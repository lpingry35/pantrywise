import { useNavigate } from 'react-router-dom';
import { doc, deleteDoc } from 'firebase/firestore';
import { db, auth } from '../../firebase';
import { useMealPlan } from '../../context/MealPlanContext';

/**
 * ============================================================================
 * RECIPE ACTIONS COMPONENT
 * ============================================================================
 *
 * PURPOSE:
 * Provides action buttons for recipe management:
 * - "Add to Meal Plan" - Opens modal to add recipe to current or saved plan
 * - "Edit Recipe" - Opens modal to edit recipe details
 * - "Delete Recipe" - Deletes recipe with smart meal plan checking
 *
 * WHY SEPARATE COMPONENT:
 * - Groups all recipe actions together
 * - Handles delete logic with meal plan awareness
 * - Makes it easy to add more actions later
 * - Reduces complexity of main RecipeDetail component
 *
 * HOW IT WORKS:
 * 1. User clicks "Add to Meal Plan" → modal opens
 * 2. User clicks "Edit Recipe" → edit modal opens
 * 3. User clicks "Delete" → checks meal plan, shows warning, deletes
 *
 * DELETE FEATURE (SMART):
 * - Checks if recipe is in current meal plan before deleting
 * - Shows enhanced warning if recipe is being used
 * - Automatically removes from meal plan slots before deleting
 * - Prevents broken meal plans
 *
 * PARENT: RecipeDetail.jsx (pages)
 *
 * @param {object} recipe - The recipe object
 * @param {function} onOpenAddToPlanModal - Callback to open add to meal plan modal
 * @param {function} onOpenEditModal - Callback to open edit recipe modal
 */

function RecipeActions({ recipe, onOpenAddToPlanModal, onOpenEditModal }) {
  const navigate = useNavigate();
  const { mealPlan, removeRecipeFromSlot } = useMealPlan();

  /**
   * CHECK IF RECIPE IS IN CURRENT MEAL PLAN
   *
   * PURPOSE:
   * Before deleting, check if this recipe is being used in the current meal plan.
   * If it is, warn the user and give them the option to remove it from the plan.
   *
   * HOW IT WORKS:
   * 1. Loop through all 7 days in the meal plan
   * 2. For each day, check breakfast, lunch, and dinner
   * 3. If any slot contains this recipe (by matching recipe ID), record the location
   * 4. Return array of human-readable locations (e.g., "Monday Dinner")
   *
   * WHY THIS IS IMPORTANT:
   * - Prevents user from accidentally breaking their meal plan
   * - Shows exactly where the recipe is being used
   * - Allows automatic cleanup when deleting
   *
   * @returns {array} Array of slot locations where recipe is used (e.g., ["Monday Dinner", "Wednesday Lunch"])
   */
  const checkRecipeInMealPlan = () => {
    const usedInSlots = [];

    // Days of the week (lowercase, as stored in Firestore)
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const meals = ['breakfast', 'lunch', 'dinner'];

    // Check all 21 meal plan slots (7 days x 3 meals)
    days.forEach(day => {
      meals.forEach(meal => {
        // Get the recipe in this slot
        const slotRecipe = mealPlan[day]?.[meal];

        // If this slot has a recipe and it matches our recipe ID
        if (slotRecipe && slotRecipe.id === recipe.id) {
          // Format for display: "monday" + "dinner" → "Monday Dinner"
          const dayCapitalized = day.charAt(0).toUpperCase() + day.slice(1);
          const mealCapitalized = meal.charAt(0).toUpperCase() + meal.slice(1);
          usedInSlots.push(`${dayCapitalized} ${mealCapitalized}`);
        }
      });
    });

    return usedInSlots;
  };

  /**
   * DELETE RECIPE WITH SMART MEAL PLAN CHECKING
   *
   * PURPOSE:
   * Safely delete a recipe, with warnings if it's being used in the meal plan.
   *
   * FLOW:
   * 1. Check if recipe is in current meal plan
   * 2. If YES:
   *    - Show enhanced warning with exact locations
   *    - Tell user recipe will be removed from meal plan
   * 3. If NO:
   *    - Show standard confirmation
   * 4. If user confirms:
   *    - Remove recipe from all meal plan slots (if any)
   *    - Delete recipe from Firestore
   *    - Navigate back to recipe library
   *
   * WHY THIS APPROACH:
   * - Prevents broken meal plans (recipe exists in plan but not in library)
   * - Gives user clear warning about consequences
   * - Automatically cleans up meal plan
   * - Professional user experience like major apps
   *
   * ERROR HANDLING:
   * - If delete fails, shows error and stays on page
   * - User can try again or cancel
   */
  const handleDelete = async () => {
    try {
      // STEP 1: Check if recipe is in current meal plan
      const usedInSlots = checkRecipeInMealPlan();

      let confirmed = false;

      if (usedInSlots.length > 0) {
        // ===================================================================
        // RECIPE IS IN MEAL PLAN - Show enhanced warning
        // ===================================================================

        // Format slot names for display (e.g., "Monday Dinner, Wednesday Lunch")
        const formattedSlots = usedInSlots.join(', ');

        confirmed = window.confirm(
          `⚠️ WARNING: This recipe is currently in your meal plan!\n\n` +
          `Used in: ${formattedSlots}\n\n` +
          `If you delete this recipe, it will be removed from your meal plan.\n\n` +
          `Delete "${recipe.name}"?\n\n` +
          `This action cannot be undone.`
        );

        if (confirmed) {
          // User confirmed - remove from all meal plan slots first
          // This prevents broken meal plan (recipe in plan but not in library)

          // Need to convert back to lowercase for removeRecipeFromSlot
          const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
          const meals = ['breakfast', 'lunch', 'dinner'];

          days.forEach(day => {
            meals.forEach(meal => {
              const slotRecipe = mealPlan[day]?.[meal];
              if (slotRecipe && slotRecipe.id === recipe.id) {
                // Remove this recipe from this slot
                removeRecipeFromSlot(day, meal);
              }
            });
          });

          console.log(`✅ Removed recipe from ${usedInSlots.length} meal plan slot(s)`);
        }

      } else {
        // ===================================================================
        // RECIPE NOT IN MEAL PLAN - Show standard confirmation
        // ===================================================================

        confirmed = window.confirm(
          `Are you sure you want to delete "${recipe.name}"?\n\n` +
          `This action cannot be undone.`
        );
      }

      // If user didn't confirm, stop here
      if (!confirmed) return;

      // STEP 2: Delete recipe from Firestore
      const user = auth.currentUser;
      if (!user) {
        alert('You must be logged in to delete recipes');
        return;
      }

      const recipeRef = doc(db, `users/${user.uid}/recipes`, recipe.id);
      await deleteDoc(recipeRef);

      console.log('✅ Recipe deleted from Firestore');

      // STEP 3: Show success message
      if (usedInSlots.length > 0) {
        alert(`✅ Recipe deleted and removed from ${usedInSlots.length} meal plan slot(s)`);
      } else {
        alert('✅ Recipe deleted successfully');
      }

      // STEP 4: Navigate back to recipe library
      navigate('/recipes');

    } catch (error) {
      console.error('Error deleting recipe:', error);
      alert('❌ Failed to delete recipe. Please try again.');
    }
  };

  return (
    <>
      {/* ===================================================================
          ACTION BUTTONS ROW
          ===================================================================
          Three main buttons:
          1. Add to Meal Plan (blue, primary action)
          2. Edit Recipe (gray, secondary action)
          3. Delete Recipe (red, destructive action)

          Layout:
          - Responsive: stacked on mobile, side-by-side on desktop
          - First two buttons flex-1 (equal width)
          - Delete button fixed width
      */}
      <div className="mt-8 flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
        {/* =================================================================
            ADD TO MEAL PLAN BUTTON (Primary Action)
            =================================================================
            Opens modal to add recipe to current plan or saved plan
            Primary action (blue background) - most common action
        */}
        <button
          onClick={onOpenAddToPlanModal}
          className="flex-1 bg-primary text-white py-3 px-6 rounded-md hover:bg-primary-hover transition-colors font-medium text-lg"
        >
          Add to Meal Plan
        </button>

        {/* =================================================================
            EDIT RECIPE BUTTON (Secondary Action)
            =================================================================
            Opens modal to edit recipe details
            Secondary action (gray background)
        */}
        <button
          onClick={onOpenEditModal}
          className="flex-1 bg-gray-200 text-gray-800 py-3 px-6 rounded-md hover:bg-gray-300 transition-colors font-medium text-lg"
        >
          Edit Recipe
        </button>

        {/* =================================================================
            DELETE RECIPE BUTTON (Destructive Action)
            =================================================================
            Deletes recipe with smart meal plan checking

            FEATURES:
            - Checks if recipe is in meal plan before deleting
            - Shows warning if recipe is being used
            - Automatically removes from meal plan
            - Prevents broken meal plans

            COLOR: Red to indicate destructive action
            ICON: Trash can to indicate deletion
        */}
        <button
          onClick={handleDelete}
          className="px-6 py-3 bg-red-500 text-white rounded-md hover:bg-red-600
                     font-medium text-lg transition-colors flex items-center justify-center gap-2"
        >
          {/* Trash Icon */}
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
          Delete
        </button>
      </div>
    </>
  );
}

export default RecipeActions;
