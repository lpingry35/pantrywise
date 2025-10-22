import { Save } from 'lucide-react';

/**
 * ============================================================================
 * MEAL PLAN STATS COMPONENT
 * ============================================================================
 *
 * PURPOSE:
 * Displays key statistics about the current meal plan and provides
 * functionality to save the plan with a custom name.
 *
 * WHY SEPARATE COMPONENT:
 * - Isolates stats display and save plan functionality
 * - Makes MealPlannerHeader cleaner and more focused
 * - Easy to modify stats layout independently
 * - Handles all save plan logic in one place
 *
 * FEATURES:
 * - Two stat cards: Weekly Cost and Meals Planned
 * - Semi-transparent glass-morphism design on blue gradient
 * - Save Plan UI: Input + button integrated below stats
 * - Real-time validation (requires plan name and at least 1 recipe)
 * - Enter key support for quick saving
 * - Loading state with spinner during save operation
 * - Shows recipe count below save button
 *
 * DESIGN:
 * - Glass-morphism cards (bg-white/10 with backdrop-blur)
 * - White borders for clarity on gradient background
 * - Blue-tinted placeholder text
 * - White button with blue text (stands out on gradient)
 * - Responsive layout: stacked on mobile, row on desktop
 *
 * PARENT: MealPlannerHeader.jsx
 *
 * @param {number} weeklyCost - Total cost of all recipes in plan
 * @param {number} filledSlotsCount - Number of filled meal slots (0-21)
 * @param {string} planName - Current value of plan name input
 * @param {function} onPlanNameChange - Callback when user types in input
 * @param {function} onSavePlan - Callback when user clicks Save Plan
 * @param {boolean} savingPlan - Whether save operation is in progress
 */

function MealPlanStats({
  weeklyCost,
  filledSlotsCount,
  planName,
  onPlanNameChange,
  onSavePlan,
  savingPlan
}) {
  /**
   * Handle Enter key press in plan name input
   * Allows users to save quickly without clicking button
   */
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      onSavePlan();
    }
  };

  return (
    <div>
      {/* ===================================================================
          STATS SECTION - WEEKLY COST AND MEALS PLANNED
          ===================================================================
          Two semi-transparent cards showing key metrics
          Responsive: Stacks vertically on mobile, horizontal on desktop
      */}
      <div className="flex gap-4 md:gap-6">
        {/* =================================================================
            WEEKLY COST CARD
            =================================================================
            Shows total cost of all recipes in current meal plan
            Calculated by summing (costPerServing × servings) for all recipes
        */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl px-6 py-4 border border-white/20">
          {/* Label */}
          <div className="text-blue-100 text-xs font-medium uppercase tracking-wide mb-1">
            Weekly Cost
          </div>
          {/* Value */}
          <div className="text-3xl font-bold text-white">
            ${weeklyCost.toFixed(2)}
          </div>
        </div>

        {/* =================================================================
            MEALS PLANNED CARD
            =================================================================
            Shows how many of 21 weekly slots are filled
            21 slots = 7 days × 3 meals per day
        */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl px-6 py-4 border border-white/20">
          {/* Label */}
          <div className="text-blue-100 text-xs font-medium uppercase tracking-wide mb-1">
            Meals Planned
          </div>
          {/* Value - Filled/21 */}
          <div className="text-3xl font-bold text-white">
            {filledSlotsCount}<span className="text-xl text-blue-200">/21</span>
          </div>
        </div>
      </div>

      {/* ===================================================================
          SAVE PLAN SECTION
          ===================================================================
          Integrated into stats area for cleaner interface
          Allows users to save current meal plan with custom name
          Saves to users/{userId}/savedMealPlans in Firestore
      */}
      <div className="border-t border-white/20 pt-6 mt-6">
        {/* Section Header */}
        <div className="flex items-center gap-2 mb-3">
          <Save className="w-5 h-5 text-blue-100" />
          <span className="font-semibold text-white text-lg">Save This Plan</span>
        </div>

        {/* Input + Button Row */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* =================================================================
              PLAN NAME INPUT
              =================================================================
              User types custom name for their meal plan
              Examples: "Budget Week", "Keto Plan", "Family Favorites"
              White semi-transparent background for glass effect
              Blue-tinted placeholder text to match theme
          */}
          <input
            type="text"
            placeholder="e.g., Budget Week, Keto Plan, Family Favorites..."
            value={planName}
            onChange={(e) => onPlanNameChange(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={savingPlan}
            className="flex-1 px-4 py-3 rounded-lg bg-white/20 border border-white/30
                       text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-white
                       focus:bg-white/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          />

          {/* =================================================================
              SAVE PLAN BUTTON
              =================================================================
              Saves current meal plan to Firestore

              DISABLED WHEN:
              - Plan name is empty or only whitespace
              - No recipes in plan (filledSlotsCount === 0)
              - Save operation already in progress

              LOADING STATE:
              - Shows spinner + "Saving..." text during operation

              STYLING:
              - White background with blue text (stands out on gradient)
              - Shadow and hover effect for interactivity
              - Fixed width button (doesn't resize based on text)
          */}
          <button
            onClick={onSavePlan}
            disabled={!planName.trim() || filledSlotsCount === 0 || savingPlan}
            className="px-6 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50
                       disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg
                       hover:shadow-xl hover:-translate-y-0.5 transform flex items-center justify-center gap-2 whitespace-nowrap"
          >
            {savingPlan ? (
              <>
                {/* Loading Spinner */}
                <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <span>Saving...</span>
              </>
            ) : (
              <>
                {/* Save Icon */}
                <Save className="w-5 h-5" />
                <span>Save Plan</span>
              </>
            )}
          </button>
        </div>

        {/* Recipe Count Info - Shows how many recipes are in current plan */}
        <p className="text-xs text-blue-200 mt-2 flex items-center gap-1">
          📋 {filledSlotsCount} recipe{filledSlotsCount !== 1 ? 's' : ''} in current plan
        </p>
      </div>
    </div>
  );
}

export default MealPlanStats;
