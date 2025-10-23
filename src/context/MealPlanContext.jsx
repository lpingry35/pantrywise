import { createContext, useContext, useState, useEffect } from 'react';
import {
  getMealPlan,
  saveMealPlan,
  getPantryItems,
  savePantryItems,
  saveCookingHistory,
  getCookingHistory,
  getLeftovers,
  addLeftover as addLeftoverToFirestore,
  removeLeftover as removeLeftoverFromFirestore
} from '../services/firestoreService';
import { normalizeIngredient } from '../utils/ingredientMatching';
import { convertUnit } from '../utils/unitConverter';
import { useAuth } from './AuthContext';

// Create the context
const MealPlanContext = createContext();

// Custom hook to use the meal plan context
export function useMealPlan() {
  const context = useContext(MealPlanContext);
  if (!context) {
    throw new Error('useMealPlan must be used within a MealPlanProvider');
  }
  return context;
}

// Initial empty meal plan structure
const initialMealPlan = {
  monday: { breakfast: null, lunch: null, dinner: null },
  tuesday: { breakfast: null, lunch: null, dinner: null },
  wednesday: { breakfast: null, lunch: null, dinner: null },
  thursday: { breakfast: null, lunch: null, dinner: null },
  friday: { breakfast: null, lunch: null, dinner: null },
  saturday: { breakfast: null, lunch: null, dinner: null },
  sunday: { breakfast: null, lunch: null, dinner: null }
};

// Provider component
export function MealPlanProvider({ children }) {
  // Get current user from auth context
  // CRITICAL: This allows us to reload data when user logs in/out
  const { currentUser } = useAuth();

  const [mealPlan, setMealPlan] = useState(initialMealPlan);
  const [currentPlanName, setCurrentPlanName] = useState('My Meal Plan'); // Track current plan name
  const [pantryItems, setPantryItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Track which recipes have been cooked (key format: "day-meal", e.g., "monday-breakfast")
  const [cookedRecipes, setCookedRecipes] = useState({});

  // Track cooking history for recipes (key: recipeId, value: cooking history object)
  // Includes: cookedCount, ratings, averageRating, firstCookedDate, lastCookedDate
  const [cookingHistoryCache, setCookingHistoryCache] = useState({});

  // ============================================================================
  // LEFTOVER TRACKING
  // ============================================================================
  // Track leftovers to reduce food waste
  // Each leftover has: { id, recipeName, recipeId, servings, expirationDate, addedDate }
  // ============================================================================
  const [leftovers, setLeftovers] = useState([]);

  // ============================================================================
  // LOAD USER DATA - RUNS ON LOGIN/LOGOUT
  // ============================================================================
  // This effect loads meal plan, pantry, and leftovers from Firestore
  //
  // CRITICAL BUG FIX:
  // Previously this effect had empty dependencies [], so it only ran once on mount.
  // If the page loaded before user was authenticated, it would load empty data
  // and never reload when user logged in, causing data loss.
  //
  // NOW: Effect depends on currentUser, so it:
  // 1. Runs when user logs in (loads their saved data)
  // 2. Runs when user logs out (clears data)
  // 3. Runs when user switches accounts (loads new user's data)
  //
  // This ensures meal plan and shopping list persist across sessions!
  // ============================================================================
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);

        // Only load data if user is authenticated (including guest mode)
        // Without a user, we can't determine whose data to load
        if (!currentUser) {
          console.log('⚠️ No user authenticated, skipping data load');
          setMealPlan(initialMealPlan);
          setPantryItems([]);
          setLeftovers([]);
          setLoading(false);
          return;
        }

        console.log(`📊 Loading data for user: ${currentUser.email || currentUser.uid}`);

        // Load meal plan from Firestore (saved at users/{uid}/mealPlans/current)
        const firestoreMealPlan = await getMealPlan();
        if (firestoreMealPlan) {
          console.log('✅ Loaded meal plan from Firestore');
          setMealPlan(firestoreMealPlan);
        } else {
          console.log('📭 No saved meal plan found, starting with empty plan');
          setMealPlan(initialMealPlan);
        }

        // Load pantry items from Firestore
        const firestorePantry = await getPantryItems();
        console.log(`✅ Loaded ${firestorePantry.length} pantry items from Firestore`);
        setPantryItems(firestorePantry);

        // Load leftovers from Firestore
        const firestoreLeftovers = await getLeftovers();
        console.log(`✅ Loaded ${firestoreLeftovers.length} leftovers from Firestore`);
        setLeftovers(firestoreLeftovers);
      } catch (error) {
        console.error('❌ Error loading data from Firestore:', error);
        // Keep default/empty state on error (don't break the app)
        setMealPlan(initialMealPlan);
        setPantryItems([]);
        setLeftovers([]);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [currentUser]); // Depend on currentUser - reload when user logs in/out

  // Auto-save meal plan to Firestore whenever it changes
  useEffect(() => {
    if (!loading) {
      console.log('💾 Auto-saving meal plan to Firestore...');
      saveMealPlan(mealPlan).catch(error => {
        console.error('❌ Error auto-saving meal plan:', error);
      });
    }
  }, [mealPlan, loading]);

  // Auto-save pantry items to Firestore whenever they change
  useEffect(() => {
    if (!loading) {
      savePantryItems(pantryItems).catch(error => {
        console.error('Error auto-saving pantry items:', error);
      });
    }
  }, [pantryItems, loading]);

  // Add recipe to a specific meal slot
  const addRecipeToSlot = (day, meal, recipe) => {
    console.log(`📅 Adding "${recipe.name}" to ${day} ${meal}`);
    setMealPlan(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [meal]: recipe
      }
    }));
  };

  // Remove recipe from a specific meal slot
  const removeRecipeFromSlot = (day, meal) => {
    setMealPlan(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [meal]: null
      }
    }));
  };

  // Clear all meals from the plan
  const clearMealPlan = () => {
    console.log('🗑️ CLEARING MEAL PLAN - All recipes will be removed from calendar');
    setMealPlan(initialMealPlan);
  };

  // Calculate total weekly cost
  const getTotalWeeklyCost = () => {
    let total = 0;
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const meals = ['breakfast', 'lunch', 'dinner'];

    days.forEach(day => {
      meals.forEach(meal => {
        const recipe = mealPlan[day][meal];
        if (recipe) {
          total += recipe.costPerServing * recipe.servings;
        }
      });
    });

    return total;
  };

  // Count filled meal slots
  const getFilledSlotsCount = () => {
    let count = 0;
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const meals = ['breakfast', 'lunch', 'dinner'];

    days.forEach(day => {
      meals.forEach(meal => {
        if (mealPlan[day][meal]) count++;
      });
    });

    return count;
  };

  // Add ingredient to pantry
  const addPantryItem = (ingredient, quantity, unit) => {
    const normalizedInput = ingredient.trim().toLowerCase();

    // Check for duplicates
    if (pantryItems.some(item => item.name.toLowerCase() === normalizedInput)) {
      return { success: false, error: 'This ingredient is already in your pantry' };
    }

    setPantryItems(prev => [...prev, {
      name: ingredient.trim(),
      quantity: parseFloat(quantity) || 0,
      unit: unit || ''
    }]);
    return { success: true };
  };

  // Remove ingredient from pantry
  const removePantryItem = (indexToRemove) => {
    setPantryItems(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  // ============================================================================
  // UPDATE PANTRY ITEM
  // ============================================================================
  // WHY: Allows users to edit an existing pantry item's quantity, unit, or name
  // WHEN: User clicks the "Edit" button on a pantry item
  // WHAT: Updates the item at the specified index with new values
  // WHERE: Saves automatically to Firestore via the useEffect hook
  // ============================================================================

  /**
   * Updates an existing pantry item
   * @param {number} index - Position of the item in the pantry array (0-based)
   * @param {string} newIngredient - New ingredient name
   * @param {number|string} newQuantity - New quantity value
   * @param {string} newUnit - New unit (e.g., 'cups', 'oz', 'lb')
   * @returns {Object} - Result with success status and optional error message
   */
  const updatePantryItem = (index, newIngredient, newQuantity, newUnit) => {
    // VALIDATION: Make sure the index is valid
    if (index < 0 || index >= pantryItems.length) {
      return { success: false, error: 'Invalid item index' };
    }

    // VALIDATION: Make sure ingredient name is not empty
    const normalizedInput = newIngredient.trim().toLowerCase();
    if (!normalizedInput) {
      return { success: false, error: 'Ingredient name cannot be empty' };
    }

    // VALIDATION: Check for duplicate names (but allow the same name if it's the same item)
    const duplicateIndex = pantryItems.findIndex((item, i) =>
      i !== index && item.name.toLowerCase() === normalizedInput
    );

    if (duplicateIndex !== -1) {
      return { success: false, error: 'This ingredient already exists in your pantry' };
    }

    // VALIDATION: Make sure quantity is a positive number
    const parsedQuantity = parseFloat(newQuantity);
    if (isNaN(parsedQuantity) || parsedQuantity <= 0) {
      return { success: false, error: 'Please enter a valid quantity greater than 0' };
    }

    // UPDATE: Create a new array with the updated item
    setPantryItems(prev => {
      const updatedItems = [...prev]; // Make a copy of the array
      updatedItems[index] = {
        name: newIngredient.trim(),
        quantity: parsedQuantity,
        unit: newUnit || ''
      };
      return updatedItems;
    });

    return { success: true };
  };

  // Clear all pantry items
  const clearPantry = () => {
    setPantryItems([]);
  };

  // ============================================================================
  // MARK RECIPE AS COOKED
  // Deducts recipe ingredients from pantry and marks as cooked
  // ============================================================================

  /**
   * Marks a recipe as cooked and deducts its ingredients from pantry
   * NOW WITH RATING SYSTEM! (Phase 7.5.2)
   *
   * @param {string} day - Day of the week (e.g., 'monday')
   * @param {string} meal - Meal type (e.g., 'breakfast')
   * @param {boolean} forceDeduct - If true, deduct anyway even if insufficient ingredients
   * @param {number} rating - Rating 1-5 stars (0 if no rating)
   * @param {string} notes - Optional cooking notes
   * @param {boolean} checkOnly - If true, only check availability without deducting (BUG FIX #7)
   * @returns {Object} - Result with success status, messages, and details
   */
  const markRecipeAsCooked = async (day, meal, forceDeduct = false, rating = 0, notes = '', checkOnly = false) => {
    console.log('🍳 markRecipeAsCooked called:', { day, meal, forceDeduct, rating, notes, checkOnly });
    // Get the recipe from the meal plan
    const recipe = mealPlan[day]?.[meal];

    if (!recipe) {
      return {
        success: false,
        message: 'No recipe found for this meal slot.',
        canProceed: false
      };
    }

    // Check if already cooked
    const recipeKey = `${day}-${meal}`;
    if (cookedRecipes[recipeKey]) {
      return {
        success: false,
        message: 'This recipe has already been marked as cooked.',
        canProceed: false,
        alreadyCooked: true
      };
    }

    if (!recipe.ingredients || recipe.ingredients.length === 0) {
      // Recipe has no ingredients - just mark as cooked
      setCookedRecipes(prev => ({ ...prev, [recipeKey]: true }));
      return {
        success: true,
        message: `${recipe.name} marked as cooked (no ingredients to deduct).`,
        canProceed: true,
        deductedItems: []
      };
    }

    // ========================================================================
    // STEP 1: Check pantry availability for each ingredient
    // ========================================================================

    const insufficientItems = []; // Items we don't have enough of
    const deductionPlan = []; // Plan for what to deduct from pantry

    recipe.ingredients.forEach(recipeIng => {
      const recipeNormalized = normalizeIngredient(recipeIng.name).toLowerCase();
      const recipeQty = parseFloat(recipeIng.quantity) || 0;
      const recipeUnit = (recipeIng.unit || '').trim().toLowerCase();

      // Find matching pantry item
      const pantryIndex = pantryItems.findIndex(pantryItem => {
        const pantryNormalized = normalizeIngredient(pantryItem.name).toLowerCase();
        return recipeNormalized === pantryNormalized ||
               recipeNormalized.includes(pantryNormalized) ||
               pantryNormalized.includes(recipeNormalized);
      });

      if (pantryIndex === -1) {
        // Ingredient NOT in pantry at all
        insufficientItems.push({
          name: recipeIng.name,
          needed: `${recipeQty} ${recipeUnit}`,
          have: '0 (not in pantry)',
          missing: true
        });
        return;
      }

      const pantryItem = pantryItems[pantryIndex];
      const pantryQty = parseFloat(pantryItem.quantity) || 0;
      const pantryUnit = (pantryItem.unit || '').trim().toLowerCase();

      // ========================================================================
      // Check if units match - if not, try to convert
      // ========================================================================

      if (recipeUnit === pantryUnit) {
        // SAME UNIT - Direct comparison
        if (pantryQty >= recipeQty) {
          // Have enough!
          deductionPlan.push({
            pantryIndex,
            name: recipeIng.name,
            deductQty: recipeQty,
            unit: recipeUnit,
            remainingQty: pantryQty - recipeQty
          });
        } else {
          // Not enough
          insufficientItems.push({
            name: recipeIng.name,
            needed: `${recipeQty} ${recipeUnit}`,
            have: `${pantryQty} ${pantryUnit}`,
            missing: false,
            shortBy: recipeQty - pantryQty
          });

          // If forcing, plan to deduct what we have
          if (forceDeduct) {
            deductionPlan.push({
              pantryIndex,
              name: recipeIng.name,
              deductQty: pantryQty, // Deduct all we have
              unit: recipeUnit,
              remainingQty: 0
            });
          }
        }
      } else {
        // DIFFERENT UNITS - Try to convert
        const convertedPantryQty = convertUnit(pantryQty, pantryUnit, recipeUnit, recipeIng.name);

        if (convertedPantryQty !== null && convertedPantryQty > 0) {
          // CONVERSION SUCCESSFUL
          if (convertedPantryQty >= recipeQty) {
            // Have enough after conversion!
            // We need to deduct from pantry in PANTRY units, not recipe units
            const qtyToDeductInPantryUnits = convertUnit(recipeQty, recipeUnit, pantryUnit, recipeIng.name);

            if (qtyToDeductInPantryUnits !== null) {
              deductionPlan.push({
                pantryIndex,
                name: recipeIng.name,
                deductQty: qtyToDeductInPantryUnits,
                unit: pantryUnit,
                remainingQty: pantryQty - qtyToDeductInPantryUnits,
                converted: true,
                originalNeed: `${recipeQty} ${recipeUnit}`
              });
            }
          } else {
            // Not enough after conversion
            insufficientItems.push({
              name: recipeIng.name,
              needed: `${recipeQty} ${recipeUnit}`,
              have: `${pantryQty} ${pantryUnit} (≈${convertedPantryQty.toFixed(2)} ${recipeUnit})`,
              missing: false,
              shortBy: recipeQty - convertedPantryQty
            });

            // If forcing, plan to deduct what we have
            if (forceDeduct) {
              deductionPlan.push({
                pantryIndex,
                name: recipeIng.name,
                deductQty: pantryQty, // Deduct all we have in pantry units
                unit: pantryUnit,
                remainingQty: 0
              });
            }
          }
        } else {
          // CONVERSION FAILED - Units incompatible
          insufficientItems.push({
            name: recipeIng.name,
            needed: `${recipeQty} ${recipeUnit}`,
            have: `${pantryQty} ${pantryUnit}`,
            missing: false,
            incompatibleUnits: true
          });

          // Can't deduct if units are incompatible
        }
      }
    });

    // ========================================================================
    // STEP 2: Determine if we can proceed
    // ========================================================================

    if (insufficientItems.length > 0 && !forceDeduct) {
      // NOT enough ingredients and user hasn't forced it
      console.log('⚠️ Insufficient ingredients found:', insufficientItems);
      return {
        success: false,
        canProceed: false,
        message: `Cannot cook ${recipe.name}. Missing or insufficient ingredients.`,
        insufficientItems,
        recipeName: recipe.name
      };
    }

    // ========================================================================
    // BUG FIX #7: If checkOnly mode, return here WITHOUT deducting
    // This allows checking pantry availability without actually deducting
    // Used when opening the cooking modal to preview what will be deducted
    // ========================================================================
    if (checkOnly) {
      console.log('✓ Check-only mode: Pantry check complete, NOT deducting ingredients');
      return {
        success: true,
        canProceed: true,
        checkOnly: true,
        message: 'Pantry check successful (check-only mode)',
        recipeName: recipe.name,
        insufficientItems: forceDeduct ? insufficientItems : [],
        deductionPreview: deductionPlan  // Preview what would be deducted
      };
    }

    // ========================================================================
    // STEP 3: Execute the deduction (ONLY if not check-only mode)
    // ========================================================================
    console.log('🔪 Executing pantry deduction for', recipe.name, '- Deducting', deductionPlan.length, 'ingredient groups');

    const updatedPantry = [...pantryItems];
    const deductedDetails = [];

    deductionPlan.forEach(plan => {
      if (plan.remainingQty > 0) {
        // Update quantity
        updatedPantry[plan.pantryIndex] = {
          ...updatedPantry[plan.pantryIndex],
          quantity: plan.remainingQty
        };
        deductedDetails.push({
          name: plan.name,
          deducted: `${plan.deductQty.toFixed(2)} ${plan.unit}`,
          remaining: `${plan.remainingQty.toFixed(2)} ${plan.unit}`
        });
      } else {
        // Quantity reached 0 - remove from pantry
        updatedPantry.splice(plan.pantryIndex, 1);
        deductedDetails.push({
          name: plan.name,
          deducted: `${plan.deductQty.toFixed(2)} ${plan.unit}`,
          remaining: '0 (removed from pantry)'
        });

        // Adjust indices for subsequent operations
        deductionPlan.forEach(p => {
          if (p.pantryIndex > plan.pantryIndex) {
            p.pantryIndex--;
          }
        });
      }
    });

    // Update pantry state (THIS IS THE CRITICAL STEP!)
    console.log('📦 Updating pantry state. Before:', pantryItems.length, 'items');
    console.log('📦 After deduction:', updatedPantry.length, 'items');
    setPantryItems(updatedPantry);
    console.log('✅ Pantry state updated in context');

    // Mark recipe as cooked
    setCookedRecipes(prev => ({ ...prev, [recipeKey]: true }));

    // ========================================================================
    // STEP 4: Save cooking history with rating to Firestore (Phase 7.5.2)
    // ========================================================================

    try {
      // Save cooking history to Firestore
      console.log('💾 Saving cooking history to Firestore:', {
        recipeId: recipe.id,
        recipeName: recipe.name,
        rating,
        notes
      });
      await saveCookingHistory(recipe.id, recipe.name, rating, notes);
      console.log('✅ Cooking history saved successfully');

      // Update cooking history cache locally
      console.log('🔄 Reloading cooking history from Firestore to update cache...');
      const updatedHistory = await getCookingHistory(recipe.id);
      console.log('📥 Reloaded history:', updatedHistory);

      if (updatedHistory) {
        console.log('💾 Updating cache with fresh history');
        setCookingHistoryCache(prev => ({
          ...prev,
          [recipe.id]: updatedHistory
        }));
      }

      console.log('Cooking history saved for:', recipe.name);
    } catch (error) {
      console.error('Error saving cooking history:', error);
      // Don't fail the whole operation if history save fails
    }

    // ========================================================================
    // STEP 5: Return success with details
    // ========================================================================

    return {
      success: true,
      canProceed: true,
      message: forceDeduct && insufficientItems.length > 0
        ? `${recipe.name} marked as cooked (some ingredients were insufficient).`
        : `${recipe.name} marked as cooked! Ingredients deducted from pantry.`,
      recipeName: recipe.name,
      deductedItems: deductedDetails,
      insufficientItems: forceDeduct ? insufficientItems : [],
      forced: forceDeduct,
      rating: rating > 0 ? rating : null
    };
  };

  /**
   * Unmarks a recipe as cooked (does NOT add ingredients back)
   * @param {string} day - Day of the week
   * @param {string} meal - Meal type
   */
  const unmarkRecipeAsCooked = (day, meal) => {
    const recipeKey = `${day}-${meal}`;
    setCookedRecipes(prev => {
      const updated = { ...prev };
      delete updated[recipeKey];
      return updated;
    });
  };

  /**
   * Get cooking history for a recipe (loads from cache or Firestore)
   * @param {string} recipeId - ID of the recipe
   * @returns {Promise<Object|null>} - Cooking history object or null
   */
  const getRecipeCookingHistory = async (recipeId) => {
    console.log('📖 getRecipeCookingHistory called for recipeId:', recipeId);

    // Check cache first
    if (cookingHistoryCache[recipeId]) {
      console.log('✅ Found in cache:', cookingHistoryCache[recipeId]);
      return cookingHistoryCache[recipeId];
    }

    console.log('🔍 Not in cache, loading from Firestore...');
    // Load from Firestore
    try {
      const history = await getCookingHistory(recipeId);
      console.log('📥 Loaded from Firestore:', history);

      if (history) {
        // Update cache
        console.log('💾 Updating cache with history');
        setCookingHistoryCache(prev => ({
          ...prev,
          [recipeId]: history
        }));
      } else {
        console.log('⚠️ No cooking history found in Firestore for', recipeId);
      }
      return history;
    } catch (error) {
      console.error('❌ Error getting cooking history:', error);
      return null;
    }
  };

  // ============================================================================
  // TRANSFER SHOPPING LIST TO PANTRY
  // Adds all shopping list items to pantry with smart quantity merging
  // ============================================================================

  /**
   * Transfers shopping list items to the pantry
   * @param {Array} shoppingItems - Array of items from shopping list with {name, quantity, unit}
   * @returns {Object} - Summary of transfer: {success: boolean, addedCount: number, mergedCount: number, message: string}
   */
  const transferShoppingListToPantry = (shoppingItems) => {
    // Validate input
    if (!shoppingItems || !Array.isArray(shoppingItems) || shoppingItems.length === 0) {
      return {
        success: false,
        addedCount: 0,
        mergedCount: 0,
        message: 'No items to transfer'
      };
    }

    try {
      let addedCount = 0;    // Count of new items added
      let mergedCount = 0;   // Count of items merged with existing pantry items

      // Create a working copy of pantry items
      const updatedPantry = [...pantryItems];

      // Process each shopping item
      shoppingItems.forEach(shopItem => {
        // Normalize the shopping item name for comparison
        const shopNormalized = normalizeIngredient(shopItem.name).toLowerCase();
        const shopQty = parseFloat(shopItem.quantity) || 0;
        const shopUnit = (shopItem.unit || '').trim().toLowerCase();

        // Find if this ingredient already exists in pantry
        // We check by comparing normalized names (handles synonyms)
        const pantryIndex = updatedPantry.findIndex(pantryItem => {
          const pantryNormalized = normalizeIngredient(pantryItem.name).toLowerCase();

          // Direct name match
          if (shopNormalized === pantryNormalized) return true;

          // Check if names are close enough (simple check)
          // This handles minor variations like "onion" vs "onions"
          return shopNormalized.includes(pantryNormalized) || pantryNormalized.includes(shopNormalized);
        });

        if (pantryIndex !== -1) {
          // Item EXISTS in pantry - we need to MERGE quantities
          const existingItem = updatedPantry[pantryIndex];
          const existingQty = parseFloat(existingItem.quantity) || 0;
          const existingUnit = (existingItem.unit || '').trim().toLowerCase();

          // Check if units match
          if (shopUnit === existingUnit) {
            // SAME UNIT - Simple addition!
            // Example: Pantry has 2 cups milk, buying 3 cups = 5 cups total
            updatedPantry[pantryIndex] = {
              ...existingItem,
              quantity: existingQty + shopQty
            };
            mergedCount++;
            console.log(`Merged ${shopItem.name}: ${existingQty} + ${shopQty} = ${existingQty + shopQty} ${shopUnit}`);
          } else {
            // DIFFERENT UNITS - Try to convert
            // Example: Pantry has 2 cups milk, buying 16 oz
            // Try to convert shopping unit to pantry unit
            const convertedQty = convertUnit(shopQty, shopUnit, existingUnit, shopItem.name);

            if (convertedQty !== null && convertedQty > 0) {
              // CONVERSION SUCCESSFUL! Add the converted quantity
              updatedPantry[pantryIndex] = {
                ...existingItem,
                quantity: existingQty + convertedQty
              };
              mergedCount++;
              console.log(`Merged ${shopItem.name} with conversion: ${existingQty} ${existingUnit} + ${shopQty} ${shopUnit} (≈${convertedQty.toFixed(2)} ${existingUnit}) = ${(existingQty + convertedQty).toFixed(2)} ${existingUnit}`);
            } else {
              // CONVERSION FAILED - Units are incompatible (e.g., cups vs pieces)
              // Add as a SEPARATE pantry item with the shopping unit
              updatedPantry.push({
                name: shopItem.name,
                quantity: shopQty,
                unit: shopUnit
              });
              addedCount++;
              console.log(`Added ${shopItem.name} as separate item (incompatible units): ${shopQty} ${shopUnit}`);
            }
          }
        } else {
          // Item DOES NOT EXIST in pantry - Add as NEW item
          updatedPantry.push({
            name: shopItem.name,
            quantity: shopQty,
            unit: shopUnit
          });
          addedCount++;
          console.log(`Added new item to pantry: ${shopQty} ${shopUnit} ${shopItem.name}`);
        }
      });

      // Update the pantry state
      // This will trigger auto-save to Firestore
      setPantryItems(updatedPantry);

      // Return success summary
      const totalItems = addedCount + mergedCount;
      return {
        success: true,
        addedCount,
        mergedCount,
        totalTransferred: totalItems,
        message: `Successfully transferred ${totalItems} item${totalItems !== 1 ? 's' : ''} to pantry! (${addedCount} new, ${mergedCount} merged)`
      };

    } catch (error) {
      console.error('Error transferring items to pantry:', error);
      return {
        success: false,
        addedCount: 0,
        mergedCount: 0,
        message: 'Failed to transfer items to pantry. Please try again.'
      };
    }
  };

  // ============================================================================
  // LEFTOVER MANAGEMENT
  // ============================================================================
  // WHY: Track leftovers to reduce food waste
  // WHEN: User marks recipe as cooked and indicates they have leftovers
  // WHAT: Add leftovers with expiration tracking, remove when used/expired
  // ============================================================================

  /**
   * Add a leftover item when cooking a recipe
   * @param {Object} leftoverData - { recipeName, recipeId, servings, expirationDate }
   * @returns {Promise<void>}
   */
  const addLeftover = async (leftoverData) => {
    try {
      console.log('🍱 Adding leftover:', leftoverData.recipeName);

      // Add to Firestore/localStorage
      const leftoverId = await addLeftoverToFirestore(leftoverData);

      // Update local state
      const newLeftover = {
        id: leftoverId,
        ...leftoverData,
        addedDate: new Date().toISOString()
      };

      setLeftovers(prev => [...prev, newLeftover]);
      console.log('✅ Leftover added successfully');
    } catch (error) {
      console.error('❌ Error adding leftover:', error);
      throw error;
    }
  };

  /**
   * Remove a leftover item
   * @param {string} leftoverId - ID of the leftover to remove
   * @returns {Promise<void>}
   */
  const removeLeftover = async (leftoverId) => {
    try {
      console.log('🗑️ Removing leftover:', leftoverId);

      // Remove from Firestore/localStorage
      await removeLeftoverFromFirestore(leftoverId);

      // Update local state
      setLeftovers(prev => prev.filter(item => item.id !== leftoverId));
      console.log('✅ Leftover removed successfully');
    } catch (error) {
      console.error('❌ Error removing leftover:', error);
      throw error;
    }
  };

  const value = {
    mealPlan,
    setMealPlan,
    currentPlanName,
    setCurrentPlanName,
    addRecipeToSlot,
    removeRecipeFromSlot,
    clearMealPlan,
    getTotalWeeklyCost,
    getFilledSlotsCount,
    pantryItems,
    setPantryItems,
    addPantryItem,
    updatePantryItem, // NEW: Edit existing pantry items
    removePantryItem,
    clearPantry,
    transferShoppingListToPantry,
    cookedRecipes,
    markRecipeAsCooked,
    unmarkRecipeAsCooked,
    // Phase 7.5.2 - Cooking History with Ratings
    cookingHistoryCache,
    getRecipeCookingHistory,
    // Leftover Tracking (Food waste reduction)
    leftovers,
    addLeftover,
    removeLeftover
  };

  return (
    <MealPlanContext.Provider value={value}>
      {children}
    </MealPlanContext.Provider>
  );
}

export default MealPlanContext;
