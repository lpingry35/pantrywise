import AlreadyHaveItem from './AlreadyHaveItem';
import ShoppingListItem from './ShoppingListItem';
import FoodCategorySection from './FoodCategorySection';
import { groupItemsByFoodCategory } from '../../utils/foodCategorizer';

/**
 * ============================================================================
 * SHOPPING LIST GROUP COMPONENT
 * ============================================================================
 *
 * PURPOSE:
 * Displays all three categories of shopping list items in color-coded sections:
 * 1. Already Have (Green) - Items in pantry with sufficient quantity
 * 2. Need More (Yellow) - Items in pantry but not enough
 * 3. Need to Buy (Orange) - Items not in pantry at all
 *
 * WHY THREE CATEGORIES:
 * - Helps users prioritize shopping (buy orange first, then yellow)
 * - Shows which pantry items are being used (builds trust in system)
 * - Color coding makes it easy to scan the list quickly
 *
 * CATEGORY VISIBILITY:
 * - Already Have: Can be toggled on/off (controlled by parent)
 * - Need More: Always shown if items exist
 * - Need to Buy: Always shown if items exist
 *
 * EACH SECTION INCLUDES:
 * - Colored header with icon
 * - Item count
 * - Description of what items mean
 * - List of items using appropriate component
 *
 * PARENT: ShoppingListPage.jsx
 *
 * @param {Object} categorizedItems - Items organized by category
 * @param {Array} categorizedItems.alreadyHave - Items already in pantry
 * @param {Array} categorizedItems.needMore - Items in pantry but need more
 * @param {Array} categorizedItems.needToBuy - Items not in pantry
 * @param {Object} checkedItems - Object tracking which items are checked off
 * @param {function} onToggleItem - Function to call when item checkbox is toggled
 * @param {boolean} showAlreadyHave - Whether to show "Already Have" section
 */

function ShoppingListGroup({
  categorizedItems,
  checkedItems,
  onToggleItem,
  showAlreadyHave
}) {
  return (
    <div className="space-y-6">

      {/* ===================================================================
          SECTION 1: ALREADY HAVE (GREEN)
          ===================================================================
          Shows items that are fully available in pantry
          Can be toggled on/off by user (reduces visual clutter)
          Only renders if showAlreadyHave is true AND items exist
      */}
      {showAlreadyHave && categorizedItems.alreadyHave.length > 0 && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden border-l-4 border-green-500">

          {/* Section Header - Green Theme */}
          <div className="bg-green-50 px-6 py-4 border-b border-green-100">
            <h2 className="text-xl font-bold text-green-800 flex items-center gap-2">
              {/* Checkmark Icon */}
              <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>

              {/* Section Title with Item Count */}
              Already Have
              <span className="text-sm font-normal text-green-700 ml-2">
                ({categorizedItems.alreadyHave.length}{' '}
                {categorizedItems.alreadyHave.length === 1 ? 'item' : 'items'})
              </span>
            </h2>

            {/* Description */}
            <p className="text-sm text-green-700 mt-1">
              These items are in your pantry with sufficient quantity
            </p>
          </div>

          {/* Items List - Grouped by Food Category */}
          <div className="p-4">
            {groupItemsByFoodCategory(categorizedItems.alreadyHave).map((foodCategory) => (
              <FoodCategorySection
                key={foodCategory.categoryName}
                foodCategory={foodCategory}
                renderItem={(item) => (
                  <AlreadyHaveItem
                    key={`${item.name}-${item.quantity}-${item.unit}`}
                    item={item}
                  />
                )}
              />
            ))}
          </div>
        </div>
      )}

      {/* ===================================================================
          SECTION 2: NEED MORE (YELLOW)
          ===================================================================
          Shows items that exist in pantry but user doesn't have enough
          Example: Recipe needs 2 cups, pantry has 1 cup → need to buy 1 more
          Only renders if items exist in this category
      */}
      {categorizedItems.needMore.length > 0 && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden border-l-4 border-yellow-500">

          {/* Section Header - Yellow Theme */}
          <div className="bg-yellow-50 px-6 py-4 border-b border-yellow-100">
            <h2 className="text-xl font-bold text-yellow-800 flex items-center gap-2">
              {/* Plus Icon (indicates need to add more) */}
              <svg className="w-6 h-6 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z"
                  clipRule="evenodd"
                />
              </svg>

              {/* Section Title with Item Count */}
              Need More
              <span className="text-sm font-normal text-yellow-700 ml-2">
                ({categorizedItems.needMore.length}{' '}
                {categorizedItems.needMore.length === 1 ? 'item' : 'items'})
              </span>
            </h2>

            {/* Description */}
            <p className="text-sm text-yellow-700 mt-1">
              You have some of these items, but need to buy more
            </p>
          </div>

          {/* Items List - Uses ShoppingListItem (has checkbox), Grouped by Food Category */}
          <div className="p-4">
            {groupItemsByFoodCategory(categorizedItems.needMore).map((foodCategory) => (
              <FoodCategorySection
                key={foodCategory.categoryName}
                foodCategory={foodCategory}
                renderItem={(item) => {
                  const itemKey = `${item.name}-${item.quantity}-${item.unit}`;
                  return (
                    <ShoppingListItem
                      key={itemKey}
                      item={item}
                      isChecked={checkedItems[itemKey] || false}
                      onToggle={onToggleItem}
                    />
                  );
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* ===================================================================
          SECTION 3: NEED TO BUY (ORANGE)
          ===================================================================
          Shows items that are NOT in pantry at all
          User must purchase these items
          Most important section for shopping
          Only renders if items exist in this category
      */}
      {categorizedItems.needToBuy.length > 0 && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden border-l-4 border-orange-500">

          {/* Section Header - Orange Theme */}
          <div className="bg-orange-50 px-6 py-4 border-b border-orange-100">
            <h2 className="text-xl font-bold text-orange-800 flex items-center gap-2">
              {/* Shopping Cart Icon */}
              <svg className="w-6 h-6 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
              </svg>

              {/* Section Title with Item Count */}
              Need to Buy
              <span className="text-sm font-normal text-orange-700 ml-2">
                ({categorizedItems.needToBuy.length}{' '}
                {categorizedItems.needToBuy.length === 1 ? 'item' : 'items'})
              </span>
            </h2>

            {/* Description */}
            <p className="text-sm text-orange-700 mt-1">
              These items are not in your pantry
            </p>
          </div>

          {/* Items List - Uses ShoppingListItem (has checkbox), Grouped by Food Category */}
          <div className="p-4">
            {groupItemsByFoodCategory(categorizedItems.needToBuy).map((foodCategory) => (
              <FoodCategorySection
                key={foodCategory.categoryName}
                foodCategory={foodCategory}
                renderItem={(item) => {
                  const itemKey = `${item.name}-${item.quantity}-${item.unit}`;
                  return (
                    <ShoppingListItem
                      key={itemKey}
                      item={item}
                      isChecked={checkedItems[itemKey] || false}
                      onToggle={onToggleItem}
                    />
                  );
                }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default ShoppingListGroup;
