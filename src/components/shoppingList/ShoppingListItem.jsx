import { formatQuantity } from '../../utils/unitConverter';

/**
 * ============================================================================
 * SHOPPING LIST ITEM COMPONENT
 * ============================================================================
 *
 * PURPOSE:
 * Renders a single item in the shopping list (for "Need More" and "Need to Buy" sections).
 * Each item shows quantity, unit, name, and allows checking off when purchased.
 *
 * FEATURES:
 * 1. Checkbox - Mark item as purchased (strikes through when checked)
 * 2. Quantity Display - Shows how much to buy (formatted nicely)
 * 3. Item Name - Capitalized for readability
 * 4. Status Icon - Visual indicator for partial matches
 * 5. Message - Shows additional info (e.g., "Have 1 cup, need 2 more")
 *
 * TWO TYPES OF ITEMS:
 * 1. "Need More" (Partial Match):
 *    - Item exists in pantry but not enough quantity
 *    - Shows needQty (additional amount needed)
 *    - Yellow status icon
 *
 * 2. "Need to Buy" (No Match):
 *    - Item not in pantry at all
 *    - Shows full quantity needed
 *    - No status icon (or could add shopping cart icon)
 *
 * PARENT: ShoppingListGroup.jsx
 *
 * @param {Object} item - The shopping list item to display
 * @param {string} item.name - Name of the ingredient
 * @param {number} item.quantity - Total quantity needed
 * @param {string} item.unit - Unit of measurement
 * @param {number} item.needQty - Additional quantity needed (if partial match)
 * @param {string} item.status - 'partial' or 'need' indicating pantry match status
 * @param {string} item.message - Additional info message
 * @param {boolean} isChecked - Whether item is marked as purchased
 * @param {function} onToggle - Function to call when checkbox is toggled
 */

function ShoppingListItem({ item, isChecked, onToggle }) {
  // Create unique key for this item (used for checkbox state tracking)
  const itemKey = `${item.name}-${item.quantity}-${item.unit}`;

  return (
    <li
      className={`flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors ${
        isChecked ? 'bg-gray-50' : ''
      }`}
    >
      {/* =================================================================
          CHECKBOX - Mark as Purchased
          =================================================================
          When checked:
          - Strikes through the item text
          - Changes text to gray (indicates completed)
          - Adds to "Checked Off" count in stats
          - Reduces "Need to Buy" count in stats
      */}
      <input
        type="checkbox"
        checked={isChecked}
        onChange={() => onToggle(itemKey)}
        className="w-5 h-5 text-primary rounded focus:ring-2 focus:ring-primary cursor-pointer mt-0.5"
        aria-label={`Mark ${item.name} as purchased`}
      />

      {/* =================================================================
          ITEM DETAILS
          =================================================================
          Shows quantity, unit, and ingredient name
          Formatting changes based on item status (partial vs. need)
      */}
      <div className="flex-1">
        <div className={`${isChecked ? 'line-through text-gray-400' : 'text-gray-800'}`}>

          {/* Quantity and Unit (Bold) */}
          <span className="font-semibold">
            {/* If "partial" match, show only the additional amount needed
                Otherwise, show the full quantity */}
            {item.status === 'partial' && item.needQty
              ? `${formatQuantity(item.needQty, item.unit)} ${item.unit}`
              : `${formatQuantity(item.quantity, item.unit)} ${item.unit}`}
          </span>
          {' '}

          {/* Ingredient Name (Capitalized) */}
          <span className="capitalize">{item.name}</span>
        </div>

        {/* Additional Message (if exists)
            Examples:
            - "Have 1 cup, need 1 more cup"
            - "Converted from 2 tablespoons"
        */}
        {item.message && (
          <div className="text-sm text-gray-600 mt-1">{item.message}</div>
        )}
      </div>

      {/* =================================================================
          STATUS ICON (Right side)
          =================================================================
          Shows visual indicator of item status:
          - Green Checkmark: Already have (shouldn't appear in this component)
          - Yellow Plus: Need more (partial match)
          - No icon: Need to buy (no pantry match)
      */}
      <div className="flex-shrink-0">
        {/* Green Checkmark - Already Have (Complete Match) */}
        {item.status === 'have' && (
          <svg className="w-6 h-6 text-green-500" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
        )}

        {/* Yellow Plus - Need More (Partial Match)
            Shows when user has some of the item but not enough */}
        {item.status === 'partial' && (
          <svg className="w-6 h-6 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z"
              clipRule="evenodd"
            />
          </svg>
        )}
      </div>
    </li>
  );
}

export default ShoppingListItem;
