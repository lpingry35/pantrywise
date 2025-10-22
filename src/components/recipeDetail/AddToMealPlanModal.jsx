import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

/**
 * ============================================================================
 * ADD TO MEAL PLAN MODAL COMPONENT
 * ============================================================================
 *
 * PURPOSE:
 * Modal dialog that allows users to add a recipe to their meal plan.
 * Supports adding to either the current active plan or any saved plan.
 *
 * FEATURES:
 * - Choose between current plan or saved plans
 * - Select day (Monday-Sunday) - FULL NAMES ONLY, NO ABBREVIATIONS
 * - Select meal (Breakfast/Lunch/Dinner)
 * - Recipe preview card shows cost and cook time
 * - Validation ensures day and meal are selected
 *
 * HOW IT WORKS:
 * 1. User clicks "Add to Meal Plan" button on recipe detail page
 * 2. Modal opens with recipe preview
 * 3. User selects: Plan → Day → Meal
 * 4. User clicks "Add to Plan"
 * 5. Parent component handles the actual addition to Firestore
 * 6. Modal closes
 *
 * STATE:
 * - selectedPlan: 'current' or saved plan ID
 * - selectedDay: Full day name ('Monday', 'Tuesday', etc.)
 * - selectedMeal: Meal name ('Breakfast', 'Lunch', or 'Dinner')
 *
 * PARENT: RecipeDetail.jsx (pages)
 *
 * @param {boolean} isOpen - Whether modal is visible
 * @param {function} onClose - Function to close modal
 * @param {object} recipe - Recipe to add to meal plan
 * @param {array} savedPlans - Array of saved meal plans
 * @param {function} onAdd - Function to call when adding (recipe, planId, day, meal)
 * @param {boolean} loading - Whether saved plans are loading
 */

function AddToMealPlanModal({ isOpen, onClose, recipe, savedPlans, onAdd, loading }) {
  const [selectedPlan, setSelectedPlan] = useState('current');
  const [selectedDay, setSelectedDay] = useState('');
  const [selectedMeal, setSelectedMeal] = useState('');

  // CRITICAL: Use FULL day names for consistency across UI
  // NO ABBREVIATIONS - makes UI clearer and more accessible
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const meals = ['Breakfast', 'Lunch', 'Dinner'];

  // Reset selections when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedPlan('current');
      setSelectedDay('');
      setSelectedMeal('');
    }
  }, [isOpen]);

  /**
   * Handle adding recipe to selected plan/day/meal
   * Validates that day and meal are selected before calling parent handler
   */
  const handleAdd = () => {
    // Validate that user selected both day and meal
    if (!selectedDay || !selectedMeal) {
      alert('Please select both a day and a meal');
      return;
    }

    // Call the parent handler with selected values
    onAdd(recipe, selectedPlan, selectedDay, selectedMeal);
    onClose();
  };

  /**
   * Helper function to format Firestore timestamp for display
   * Shows month and day (e.g., "Jan 15")
   */
  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    try {
      // Handle both Firestore Timestamp and ISO string
      const date = timestamp.seconds
        ? new Date(timestamp.seconds * 1000)
        : new Date(timestamp);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch (error) {
      return '';
    }
  };

  /**
   * Helper function to count total recipes in a meal plan
   * Used to show recipe count for saved plans
   */
  const countRecipes = (plan) => {
    if (!plan || !plan.mealPlan) return 0;
    let count = 0;
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const meals = ['breakfast', 'lunch', 'dinner'];

    days.forEach(day => {
      meals.forEach(meal => {
        if (plan.mealPlan[day] && plan.mealPlan[day][meal]) {
          count++;
        }
      });
    });

    return count;
  };

  // Don't render if modal is closed or no recipe
  if (!isOpen || !recipe) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ===================================================================
            MODAL HEADER
            ===================================================================
            Title and close button
        */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800">Add to Meal Plan</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* ===================================================================
            RECIPE PREVIEW CARD
            ===================================================================
            Shows which recipe is being added
        */}
        <div className="mb-4 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
          <p className="font-semibold text-gray-800">{recipe.name}</p>
          <p className="text-sm text-gray-600">
            ${recipe.costPerServing.toFixed(2)} per serving • {recipe.cookTime} min
          </p>
        </div>

        {/* ===================================================================
            MEAL PLAN SELECTION
            ===================================================================
            Choose current plan or saved plan
        */}
        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Which meal plan?
          </label>
          <div className="space-y-2">
            {/* Current/Active Plan Option */}
            <button
              onClick={() => setSelectedPlan('current')}
              className={`w-full px-4 py-3 rounded-lg border-2 text-left transition-colors ${
                selectedPlan === 'current'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <div className="flex items-center gap-2">
                {/* Radio Button Indicator */}
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                  selectedPlan === 'current' ? 'border-blue-500' : 'border-gray-300'
                }`}>
                  {selectedPlan === 'current' && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  )}
                </div>
                <div>
                  <p className="font-semibold text-gray-800">Current Plan</p>
                  <p className="text-sm text-gray-600">Your active meal plan (My Meal Plan)</p>
                </div>
              </div>
            </button>

            {/* Loading Saved Plans */}
            {loading && (
              <p className="text-sm text-gray-500 italic mt-2">Loading saved plans...</p>
            )}

            {/* Saved Plans List */}
            {!loading && savedPlans && savedPlans.length > 0 && (
              <>
                <p className="text-xs text-gray-500 font-semibold uppercase mt-3 mb-1">
                  Or add to saved plan:
                </p>
                {savedPlans.map(plan => (
                  <button
                    key={plan.id}
                    onClick={() => setSelectedPlan(plan.id)}
                    className={`w-full px-4 py-3 rounded-lg border-2 text-left transition-colors ${
                      selectedPlan === plan.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {/* Radio Button Indicator */}
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                        selectedPlan === plan.id ? 'border-blue-500' : 'border-gray-300'
                      }`}>
                        {selectedPlan === plan.id && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-800">{plan.name}</p>
                        <p className="text-sm text-gray-600">
                          {countRecipes(plan)} recipes • Saved {formatDate(plan.createdAt)}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </>
            )}

            {/* No Saved Plans Message */}
            {!loading && (!savedPlans || savedPlans.length === 0) && (
              <p className="text-sm text-gray-500 italic mt-2">
                No saved meal plans yet. This will add to your current plan.
              </p>
            )}
          </div>
        </div>

        {/* ===================================================================
            DAY SELECTION
            ===================================================================
            Choose day of the week - FULL NAMES ONLY, NO ABBREVIATIONS
        */}
        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Select Day:
          </label>
          <div className="grid grid-cols-2 gap-2">
            {days.map(day => (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                className={`px-4 py-2 rounded-lg border-2 transition-colors ${
                  selectedDay === day
                    ? 'border-blue-500 bg-blue-50 text-blue-700 font-semibold'
                    : 'border-gray-300 hover:border-gray-400 text-gray-700'
                }`}
              >
                {day}
              </button>
            ))}
          </div>
        </div>

        {/* ===================================================================
            MEAL SELECTION
            ===================================================================
            Choose Breakfast, Lunch, or Dinner
        */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Select Meal:
          </label>
          <div className="flex gap-2">
            {meals.map(meal => (
              <button
                key={meal}
                onClick={() => setSelectedMeal(meal)}
                className={`flex-1 px-4 py-2 rounded-lg border-2 transition-colors ${
                  selectedMeal === meal
                    ? 'border-blue-500 bg-blue-50 text-blue-700 font-semibold'
                    : 'border-gray-300 hover:border-gray-400 text-gray-700'
                }`}
              >
                {meal}
              </button>
            ))}
          </div>
        </div>

        {/* ===================================================================
            ACTION BUTTONS
            ===================================================================
            Cancel or confirm adding recipe to plan
        */}
        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleAdd}
            disabled={!selectedDay || !selectedMeal}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700
                       disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
          >
            Add to Plan
          </button>
        </div>
      </div>
    </div>
  );
}

export default AddToMealPlanModal;
