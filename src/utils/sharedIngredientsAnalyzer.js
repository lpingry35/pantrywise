// Shared Ingredients Analyzer
// Analyzes meal plan to find ingredients used across multiple recipes

import { normalizeIngredient } from './ingredientMatching';

/**
 * Analyzes a meal plan to find ingredients that are shared across multiple recipes
 * @param {Object} mealPlan - Meal plan object with days and meals
 * @returns {Object} - Analysis results with shared ingredients data
 */
export function analyzeSharedIngredients(mealPlan) {
  if (!mealPlan) {
    return {
      totalSharedIngredients: 0,
      totalRecipes: 0,
      topSharedIngredients: [],
      ingredientUsageMap: {}
    };
  }

  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const meals = ['breakfast', 'lunch', 'dinner'];

  // Track which recipes use each ingredient and sum quantities
  const ingredientUsageMap = {}; // { normalizedIngredient: { displayName, recipes, quantities, totalQuantity, unit } }
  const recipeNames = new Set();

  // Collect all ingredients from all recipes in meal plan
  days.forEach(day => {
    meals.forEach(meal => {
      const recipe = mealPlan[day]?.[meal];
      if (recipe && recipe.ingredients) {
        recipeNames.add(recipe.name);

        recipe.ingredients.forEach(ing => {
          const normalized = normalizeIngredient(ing.name).toLowerCase();

          if (!ingredientUsageMap[normalized]) {
            ingredientUsageMap[normalized] = {
              displayName: ing.name,
              recipes: [],
              quantities: [],
              units: new Set(),
              totalQuantity: 0,
              unit: ing.unit || ''
            };
          }

          // Add recipe name if not already added (avoid duplicates if same recipe appears multiple times)
          if (!ingredientUsageMap[normalized].recipes.includes(recipe.name)) {
            ingredientUsageMap[normalized].recipes.push(recipe.name);

            // Track quantities and units
            const quantity = parseFloat(ing.quantity) || 0;
            const unit = ing.unit || '';

            ingredientUsageMap[normalized].quantities.push({
              quantity,
              unit,
              recipe: recipe.name
            });

            ingredientUsageMap[normalized].units.add(unit);
          }
        });
      }
    });
  });

  // Calculate total quantities for each ingredient
  Object.keys(ingredientUsageMap).forEach(normalized => {
    const data = ingredientUsageMap[normalized];

    // If all quantities use the same unit, sum them
    if (data.units.size === 1) {
      const unit = Array.from(data.units)[0];
      const total = data.quantities.reduce((sum, q) => sum + q.quantity, 0);
      data.totalQuantity = total;
      data.unit = unit;
      data.hasMultipleUnits = false;
      data.quantityDisplay = `${total} ${unit}`;
    } else {
      // Multiple different units - list them all separated by commas
      // Group by unit and sum quantities with same unit
      const unitGroups = {};
      data.quantities.forEach(q => {
        const unit = q.unit || 'unit';
        if (!unitGroups[unit]) {
          unitGroups[unit] = 0;
        }
        unitGroups[unit] += q.quantity;
      });

      // Create display string: "2 cups, 1 lb, 3 tbsp"
      const quantityList = Object.entries(unitGroups)
        .map(([unit, quantity]) => `${quantity} ${unit}`)
        .join(', ');

      data.totalQuantity = null;
      data.unit = 'Multiple units';
      data.hasMultipleUnits = true;
      data.quantityDisplay = quantityList;
    }
  });

  // Filter to only ingredients used in 2+ recipes (shared ingredients)
  const sharedIngredients = Object.entries(ingredientUsageMap)
    .filter(([_, data]) => data.recipes.length >= 2)
    .map(([normalized, data]) => ({
      name: data.displayName,
      normalizedName: normalized,
      recipeCount: data.recipes.length,
      recipes: data.recipes,
      totalQuantity: data.totalQuantity,
      unit: data.unit,
      hasMultipleUnits: data.hasMultipleUnits,
      quantities: data.quantities,
      quantityDisplay: data.quantityDisplay
    }))
    .sort((a, b) => b.recipeCount - a.recipeCount); // Sort by most shared first

  return {
    totalSharedIngredients: sharedIngredients.length,
    totalRecipes: recipeNames.size,
    topSharedIngredients: sharedIngredients.slice(0, 5), // Top 5 most shared
    allSharedIngredients: sharedIngredients,
    ingredientUsageMap
  };
}

/**
 * Calculates total number of ingredients across all recipes in meal plan
 * @param {Object} mealPlan - Meal plan object
 * @returns {number} - Total unique ingredients
 */
export function getTotalUniqueIngredients(mealPlan) {
  if (!mealPlan) return 0;

  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const meals = ['breakfast', 'lunch', 'dinner'];
  const uniqueIngredients = new Set();

  days.forEach(day => {
    meals.forEach(meal => {
      const recipe = mealPlan[day]?.[meal];
      if (recipe && recipe.ingredients) {
        recipe.ingredients.forEach(ing => {
          const normalized = normalizeIngredient(ing.name).toLowerCase();
          uniqueIngredients.add(normalized);
        });
      }
    });
  });

  return uniqueIngredients.size;
}

export default {
  analyzeSharedIngredients,
  getTotalUniqueIngredients
};
