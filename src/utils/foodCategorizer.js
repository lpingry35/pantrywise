/**
 * ============================================================================
 * FOOD CATEGORY CLASSIFIER UTILITY
 * ============================================================================
 *
 * PURPOSE:
 * Automatically determines which food category an ingredient belongs to.
 * Used to organize shopping list by grocery store sections.
 *
 * WHY THIS IS USEFUL:
 * - Matches real grocery store layout (produce, meat, dairy sections)
 * - Makes shopping more efficient (get all produce at once)
 * - Reduces back-and-forth across store
 * - Professional shopping app experience
 *
 * CATEGORIES:
 * 1. Produce - Fruits and vegetables
 * 2. Meat & Seafood - Chicken, beef, pork, fish
 * 3. Dairy & Eggs - Milk, cheese, yogurt, butter, eggs
 * 4. Grains & Pasta - Rice, pasta, bread, flour, oats
 * 5. Canned & Jarred - Canned goods, sauces in jars
 * 6. Seasonings & Spices - Salt, pepper, herbs, spices
 * 7. Oils & Condiments - Cooking oils, soy sauce, vinegar, ketchup
 * 8. Snacks & Baking - Sugar, flour, baking powder, chocolate chips
 * 9. Frozen - Frozen vegetables, ice cream, frozen meals
 * 10. Other - Anything not recognized above
 */

/**
 * CATEGORIZE A SINGLE INGREDIENT
 *
 * Takes an ingredient name and returns its food category.
 * Works by checking ingredient name against keyword lists.
 *
 * @param {string} ingredientName - Name of ingredient (e.g., "2 cups tomatoes")
 * @returns {object} { category: string, icon: string, order: number }
 *
 * Example:
 * categorizeIngredient("2 cups tomatoes")
 * Returns: { category: 'Produce', icon: '🥬', order: 1 }
 */
export const categorizeIngredient = (ingredientName) => {
  // Convert to lowercase for easier matching
  const name = ingredientName.toLowerCase();

  // CATEGORY 1: PRODUCE (Fruits & Vegetables)
  const produceKeywords = [
    'tomato', 'lettuce', 'onion', 'garlic', 'pepper', 'carrot', 'celery',
    'potato', 'broccoli', 'spinach', 'cucumber', 'zucchini', 'mushroom',
    'apple', 'banana', 'lemon', 'lime', 'orange', 'berry', 'strawberry',
    'avocado', 'corn', 'peas', 'bean', 'cabbage', 'kale', 'arugula',
    'radish', 'beet', 'turnip', 'squash', 'pumpkin', 'eggplant',
    'cilantro', 'parsley', 'basil', 'mint', 'thyme', 'rosemary', 'dill',
    'scallion', 'shallot', 'leek', 'ginger', 'jalapeño', 'chile', 'chili'
  ];

  // CATEGORY 2: MEAT & SEAFOOD
  const meatKeywords = [
    'chicken', 'beef', 'pork', 'turkey', 'lamb', 'steak', 'ground',
    'bacon', 'sausage', 'ham', 'fish', 'salmon', 'tuna', 'shrimp',
    'crab', 'lobster', 'tilapia', 'cod', 'meat', 'breast', 'thigh',
    'ribeye', 'sirloin', 'tenderloin', 'ribs', 'brisket'
  ];

  // CATEGORY 3: DAIRY & EGGS
  const dairyKeywords = [
    'milk', 'cheese', 'butter', 'cream', 'yogurt', 'sour cream',
    'cottage cheese', 'mozzarella', 'cheddar', 'parmesan', 'feta',
    'egg', 'eggs', 'half and half', 'whipping cream', 'ice cream'
  ];

  // CATEGORY 4: GRAINS & PASTA
  const grainsKeywords = [
    'rice', 'pasta', 'noodle', 'bread', 'flour', 'oat', 'quinoa',
    'couscous', 'barley', 'tortilla', 'pita', 'bagel', 'roll',
    'spaghetti', 'macaroni', 'penne', 'linguine', 'fettuccine',
    'cereal', 'granola', 'crackers', 'wheat', 'grain'
  ];

  // CATEGORY 5: CANNED & JARRED
  const cannedKeywords = [
    'canned', 'can', 'jar', 'jarred', 'sauce', 'salsa', 'marinara',
    'tomato sauce', 'paste', 'diced tomatoes', 'crushed tomatoes',
    'beans', 'chickpeas', 'black beans', 'kidney beans',
    'broth', 'stock', 'soup', 'coconut milk', 'condensed'
  ];

  // CATEGORY 6: SEASONINGS & SPICES
  const seasoningsKeywords = [
    'salt', 'pepper', 'cumin', 'paprika', 'oregano', 'basil', 'thyme',
    'cinnamon', 'nutmeg', 'clove', 'cardamom', 'curry', 'turmeric',
    'coriander', 'chili powder', 'garlic powder', 'onion powder',
    'seasoning', 'spice', 'herb', 'cayenne', 'red pepper flakes',
    'bay leaf', 'sage', 'marjoram', 'tarragon', 'allspice', 'vanilla'
  ];

  // CATEGORY 7: OILS & CONDIMENTS
  const oilsKeywords = [
    'oil', 'olive oil', 'vegetable oil', 'coconut oil', 'sesame oil',
    'vinegar', 'balsamic', 'soy sauce', 'worcestershire', 'hot sauce',
    'ketchup', 'mustard', 'mayo', 'mayonnaise', 'ranch', 'dressing',
    'honey', 'maple syrup', 'molasses', 'tahini', 'peanut butter'
  ];

  // CATEGORY 8: SNACKS & BAKING
  const bakingKeywords = [
    'sugar', 'brown sugar', 'powdered sugar', 'baking powder',
    'baking soda', 'yeast', 'cornstarch', 'chocolate chip', 'cocoa',
    'chocolate', 'chips', 'cookie', 'cake', 'frosting', 'sprinkles',
    'extract', 'vanilla extract', 'almond extract'
  ];

  // CATEGORY 9: FROZEN
  const frozenKeywords = [
    'frozen', 'ice', 'popsicle', 'ice cream', 'frozen vegetables',
    'frozen fruit', 'frozen pizza', 'frozen meal'
  ];

  // CHECK EACH CATEGORY
  // Order matters! Check specific keywords first (like "garlic powder") before general ("garlic")

  if (seasoningsKeywords.some(keyword => name.includes(keyword))) {
    return { category: 'Seasonings & Spices', icon: '🧂', order: 6 };
  }
  if (oilsKeywords.some(keyword => name.includes(keyword))) {
    return { category: 'Oils & Condiments', icon: '🧈', order: 7 };
  }
  if (bakingKeywords.some(keyword => name.includes(keyword))) {
    return { category: 'Snacks & Baking', icon: '🍪', order: 8 };
  }
  if (cannedKeywords.some(keyword => name.includes(keyword))) {
    return { category: 'Canned & Jarred', icon: '🥫', order: 5 };
  }
  if (meatKeywords.some(keyword => name.includes(keyword))) {
    return { category: 'Meat & Seafood', icon: '🥩', order: 2 };
  }
  if (dairyKeywords.some(keyword => name.includes(keyword))) {
    return { category: 'Dairy & Eggs', icon: '🥛', order: 3 };
  }
  if (grainsKeywords.some(keyword => name.includes(keyword))) {
    return { category: 'Grains & Pasta', icon: '🌾', order: 4 };
  }
  if (frozenKeywords.some(keyword => name.includes(keyword))) {
    return { category: 'Frozen', icon: '🧊', order: 9 };
  }
  if (produceKeywords.some(keyword => name.includes(keyword))) {
    return { category: 'Produce', icon: '🥬', order: 1 };
  }

  // DEFAULT: Other (for items we don't recognize)
  return { category: 'Other', icon: '❓', order: 10 };
};

/**
 * GROUP ITEMS BY FOOD CATEGORY
 *
 * Takes an array of shopping list items and groups them by food category.
 * Returns sorted array of category objects, each containing items.
 *
 * @param {array} items - Array of shopping list items
 * @returns {array} Array of category objects sorted by order
 *
 * HOW IT WORKS:
 * 1. Loop through each item
 * 2. Determine its food category
 * 3. Add to corresponding category group
 * 4. Sort categories by order (Produce first, Other last)
 *
 * Example return:
 * [
 *   {
 *     categoryName: 'Produce',
 *     icon: '🥬',
 *     order: 1,
 *     items: [item1, item2, item3]
 *   },
 *   {
 *     categoryName: 'Meat & Seafood',
 *     icon: '🥩',
 *     order: 2,
 *     items: [item4, item5]
 *   }
 * ]
 */
export const groupItemsByFoodCategory = (items) => {
  // Create empty object to hold grouped items
  const grouped = {};

  // Loop through each item and categorize it
  items.forEach(item => {
    // Get category info for this ingredient
    const { category, icon, order } = categorizeIngredient(item.name);

    // Create category group if it doesn't exist yet
    if (!grouped[category]) {
      grouped[category] = {
        categoryName: category,
        icon: icon,
        order: order,
        items: []
      };
    }

    // Add this item to its category group
    grouped[category].items.push(item);
  });

  // Convert object to array and sort by order
  // This ensures Produce appears first, Other appears last
  return Object.values(grouped).sort((a, b) => a.order - b.order);
};
