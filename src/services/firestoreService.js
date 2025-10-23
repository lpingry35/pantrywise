// Firestore Service - CRUD operations for recipes, meal plans, and pantry items
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  setDoc,
  serverTimestamp
} from 'firebase/firestore';
import { db, auth } from '../firebase';
import sampleRecipes from '../data/sampleRecipes';

// ============================================================================
// GUEST MODE HELPERS
// ============================================================================

/**
 * Check if user is in guest mode
 * @returns {boolean} - True if in guest mode
 */
function isGuestMode() {
  return localStorage.getItem('guestMode') === 'true';
}

/**
 * Get guest recipes from localStorage or return sample recipes
 * @returns {Array} - Array of recipe objects
 */
function getGuestRecipes() {
  const stored = localStorage.getItem('guestRecipes');
  if (stored) {
    return JSON.parse(stored);
  }
  // Initialize with sample recipes for first time guests
  localStorage.setItem('guestRecipes', JSON.stringify(sampleRecipes));
  return sampleRecipes;
}

/**
 * Save guest recipes to localStorage
 * @param {Array} recipes - Array of recipe objects
 */
function setGuestRecipes(recipes) {
  localStorage.setItem('guestRecipes', JSON.stringify(recipes));
}

/**
 * Get guest meal plan from localStorage or return empty structure
 * @returns {Object|null} - Meal plan object or null
 */
function getGuestMealPlan() {
  const stored = localStorage.getItem('guestMealPlan');
  if (stored) {
    return JSON.parse(stored);
  }
  return null;
}

/**
 * Save guest meal plan to localStorage
 * @param {Object} mealPlan - Meal plan object
 */
function setGuestMealPlan(mealPlan) {
  localStorage.setItem('guestMealPlan', JSON.stringify(mealPlan));
}

/**
 * Get guest saved meal plans from localStorage or return empty array
 * @returns {Array} - Array of saved meal plan objects
 */
function getGuestSavedMealPlans() {
  const stored = localStorage.getItem('guestSavedMealPlans');
  if (stored) {
    return JSON.parse(stored);
  }
  return [];
}

/**
 * Save guest saved meal plans to localStorage
 * @param {Array} plans - Array of saved meal plan objects
 */
function setGuestSavedMealPlans(plans) {
  localStorage.setItem('guestSavedMealPlans', JSON.stringify(plans));
}

/**
 * Get guest pantry items from localStorage or return empty array
 * @returns {Array} - Array of pantry item objects
 */
function getGuestPantry() {
  const stored = localStorage.getItem('guestPantry');
  if (stored) {
    return JSON.parse(stored);
  }
  return [];
}

/**
 * Save guest pantry items to localStorage
 * @param {Array} items - Array of pantry item objects
 */
function setGuestPantry(items) {
  localStorage.setItem('guestPantry', JSON.stringify(items));
}

/**
 * Get guest cooking history from localStorage or return empty array
 * @returns {Array} - Array of cooking history objects
 */
function getGuestCookingHistory() {
  const stored = localStorage.getItem('guestCookingHistory');
  if (stored) {
    return JSON.parse(stored);
  }
  return [];
}

/**
 * Save guest cooking history to localStorage
 * @param {Array} history - Array of cooking history objects
 */
function setGuestCookingHistory(history) {
  localStorage.setItem('guestCookingHistory', JSON.stringify(history));
}

// ============================================================================
// USER-SCOPED DATA HELPERS
// ============================================================================

/**
 * Get the current user's ID
 * @returns {string} - Current user's UID
 * @throws {Error} - If no user is logged in
 */
function getUserId() {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('No user logged in');
  }
  return user.uid;
}

/**
 * Get a user-scoped collection reference
 * @param {string} collectionName - Name of the collection (recipes, mealPlans, etc.)
 * @returns {CollectionReference} - Firestore collection reference under users/{userId}/{collectionName}
 */
function getUserCollection(collectionName) {
  const userId = getUserId();
  return collection(db, 'users', userId, collectionName);
}

/**
 * Get a user-scoped document reference
 * @param {string} collectionName - Name of the collection
 * @param {string} docId - Document ID
 * @returns {DocumentReference} - Firestore document reference under users/{userId}/{collectionName}/{docId}
 */
function getUserDoc(collectionName, docId) {
  const userId = getUserId();
  return doc(db, 'users', userId, collectionName, docId);
}

// ============================================================================
// RECIPES COLLECTION
// ============================================================================

/**
 * Save a new recipe to Firestore
 *
 * CRITICAL: This function handles TWO types of recipes:
 * 1. SAMPLE RECIPES: Have an existing ID (e.g., "recipe-001") that we MUST preserve
 *    - Uses setDoc() with the recipe's existing ID as the Firestore document ID
 *    - Ensures recipe cards and recipe detail pages use the same ID
 * 2. USER-CREATED RECIPES: No ID, need a new one generated
 *    - Uses addDoc() to auto-generate a Firestore document ID
 *
 * WHY: If we use addDoc() for sample recipes, Firestore generates a NEW ID (e.g., "xyz123")
 * but the recipe data still contains the original ID (e.g., "recipe-001").
 * When getAllRecipes() returns {...doc.data()}, it overwrites the Firestore ID with
 * the old ID, causing "Recipe not found" errors when clicking recipe cards.
 *
 * FIX: Use the recipe's existing ID as the Firestore document ID via setDoc()
 * This way the ID is consistent everywhere and recipes load correctly.
 *
 * @param {Object} recipe - Recipe object with all required fields
 * @returns {Promise<string>} - Document ID of the saved recipe
 */
export async function saveRecipe(recipe) {
  try {
    // Guest mode: save to localStorage
    if (isGuestMode()) {
      const guestRecipes = getGuestRecipes();
      const newRecipe = {
        ...recipe,
        id: `guest-recipe-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      guestRecipes.push(newRecipe);
      setGuestRecipes(guestRecipes);
      console.log(`👤 saveRecipe: Guest mode - saved recipe to localStorage:`, newRecipe.id);
      console.log(`⚠️ Guest data will be lost when you exit. Create an account to save permanently!`);
      return newRecipe.id;
    }

    // Regular user: save to Firestore
    const userId = getUserId();
    console.log(`💾 saveRecipe: Saving recipe for user ${userId}`);
    console.log(`📂 Path: users/${userId}/recipes/`);
    console.log(`📗 Recipe name: ${recipe.name}`);

    // CRITICAL BUG FIX: Remove the 'id' field from the recipe data
    // The ID should ONLY be the Firestore document ID, NOT a field in the data
    // This prevents ID mismatches when getAllRecipes() spreads doc.data()
    const { id, ...recipeDataWithoutId } = recipe;

    const recipeWithTimestamp = {
      ...recipeDataWithoutId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    // CRITICAL: Check if recipe has an existing ID (sample recipes)
    if (id) {
      // SAMPLE RECIPE: Use the recipe's existing ID as the Firestore document ID
      // This ensures the ID is consistent between recipe cards and detail pages
      console.log(`📌 Recipe has existing ID: ${id} - using setDoc() to preserve it`);

      const recipeDocRef = getUserDoc('recipes', id);
      await setDoc(recipeDocRef, recipeWithTimestamp);

      console.log(`✅ saveRecipe: Recipe saved with preserved ID: ${id}`);
      console.log(`📂 Full path: users/${userId}/recipes/${id}`);
      return id;
    } else {
      // USER-CREATED RECIPE: No existing ID, generate a new one
      console.log(`🆕 Recipe has no ID - using addDoc() to generate new ID`);

      const recipesRef = getUserCollection('recipes');
      const docRef = await addDoc(recipesRef, recipeWithTimestamp);

      console.log(`✅ saveRecipe: Recipe saved with generated ID: ${docRef.id}`);
      console.log(`📂 Full path: users/${userId}/recipes/${docRef.id}`);
      return docRef.id;
    }
  } catch (error) {
    console.error('❌ saveRecipe: Error saving recipe:', error);
    throw new Error(`Failed to save recipe: ${error.message}`);
  }
}

/**
 * Get all recipes from Firestore
 *
 * IMPORTANT: The Firestore document ID is the source of truth for recipe IDs
 * We set `id: doc.id` BEFORE spreading doc.data() to ensure the document ID is used
 * Since saveRecipe() now strips the 'id' field before saving, doc.data() won't
 * contain an 'id' field that could overwrite doc.id
 *
 * @returns {Promise<Array>} - Array of recipe objects with IDs
 */
export async function getAllRecipes() {
  try {
    // Guest mode: return sample recipes from localStorage
    if (isGuestMode()) {
      const guestRecipes = getGuestRecipes();
      console.log(`👤 getAllRecipes: Guest mode - loaded ${guestRecipes.length} sample recipes`);
      return guestRecipes;
    }

    // Regular user: load from Firestore
    const userId = getUserId();
    console.log(`📚 getAllRecipes: Loading recipes for user ${userId}`);
    console.log(`📂 Path: users/${userId}/recipes/`);

    const recipesRef = getUserCollection('recipes');
    const querySnapshot = await getDocs(recipesRef);

    const recipes = [];
    querySnapshot.forEach((doc) => {
      // CRITICAL: Set id BEFORE spreading doc.data()
      // The Firestore document ID is the source of truth
      // doc.data() should NOT contain an 'id' field (stripped by saveRecipe)
      recipes.push({
        id: doc.id,
        ...doc.data()
      });
    });

    console.log(`✅ getAllRecipes: Loaded ${recipes.length} recipes from Firestore`);
    if (recipes.length > 0) {
      console.log(`📗 Recipe names:`, recipes.map(r => r.name));
    }
    return recipes;
  } catch (error) {
    console.error('❌ getAllRecipes: Error getting recipes:', error);
    throw new Error(`Failed to get recipes: ${error.message}`);
  }
}

/**
 * Get a single recipe by ID
 *
 * BACKWARDS COMPATIBILITY FIX FOR EXISTING USERS:
 * Some users loaded sample recipes before the ID preservation fix was implemented.
 * Their recipes have mismatched IDs:
 * - Firestore document ID: auto-generated (e.g., "xyz123")
 * - Recipe data: contains original id field (e.g., "recipe-001")
 *
 * This function has a TWO-STEP FALLBACK to handle both cases:
 * 1. STEP 1: Try direct lookup by document ID (fast, works for new users)
 * 2. STEP 2: If not found, search ALL recipes for matching id in data (slow, fixes old users)
 *
 * This ensures both new and existing users can view recipe details without errors
 *
 * @param {string} id - Recipe document ID
 * @returns {Promise<Object|null>} - Recipe object or null if not found
 */
export async function getRecipeById(id) {
  try {
    // Guest mode: find in local recipes
    if (isGuestMode()) {
      const guestRecipes = getGuestRecipes();
      const recipe = guestRecipes.find(r => r.id === id);
      if (recipe) {
        console.log(`👤 getRecipeById: Guest mode - found recipe:`, recipe.name);
        return recipe;
      } else {
        console.warn(`👤 getRecipeById: Guest mode - recipe ${id} not found`);
        return null;
      }
    }

    // Regular user: load from Firestore
    const userId = getUserId();
    console.log(`🔍 getRecipeById: Querying recipe ${id} for user ${userId}`);
    console.log(`📂 Path: users/${userId}/recipes/${id}`);

    // STEP 1: Try direct lookup by document ID (works for properly saved recipes)
    const recipeRef = getUserDoc('recipes', id);
    const recipeDoc = await getDoc(recipeRef);

    if (recipeDoc.exists()) {
      console.log(`✅ getRecipeById: Recipe found via direct lookup:`, recipeDoc.data().name);
      return {
        id: recipeDoc.id,
        ...recipeDoc.data()
      };
    }

    // STEP 2: FALLBACK for existing users with broken recipe IDs
    // If direct lookup failed, search all recipes to find one with matching id in the data
    // This handles legacy recipes that were saved before the ID preservation fix
    console.warn(`⚠️ getRecipeById: Direct lookup failed for ${id}`);
    console.log(`🔄 getRecipeById: Trying fallback search for legacy recipes...`);

    const recipesRef = getUserCollection('recipes');
    const querySnapshot = await getDocs(recipesRef);

    let foundRecipe = null;
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      // Check if this recipe's data contains the ID we're looking for
      // This would only happen with old buggy recipes
      if (data.id === id) {
        console.log(`✅ getRecipeById: Found recipe via fallback search (legacy data):`, data.name);
        console.log(`📌 Recipe has mismatched IDs - Firestore doc ID: ${doc.id}, Data ID: ${data.id}`);
        foundRecipe = {
          id: doc.id, // Use the CORRECT Firestore document ID
          ...data
        };
      }
    });

    if (foundRecipe) {
      console.log(`🔧 getRecipeById: Returning recipe with corrected ID`);
      return foundRecipe;
    }

    console.warn(`⚠️ getRecipeById: Recipe ${id} not found even after fallback search`);
    return null;

  } catch (error) {
    console.error('❌ getRecipeById: Error getting recipe:', error);
    throw new Error(`Failed to get recipe: ${error.message}`);
  }
}

/**
 * Update an existing recipe
 * @param {string} id - Recipe document ID
 * @param {Object} recipe - Updated recipe data
 * @returns {Promise<void>}
 */
export async function updateRecipe(id, recipe) {
  try {
    const recipeRef = getUserDoc('recipes', id);
    const updatedRecipe = {
      ...recipe,
      updatedAt: serverTimestamp()
    };

    await updateDoc(recipeRef, updatedRecipe);
    console.log('Recipe updated:', id);
  } catch (error) {
    console.error('Error updating recipe:', error);
    throw new Error(`Failed to update recipe: ${error.message}`);
  }
}

/**
 * Delete a recipe
 * @param {string} id - Recipe document ID
 * @returns {Promise<void>}
 */
export async function deleteRecipe(id) {
  try {
    const recipeRef = getUserDoc('recipes', id);
    await deleteDoc(recipeRef);
    console.log('Recipe deleted:', id);
  } catch (error) {
    console.error('Error deleting recipe:', error);
    throw new Error(`Failed to delete recipe: ${error.message}`);
  }
}

// ============================================================================
// MEAL PLANS COLLECTION
// ============================================================================

/**
 * Save a meal plan to Firestore or localStorage (guest mode)
 * Uses a fixed document ID 'current' for the user's active meal plan
 * @param {Object} mealPlan - Meal plan object with days and meals
 * @returns {Promise<void>}
 */
export async function saveMealPlan(mealPlan) {
  try {
    // Guest mode: save to localStorage
    if (isGuestMode()) {
      const mealPlanData = {
        ...mealPlan,
        updatedAt: new Date().toISOString()
      };
      setGuestMealPlan(mealPlanData);
      console.log('👤 saveMealPlan: Guest mode - saved meal plan to localStorage');
      console.log('⚠️ Guest data will be lost when you exit. Create an account to save permanently!');
      return;
    }

    // Regular user: save to Firestore
    const mealPlanRef = getUserDoc('mealPlans', 'current');
    const mealPlanWithTimestamp = {
      ...mealPlan,
      updatedAt: serverTimestamp()
    };

    await setDoc(mealPlanRef, mealPlanWithTimestamp);
    console.log('Meal plan saved');
  } catch (error) {
    console.error('Error saving meal plan:', error);
    throw new Error(`Failed to save meal plan: ${error.message}`);
  }
}

/**
 * Get a meal plan by ID from Firestore or localStorage (guest mode)
 * @param {string} id - Meal plan document ID (defaults to 'current')
 * @returns {Promise<Object|null>} - Meal plan object or null if not found
 */
export async function getMealPlan(id = 'current') {
  try {
    // Guest mode: load from localStorage
    if (isGuestMode()) {
      const mealPlan = getGuestMealPlan();
      if (mealPlan) {
        console.log('👤 getMealPlan: Guest mode - loaded meal plan from localStorage');
        return mealPlan;
      } else {
        console.log('👤 getMealPlan: Guest mode - no meal plan found');
        return null;
      }
    }

    // Regular user: load from Firestore
    const mealPlanRef = getUserDoc('mealPlans', id);
    const mealPlanDoc = await getDoc(mealPlanRef);

    if (mealPlanDoc.exists()) {
      console.log('Meal plan loaded from Firestore');
      return mealPlanDoc.data();
    } else {
      console.log('No meal plan found, returning empty structure');
      return null;
    }
  } catch (error) {
    console.error('Error getting meal plan:', error);
    throw new Error(`Failed to get meal plan: ${error.message}`);
  }
}

/**
 * Update an existing meal plan in Firestore or localStorage (guest mode)
 * @param {string} id - Meal plan document ID
 * @param {Object} mealPlan - Updated meal plan data
 * @returns {Promise<void>}
 */
export async function updateMealPlan(id, mealPlan) {
  try {
    // Guest mode: update localStorage (just save it)
    if (isGuestMode()) {
      const updatedMealPlan = {
        ...mealPlan,
        updatedAt: new Date().toISOString()
      };
      setGuestMealPlan(updatedMealPlan);
      console.log('👤 updateMealPlan: Guest mode - updated meal plan in localStorage');
      return;
    }

    // Regular user: update Firestore
    const mealPlanRef = getUserDoc('mealPlans', id);
    const updatedMealPlan = {
      ...mealPlan,
      updatedAt: serverTimestamp()
    };

    await updateDoc(mealPlanRef, updatedMealPlan);
    console.log('Meal plan updated:', id);
  } catch (error) {
    console.error('Error updating meal plan:', error);
    throw new Error(`Failed to update meal plan: ${error.message}`);
  }
}

// ============================================================================
// SAVED MEAL PLANS COLLECTION (Phase 6.1 - Multiple Named Plans)
// ============================================================================

/**
 * Save the current meal plan with a custom name
 * Creates a new document in 'savedMealPlans' collection or adds to localStorage (guest mode)
 * @param {string} name - Custom name for the meal plan (e.g., "Budget Week", "Keto Plan")
 * @param {Object} mealPlanData - The meal plan object to save
 * @returns {Promise<string>} - Document ID of the saved meal plan
 */
export async function saveNamedMealPlan(name, mealPlanData) {
  try {
    // Guest mode: save to localStorage
    if (isGuestMode()) {
      const savedPlans = getGuestSavedMealPlans();
      const newPlan = {
        id: `guest-plan-${Date.now()}`,
        name: name.trim(),
        mealPlan: mealPlanData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      savedPlans.push(newPlan);
      setGuestSavedMealPlans(savedPlans);
      console.log('👤 saveNamedMealPlan: Guest mode - saved meal plan to localStorage:', newPlan.id);
      console.log('⚠️ Guest data will be lost when you exit. Create an account to save permanently!');
      return newPlan.id;
    }

    // Regular user: save to Firestore
    const savedPlansRef = getUserCollection('savedMealPlans');
    const planToSave = {
      name: name.trim(),
      mealPlan: mealPlanData, // The actual meal plan data (days/meals)
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    const docRef = await addDoc(savedPlansRef, planToSave);
    console.log('Named meal plan saved with ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error saving named meal plan:', error);
    throw new Error(`Failed to save named meal plan: ${error.message}`);
  }
}

/**
 * Get all saved meal plans from Firestore or localStorage (guest mode)
 * @returns {Promise<Array>} - Array of saved meal plan objects with IDs
 */
export async function getAllSavedMealPlans() {
  try {
    // Guest mode: load from localStorage
    if (isGuestMode()) {
      const plans = getGuestSavedMealPlans();
      // Sort by creation date (newest first)
      plans.sort((a, b) => {
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
      console.log(`👤 getAllSavedMealPlans: Guest mode - loaded ${plans.length} saved meal plans`);
      return plans;
    }

    // Regular user: load from Firestore
    const savedPlansRef = getUserCollection('savedMealPlans');
    const querySnapshot = await getDocs(savedPlansRef);

    const plans = [];
    querySnapshot.forEach((doc) => {
      plans.push({
        id: doc.id,
        ...doc.data()
      });
    });

    // Sort by creation date (newest first)
    plans.sort((a, b) => {
      if (b.createdAt && a.createdAt) {
        return b.createdAt.toMillis() - a.createdAt.toMillis();
      }
      return 0;
    });

    console.log(`Loaded ${plans.length} saved meal plans from Firestore`);
    return plans;
  } catch (error) {
    console.error('Error getting saved meal plans:', error);
    throw new Error(`Failed to get saved meal plans: ${error.message}`);
  }
}

/**
 * Get a specific saved meal plan by ID from Firestore or localStorage (guest mode)
 * @param {string} id - Saved meal plan document ID
 * @returns {Promise<Object|null>} - Saved meal plan object or null if not found
 */
export async function getSavedMealPlanById(id) {
  try {
    // Guest mode: find in localStorage
    if (isGuestMode()) {
      const plans = getGuestSavedMealPlans();
      const plan = plans.find(p => p.id === id);
      if (plan) {
        console.log(`👤 getSavedMealPlanById: Guest mode - found plan:`, plan.name);
        return plan;
      } else {
        console.warn(`👤 getSavedMealPlanById: Guest mode - plan ${id} not found`);
        return null;
      }
    }

    // Regular user: load from Firestore
    const planRef = getUserDoc('savedMealPlans', id);
    const planDoc = await getDoc(planRef);

    if (planDoc.exists()) {
      return {
        id: planDoc.id,
        ...planDoc.data()
      };
    } else {
      console.warn(`Saved meal plan with ID ${id} not found`);
      return null;
    }
  } catch (error) {
    console.error('Error getting saved meal plan:', error);
    throw new Error(`Failed to get saved meal plan: ${error.message}`);
  }
}

/**
 * Delete a saved meal plan from Firestore or localStorage (guest mode)
 * @param {string} id - Saved meal plan document ID
 * @returns {Promise<void>}
 */
export async function deleteSavedMealPlan(id) {
  try {
    // Guest mode: delete from localStorage
    if (isGuestMode()) {
      const plans = getGuestSavedMealPlans();
      const filteredPlans = plans.filter(p => p.id !== id);
      setGuestSavedMealPlans(filteredPlans);
      console.log('👤 deleteSavedMealPlan: Guest mode - deleted plan:', id);
      return;
    }

    // Regular user: delete from Firestore
    const planRef = getUserDoc('savedMealPlans', id);
    await deleteDoc(planRef);
    console.log('Saved meal plan deleted:', id);
  } catch (error) {
    console.error('Error deleting saved meal plan:', error);
    throw new Error(`Failed to delete saved meal plan: ${error.message}`);
  }
}

// ============================================================================
// PANTRY ITEMS COLLECTION
// ============================================================================

/**
 * Save pantry items to Firestore or localStorage (guest mode)
 * Uses a fixed document ID 'current' for the user's pantry
 * @param {Array} items - Array of pantry item objects
 * @returns {Promise<void>}
 */
export async function savePantryItems(items) {
  try {
    // Guest mode: save to localStorage
    if (isGuestMode()) {
      setGuestPantry(items);
      console.log(`👤 savePantryItems: Guest mode - saved ${items.length} pantry items to localStorage`);
      console.log('⚠️ Guest data will be lost when you exit. Create an account to save permanently!');
      return;
    }

    // Regular user: save to Firestore
    const pantryRef = getUserDoc('pantryItems', 'current');
    const pantryData = {
      items: items,
      updatedAt: serverTimestamp()
    };

    await setDoc(pantryRef, pantryData);
    console.log(`Saved ${items.length} pantry items to Firestore`);
  } catch (error) {
    console.error('Error saving pantry items:', error);
    throw new Error(`Failed to save pantry items: ${error.message}`);
  }
}

/**
 * Get pantry items from Firestore or localStorage (guest mode)
 * @returns {Promise<Array>} - Array of pantry item objects
 */
export async function getPantryItems() {
  try {
    // Guest mode: load from localStorage
    if (isGuestMode()) {
      const items = getGuestPantry();
      console.log(`👤 getPantryItems: Guest mode - loaded ${items.length} pantry items from localStorage`);
      return items;
    }

    // Regular user: load from Firestore
    const pantryRef = getUserDoc('pantryItems', 'current');
    const pantryDoc = await getDoc(pantryRef);

    if (pantryDoc.exists()) {
      const data = pantryDoc.data();
      console.log(`Loaded ${data.items?.length || 0} pantry items from Firestore`);
      return data.items || [];
    } else {
      console.log('No pantry items found, returning empty array');
      return [];
    }
  } catch (error) {
    console.error('Error getting pantry items:', error);
    throw new Error(`Failed to get pantry items: ${error.message}`);
  }
}

/**
 * Transfer shopping list items to pantry with sequential writes (NO RACE CONDITIONS)
 * Each item is saved individually to prevent race conditions and ensure reliability.
 *
 * @param {Array} items - Array of items to transfer (from shopping list)
 * @returns {Promise<Object>} - Results object with success/failed/skipped counts
 */
export async function transferItemsToPantry(items) {
  console.log('🔍 === TRANSFER TO PANTRY (SEQUENTIAL) ===');
  console.log(`Starting transfer of ${items.length} items`);

  if (!items || items.length === 0) {
    throw new Error('No items to transfer');
  }

  const results = {
    success: [],
    failed: [],
    skipped: []
  };

  // SEQUENTIAL PROCESSING - One item at a time
  for (let i = 0; i < items.length; i++) {
    const item = items[i];

    try {
      // VALIDATE ITEM
      if (!item.name || typeof item.name !== 'string' || item.name.trim() === '') {
        console.warn(`⚠️ [${i + 1}/${items.length}] Skipping item - no valid name:`, item);
        results.skipped.push({ item, reason: 'No valid name' });
        continue;
      }

      if (item.quantity === undefined || item.quantity === null || isNaN(parseFloat(item.quantity))) {
        console.warn(`⚠️ [${i + 1}/${items.length}] Skipping ${item.name} - invalid quantity:`, item.quantity);
        results.skipped.push({ item, reason: 'Invalid quantity' });
        continue;
      }

      console.log(`📦 [${i + 1}/${items.length}] Transferring: "${item.name}" (${item.quantity} ${item.unit || 'unit'})`);

      // Guest mode: Add to localStorage pantry
      if (isGuestMode()) {
        const currentPantry = getGuestPantry();

        // Check if item already exists (merge quantities)
        const existingIndex = currentPantry.findIndex(p =>
          p.name.toLowerCase().trim() === item.name.toLowerCase().trim()
        );

        if (existingIndex !== -1) {
          // Merge with existing item
          const existing = currentPantry[existingIndex];
          if (existing.unit === item.unit) {
            currentPantry[existingIndex] = {
              ...existing,
              quantity: parseFloat(existing.quantity) + parseFloat(item.quantity)
            };
          } else {
            // Different units - add as separate item
            currentPantry.push({
              id: `pantry_${Date.now()}_${i}_${Math.random().toString(36).substr(2, 9)}`,
              name: item.name.trim(),
              quantity: parseFloat(item.quantity),
              unit: item.unit || 'unit'
            });
          }
        } else {
          // Add as new item
          currentPantry.push({
            id: `pantry_${Date.now()}_${i}_${Math.random().toString(36).substr(2, 9)}`,
            name: item.name.trim(),
            quantity: parseFloat(item.quantity),
            unit: item.unit || 'unit'
          });
        }

        setGuestPantry(currentPantry);
        console.log(`✅ [${i + 1}/${items.length}] Successfully saved to guest pantry: "${item.name}"`);
        results.success.push({ name: item.name, quantity: item.quantity, unit: item.unit });
      } else {
        // Regular user: Load current pantry, merge, and save back
        const pantryRef = getUserDoc('pantryItems', 'current');
        const pantryDoc = await getDoc(pantryRef);

        let currentPantryItems = [];
        if (pantryDoc.exists()) {
          currentPantryItems = pantryDoc.data().items || [];
        }

        // Check if item already exists (merge quantities)
        const existingIndex = currentPantryItems.findIndex(p =>
          p.name.toLowerCase().trim() === item.name.toLowerCase().trim()
        );

        if (existingIndex !== -1) {
          // Merge with existing item
          const existing = currentPantryItems[existingIndex];
          if (existing.unit === item.unit) {
            currentPantryItems[existingIndex] = {
              ...existing,
              quantity: parseFloat(existing.quantity) + parseFloat(item.quantity)
            };
          } else {
            // Different units - add as separate item
            currentPantryItems.push({
              name: item.name.trim(),
              quantity: parseFloat(item.quantity),
              unit: item.unit || 'unit'
            });
          }
        } else {
          // Add as new item
          currentPantryItems.push({
            name: item.name.trim(),
            quantity: parseFloat(item.quantity),
            unit: item.unit || 'unit'
          });
        }

        // SAVE BACK TO FIRESTORE (with await - sequential!)
        await setDoc(pantryRef, {
          items: currentPantryItems,
          updatedAt: serverTimestamp()
        });

        console.log(`✅ [${i + 1}/${items.length}] Successfully saved: "${item.name}"`);
        results.success.push({ name: item.name, quantity: item.quantity, unit: item.unit });
      }

      // Small delay to prevent overwhelming Firestore (optional but safe)
      if (i < items.length - 1 && !isGuestMode()) {
        await new Promise(resolve => setTimeout(resolve, 50)); // 50ms delay between Firestore writes
      }

    } catch (error) {
      console.error(`❌ [${i + 1}/${items.length}] FAILED to transfer "${item.name}":`, error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        item: item
      });
      results.failed.push({ item, error: error.message });

      // Continue with next item instead of stopping
    }
  }

  // FINAL SUMMARY
  console.log('📊 === TRANSFER SUMMARY ===');
  console.log(`  ✅ Success: ${results.success.length}/${items.length}`);
  console.log(`  ❌ Failed: ${results.failed.length}/${items.length}`);
  console.log(`  ⚠️  Skipped: ${results.skipped.length}/${items.length}`);

  if (results.failed.length > 0) {
    console.error('❌ Failed items:', results.failed.map(f => f.item.name));
  }

  if (results.skipped.length > 0) {
    console.warn('⚠️  Skipped items:', results.skipped.map(s => s.item.name || 'unnamed'));
  }

  // Return results for UI feedback
  return {
    success: results.success.length,
    failed: results.failed.length,
    skipped: results.skipped.length,
    total: items.length,
    failedItems: results.failed,
    skippedItems: results.skipped
  };
}

// ============================================================================
// COOKING HISTORY (Phase 7.5.2 - Recipe Completion Tracking with Ratings)
// ============================================================================

/**
 * Save or update cooking history for a recipe in Firestore or localStorage (guest mode)
 * Stores: cooking count, ratings, notes, dates
 *
 * Data structure:
 * {
 *   recipeId: string,
 *   recipeName: string,
 *   cookedCount: number,
 *   firstCookedDate: Timestamp,
 *   lastCookedDate: Timestamp,
 *   ratings: [{ rating: number, notes: string, date: Timestamp }],
 *   averageRating: number
 * }
 *
 * @param {string} recipeId - ID of the recipe
 * @param {string} recipeName - Name of the recipe
 * @param {number} rating - Rating (1-5 stars, 0 if no rating this time)
 * @param {string} notes - Optional cooking notes
 * @returns {Promise<void>}
 */
export async function saveCookingHistory(recipeId, recipeName, rating, notes = '') {
  try {
    const jsDate = new Date().toISOString();

    // Guest mode: save to localStorage
    if (isGuestMode()) {
      const history = getGuestCookingHistory();
      const existingIndex = history.findIndex(h => h.recipeId === recipeId);

      if (existingIndex >= 0) {
        // UPDATE existing history
        const existing = history[existingIndex];
        const newRatings = rating > 0
          ? [...existing.ratings, { rating, notes, date: jsDate }]
          : existing.ratings;

        const totalRating = newRatings.reduce((sum, r) => sum + r.rating, 0);
        const averageRating = newRatings.length > 0 ? totalRating / newRatings.length : 0;

        history[existingIndex] = {
          ...existing,
          cookedCount: existing.cookedCount + 1,
          lastCookedDate: jsDate,
          ratings: newRatings,
          averageRating: parseFloat(averageRating.toFixed(2)),
          updatedAt: jsDate
        };
      } else {
        // CREATE new history
        history.push({
          recipeId,
          recipeName,
          cookedCount: 1,
          firstCookedDate: jsDate,
          lastCookedDate: jsDate,
          ratings: rating > 0 ? [{ rating, notes, date: jsDate }] : [],
          averageRating: rating || 0,
          createdAt: jsDate,
          updatedAt: jsDate
        });
      }

      setGuestCookingHistory(history);
      console.log('👤 saveCookingHistory: Guest mode - saved cooking history for recipe:', recipeId);
      return;
    }

    // Regular user: save to Firestore
    const cookingHistoryRef = getUserDoc('cookingHistory', recipeId);
    const existingDoc = await getDoc(cookingHistoryRef);

    // Use serverTimestamp() for top-level fields
    const now = serverTimestamp();

    if (existingDoc.exists()) {
      // UPDATE existing history
      const existingData = existingDoc.data();
      // BUG FIX #8: Use JavaScript date string instead of serverTimestamp() inside array
      const newRatings = rating > 0
        ? [...existingData.ratings, { rating, notes, date: jsDate }]
        : existingData.ratings;

      // Calculate new average rating
      const totalRating = newRatings.reduce((sum, r) => sum + r.rating, 0);
      const averageRating = newRatings.length > 0 ? totalRating / newRatings.length : 0;

      await updateDoc(cookingHistoryRef, {
        cookedCount: existingData.cookedCount + 1,
        lastCookedDate: now,
        ratings: newRatings,
        averageRating: parseFloat(averageRating.toFixed(2)),
        updatedAt: now
      });

      console.log('Cooking history updated for recipe:', recipeId);
    } else {
      // CREATE new history
      // BUG FIX #8: Use JavaScript date string instead of serverTimestamp() inside array
      const newData = {
        recipeId,
        recipeName,
        cookedCount: 1,
        firstCookedDate: now,
        lastCookedDate: now,
        ratings: rating > 0 ? [{ rating, notes, date: jsDate }] : [],
        averageRating: rating || 0,
        createdAt: now,
        updatedAt: now
      };

      await setDoc(cookingHistoryRef, newData);
      console.log('Cooking history created for recipe:', recipeId);
    }
  } catch (error) {
    console.error('Error saving cooking history:', error);
    throw new Error(`Failed to save cooking history: ${error.message}`);
  }
}

/**
 * Get cooking history for a specific recipe from Firestore or localStorage (guest mode)
 * @param {string} recipeId - ID of the recipe
 * @returns {Promise<Object|null>} - Cooking history object or null if not found
 */
export async function getCookingHistory(recipeId) {
  try {
    // Guest mode: find in localStorage
    if (isGuestMode()) {
      const history = getGuestCookingHistory();
      const record = history.find(h => h.recipeId === recipeId);
      if (record) {
        console.log('👤 getCookingHistory: Guest mode - found history for recipe:', recipeId);
        return record;
      } else {
        return null;
      }
    }

    // Regular user: load from Firestore
    const cookingHistoryRef = getUserDoc('cookingHistory', recipeId);
    const docSnap = await getDoc(cookingHistoryRef);

    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data()
      };
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error getting cooking history:', error);
    throw new Error(`Failed to get cooking history: ${error.message}`);
  }
}

/**
 * Get all cooking history from Firestore or localStorage (guest mode)
 * @returns {Promise<Array>} - Array of cooking history objects
 */
export async function getAllCookingHistory() {
  try {
    // Guest mode: load from localStorage
    if (isGuestMode()) {
      const history = getGuestCookingHistory();
      console.log('👤 getAllCookingHistory: Guest mode - retrieved history for', history.length, 'recipes');
      return history;
    }

    // Regular user: load from Firestore
    const cookingHistoryRef = getUserCollection('cookingHistory');
    const querySnapshot = await getDocs(cookingHistoryRef);

    const history = [];
    querySnapshot.forEach((doc) => {
      history.push({
        id: doc.id,
        ...doc.data()
      });
    });

    console.log('Retrieved cooking history for', history.length, 'recipes');
    return history;
  } catch (error) {
    console.error('Error getting all cooking history:', error);
    throw new Error(`Failed to get cooking history: ${error.message}`);
  }
}

// ============================================================================
// LEFTOVER TRACKING
// ============================================================================
// WHY: Track leftovers to reduce food waste
// WHAT: Users can add leftovers when cooking and track expiration dates
// WHERE: Stored in users/{userId}/leftovers collection in Firestore
// ============================================================================

/**
 * Get guest leftovers from localStorage
 * @returns {Array} - Array of leftover objects
 */
function getGuestLeftovers() {
  const stored = localStorage.getItem('guestLeftovers');
  if (stored) {
    return JSON.parse(stored);
  }
  return [];
}

/**
 * Save guest leftovers to localStorage
 * @param {Array} leftovers - Array of leftover objects
 */
function setGuestLeftovers(leftovers) {
  localStorage.setItem('guestLeftovers', JSON.stringify(leftovers));
}

/**
 * Add a leftover item to track food waste
 * @param {Object} leftoverData - Leftover data { recipeName, recipeId, servings, expirationDate }
 * @returns {Promise<string>} - ID of the created leftover
 */
export async function addLeftover(leftoverData) {
  try {
    const now = new Date().toISOString();

    // Guest mode: save to localStorage
    if (isGuestMode()) {
      const leftovers = getGuestLeftovers();
      const newLeftover = {
        id: `leftover_${Date.now()}`,
        ...leftoverData,
        addedDate: now
      };
      leftovers.push(newLeftover);
      setGuestLeftovers(leftovers);
      console.log('✅ Leftover added to guest storage');
      return newLeftover.id;
    }

    // Regular user: save to Firestore
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User must be logged in to add leftovers');
    }

    const leftoverRef = doc(collection(db, `users/${user.uid}/leftovers`));
    const leftover = {
      id: leftoverRef.id,
      ...leftoverData,
      addedDate: now,
      userId: user.uid
    };

    await setDoc(leftoverRef, leftover);
    console.log('✅ Leftover added to Firestore:', leftover.recipeName);
    return leftoverRef.id;
  } catch (error) {
    console.error('Error adding leftover:', error);
    throw new Error(`Failed to add leftover: ${error.message}`);
  }
}

/**
 * Remove a leftover item
 * @param {string} leftoverId - ID of the leftover to remove
 * @returns {Promise<void>}
 */
export async function removeLeftover(leftoverId) {
  try {
    // Guest mode: remove from localStorage
    if (isGuestMode()) {
      const leftovers = getGuestLeftovers();
      const filtered = leftovers.filter(item => item.id !== leftoverId);
      setGuestLeftovers(filtered);
      console.log('✅ Leftover removed from guest storage');
      return;
    }

    // Regular user: remove from Firestore
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User must be logged in to remove leftovers');
    }

    await deleteDoc(doc(db, `users/${user.uid}/leftovers`, leftoverId));
    console.log('✅ Leftover removed from Firestore');
  } catch (error) {
    console.error('Error removing leftover:', error);
    throw new Error(`Failed to remove leftover: ${error.message}`);
  }
}

/**
 * Get all leftovers for current user
 * @returns {Promise<Array>} - Array of leftover objects
 */
export async function getLeftovers() {
  try {
    // Guest mode: get from localStorage
    if (isGuestMode()) {
      const leftovers = getGuestLeftovers();
      console.log('Retrieved', leftovers.length, 'leftovers from guest storage');
      return leftovers;
    }

    // Regular user: get from Firestore
    const user = auth.currentUser;
    if (!user) {
      console.log('No user logged in, returning empty leftovers array');
      return [];
    }

    const leftoversRef = collection(db, `users/${user.uid}/leftovers`);
    const snapshot = await getDocs(leftoversRef);

    const leftovers = [];
    snapshot.forEach((doc) => {
      leftovers.push({
        id: doc.id,
        ...doc.data()
      });
    });

    console.log('Retrieved', leftovers.length, 'leftovers from Firestore');
    return leftovers;
  } catch (error) {
    console.error('Error getting leftovers:', error);
    throw new Error(`Failed to get leftovers: ${error.message}`);
  }
}

// ============================================================================
// SHOPPING LIST COLLECTION
// ============================================================================

/**
 * Get all shopping list items from Firestore or localStorage (guest mode)
 * @returns {Promise<Array>} - Array of shopping list item objects
 */
export async function getShoppingListItems() {
  try {
    // Guest mode: load from localStorage
    if (isGuestMode()) {
      const stored = localStorage.getItem('guestShoppingList');
      if (stored) {
        const items = JSON.parse(stored);
        console.log('👤 getShoppingListItems: Guest mode - loaded', items.length, 'items');
        return items;
      }
      console.log('👤 getShoppingListItems: Guest mode - no items found');
      return [];
    }

    // Regular user: load from Firestore
    const shoppingListRef = getUserCollection('currentShoppingList');
    const querySnapshot = await getDocs(shoppingListRef);

    const items = [];
    querySnapshot.forEach((doc) => {
      items.push({
        id: doc.id,
        ...doc.data()
      });
    });

    console.log(`📋 Loaded ${items.length} shopping list items from Firestore`);
    return items;
  } catch (error) {
    console.error('Error getting shopping list items:', error);
    throw new Error(`Failed to get shopping list items: ${error.message}`);
  }
}

/**
 * Save shopping list items to Firestore or localStorage (guest mode)
 * Replaces all existing recipe-sourced items with new ones
 * @param {Array} items - Array of shopping list item objects
 */
export async function saveShoppingListItems(items) {
  try {
    // Guest mode: save to localStorage
    if (isGuestMode()) {
      localStorage.setItem('guestShoppingList', JSON.stringify(items));
      console.log('👤 saveShoppingListItems: Guest mode - saved', items.length, 'items');
      console.log('⚠️ Guest data will be lost when you exit. Create an account to save permanently!');
      return;
    }

    // Regular user: save to Firestore
    // First, delete all existing recipe-sourced items
    const shoppingListRef = getUserCollection('currentShoppingList');
    const existingSnapshot = await getDocs(shoppingListRef);

    const deletePromises = existingSnapshot.docs
      .filter(doc => doc.data().source === 'recipe')
      .map(doc => deleteDoc(doc.ref));

    await Promise.all(deletePromises);

    // Then add all new items
    const addPromises = items.map(item => {
      const itemRef = getUserDoc('currentShoppingList', item.id);
      return setDoc(itemRef, {
        ...item,
        source: 'recipe',
        addedAt: serverTimestamp()
      });
    });

    await Promise.all(addPromises);
    console.log(`✅ Saved ${items.length} shopping list items to Firestore`);
  } catch (error) {
    console.error('Error saving shopping list items:', error);
    throw new Error(`Failed to save shopping list items: ${error.message}`);
  }
}

/**
 * Add a single manual item to shopping list
 * @param {Object} item - Shopping list item object
 */
export async function addShoppingListItem(item) {
  try {
    // Guest mode: add to localStorage
    if (isGuestMode()) {
      const existing = JSON.parse(localStorage.getItem('guestShoppingList') || '[]');
      existing.push(item);
      localStorage.setItem('guestShoppingList', JSON.stringify(existing));
      console.log('👤 addShoppingListItem: Guest mode - added item');
      return;
    }

    // Regular user: add to Firestore
    const itemRef = getUserDoc('currentShoppingList', item.id);
    await setDoc(itemRef, {
      ...item,
      addedAt: serverTimestamp()
    });
    console.log(`✅ Added item to shopping list: ${item.name}`);
  } catch (error) {
    console.error('Error adding shopping list item:', error);
    throw new Error(`Failed to add shopping list item: ${error.message}`);
  }
}

/**
 * Update a shopping list item
 * @param {string} itemId - Item ID
 * @param {Object} updates - Fields to update
 */
export async function updateShoppingListItem(itemId, updates) {
  try {
    // Guest mode: update in localStorage
    if (isGuestMode()) {
      const existing = JSON.parse(localStorage.getItem('guestShoppingList') || '[]');
      const index = existing.findIndex(item => item.id === itemId);
      if (index !== -1) {
        existing[index] = { ...existing[index], ...updates };
        localStorage.setItem('guestShoppingList', JSON.stringify(existing));
        console.log('👤 updateShoppingListItem: Guest mode - updated item');
      }
      return;
    }

    // Regular user: update in Firestore
    const itemRef = getUserDoc('currentShoppingList', itemId);
    await updateDoc(itemRef, updates);
    console.log(`✅ Updated shopping list item: ${itemId}`);
  } catch (error) {
    console.error('Error updating shopping list item:', error);
    throw new Error(`Failed to update shopping list item: ${error.message}`);
  }
}

/**
 * Delete a shopping list item
 * @param {string} itemId - Item ID
 */
export async function deleteShoppingListItem(itemId) {
  try {
    // Guest mode: delete from localStorage
    if (isGuestMode()) {
      const existing = JSON.parse(localStorage.getItem('guestShoppingList') || '[]');
      const filtered = existing.filter(item => item.id !== itemId);
      localStorage.setItem('guestShoppingList', JSON.stringify(filtered));
      console.log('👤 deleteShoppingListItem: Guest mode - deleted item');
      return;
    }

    // Regular user: delete from Firestore
    const itemRef = getUserDoc('currentShoppingList', itemId);
    await deleteDoc(itemRef);
    console.log(`✅ Deleted shopping list item: ${itemId}`);
  } catch (error) {
    console.error('Error deleting shopping list item:', error);
    throw new Error(`Failed to delete shopping list item: ${error.message}`);
  }
}

/**
 * Clear all shopping list items
 */
export async function clearShoppingList() {
  try {
    // Guest mode: clear localStorage
    if (isGuestMode()) {
      localStorage.setItem('guestShoppingList', JSON.stringify([]));
      console.log('👤 clearShoppingList: Guest mode - cleared all items');
      return;
    }

    // Regular user: delete all from Firestore
    const shoppingListRef = getUserCollection('currentShoppingList');
    const snapshot = await getDocs(shoppingListRef);

    const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deletePromises);

    console.log('🗑️ Shopping list cleared');
  } catch (error) {
    console.error('Error clearing shopping list:', error);
    throw new Error(`Failed to clear shopping list: ${error.message}`);
  }
}

/**
 * Add a manually-entered item to the shopping list
 * These items are not from recipes - they're things like paper towels, cleaning supplies, etc.
 *
 * @param {Object} item - Item object with { id, name, quantity, unit, category, source: 'manual', ... }
 * @returns {Promise<void>}
 */
export async function addManualItemToShoppingList(item) {
  console.log('➕ Adding manual item to shopping list:', item.name);

  try {
    // Guest mode: add to localStorage
    if (isGuestMode()) {
      const stored = localStorage.getItem('guestShoppingList');
      const currentList = stored ? JSON.parse(stored) : [];
      currentList.push(item);
      localStorage.setItem('guestShoppingList', JSON.stringify(currentList));
      console.log('👤 addManualItemToShoppingList: Guest mode - added item:', item.name);
      return;
    }

    // Regular user: add to Firestore
    const itemRef = getUserDoc('currentShoppingList', item.id);
    await setDoc(itemRef, item);

    console.log('✅ Manual item added successfully:', item.name);
  } catch (error) {
    console.error('❌ Failed to add manual item:', error);
    throw new Error(`Failed to add manual item: ${error.message}`);
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Test Firestore connection
 * @returns {Promise<boolean>} - True if connection successful
 */
export async function testFirestoreConnection() {
  try {
    // Try to read from a collection (even if empty)
    const testRef = getUserCollection('recipes');
    await getDocs(testRef);
    console.log('✅ Firestore connection successful');
    return true;
  } catch (error) {
    console.error('❌ Firestore connection failed:', error);
    return false;
  }
}

// Export all functions
const firestoreService = {
  // Recipes
  saveRecipe,
  getAllRecipes,
  getRecipeById,
  updateRecipe,
  deleteRecipe,

  // Meal Plans
  saveMealPlan,
  getMealPlan,
  updateMealPlan,

  // Saved Meal Plans (Phase 6.1)
  saveNamedMealPlan,
  getAllSavedMealPlans,
  getSavedMealPlanById,
  deleteSavedMealPlan,

  // Pantry Items
  savePantryItems,
  getPantryItems,

  // Shopping List
  getShoppingListItems,
  saveShoppingListItems,
  addShoppingListItem,
  updateShoppingListItem,
  deleteShoppingListItem,
  clearShoppingList,

  // Cooking History (Phase 7.5.2)
  saveCookingHistory,
  getCookingHistory,
  getAllCookingHistory,

  // Utilities
  testFirestoreConnection,

  // Leftovers (Food waste tracking)
  addLeftover,
  removeLeftover,
  getLeftovers
};

export default firestoreService;
