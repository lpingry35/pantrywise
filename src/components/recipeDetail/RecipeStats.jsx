/**
 * ============================================================================
 * RECIPE STATS COMPONENT
 * ============================================================================
 *
 * PURPOSE:
 * Displays key recipe statistics in a clean, organized grid layout.
 * Shows cook time, servings, cost per serving, and ingredient count.
 *
 * WHY IMPORTANT:
 * - Gives users quick overview of recipe at a glance
 * - Helps with meal planning decisions (time, budget, portions)
 * - Professional, organized appearance
 * - Makes complex information easy to scan
 *
 * LAYOUT:
 * - 2 columns on mobile (grid-cols-2)
 * - 4 columns on desktop (md:grid-cols-4)
 * - Light gray background to differentiate from main content
 * - Centered text for clean, symmetrical appearance
 *
 * PARENT: RecipeDetail.jsx (pages)
 *
 * @param {number} cookTime - Cook time in minutes
 * @param {number} servings - Number of servings recipe makes
 * @param {number} costPerServing - Cost per serving in dollars
 * @param {number} ingredientCount - Total number of ingredients
 */

function RecipeStats({ cookTime, servings, costPerServing, ingredientCount }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 p-6 bg-gray-50 rounded-lg">
      {/* ===================================================================
          COOK TIME STAT
          ===================================================================
          Shows how long the recipe takes to prepare and cook
      */}
      <div className="text-center">
        {/* Label */}
        <div className="text-sm text-gray-600 mb-1">Cook Time</div>

        {/* Large Number */}
        <div className="text-2xl font-bold text-gray-800">{cookTime}</div>

        {/* Unit */}
        <div className="text-xs text-gray-500">minutes</div>
      </div>

      {/* ===================================================================
          SERVINGS STAT
          ===================================================================
          Shows how many people the recipe serves
      */}
      <div className="text-center">
        {/* Label */}
        <div className="text-sm text-gray-600 mb-1">Servings</div>

        {/* Large Number */}
        <div className="text-2xl font-bold text-gray-800">{servings}</div>

        {/* Unit */}
        <div className="text-xs text-gray-500">people</div>
      </div>

      {/* ===================================================================
          COST PER SERVING STAT
          ===================================================================
          Shows estimated cost per person
          Uses primary color to emphasize this important metric
      */}
      <div className="text-center">
        {/* Label */}
        <div className="text-sm text-gray-600 mb-1">Cost</div>

        {/* Large Number - Blue color for emphasis */}
        <div className="text-2xl font-bold text-primary">
          ${costPerServing.toFixed(2)}
        </div>

        {/* Unit */}
        <div className="text-xs text-gray-500">per serving</div>
      </div>

      {/* ===================================================================
          INGREDIENT COUNT STAT
          ===================================================================
          Shows total number of ingredients needed
          Helps users gauge recipe complexity
      */}
      <div className="text-center">
        {/* Label */}
        <div className="text-sm text-gray-600 mb-1">Ingredients</div>

        {/* Large Number */}
        <div className="text-2xl font-bold text-gray-800">{ingredientCount}</div>

        {/* Unit */}
        <div className="text-xs text-gray-500">items</div>
      </div>
    </div>
  );
}

export default RecipeStats;
