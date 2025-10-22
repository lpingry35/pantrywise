/**
 * ============================================================================
 * FOOD CATEGORY SECTION COMPONENT
 * ============================================================================
 *
 * PURPOSE:
 * Renders a single food category subsection within a shopping list group.
 * Shows category header with icon and item count, plus all items in that category.
 *
 * EXAMPLE OUTPUT:
 * 🥬 Produce (5)
 *   □ 2 tomatoes
 *   □ 1 onion
 *   □ 3 bell peppers
 *
 * WHY SEPARATE COMPONENT:
 * - Keeps ShoppingListGroup.jsx clean and focused
 * - Reusable for different sections (Already Have, Need More, Need to Buy)
 * - Easy to modify food category rendering independently
 * - Prevents file bloat (we just refactored to avoid this!)
 *
 * PARENT: ShoppingListGroup.jsx
 *
 * @param {object} foodCategory - Category object with name, icon, items
 * @param {function} renderItem - Function to render individual item (varies by section)
 */

import React from 'react';

function FoodCategorySection({ foodCategory, renderItem }) {
  // Don't render if no items in this category
  if (!foodCategory.items || foodCategory.items.length === 0) {
    return null;
  }

  return (
    <div className="mb-4 last:mb-0">
      {/* ===================================================================
          FOOD CATEGORY HEADER
          ===================================================================
          Shows icon, category name, and item count
          Border-left creates visual hierarchy (subsection within main section)
      */}
      <div className="flex items-center gap-2 mb-2 pl-2 border-l-4 border-gray-300">
        {/* Category Icon (e.g., 🥬 for Produce, 🥩 for Meat) */}
        <span className="text-2xl" aria-label={foodCategory.categoryName}>
          {foodCategory.icon}
        </span>

        {/* Category Name (e.g., "Produce", "Meat & Seafood") */}
        <h4 className="font-semibold text-gray-700">
          {foodCategory.categoryName}
        </h4>

        {/* Item Count in this category (e.g., "(5)" means 5 items) */}
        <span className="text-sm text-gray-500">
          ({foodCategory.items.length})
        </span>
      </div>

      {/* ===================================================================
          ITEMS IN THIS FOOD CATEGORY
          ===================================================================
          Indented to show hierarchy (items belong to this category)
          renderItem function is passed from parent and varies by section:
          - Already Have: Uses AlreadyHaveItem component (green checkmark)
          - Need More: Uses ShoppingListItem component (checkbox)
          - Need to Buy: Uses ShoppingListItem component (checkbox)
      */}
      <div className="space-y-2 pl-8">
        {foodCategory.items.map(item => renderItem(item))}
      </div>
    </div>
  );
}

export default FoodCategorySection;
