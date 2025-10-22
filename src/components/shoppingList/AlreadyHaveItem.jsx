import { formatQuantity } from '../../utils/unitConverter';

/**
 * ============================================================================
 * ALREADY HAVE ITEM COMPONENT
 * ============================================================================
 *
 * PURPOSE:
 * Displays items that are ALREADY IN PANTRY with sufficient quantity.
 * Different from ShoppingListItem because these don't need checkboxes
 * (user doesn't need to buy them).
 *
 * SHOWS:
 * 1. Green checkmark icon (visual confirmation)
 * 2. Ingredient name (bold)
 * 3. Pantry quantity (what user has)
 * 4. Recipe requirement (what recipe needs)
 * 5. Unit conversion info (if applicable)
 *
 * EXAMPLE DISPLAY:
 * "flour: Have 4 cups (≈500g) • Recipe needs 2 cups"
 *
 * UNIT CONVERSION:
 * When pantry stores in different units than recipe needs, shows conversion.
 * Example: Pantry has "500 grams" but recipe needs "2 cups"
 * Display: "Have 500 grams (≈2 cups) • Recipe needs 2 cups"
 *
 * WHY SHOW THESE:
 * - User confirmation that pantry items are being recognized
 * - Builds confidence in the pantry matching system
 * - Shows estimated savings (these don't need to be purchased)
 *
 * PARENT: ShoppingListGroup.jsx (in "Already Have" section)
 *
 * @param {Object} item - The already-have item to display
 * @param {string} item.name - Name of the ingredient
 * @param {number} item.pantryQty - Quantity available in pantry
 * @param {string} item.pantryUnit - Unit of pantry quantity
 * @param {number} item.quantity - Quantity needed by recipe
 * @param {string} item.unit - Unit of recipe quantity
 * @param {string} item.message - Optional message with conversion info
 */

function AlreadyHaveItem({ item }) {
  // Create unique key for React rendering
  const itemKey = `${item.name}-${item.quantity}-${item.unit}`;

  // Parse quantities and units for display
  const pantryQty = item.pantryQty;
  const pantryUnit = item.pantryUnit || '';
  const recipeQty = item.quantity;
  const recipeUnit = item.unit || '';

  // Check if a unit conversion occurred
  // Example: pantry has "grams" but recipe needs "cups"
  const unitsAreDifferent = pantryUnit.toLowerCase() !== recipeUnit.toLowerCase();

  // Extract converted value from message if it exists
  // Message format: "Have 500g (≈2 cups) • Recipe needs 2 cups"
  // We extract "2" from the conversion part
  const conversionMatch = item.message?.match(/≈\s*(\d+\.?\d*)\s*(\w+)/);
  const convertedValue = conversionMatch ? conversionMatch[1] : null;

  return (
    <li
      key={itemKey}
      className="flex items-start gap-3 p-3 rounded-lg"
    >
      {/* =================================================================
          STATUS ICON - Green Checkmark
          =================================================================
          Visual indicator showing this item is already available
          Not interactive (just for display)
      */}
      <div className="flex-shrink-0">
        <svg className="w-6 h-6 text-green-500 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
            clipRule="evenodd"
          />
        </svg>
      </div>

      {/* =================================================================
          ITEM DETAILS - Enhanced Format
          =================================================================
          Shows ingredient name and quantity information in readable format
      */}
      <div className="flex-1">
        <div className="text-gray-800">

          {/* Ingredient Name (Bold) */}
          <span className="font-bold capitalize">{item.name}:</span>
          {' '}

          {/* Pantry Quantity - What User Has
              Shows quantity in pantry's unit
              Example: "Have 4 cups" or "Have 500 grams" */}
          <span className="text-gray-700">
            Have {formatQuantity(pantryQty, pantryUnit)} {pantryUnit}

            {/* Unit Conversion Display (if applicable)
                Shows when pantry unit differs from recipe unit
                Example: "Have 500 grams (≈2 cups)" when recipe needs cups
                Green color emphasizes positive match */}
            {unitsAreDifferent && convertedValue && (
              <span className="text-green-700">
                {' '}(≈{formatQuantity(parseFloat(convertedValue), recipeUnit)} {recipeUnit})
              </span>
            )}
          </span>

          {/* Separator - Visual divider between sections */}
          <span className="text-gray-500 mx-2">•</span>

          {/* Recipe Requirement - What Recipe Needs
              Shows what the recipes require in their specified unit
              Gray color (less emphasized since already have it) */}
          <span className="text-gray-600">
            Recipe needs {formatQuantity(recipeQty, recipeUnit)} {recipeUnit}
          </span>
        </div>
      </div>
    </li>
  );
}

export default AlreadyHaveItem;
