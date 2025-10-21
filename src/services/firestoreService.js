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

    const recipesRef = getUserCollection('recipes');
    const recipeWithTimestamp = {
      ...recipe,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    const docRef = await addDoc(recipesRef, recipeWithTimestamp);
    console.log(`✅ saveRecipe: Recipe saved with ID: ${docRef.id}`);
    console.log(`📂 Full path: users/${userId}/recipes/${docRef.id}`);
    return docRef.id;
  } catch (error) {
    console.error('❌ saveRecipe: Error saving recipe:', error);
    throw new Error(`Failed to save recipe: ${error.message}`);
  }
}

/**
 * Get all recipes from Firestore
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

    const recipeRef = getUserDoc('recipes', id);
    const recipeDoc = await getDoc(recipeRef);

    if (recipeDoc.exists()) {
      console.log(`✅ getRecipeById: Recipe found:`, recipeDoc.data().name);
      return {
        id: recipeDoc.id,
        ...recipeDoc.data()
      };
    } else {
      console.warn(`⚠️ getRecipeById: Recipe with ID ${id} not found at users/${userId}/recipes/${id}`);
      return null;
    }
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

  // Cooking History (Phase 7.5.2)
  saveCookingHistory,
  getCookingHistory,
  getAllCookingHistory,

  // Utilities
  testFirestoreConnection
};

export default firestoreService;
