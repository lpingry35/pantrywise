// Ingredient Matching Utilities
// Handles ingredient normalization, comparison, and recipe matching

import { convertUnit, normalizeUnit as normalizeUnitConverter } from './unitConverter';

// ============================================================================
// INGREDIENT SYNONYM MAP
// Maps variations of ingredient names to a standard form
// ============================================================================

const ingredientSynonyms = {
  // Proteins
  'chicken breast': ['chicken', 'chicken breasts', 'poultry', 'chicken meat'],
  'chicken': ['chicken breast', 'poultry', 'chicken meat'],
  'ground beef': ['beef', 'ground meat', 'minced beef', 'hamburger meat'],
  'beef': ['ground beef', 'beef meat'],
  'pork': ['pork chops', 'pork meat', 'pork shoulder'],
  'pork chops': ['pork', 'pork meat'],
  'shrimp': ['prawns', 'shrimps'],
  'salmon': ['salmon fillets', 'salmon fillet'],

  // Vegetables
  'onion': ['onions', 'yellow onion', 'white onion'],
  'garlic': ['garlic cloves', 'garlic clove', 'minced garlic'],
  'tomatoes': ['tomato', 'fresh tomatoes', 'roma tomatoes'],
  'bell pepper': ['bell peppers', 'sweet pepper', 'pepper', 'capsicum'],
  'broccoli': ['broccoli florets'],
  'carrots': ['carrot'],
  'potatoes': ['potato'],
  'mushrooms': ['mushroom', 'button mushrooms'],

  // Pantry/Grains
  'rice': ['white rice', 'long grain rice'],
  'pasta': ['spaghetti', 'penne', 'noodles', 'linguine'],
  'spaghetti': ['pasta', 'noodles'],
  'flour': ['all-purpose flour', 'AP flour', 'plain flour'],
  'bread': ['sandwich bread', 'white bread'],
  'quinoa': ['quinoa grain'],

  // Dairy
  'cheese': ['shredded cheese', 'grated cheese', 'cheddar cheese'],
  'parmesan cheese': ['parmesan', 'parmigiano', 'grated parmesan'],
  'mozzarella cheese': ['mozzarella', 'fresh mozzarella'],
  'feta cheese': ['feta'],
  'milk': ['whole milk', 'dairy milk'],
  'butter': ['unsalted butter', 'salted butter'],

  // Oils & Condiments
  'olive oil': ['extra virgin olive oil', 'EVOO', 'oil'],
  'vegetable oil': ['cooking oil', 'oil'],
  'soy sauce': ['soya sauce', 'tamari'],
  'fish sauce': ['nam pla'],

  // Canned Goods
  'crushed tomatoes': ['canned tomatoes', 'tomato sauce', 'tomato puree'],
  'black beans': ['canned black beans', 'cooked black beans'],
  'chickpeas': ['garbanzo beans', 'canned chickpeas'],
  'kidney beans': ['red beans', 'canned kidney beans'],

  // Herbs & Spices
  'basil': ['fresh basil', 'basil leaves'],
  'parsley': ['fresh parsley', 'Italian parsley'],
  'oregano': ['dried oregano'],
  'cumin': ['ground cumin', 'cumin powder'],
  'paprika': ['sweet paprika', 'paprika powder']
};

// ============================================================================
// 1. NORMALIZE INGREDIENT
// Extracts clean ingredient name from strings with quantities
// ============================================================================

/**
 * Normalizes an ingredient string by removing quantities, units, and extra descriptors
 * @param {string} ingredientString - Raw ingredient string (e.g., "2 cups chicken breast")
 * @returns {string} - Normalized ingredient name (e.g., "chicken breast")
 */
export function normalizeIngredient(ingredientString) {
  if (!ingredientString || typeof ingredientString !== 'string') {
    return '';
  }

  let normalized = ingredientString.toLowerCase().trim();

  // Remove common quantity words and numbers at the beginning
  normalized = normalized.replace(/^[\d./\s]+/, ''); // Remove leading numbers and fractions

  // Remove common units
  const units = [
    'cup', 'cups', 'tablespoon', 'tablespoons', 'tbsp', 'teaspoon', 'teaspoons', 'tsp',
    'ounce', 'ounces', 'oz', 'pound', 'pounds', 'lb', 'lbs',
    'gram', 'grams', 'g', 'kilogram', 'kilograms', 'kg',
    'milliliter', 'milliliters', 'ml', 'liter', 'liters', 'l',
    'piece', 'pieces', 'clove', 'cloves', 'small', 'medium', 'large', 'whole'
  ];

  const unitsPattern = new RegExp(`^(${units.join('|')})\\s+`, 'i');
  normalized = normalized.replace(unitsPattern, '');

  // Remove common descriptors
  const descriptors = [
    'fresh', 'frozen', 'dried', 'canned', 'cooked', 'raw', 'organic',
    'chopped', 'diced', 'minced', 'sliced', 'shredded', 'grated',
    'peeled', 'trimmed', 'boneless', 'skinless'
  ];

  descriptors.forEach(descriptor => {
    const pattern = new RegExp(`\\b${descriptor}\\b`, 'gi');
    normalized = normalized.replace(pattern, '');
  });

  // Clean up extra spaces and trim
  normalized = normalized.replace(/\s+/g, ' ').trim();

  return normalized;
}

// ============================================================================
// 2. CHECK IF INGREDIENTS MATCH
// Uses synonym map to determine if two ingredients are the same
// ============================================================================

/**
 * Checks if two ingredient names match, considering synonyms
 * @param {string} ingredient1 - First ingredient name
 * @param {string} ingredient2 - Second ingredient name
 * @returns {boolean} - True if ingredients match
 */
function ingredientsMatch(ingredient1, ingredient2) {
  const norm1 = normalizeIngredient(ingredient1).toLowerCase();
  const norm2 = normalizeIngredient(ingredient2).toLowerCase();

  // Direct match
  if (norm1 === norm2) return true;

  // Check if either ingredient is in the other's synonym list
  if (ingredientSynonyms[norm1]?.includes(norm2)) return true;
  if (ingredientSynonyms[norm2]?.includes(norm1)) return true;

  // Check if both share a common synonym
  const synonyms1 = ingredientSynonyms[norm1] || [];
  const synonyms2 = ingredientSynonyms[norm2] || [];

  for (const syn1 of synonyms1) {
    if (synonyms2.includes(syn1) || syn1 === norm2) return true;
  }

  return false;
}

// ============================================================================
// 3. FIND SHARED INGREDIENTS
// Returns array of ingredient names that appear in both recipes
// ============================================================================

/**
 * Finds ingredients that are shared between two recipes
 * @param {Object} recipe1 - First recipe object with ingredients array
 * @param {Object} recipe2 - Second recipe object with ingredients array
 * @returns {Array<string>} - Array of shared ingredient names
 */
export function findSharedIngredients(recipe1, recipe2) {
  if (!recipe1?.ingredients || !recipe2?.ingredients) {
    return [];
  }

  const sharedIngredients = [];
  const recipe2IngredientNames = recipe2.ingredients.map(ing =>
    normalizeIngredient(ing.name)
  );

  recipe1.ingredients.forEach(ing1 => {
    const normalized1 = normalizeIngredient(ing1.name);

    // Check if this ingredient matches any in recipe2
    const hasMatch = recipe2IngredientNames.some(ing2Name =>
      ingredientsMatch(normalized1, ing2Name)
    );

    if (hasMatch && !sharedIngredients.includes(normalized1)) {
      sharedIngredients.push(normalized1);
    }
  });

  return sharedIngredients;
}

// ============================================================================
// 4. CALCULATE MATCH SCORE
// Returns percentage (0-100) of ingredient overlap between recipes
// ============================================================================

/**
 * Calculates the match score between two recipes based on shared ingredients
 * @param {Object} recipe1 - First recipe object
 * @param {Object} recipe2 - Second recipe object
 * @returns {number} - Match score as percentage (0-100)
 */
export function calculateMatchScore(recipe1, recipe2) {
  if (!recipe1?.ingredients || !recipe2?.ingredients) {
    return 0;
  }

  const sharedIngredients = findSharedIngredients(recipe1, recipe2);

  // Calculate based on the recipe with fewer ingredients (more meaningful overlap)
  const smallerIngredientCount = Math.min(
    recipe1.ingredients.length,
    recipe2.ingredients.length
  );

  if (smallerIngredientCount === 0) return 0;

  const matchPercentage = (sharedIngredients.length / smallerIngredientCount) * 100;

  return Math.round(matchPercentage);
}

// ============================================================================
// 5. SUGGEST RECIPES
// Finds and ranks recipes that share ingredients with selected recipe
// ============================================================================

/**
 * Suggests recipes that share ingredients with the selected recipe
 * @param {Object} selectedRecipe - The recipe to find matches for
 * @param {Array<Object>} allRecipes - Array of all available recipes
 * @param {number} limit - Maximum number of suggestions to return (default: 5)
 * @returns {Array<Object>} - Array of suggested recipes with match scores
 */
export function suggestRecipes(selectedRecipe, allRecipes, limit = 5) {
  if (!selectedRecipe || !allRecipes || !Array.isArray(allRecipes)) {
    return [];
  }

  // Calculate match scores for all recipes (excluding the selected one)
  const recipesWithScores = allRecipes
    .filter(recipe => recipe.id !== selectedRecipe.id)
    .map(recipe => ({
      ...recipe,
      matchScore: calculateMatchScore(selectedRecipe, recipe),
      sharedIngredients: findSharedIngredients(selectedRecipe, recipe)
    }))
    .filter(recipe => recipe.matchScore > 0) // Only include recipes with shared ingredients
    .sort((a, b) => {
      // Sort by match score (descending), then by number of shared ingredients
      if (b.matchScore !== a.matchScore) {
        return b.matchScore - a.matchScore;
      }
      return b.sharedIngredients.length - a.sharedIngredients.length;
    });

  // Return top matches up to the limit
  return recipesWithScores.slice(0, limit);
}

// ============================================================================
// NORMALIZE UNIT
// Helper function to handle singular/plural units
// ============================================================================

/**
 * Normalizes a unit by converting plural to singular
 * @param {string} unit - The unit to normalize (e.g., "cups", "lbs")
 * @returns {string} - Normalized unit (e.g., "cup", "lb")
 */
function normalizeUnit(unit) {
  if (!unit || typeof unit !== 'string') return '';

  const normalized = unit.trim().toLowerCase();

  // Handle common plural forms
  if (normalized.endsWith('s') && normalized.length > 1) {
    // Remove trailing 's' for most plurals (cups → cup, lbs → lb, pieces → piece)
    return normalized.slice(0, -1);
  }

  return normalized;
}

// ============================================================================
// 6. MATCH RECIPES TO PANTRY
// Finds recipes user can make with pantry ingredients
// ============================================================================

/**
 * Matches recipes to pantry ingredients and returns sorted by match percentage
 * @param {Array<Object>} pantryIngredients - Array of pantry items with {name, quantity, unit}
 * @param {Array<Object>} allRecipes - Array of all available recipes
 * @returns {Array<Object>} - Array of recipes with pantry match info
 */
export function matchRecipesToPantry(pantryIngredients, allRecipes) {
  if (!pantryIngredients || !Array.isArray(pantryIngredients) ||
      !allRecipes || !Array.isArray(allRecipes)) {
    return [];
  }

  // Normalize pantry ingredients with quantities
  const normalizedPantry = pantryIngredients.map(item => ({
    normalized: typeof item === 'string' ? normalizeIngredient(item) : normalizeIngredient(item.name),
    quantity: typeof item === 'object' ? item.quantity : 0,
    unit: typeof item === 'object' ? item.unit : ''
  }));

  // Calculate matches for each recipe
  const recipesWithMatches = allRecipes.map(recipe => {
    let matchedCount = 0;
    const matchedIngredients = [];
    const missingIngredients = [];
    const partialMatches = [];

    recipe.ingredients.forEach(recipeIng => {
      const normalized = normalizeIngredient(recipeIng.name);

      // Check if this ingredient is in the pantry
      const pantryItem = normalizedPantry.find(pantryIng =>
        ingredientsMatch(normalized, pantryIng.normalized)
      );

      if (pantryItem) {
        // Check if quantities match
        const recipeQty = parseFloat(recipeIng.quantity) || 0;
        const pantryQty = pantryItem.quantity || 0;
        const recipeUnit = normalizeUnit(recipeIng.unit || '');
        const pantryUnit = normalizeUnit(pantryItem.unit || '');

        // If units match (after normalization), compare quantities
        if (recipeUnit === pantryUnit && recipeUnit !== '') {
          if (pantryQty >= recipeQty) {
            // Have enough
            matchedCount++;
            matchedIngredients.push(normalized);
          } else if (pantryQty > 0) {
            // Have some but not enough (partial match)
            const matchPercent = Math.round((pantryQty / recipeQty) * 100);
            partialMatches.push({
              name: normalized,
              displayName: recipeIng.name,
              has: pantryQty,
              needs: recipeQty,
              unit: recipeUnit,
              matchPercent: matchPercent
            });
            // Don't add to missingIngredients since we have partial match
          } else {
            // Have 0 quantity
            missingIngredients.push(normalized);
          }
        } else if (recipeUnit === '' || pantryUnit === '') {
          // One or both units are empty - can't reliably compare
          // Assume we have it if it's in pantry
          matchedCount++;
          matchedIngredients.push(normalized);
        } else {
          // Units don't match - try to convert using unit converter
          const ingredientName = recipeIng.name || normalized;

          // Try to convert pantry quantity to recipe unit
          const convertedPantryQty = convertUnit(pantryQty, pantryUnit, recipeUnit, ingredientName);

          if (convertedPantryQty !== null) {
            // Conversion successful! Now we can compare
            if (convertedPantryQty >= recipeQty) {
              // Have enough after conversion
              matchedCount++;
              matchedIngredients.push(normalized);
            } else if (convertedPantryQty > 0) {
              // Have some but not enough after conversion
              const matchPercent = Math.round((convertedPantryQty / recipeQty) * 100);
              partialMatches.push({
                name: normalized,
                displayName: recipeIng.name,
                has: `${pantryQty} ${pantryUnit} (≈${convertedPantryQty.toFixed(2)} ${recipeUnit})`,
                needs: recipeQty,
                unit: recipeUnit,
                matchPercent: matchPercent
              });
            } else {
              // Converted to 0 or negative
              missingIngredients.push(normalized);
            }
          } else {
            // Conversion failed - units are incompatible
            partialMatches.push({
              name: normalized,
              displayName: recipeIng.name,
              has: `${pantryQty} ${pantryUnit}`,
              needs: `${recipeQty} ${recipeUnit}`,
              unit: 'mixed',
              matchPercent: 0
            });
          }
        }
      } else {
        missingIngredients.push(normalized);
      }
    });

    const totalIngredients = recipe.ingredients.length;
    const matchPercentage = totalIngredients > 0
      ? Math.round((matchedCount / totalIngredients) * 100)
      : 0;

    return {
      ...recipe,
      pantryMatchPercentage: matchPercentage,
      matchedIngredientsCount: matchedCount,
      totalIngredientsCount: totalIngredients,
      matchedIngredients,
      missingIngredients,
      partialMatches,
      canMakeWithPantry: matchPercentage === 100
    };
  });

  // Sort by match percentage (descending), then by number of matched ingredients
  const sortedRecipes = recipesWithMatches.sort((a, b) => {
    if (b.pantryMatchPercentage !== a.pantryMatchPercentage) {
      return b.pantryMatchPercentage - a.pantryMatchPercentage;
    }
    return b.matchedIngredientsCount - a.matchedIngredientsCount;
  });

  return sortedRecipes;
}

// ============================================================================
// 7. COMPARE SHOPPING LIST WITH PANTRY
// Categorizes shopping list items based on pantry availability
// ============================================================================

/**
 * Compares shopping list items against pantry inventory
 * @param {Array<Object>} shoppingItems - Shopping list items with {name, quantity, unit}
 * @param {Array<Object>} pantryItems - Pantry items with {name, quantity, unit}
 * @returns {Object} - Categorized items: {alreadyHave, needMore, needToBuy}
 */
export function compareShoppingListWithPantry(shoppingItems, pantryItems) {
  if (!shoppingItems || !Array.isArray(shoppingItems)) {
    return { alreadyHave: [], needMore: [], needToBuy: [] };
  }

  if (!pantryItems || !Array.isArray(pantryItems) || pantryItems.length === 0) {
    // No pantry items, everything needs to be bought
    return {
      alreadyHave: [],
      needMore: [],
      needToBuy: shoppingItems.map(item => ({ ...item, status: 'buy' }))
    };
  }

  // Normalize pantry items
  const normalizedPantry = pantryItems.map(item => ({
    originalName: item.name,
    normalized: normalizeIngredient(item.name),
    quantity: parseFloat(item.quantity) || 0,
    unit: normalizeUnit(item.unit || '')
  }));

  const alreadyHave = [];
  const needMore = [];
  const needToBuy = [];

  shoppingItems.forEach(shopItem => {
    const normalized = normalizeIngredient(shopItem.name);
    const shopQty = parseFloat(shopItem.quantity) || 0;
    const shopUnit = normalizeUnit(shopItem.unit || '');

    // Find matching pantry item
    const pantryMatch = normalizedPantry.find(pantryItem =>
      ingredientsMatch(normalized, pantryItem.normalized)
    );

    if (!pantryMatch) {
      // Not in pantry at all
      needToBuy.push({
        ...shopItem,
        status: 'buy',
        message: null
      });
    } else {
      const pantryQty = pantryMatch.quantity;
      const pantryUnit = pantryMatch.unit;

      // Check if units match
      if (shopUnit === pantryUnit && shopUnit !== '') {
        if (pantryQty >= shopQty) {
          // Have enough in pantry
          alreadyHave.push({
            ...shopItem,
            status: 'have',
            pantryQty: pantryQty,
            pantryUnit: pantryUnit,
            message: `Already have ${pantryQty} ${pantryUnit} (need ${shopQty} ${shopUnit})`
          });
        } else if (pantryQty > 0) {
          // Have some but need more
          const needQty = (shopQty - pantryQty).toFixed(2);
          needMore.push({
            ...shopItem,
            status: 'partial',
            pantryQty: pantryQty,
            pantryUnit: pantryUnit,
            needQty: parseFloat(needQty),
            message: `Need ${needQty} more ${shopUnit} (you have ${pantryQty} ${pantryUnit})`
          });
        } else {
          // Pantry quantity is 0
          needToBuy.push({
            ...shopItem,
            status: 'buy',
            message: null
          });
        }
      } else if (shopUnit === '' || pantryUnit === '') {
        // Can't compare units reliably - assume we have it if it's in pantry with any quantity
        if (pantryQty > 0) {
          alreadyHave.push({
            ...shopItem,
            status: 'have',
            pantryQty: pantryQty,
            pantryUnit: pantryUnit,
            message: `Already have ${pantryQty > 0 ? `${pantryQty} ${pantryUnit || 'in pantry'}` : 'in pantry'}`
          });
        } else {
          needToBuy.push({
            ...shopItem,
            status: 'buy',
            message: null
          });
        }
      } else {
        // Units don't match - try to convert using unit converter
        const ingredientName = shopItem.name || normalized;

        // Try to convert pantry quantity to shopping unit
        const convertedPantryQty = convertUnit(pantryQty, pantryUnit, shopUnit, ingredientName);

        if (convertedPantryQty !== null) {
          // Conversion successful! Now we can compare
          if (convertedPantryQty >= shopQty) {
            // Have enough after conversion
            alreadyHave.push({
              ...shopItem,
              status: 'have',
              pantryQty: pantryQty,
              pantryUnit: pantryUnit,
              message: `Already have ${pantryQty} ${pantryUnit} ≈ ${convertedPantryQty.toFixed(2)} ${shopUnit} (need ${shopQty} ${shopUnit})`
            });
          } else if (convertedPantryQty > 0) {
            // Have some but need more after conversion
            const needQty = (shopQty - convertedPantryQty).toFixed(2);
            needMore.push({
              ...shopItem,
              status: 'partial',
              pantryQty: pantryQty,
              pantryUnit: pantryUnit,
              needQty: parseFloat(needQty),
              message: `Need ${needQty} more ${shopUnit} (you have ${pantryQty} ${pantryUnit} ≈ ${convertedPantryQty.toFixed(2)} ${shopUnit})`
            });
          }
        } else {
          // Conversion failed - units are incompatible
          needMore.push({
            ...shopItem,
            status: 'partial',
            pantryQty: pantryQty,
            pantryUnit: pantryUnit,
            needQty: shopQty,
            message: `Have ${pantryQty} ${pantryUnit}, need ${shopQty} ${shopUnit} (cannot convert units)`
          });
        }
      }
    }
  });

  return {
    alreadyHave,
    needMore,
    needToBuy
  };
}

// ============================================================================
// EXPORTS
// ============================================================================

const ingredientMatchingUtils = {
  normalizeIngredient,
  findSharedIngredients,
  calculateMatchScore,
  suggestRecipes,
  matchRecipesToPantry,
  compareShoppingListWithPantry,
  ingredientSynonyms // Export for testing/reference
};

export default ingredientMatchingUtils;
