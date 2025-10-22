import MealPlanStats from './MealPlanStats';

/**
 * ============================================================================
 * MEAL PLANNER HEADER COMPONENT
 * ============================================================================
 *
 * PURPOSE:
 * Displays the prominent header banner for the meal planner calendar.
 * Shows current plan name, decorative background, and integrates stats.
 *
 * WHY SEPARATE COMPONENT:
 * - Isolates header design and layout
 * - Makes it easy to modify banner styling
 * - Reduces MealPlannerCalendar.jsx complexity
 * - Groups related UI elements (plan name + stats)
 *
 * FEATURES:
 * - Beautiful blue-to-purple gradient background
 * - Decorative blurred circles for visual interest
 * - Current plan name display (large, bold, prominent)
 * - Clipboard icon for visual context
 * - Instructions for user ("Click any meal slot...")
 * - Integrates MealPlanStats component for metrics and save functionality
 * - Responsive layout: Stacks on mobile, row on desktop
 *
 * DESIGN:
 * - Glass-morphism effect with semi-transparent white elements
 * - Gradient: blue-600 → indigo-600 → purple-600
 * - White text on gradient for high contrast
 * - Rounded corners (rounded-2xl) for modern look
 * - Large shadow (shadow-2xl) for depth
 *
 * PARENT: MealPlannerCalendar.jsx
 *
 * @param {string} currentPlanName - Name of current meal plan
 * @param {number} weeklyCost - Total cost of all recipes in plan
 * @param {number} filledSlotsCount - Number of filled meal slots (0-21)
 * @param {string} planName - Current value of plan name input (for saving)
 * @param {function} onPlanNameChange - Callback when user types in save input
 * @param {function} onSavePlan - Callback when user clicks Save Plan
 * @param {boolean} savingPlan - Whether save operation is in progress
 */

function MealPlannerHeader({
  currentPlanName,
  weeklyCost,
  filledSlotsCount,
  planName,
  onPlanNameChange,
  onSavePlan,
  savingPlan
}) {
  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-2xl shadow-2xl mb-6">
      {/* ===================================================================
          DECORATIVE BACKGROUND PATTERN
          ===================================================================
          Two large blurred circles create visual interest
          Positioned at opposite corners for balanced design
          Low opacity (10%) so they don't distract from content
          Adds depth and modern aesthetic to gradient
      */}
      <div className="absolute inset-0 opacity-10">
        {/* Top-right circle */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        {/* Bottom-left circle */}
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white rounded-full blur-3xl"></div>
      </div>

      {/* ===================================================================
          MAIN CONTENT AREA
          ===================================================================
          All content positioned above decorative background (z-10)
          Padding and spacing designed for mobile and desktop
      */}
      <div className="relative z-10 px-8 py-6">
        {/* =================================================================
            TOP SECTION - PLAN NAME AND INSTRUCTIONS
            =================================================================
            Responsive flex layout:
            - Mobile: Stacks vertically
            - Desktop: Plan name on left, stats on right (handled by stats)
        */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* ===============================================================
              PLAN NAME SECTION
              ===============================================================
              Shows current meal plan name with icon
              This is the primary identifier for the user's active plan
          */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              {/* =============================================================
                  CLIPBOARD ICON
                  =============================================================
                  Visual representation of meal planning
                  Semi-transparent white background with backdrop blur
                  Icon centered in rounded square
              */}
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              </div>

              {/* =============================================================
                  PLAN NAME AND LABEL
                  =============================================================
                  Shows "Current Meal Plan" label above plan name
                  Plan name is large (3xl/4xl) and bold for prominence
              */}
              <div>
                {/* Label (small, uppercase, light blue) */}
                <div className="text-blue-100 text-sm font-medium uppercase tracking-wide">
                  Current Meal Plan
                </div>
                {/* Plan Name (large, white, bold) */}
                <h2 className="text-3xl md:text-4xl font-bold text-white mt-1">
                  {currentPlanName}
                </h2>
              </div>
            </div>

            {/* =============================================================
                INSTRUCTIONS
                =============================================================
                Helpful text guiding users on how to use the calendar
                Light blue color for secondary text
            */}
            <p className="text-blue-100 ml-15 text-sm">
              Click any meal slot below to add or change recipes
            </p>
          </div>

          {/* ===============================================================
              STATS SECTION
              ===============================================================
              Rendered by MealPlanStats component
              Shows Weekly Cost, Meals Planned, and Save Plan UI
              Positioned on right side of header on desktop
          */}
          <MealPlanStats
            weeklyCost={weeklyCost}
            filledSlotsCount={filledSlotsCount}
            planName={planName}
            onPlanNameChange={onPlanNameChange}
            onSavePlan={onSavePlan}
            savingPlan={savingPlan}
          />
        </div>
      </div>
    </div>
  );
}

export default MealPlannerHeader;
