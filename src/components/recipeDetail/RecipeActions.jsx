/**
 * ============================================================================
 * RECIPE ACTIONS COMPONENT
 * ============================================================================
 *
 * PURPOSE:
 * Provides action buttons for recipe management:
 * - "Add to Meal Plan" - Opens modal to add recipe to current or saved plan
 * - "Edit Recipe" - Opens modal to edit recipe details
 *
 * WHY SEPARATE COMPONENT:
 * - Manages modal state independently from parent
 * - Keeps action buttons grouped together
 * - Makes it easy to add more actions later
 * - Reduces complexity of main RecipeDetail component
 *
 * HOW IT WORKS:
 * 1. User clicks "Add to Meal Plan" → modal opens
 * 2. User selects plan, day, meal → recipe added
 * 3. User clicks "Edit Recipe" → edit modal opens
 * 4. User makes changes → saves to Firestore
 *
 * STATE MANAGEMENT:
 * - isAddToPlanModalOpen: Controls Add to Meal Plan modal visibility
 * - isEditModalOpen: Controls Edit Recipe modal visibility
 *
 * PARENT: RecipeDetail.jsx (pages)
 *
 * @param {function} onOpenAddToPlanModal - Callback to open add to meal plan modal
 * @param {function} onOpenEditModal - Callback to open edit recipe modal
 */

function RecipeActions({ onOpenAddToPlanModal, onOpenEditModal }) {
  return (
    <>
      {/* ===================================================================
          ACTION BUTTONS ROW
          ===================================================================
          Two main buttons:
          1. Add to Meal Plan (blue, primary action)
          2. Edit Recipe (gray, secondary action)

          Layout:
          - Full width buttons on mobile
          - Side-by-side with equal width on desktop (flex-1)
          - Border top separates from content above
      */}
      <div className="mt-8 flex gap-4 pt-6 border-t border-gray-200">
        {/* =================================================================
            ADD TO MEAL PLAN BUTTON (Primary)
            =================================================================
            Opens modal to add recipe to current plan or saved plan
            Primary action (blue background)
        */}
        <button
          onClick={onOpenAddToPlanModal}
          className="flex-1 bg-primary text-white py-3 px-6 rounded-md hover:bg-primary-hover transition-colors font-medium text-lg"
        >
          Add to Meal Plan
        </button>

        {/* =================================================================
            EDIT RECIPE BUTTON (Secondary)
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
      </div>
    </>
  );
}

export default RecipeActions;
