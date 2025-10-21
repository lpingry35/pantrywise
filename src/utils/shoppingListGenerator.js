// Shopping List Generator Utility
// Consolidates ingredients from meal plan and groups by category

import { normalizeIngredient } from './ingredientMatching';

// ============================================================================
// INGREDIENT SYNONYM MAP (for combining ingredients)
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

  // Canned Goods
  'crushed tomatoes': ['canned tomatoes', 'tomato sauce', 'tomato puree'],
  'black beans': ['canned black beans', 'cooked black beans'],
  'chickpeas': ['garbanzo beans', 'canned chickpeas'],
  'kidney beans': ['red beans', 'canned kidney beans']
};

/**
 * Checks if two ingredient names match using synonyms
 * @param {string} ingredient1 - First ingredient name (normalized)
 * @param {string} ingredient2 - Second ingredient name (normalized)
 * @returns {boolean} - True if ingredients match
 */
function ingredientsMatch(ingredient1, ingredient2) {
  const norm1 = ingredient1.toLowerCase();
  const norm2 = ingredient2.toLowerCase();

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

/**
 * Normalizes units to handle singular/plural and common variations
 * @param {string} unit - The unit to normalize
 * @returns {string} - Normalized unit
 */
function normalizeUnit(unit) {
  if (!unit || typeof unit !== 'string') return '';

  let normalized = unit.trim().toLowerCase();

  // Remove trailing 's' for plurals (lbs → lb, cups → cup, etc.)
  if (normalized.endsWith('s') && normalized.length > 1) {
    // Handle special cases first
    if (normalized === 'cloves') {
      return 'clove';
    }
    normalized = normalized.slice(0, -1);
  }

  // Ignore descriptive units like "medium", "large", "small"
  // These are size descriptors, not real units
  const descriptiveUnits = ['small', 'medium', 'large', 'whole', 'piece'];
  if (descriptiveUnits.includes(normalized)) {
    return 'unit'; // Treat all descriptive sizes as generic "unit"
  }

  return normalized;
}

/**
 * Finds the canonical name for an ingredient (for grouping)
 * @param {string} ingredient - Normalized ingredient name
 * @returns {string} - Canonical name
 */
function getCanonicalName(ingredient) {
  const norm = ingredient.toLowerCase();

  // If this ingredient is a key in the synonym map, use it
  if (ingredientSynonyms[norm]) {
    return norm;
  }

  // Otherwise, find if it's a synonym of something
  for (const [canonical, synonyms] of Object.entries(ingredientSynonyms)) {
    if (synonyms.includes(norm)) {
      return canonical;
    }
  }

  // No synonyms found, return as-is
  return norm;
}

// ============================================================================
// INGREDIENT CATEGORIES
// Maps ingredient names to their categories
// ============================================================================

const ingredientCategories = {
  // Proteins
  proteins: [
    'chicken breast', 'chicken', 'ground beef', 'beef', 'pork chops', 'pork',
    'pork shoulder', 'salmon', 'salmon fillets', 'shrimp', 'prawns', 'eggs'
  ],

  // Vegetables
  vegetables: [
    'onion', 'onions', 'garlic', 'tomatoes', 'cherry tomatoes', 'bell pepper',
    'broccoli', 'carrots', 'potatoes', 'mushrooms', 'lettuce', 'romaine lettuce',
    'cucumber', 'asparagus', 'cauliflower', 'celery', 'spinach', 'green onions',
    'red onion', 'bean sprouts'
  ],

  // Grains & Pasta
  grains: [
    'rice', 'pasta', 'spaghetti', 'linguine', 'arborio rice', 'quinoa',
    'bread', 'hamburger buns', 'flour tortillas', 'taco shells', 'flour',
    'breadcrumbs', 'rice noodles', 'noodles'
  ],

  // Dairy
  dairy: [
    'milk', 'butter', 'cheese', 'shredded cheese', 'parmesan cheese', 'parmesan',
    'mozzarella cheese', 'mozzarella', 'feta cheese', 'feta', 'sour cream',
    'heavy cream', 'cream cheese', 'yogurt'
  ],

  // Canned/Packaged Goods
  pantry: [
    'crushed tomatoes', 'black beans', 'kidney beans', 'chickpeas',
    'coconut milk', 'chicken broth', 'beef broth', 'vegetable broth',
    'BBQ sauce', 'salsa', 'olives', 'Caesar dressing', 'croutons',
    'peanuts', 'lentils'
  ],

  // Oils & Condiments
  condiments: [
    'olive oil', 'vegetable oil', 'sesame oil', 'soy sauce', 'fish sauce',
    'balsamic vinegar', 'apple cider vinegar', 'honey', 'brown sugar',
    'sugar', 'maple syrup', 'mayo', 'mustard', 'ketchup'
  ],

  // Herbs & Spices
  spices: [
    'salt', 'black pepper', 'basil', 'parsley', 'oregano', 'cumin',
    'paprika', 'chili powder', 'red pepper flakes', 'Italian seasoning',
    'curry powder', 'ginger', 'dill', 'taco seasoning', 'cinnamon',
    'baking powder', 'vanilla extract', 'garlic powder'
  ]
};

// ============================================================================
// CATEGORIZE INGREDIENT
// Determines which category an ingredient belongs to
// ============================================================================

/**
 * Categorizes an ingredient based on its name
 * @param {string} ingredientName - Name of the ingredient
 * @returns {string} - Category name
 */
function categorizeIngredient(ingredientName) {
  const normalized = normalizeIngredient(ingredientName).toLowerCase();

  // Check each category
  for (const [category, ingredients] of Object.entries(ingredientCategories)) {
    if (ingredients.some(ing => normalized.includes(ing) || ing.includes(normalized))) {
      return category;
    }
  }

  // Default category for uncategorized items
  return 'other';
}

// ============================================================================
// COMBINE QUANTITIES
// Sums up quantities for duplicate ingredients
// ============================================================================

/**
 * Combines duplicate ingredients and sums their quantities
 * @param {Array} ingredients - Array of ingredient objects
 * @returns {Array} - Consolidated array with combined quantities
 */
function combineQuantities(ingredients) {
  const combined = {};

  ingredients.forEach(ing => {
    const normalized = normalizeIngredient(ing.name).toLowerCase();
    // Get canonical name to group synonyms together
    const canonical = getCanonicalName(normalized);
    // Normalize the unit to handle plurals and descriptive units
    const normalizedUnit = normalizeUnit(ing.unit);
    // Create a unique key based on canonical name AND normalized unit
    const key = `${canonical}|${normalizedUnit}`;

    if (combined[key]) {
      // Same ingredient with same unit - add quantities
      combined[key].quantity += ing.quantity;
    } else {
      // First occurrence of this ingredient+unit combination
      combined[key] = {
        name: ing.name,
        quantity: ing.quantity,
        unit: normalizedUnit, // Use normalized unit for consistent display
        normalizedUnit: normalizedUnit, // Store normalized for reference
        category: categorizeIngredient(ing.name)
      };
    }
  });

  return Object.values(combined);
}

// ============================================================================
// GROUP BY CATEGORY
// Organizes ingredients into category groups
// ============================================================================

/**
 * Groups ingredients by their category
 * @param {Array} ingredients - Array of ingredient objects with category
 * @returns {Object} - Object with categories as keys, arrays of ingredients as values
 */
function groupByCategory(ingredients) {
  const grouped = {
    proteins: [],
    vegetables: [],
    grains: [],
    dairy: [],
    pantry: [],
    condiments: [],
    spices: [],
    other: []
  };

  ingredients.forEach(ing => {
    const category = ing.category || 'other';
    if (grouped[category]) {
      grouped[category].push(ing);
    } else {
      grouped.other.push(ing);
    }
  });

  // Sort ingredients within each category alphabetically
  Object.keys(grouped).forEach(category => {
    grouped[category].sort((a, b) => a.name.localeCompare(b.name));
  });

  return grouped;
}

// ============================================================================
// GENERATE SHOPPING LIST
// Main function to create consolidated shopping list from meal plan
// ============================================================================

/**
 * Generates a consolidated shopping list from a meal plan
 * @param {Object} mealPlan - Meal plan object with days and meals
 * @returns {Object} - Shopping list grouped by category with total cost
 */
export function generateShoppingList(mealPlan) {
  if (!mealPlan) {
    return {
      items: {},
      totalCost: 0,
      totalItems: 0
    };
  }

  // Collect all ingredients from all recipes in meal plan
  const allIngredients = [];
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const meals = ['breakfast', 'lunch', 'dinner'];
  let totalCost = 0;

  days.forEach(day => {
    meals.forEach(meal => {
      const recipe = mealPlan[day]?.[meal];
      if (recipe && recipe.ingredients) {
        // Add all ingredients from this recipe
        recipe.ingredients.forEach(ing => {
          allIngredients.push({
            name: ing.name,
            quantity: ing.quantity,
            unit: ing.unit
          });
        });
        // Add to total cost
        totalCost += (recipe.costPerServing * recipe.servings);
      }
    });
  });

  // Combine duplicate ingredients
  const consolidatedIngredients = combineQuantities(allIngredients);

  // Group by category
  const groupedItems = groupByCategory(consolidatedIngredients);

  return {
    items: groupedItems,
    totalCost: totalCost.toFixed(2),
    totalItems: consolidatedIngredients.length,
    allIngredients: consolidatedIngredients
  };
}

// ============================================================================
// EXPORT TEXT
// Converts shopping list to plain text for export
// ============================================================================

/**
 * Converts shopping list to plain text format
 * @param {Object} shoppingList - Shopping list object from generateShoppingList
 * @returns {string} - Formatted text
 */
export function exportShoppingListText(shoppingList) {
  if (!shoppingList || !shoppingList.items) {
    return 'No items in shopping list';
  }

  let text = '=== SHOPPING LIST ===\n\n';

  const categoryLabels = {
    proteins: 'Proteins',
    vegetables: 'Vegetables',
    grains: 'Grains & Pasta',
    dairy: 'Dairy',
    pantry: 'Pantry Items',
    condiments: 'Oils & Condiments',
    spices: 'Herbs & Spices',
    other: 'Other Items'
  };

  Object.entries(shoppingList.items).forEach(([category, items]) => {
    if (items.length > 0) {
      text += `${categoryLabels[category] || category.toUpperCase()}\n`;
      text += '-'.repeat(40) + '\n';
      items.forEach(item => {
        text += `☐ ${item.quantity} ${item.unit} ${item.name}\n`;
      });
      text += '\n';
    }
  });

  text += `\nTOTAL ITEMS: ${shoppingList.totalItems}\n`;
  text += `TOTAL COST: $${shoppingList.totalCost}\n`;

  return text;
}

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  generateShoppingList,
  exportShoppingListText,
  combineQuantities,
  groupByCategory,
  categorizeIngredient
};
