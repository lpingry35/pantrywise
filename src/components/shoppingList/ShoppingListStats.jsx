/**
 * ============================================================================
 * SHOPPING LIST STATS COMPONENT
 * ============================================================================
 *
 * PURPOSE:
 * Displays summary statistics for the shopping list in a visually appealing card.
 * Shows key metrics that help users understand their shopping needs at a glance.
 *
 * DISPLAYS:
 * 1. Total Items - Total number of items in shopping list
 * 2. Estimated Cost - Total cost of all items (calculated from recipes)
 * 3. Estimated Savings - Money saved by already having items in pantry
 * 4. Need to Buy - Items that must be purchased (excludes already have)
 * 5. Checked Off - Items user has marked as purchased
 *
 * WHY THIS IS USEFUL:
 * - Gives users a quick overview of their shopping needs
 * - Shows potential cost savings from having pantry items
 * - Tracks progress with "Checked Off" count
 * - Helps budget planning with cost estimates
 *
 * PARENT: ShoppingListPage.jsx
 *
 * @param {number} totalItems - Total number of items in shopping list
 * @param {number} totalCost - Total estimated cost of all items
 * @param {number} estimatedSavings - Money saved from items already in pantry
 * @param {number} remainingNeedToBuy - Number of items still needing purchase
 * @param {number} checkedOffCount - Number of items marked as purchased
 */

function ShoppingListStats({
  totalItems,
  totalCost,
  estimatedSavings,
  remainingNeedToBuy,
  checkedOffCount
}) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      {/* Grid Layout - Responsive: 2 columns on mobile, 5 on desktop */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-6">

        {/* STAT 1: Total Items */}
        <div className="text-center">
          <div className="text-sm text-gray-600 mb-1">Total Items</div>
          <div className="text-3xl font-bold text-primary">{totalItems}</div>
        </div>

        {/* STAT 2: Estimated Cost
            Shows total cost of all items needed for recipes
            Helps users budget for their shopping trip */}
        <div className="text-center">
          <div className="text-sm text-gray-600 mb-1">Estimated Cost</div>
          <div className="text-3xl font-bold text-success">${totalCost}</div>
        </div>

        {/* STAT 3: Estimated Savings
            Calculated as: (items already in pantry) × $3 average per item
            Shows how much money user saves by having pantry items
            Green color emphasizes positive savings */}
        <div className="text-center">
          <div className="text-sm text-gray-600 mb-1">Estimated Savings</div>
          <div className="text-3xl font-bold text-green-700">${estimatedSavings}</div>
        </div>

        {/* STAT 4: Need to Buy
            Dynamic count that decreases as user checks off items
            Orange color indicates action needed (must purchase)
            Helps users focus on uncompleted shopping tasks */}
        <div className="text-center">
          <div className="text-sm text-gray-600 mb-1">Need to Buy</div>
          <div className="text-3xl font-bold text-orange-600">
            {remainingNeedToBuy}
          </div>
        </div>

        {/* STAT 5: Checked Off
            Tracks user's progress through the shopping list
            Increases as user marks items as purchased
            Gray color (neutral - just informational) */}
        <div className="text-center">
          <div className="text-sm text-gray-600 mb-1">Checked Off</div>
          <div className="text-3xl font-bold text-gray-700">
            {checkedOffCount}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ShoppingListStats;
