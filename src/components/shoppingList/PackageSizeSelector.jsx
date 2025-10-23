/**
 * ============================================================================
 * PACKAGE SIZE SELECTOR COMPONENT
 * ============================================================================
 *
 * PURPOSE:
 * Reusable component that displays quick-select buttons for common package
 * sizes based on ingredient category and name. Makes transferring to pantry
 * faster by letting users click package sizes instead of typing.
 *
 * USAGE:
 * <PackageSizeSelector
 *   category="Oils & Condiments"
 *   ingredientName="Olive Oil"
 *   recipeAmount="2 tbsp"
 *   onSelect={(quantity, unit) => handleSelect(quantity, unit)}
 * />
 *
 * PROPS:
 * - category: Ingredient category (e.g., "Dairy & Eggs", "Meat & Seafood")
 * - ingredientName: Name of ingredient (e.g., "Eggs", "Olive Oil")
 * - recipeAmount: What recipe needs (e.g., "2 tbsp", "3 eggs") - for display
 * - onSelect: Callback function (quantity, unit) => {} called when button clicked
 */

/**
 * Get common package sizes for different ingredients
 * Comprehensive database of 50+ common ingredients with real grocery store package sizes
 * Sources: Walmart, Kroger, Target, Safeway
 */
const getCommonPackageSizes = (category, ingredientName) => {
  const name = ingredientName.toLowerCase();

  // ============================================================================
  // COMPREHENSIVE INGREDIENT DATABASE (50+ items)
  // Real package sizes from grocery stores
  // ============================================================================

  // ---------------------------------------------------------------------------
  // PROTEINS (Meat & Seafood)
  // ---------------------------------------------------------------------------

  if (name.includes('chicken breast')) {
    return [
      { label: '1 lb', value: 1, unit: 'lb' },
      { label: '1.5 lb', value: 1.5, unit: 'lb' },
      { label: '2 lb', value: 2, unit: 'lb' },
      { label: '3 lb', value: 3, unit: 'lb' }
    ];
  }

  if (name.includes('chicken thigh')) {
    return [
      { label: '1 lb', value: 1, unit: 'lb' },
      { label: '2 lb', value: 2, unit: 'lb' },
      { label: '3 lb', value: 3, unit: 'lb' }
    ];
  }

  if (name.includes('ground beef') || name.includes('ground chuck')) {
    return [
      { label: '1 lb', value: 1, unit: 'lb' },
      { label: '1.33 lb', value: 1.33, unit: 'lb' },
      { label: '2 lb', value: 2, unit: 'lb' },
      { label: '3 lb', value: 3, unit: 'lb' }
    ];
  }

  if (name.includes('ground turkey')) {
    return [
      { label: '1 lb', value: 1, unit: 'lb' },
      { label: '1.3 lb', value: 1.3, unit: 'lb' },
      { label: '2 lb', value: 2, unit: 'lb' }
    ];
  }

  if (name.includes('pork chop')) {
    return [
      { label: '1 lb', value: 1, unit: 'lb' },
      { label: '1.5 lb', value: 1.5, unit: 'lb' },
      { label: '2 lb', value: 2, unit: 'lb' }
    ];
  }

  if (name.includes('bacon')) {
    return [
      { label: '12 oz pack', value: 12, unit: 'oz' },
      { label: '16 oz pack', value: 16, unit: 'oz' },
      { label: '24 oz pack', value: 24, unit: 'oz' }
    ];
  }

  if (name.includes('salmon') || name.includes('fish fillet')) {
    return [
      { label: '0.5 lb', value: 0.5, unit: 'lb' },
      { label: '1 lb', value: 1, unit: 'lb' },
      { label: '1.5 lb', value: 1.5, unit: 'lb' },
      { label: '2 lb', value: 2, unit: 'lb' }
    ];
  }

  if (name.includes('shrimp')) {
    return [
      { label: '12 oz bag', value: 12, unit: 'oz' },
      { label: '1 lb bag', value: 16, unit: 'oz' },
      { label: '2 lb bag', value: 32, unit: 'oz' }
    ];
  }

  if (name.includes('sausage')) {
    return [
      { label: '12 oz pack', value: 12, unit: 'oz' },
      { label: '1 lb pack', value: 16, unit: 'oz' },
      { label: '19 oz pack', value: 19, unit: 'oz' }
    ];
  }

  if (name.includes('steak') || name.includes('beef')) {
    return [
      { label: '0.75 lb', value: 0.75, unit: 'lb' },
      { label: '1 lb', value: 1, unit: 'lb' },
      { label: '1.5 lb', value: 1.5, unit: 'lb' },
      { label: '2 lb', value: 2, unit: 'lb' }
    ];
  }

  // ---------------------------------------------------------------------------
  // PRODUCE (Fresh Vegetables & Fruits)
  // ---------------------------------------------------------------------------

  if (name.includes('onion') && !name.includes('powder')) {
    return [
      { label: '1 onion', value: 1, unit: 'onion' },
      { label: '2 onions', value: 2, unit: 'onion' },
      { label: '3 lb bag', value: 3, unit: 'lb' },
      { label: '5 lb bag', value: 5, unit: 'lb' }
    ];
  }

  if (name.includes('tomato') && !name.includes('paste') && !name.includes('sauce')) {
    return [
      { label: '1 tomato', value: 1, unit: 'tomato' },
      { label: '2 tomatoes', value: 2, unit: 'tomato' },
      { label: '1 lb', value: 1, unit: 'lb' },
      { label: '2 lb', value: 2, unit: 'lb' }
    ];
  }

  if (name.includes('potato')) {
    return [
      { label: '1 potato', value: 1, unit: 'potato' },
      { label: '2 potatoes', value: 2, unit: 'potato' },
      { label: '5 lb bag', value: 5, unit: 'lb' },
      { label: '10 lb bag', value: 10, unit: 'lb' }
    ];
  }

  if (name.includes('carrot')) {
    return [
      { label: '1 lb bag', value: 1, unit: 'lb' },
      { label: '2 lb bag', value: 2, unit: 'lb' },
      { label: '3 lb bag', value: 3, unit: 'lb' },
      { label: '5 lb bag', value: 5, unit: 'lb' }
    ];
  }

  if (name.includes('celery')) {
    return [
      { label: '1 bunch', value: 1, unit: 'bunch' },
      { label: '2 bunches', value: 2, unit: 'bunch' }
    ];
  }

  if (name.includes('lettuce') || name.includes('romaine')) {
    return [
      { label: '1 head', value: 1, unit: 'head' },
      { label: '2 heads', value: 2, unit: 'head' },
      { label: '3 hearts', value: 3, unit: 'hearts' }
    ];
  }

  if (name.includes('bell pepper') || name.includes('pepper') && !name.includes('black pepper')) {
    return [
      { label: '1 pepper', value: 1, unit: 'pepper' },
      { label: '2 peppers', value: 2, unit: 'pepper' },
      { label: '3 peppers', value: 3, unit: 'pepper' },
      { label: '1 lb bag', value: 1, unit: 'lb' }
    ];
  }

  if (name.includes('garlic') && !name.includes('powder')) {
    return [
      { label: '1 bulb', value: 1, unit: 'bulb' },
      { label: '2 bulbs', value: 2, unit: 'bulb' },
      { label: '3 bulb pack', value: 3, unit: 'bulb' }
    ];
  }

  if (name.includes('spinach')) {
    return [
      { label: '5 oz bag', value: 5, unit: 'oz' },
      { label: '10 oz bag', value: 10, unit: 'oz' },
      { label: '16 oz bag', value: 16, unit: 'oz' }
    ];
  }

  if (name.includes('broccoli')) {
    return [
      { label: '1 head', value: 1, unit: 'head' },
      { label: '2 heads', value: 2, unit: 'head' },
      { label: '12 oz bag', value: 12, unit: 'oz' }
    ];
  }

  if (name.includes('mushroom')) {
    return [
      { label: '8 oz pack', value: 8, unit: 'oz' },
      { label: '16 oz pack', value: 16, unit: 'oz' },
      { label: '24 oz pack', value: 24, unit: 'oz' }
    ];
  }

  if (name.includes('zucchini')) {
    return [
      { label: '1 zucchini', value: 1, unit: 'zucchini' },
      { label: '2 zucchini', value: 2, unit: 'zucchini' },
      { label: '3 zucchini', value: 3, unit: 'zucchini' }
    ];
  }

  if (name.includes('cucumber')) {
    return [
      { label: '1 cucumber', value: 1, unit: 'cucumber' },
      { label: '2 cucumbers', value: 2, unit: 'cucumber' },
      { label: '3 cucumbers', value: 3, unit: 'cucumber' }
    ];
  }

  if (name.includes('avocado')) {
    return [
      { label: '1 avocado', value: 1, unit: 'avocado' },
      { label: '2 avocados', value: 2, unit: 'avocado' },
      { label: '4 avocados', value: 4, unit: 'avocado' },
      { label: '6 avocados', value: 6, unit: 'avocado' }
    ];
  }

  if (name.includes('lemon')) {
    return [
      { label: '1 lemon', value: 1, unit: 'lemon' },
      { label: '2 lemons', value: 2, unit: 'lemon' },
      { label: '3 lb bag', value: 3, unit: 'lb' }
    ];
  }

  if (name.includes('lime')) {
    return [
      { label: '1 lime', value: 1, unit: 'lime' },
      { label: '2 limes', value: 2, unit: 'lime' },
      { label: '2 lb bag', value: 2, unit: 'lb' }
    ];
  }

  // ---------------------------------------------------------------------------
  // GRAINS & PASTA
  // ---------------------------------------------------------------------------

  if (name.includes('rice') && !name.includes('milk')) {
    return [
      { label: '1 lb bag', value: 1, unit: 'lb' },
      { label: '2 lb bag', value: 2, unit: 'lb' },
      { label: '5 lb bag', value: 5, unit: 'lb' },
      { label: '10 lb bag', value: 10, unit: 'lb' }
    ];
  }

  if (name.includes('pasta') || name.includes('spaghetti') || name.includes('penne') || name.includes('noodle')) {
    return [
      { label: '12 oz box', value: 12, unit: 'oz' },
      { label: '1 lb box', value: 16, unit: 'oz' },
      { label: '2 lb box', value: 32, unit: 'oz' }
    ];
  }

  if (name.includes('bread') && !name.includes('crumb')) {
    return [
      { label: '1 loaf', value: 1, unit: 'loaf' },
      { label: '2 loaves', value: 2, unit: 'loaf' }
    ];
  }

  if (name.includes('flour')) {
    return [
      { label: '2 lb bag', value: 2, unit: 'lb' },
      { label: '5 lb bag', value: 5, unit: 'lb' },
      { label: '10 lb bag', value: 10, unit: 'lb' }
    ];
  }

  if (name.includes('oats') || name.includes('oatmeal')) {
    return [
      { label: '18 oz', value: 18, unit: 'oz' },
      { label: '42 oz', value: 42, unit: 'oz' },
      { label: '4 lb', value: 4, unit: 'lb' }
    ];
  }

  if (name.includes('quinoa')) {
    return [
      { label: '12 oz bag', value: 12, unit: 'oz' },
      { label: '1 lb bag', value: 16, unit: 'oz' },
      { label: '2 lb bag', value: 32, unit: 'oz' }
    ];
  }

  // ---------------------------------------------------------------------------
  // CANNED & JARRED GOODS
  // ---------------------------------------------------------------------------

  if (name.includes('beans') || name.includes('chickpea')) {
    return [
      { label: '15 oz can', value: 15, unit: 'oz' },
      { label: '28 oz can', value: 28, unit: 'oz' },
      { label: '4-pack cans', value: 60, unit: 'oz' }
    ];
  }

  if (name.includes('tomato sauce') || name.includes('marinara')) {
    return [
      { label: '8 oz can', value: 8, unit: 'oz' },
      { label: '15 oz can', value: 15, unit: 'oz' },
      { label: '24 oz jar', value: 24, unit: 'oz' },
      { label: '28 oz can', value: 28, unit: 'oz' }
    ];
  }

  if (name.includes('tomato paste')) {
    return [
      { label: '6 oz can', value: 6, unit: 'oz' },
      { label: '12 oz can', value: 12, unit: 'oz' }
    ];
  }

  if (name.includes('diced tomato') || name.includes('crushed tomato')) {
    return [
      { label: '14.5 oz can', value: 14.5, unit: 'oz' },
      { label: '28 oz can', value: 28, unit: 'oz' }
    ];
  }

  if (name.includes('broth') || name.includes('stock')) {
    return [
      { label: '14.5 oz can', value: 14.5, unit: 'oz' },
      { label: '32 oz carton', value: 32, unit: 'oz' },
      { label: '48 oz carton', value: 48, unit: 'oz' }
    ];
  }

  if (name.includes('tuna') || name.includes('salmon') && name.includes('can')) {
    return [
      { label: '5 oz can', value: 5, unit: 'oz' },
      { label: '12 oz can', value: 12, unit: 'oz' }
    ];
  }

  if (name.includes('corn') && (name.includes('can') || name.includes('kernel'))) {
    return [
      { label: '11 oz can', value: 11, unit: 'oz' },
      { label: '15 oz can', value: 15, unit: 'oz' }
    ];
  }

  // ---------------------------------------------------------------------------
  // DAIRY & EGGS
  // ---------------------------------------------------------------------------

  if (name.includes('egg')) {
    return [
      { label: '6 eggs', value: 6, unit: 'eggs' },
      { label: '12 eggs', value: 12, unit: 'eggs' },
      { label: '18 eggs', value: 18, unit: 'eggs' }
    ];
  }

  if (name.includes('butter')) {
    return [
      { label: '1 stick (4 oz)', value: 4, unit: 'oz' },
      { label: '4 sticks (1 lb)', value: 16, unit: 'oz' }
    ];
  }

  if (name.includes('milk')) {
    return [
      { label: 'Pint (16 oz)', value: 16, unit: 'oz' },
      { label: 'Quart (32 oz)', value: 32, unit: 'oz' },
      { label: 'Half gallon', value: 64, unit: 'oz' },
      { label: 'Gallon', value: 128, unit: 'oz' }
    ];
  }

  if (name.includes('cheese')) {
    return [
      { label: '8 oz block', value: 8, unit: 'oz' },
      { label: '16 oz block', value: 16, unit: 'oz' },
      { label: '2 lb block', value: 32, unit: 'oz' }
    ];
  }

  if (name.includes('cream') || name.includes('half and half')) {
    return [
      { label: '8 oz', value: 8, unit: 'oz' },
      { label: '16 oz (pint)', value: 16, unit: 'oz' },
      { label: '32 oz (quart)', value: 32, unit: 'oz' }
    ];
  }

  if (name.includes('yogurt')) {
    return [
      { label: '5.3 oz cup', value: 5.3, unit: 'oz' },
      { label: '32 oz tub', value: 32, unit: 'oz' }
    ];
  }

  if (name.includes('sour cream')) {
    return [
      { label: '8 oz tub', value: 8, unit: 'oz' },
      { label: '16 oz tub', value: 16, unit: 'oz' }
    ];
  }

  // ---------------------------------------------------------------------------
  // CONDIMENTS & OILS
  // ---------------------------------------------------------------------------

  if (name.includes('olive oil') || name.includes('vegetable oil') || name.includes('canola oil')) {
    return [
      { label: '16 oz bottle', value: 16, unit: 'oz' },
      { label: '25 oz bottle', value: 25, unit: 'oz' },
      { label: '33 oz bottle', value: 33, unit: 'oz' },
      { label: '51 oz bottle', value: 51, unit: 'oz' }
    ];
  }

  if (name.includes('soy sauce')) {
    return [
      { label: '10 oz bottle', value: 10, unit: 'oz' },
      { label: '15 oz bottle', value: 15, unit: 'oz' }
    ];
  }

  if (name.includes('vinegar')) {
    return [
      { label: '16 oz bottle', value: 16, unit: 'oz' },
      { label: '32 oz bottle', value: 32, unit: 'oz' }
    ];
  }

  // ---------------------------------------------------------------------------
  // BAKING SUPPLIES
  // ---------------------------------------------------------------------------

  if (name.includes('sugar') && !name.includes('brown')) {
    return [
      { label: '2 lb bag', value: 2, unit: 'lb' },
      { label: '4 lb bag', value: 4, unit: 'lb' },
      { label: '10 lb bag', value: 10, unit: 'lb' }
    ];
  }

  if (name.includes('brown sugar')) {
    return [
      { label: '1 lb bag', value: 1, unit: 'lb' },
      { label: '2 lb bag', value: 2, unit: 'lb' }
    ];
  }

  if (name.includes('chocolate chip')) {
    return [
      { label: '12 oz bag', value: 12, unit: 'oz' },
      { label: '24 oz bag', value: 24, unit: 'oz' }
    ];
  }

  if (name.includes('vanilla extract')) {
    return [
      { label: '2 oz bottle', value: 2, unit: 'oz' },
      { label: '4 oz bottle', value: 4, unit: 'oz' }
    ];
  }

  // ============================================================================
  // CATEGORY-BASED FALLBACKS (when no specific ingredient match found)
  // ============================================================================

  const packageSizes = {
    'Oils & Condiments': [
      { label: '8 oz bottle', value: 8, unit: 'oz' },
      { label: '16 oz bottle', value: 16, unit: 'oz' },
      { label: '32 oz bottle', value: 32, unit: 'oz' }
    ],

    'Seasonings & Spices': [
      { label: '1 oz jar', value: 1, unit: 'oz' },
      { label: '2 oz jar', value: 2, unit: 'oz' },
      { label: '4 oz jar', value: 4, unit: 'oz' }
    ],

    'Canned & Jarred': [
      { label: '6 oz can', value: 6, unit: 'oz' },
      { label: '15 oz can', value: 15, unit: 'oz' },
      { label: '28 oz can', value: 28, unit: 'oz' }
    ],

    'Meat & Seafood': [
      { label: '0.5 lb', value: 0.5, unit: 'lb' },
      { label: '1 lb', value: 1, unit: 'lb' },
      { label: '1.5 lb', value: 1.5, unit: 'lb' },
      { label: '2 lb', value: 2, unit: 'lb' }
    ],

    'Dairy & Eggs': [
      { label: '8 oz', value: 8, unit: 'oz' },
      { label: '16 oz', value: 16, unit: 'oz' },
      { label: '32 oz', value: 32, unit: 'oz' }
    ],

    'Grains & Pasta': [
      { label: '12 oz box', value: 12, unit: 'oz' },
      { label: '1 lb box', value: 16, unit: 'oz' },
      { label: '2 lb bag', value: 32, unit: 'oz' }
    ],

    'Produce': [
      { label: '1 lb', value: 1, unit: 'lb' },
      { label: '2 lb', value: 2, unit: 'lb' },
      { label: '3 lb', value: 3, unit: 'lb' }
    ],

    'Snacks & Baking': [
      { label: '8 oz', value: 8, unit: 'oz' },
      { label: '16 oz', value: 16, unit: 'oz' },
      { label: '2 lb bag', value: 32, unit: 'oz' }
    ],

    'Frozen': [
      { label: '10 oz', value: 10, unit: 'oz' },
      { label: '16 oz', value: 16, unit: 'oz' },
      { label: '2 lb bag', value: 32, unit: 'oz' }
    ],

    'Household': [
      { label: '1 item', value: 1, unit: 'item' },
      { label: '2 pack', value: 2, unit: 'item' },
      { label: '4 pack', value: 4, unit: 'item' }
    ],

    'Personal Care': [
      { label: '1 item', value: 1, unit: 'item' },
      { label: '8 oz bottle', value: 8, unit: 'oz' },
      { label: '16 oz bottle', value: 16, unit: 'oz' }
    ],

    'Pet Supplies': [
      { label: '1 lb', value: 1, unit: 'lb' },
      { label: '5 lb bag', value: 5, unit: 'lb' },
      { label: '10 lb bag', value: 10, unit: 'lb' }
    ],

    'Other': [
      { label: '1 lb', value: 1, unit: 'lb' },
      { label: '2 lb', value: 2, unit: 'lb' },
      { label: '5 lb', value: 5, unit: 'lb' }
    ]
  };

  return packageSizes[category] || [
    { label: '1 lb', value: 1, unit: 'lb' },
    { label: '2 lb', value: 2, unit: 'lb' },
    { label: '5 lb', value: 5, unit: 'lb' }
  ];
};

function PackageSizeSelector({ category, ingredientName, recipeAmount, onSelect }) {
  const packageSizes = getCommonPackageSizes(category, ingredientName);

  const handleClick = (size) => {
    console.log(`⚡ Quick select: ${size.value} ${size.unit} for ${ingredientName}`);
    onSelect(size.value, size.unit);
  };

  return (
    <div className="mb-4">
      {/* Show what recipe needs */}
      {recipeAmount && (
        <div className="text-sm text-gray-600 mb-2">
          Recipe needs: <span className="font-medium">{recipeAmount}</span>
        </div>
      )}

      {/* Quick Select Label */}
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        What size did you buy?
      </label>

      {/* Quick Select Buttons */}
      <div className="flex flex-wrap gap-2 mb-3">
        {packageSizes.map((size, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleClick(size)}
            className="px-3 py-2 border-2 border-gray-300 rounded-lg
                     hover:border-blue-500 hover:bg-blue-50
                     text-sm font-medium transition-all
                     focus:outline-none focus:ring-2 focus:ring-blue-500
                     active:scale-95"
          >
            {size.label}
          </button>
        ))}
      </div>

      {/* Helper Text */}
      <div className="text-xs text-gray-500 italic">
        Or enter custom amount below ↓
      </div>
    </div>
  );
}

export default PackageSizeSelector;
