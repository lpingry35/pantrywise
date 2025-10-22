import MealSlot from './MealSlot';

/**
 * ============================================================================
 * MEAL PLAN GRID COMPONENT
 * ============================================================================
 *
 * PURPOSE:
 * Renders the weekly meal planning calendar as a 7×3 grid:
 * - 7 columns (Monday through Sunday)
 * - 3 rows (Breakfast, Lunch, Dinner)
 * - 21 total meal slots
 *
 * WHY SEPARATE COMPONENT:
 * - Isolates complex grid layout logic
 * - Makes table structure reusable
 * - Easier to modify layout without affecting other components
 * - Reduces MealPlannerCalendar.jsx complexity
 *
 * FEATURES:
 * - Fixed table layout (table-fixed) for equal column widths
 * - All cells are identical size regardless of content
 * - Responsive: Scrolls horizontally on mobile (min-width: 800px)
 * - Uses FULL day names only (Monday, Tuesday, etc.) - NO ABBREVIATIONS
 * - Each cell is a MealSlot component (filled or empty)
 * - Maintains cooking history and cooked state
 *
 * LAYOUT DETAILS:
 * - table-fixed CSS class ensures all columns equal width
 * - Fixed cell height (140px) prevents grid jumping
 * - Border-collapse for clean cell borders
 * - Header row with gray background
 * - Left column (meal names) has light gray background
 *
 * DATA FLOW:
 * - Receives mealPlan object from context
 * - Passes individual recipe data to each MealSlot
 * - Callbacks bubble up from MealSlot → MealPlanGrid → parent
 *
 * PARENT: MealPlannerCalendar.jsx
 *
 * @param {object} mealPlan - Full meal plan object (7 days × 3 meals)
 * @param {object} cookedRecipes - Object tracking which recipes are cooked
 * @param {object} cookingHistoryCache - Cached cooking history for all recipes
 * @param {function} onOpenRecipeModal - Callback to open recipe selection modal
 * @param {function} onToggleCooked - Callback to toggle cooked status
 * @param {function} onRemoveRecipe - Callback to remove recipe from slot
 */

function MealPlanGrid({
  mealPlan,
  cookedRecipes,
  cookingHistoryCache,
  onOpenRecipeModal,
  onToggleCooked,
  onRemoveRecipe
}) {
  // ============================================================================
  // DAY AND MEAL CONFIGURATION
  // ============================================================================
  // CRITICAL: Use FULL day names for consistency and accessibility
  // NO ABBREVIATIONS - makes UI clearer for all users
  // Lowercase keys for mealPlan object access
  // Capitalized labels for display
  // ============================================================================

  // Days of the week (lowercase for object keys)
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

  // Day labels for display (full names, capitalized)
  const dayLabels = {
    monday: 'Monday',
    tuesday: 'Tuesday',
    wednesday: 'Wednesday',
    thursday: 'Thursday',
    friday: 'Friday',
    saturday: 'Saturday',
    sunday: 'Sunday'
  };

  // Meals (lowercase for object keys)
  const meals = ['breakfast', 'lunch', 'dinner'];

  // Meal labels for display (capitalized)
  const mealLabels = {
    breakfast: 'Breakfast',
    lunch: 'Lunch',
    dinner: 'Dinner'
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* ===================================================================
          HORIZONTAL SCROLL CONTAINER FOR MOBILE
          ===================================================================
          Table has min-width of 800px to fit all columns comfortably
          On small screens, allows horizontal scrolling
          On larger screens, table fills available width
      */}
      <div className="overflow-x-auto">
        {/* =================================================================
            MEAL PLAN TABLE - FIXED LAYOUT FOR CONSISTENT COLUMN WIDTHS
            =================================================================
            CRITICAL: table-fixed ensures ALL columns are equal width
            WHY: Without this, columns expand based on content (BAD!)
            RESULT: All cells identical size regardless of content
            MIN-WIDTH: 800px ensures comfortable layout on all screens
        */}
        <table className="w-full border-collapse min-w-[800px] table-fixed">
          {/* ===============================================================
              TABLE HEADER - DAY NAMES
              ===============================================================
              First column: "Meal" label
              Remaining 7 columns: Monday through Sunday (FULL NAMES)
              Gray background to distinguish from table body
          */}
          <thead>
            <tr className="bg-gray-100">
              {/* "Meal" Column Header (fixed width) */}
              <th className="p-3 text-left font-semibold text-gray-700 border-r border-gray-200 w-32">
                Meal
              </th>

              {/* Day Column Headers (Monday-Sunday) */}
              {days.map(day => (
                <th key={day} className="p-3 text-center font-semibold text-gray-700 border-r border-gray-200 last:border-r-0">
                  {dayLabels[day]}
                </th>
              ))}
            </tr>
          </thead>

          {/* ===============================================================
              TABLE BODY - MEAL ROWS
              ===============================================================
              3 rows: Breakfast, Lunch, Dinner
              Each row has 8 columns: Meal name + 7 day slots
              Each slot is a MealSlot component
          */}
          <tbody>
            {meals.map((meal, mealIndex) => (
              <tr
                key={meal}
                className={mealIndex !== meals.length - 1 ? 'border-b border-gray-200' : ''}
              >
                {/* =============================================================
                    MEAL NAME COLUMN (Left side)
                    =============================================================
                    Shows meal type: Breakfast, Lunch, or Dinner
                    Light gray background to distinguish from meal slots
                */}
                <td className="p-3 font-medium text-gray-700 bg-gray-50 border-r border-gray-200 capitalize">
                  {mealLabels[meal]}
                </td>

                {/* =============================================================
                    MEAL SLOTS (7 columns for each day)
                    =============================================================
                    Each cell contains a MealSlot component
                    MealSlot shows either:
                    - Filled slot (recipe with image, name, cost, rating)
                    - Empty slot (clickable to add recipe)

                    IMPORTANT:
                    - min-w-0 prevents cell from growing beyond table column
                    - overflow-hidden ensures content stays within bounds
                    - MealSlot handles all slot-specific logic and UI
                */}
                {days.map(day => {
                  // Get recipe for this slot (or undefined if empty)
                  const recipe = mealPlan[day][meal];

                  // Check if this recipe has been marked as cooked
                  const recipeKey = `${day}-${meal}`;
                  const isCooked = cookedRecipes[recipeKey];

                  return (
                    <td
                      key={`${day}-${meal}`}
                      className="p-2 border-r border-gray-200 last:border-r-0 min-w-0 overflow-hidden"
                    >
                      <MealSlot
                        recipe={recipe}
                        day={day}
                        meal={meal}
                        isCooked={isCooked}
                        cookingHistoryCache={cookingHistoryCache}
                        onOpenRecipeModal={onOpenRecipeModal}
                        onToggleCooked={onToggleCooked}
                        onRemoveRecipe={onRemoveRecipe}
                      />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default MealPlanGrid;
