import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getRecipeById, getAllSavedMealPlans, getSavedMealPlanById, updateRecipe } from '../services/firestoreService';
import { useMealPlan } from '../context/MealPlanContext';
import { doc, updateDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';

// Import all refactored components
import RecipeHeader from '../components/recipeDetail/RecipeHeader';
import RecipeStats from '../components/recipeDetail/RecipeStats';
import RecipeIngredientsList from '../components/recipeDetail/RecipeIngredientsList';
import RecipeInstructions from '../components/recipeDetail/RecipeInstructions';
import RecipeActions from '../components/recipeDetail/RecipeActions';
import AddToMealPlanModal from '../components/recipeDetail/AddToMealPlanModal';
import EditRecipeModal from '../components/recipeDetail/EditRecipeModal';

/**
 * ============================================================================
 * RECIPE DETAIL PAGE (MAIN COORDINATOR)
 * ============================================================================
 *
 * PURPOSE:
 * Main page for displaying a single recipe's complete details.
 * Coordinates all child components and manages state/data loading.
 *
 * THIS FILE WAS REFACTORED FROM 1229 LINES TO ~300 LINES
 * By extracting components into focused, reusable pieces
 *
 * RESPONSIBILITIES:
 * - Load recipe data from Firestore by ID
 * - Manage loading and error states
 * - Handle "Add to Meal Plan" logic (current and saved plans)
 * - Handle "Edit Recipe" logic (save changes to Firestore)
 * - Manage modal state (open/close)
 * - Pass data to child components
 *
 * CHILD COMPONENTS:
 * - RecipeHeader: Hero image, name, description, cuisine badge
 * - RecipeStats: Cook time, servings, cost, ingredient count
 * - RecipeIngredientsList: Ingredients with quantities
 * - RecipeInstructions: Cooking steps
 * - RecipeActions: Action buttons (Add to Plan, Edit, Delete with smart checking)
 * - AddToMealPlanModal: Modal for adding to meal plan
 * - EditRecipeModal: Modal for editing recipe
 *
 * DATA FLOW:
 * 1. URL param provides recipeId
 * 2. useEffect loads recipe from Firestore
 * 3. Recipe data passed to display components
 * 4. User interactions handled by this component
 * 5. Modals manage their own form state
 * 6. This component saves changes back to Firestore
 */

function RecipeDetail() {
  // Get recipe ID from URL params (/recipes/:recipeId)
  const { recipeId } = useParams();
  const navigate = useNavigate();

  // State for recipe data and loading
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);

  // Get meal plan context for adding recipes to current plan
  const { addRecipeToSlot } = useMealPlan();

  // State for Add to Meal Plan modal
  const [isAddToPlanModalOpen, setIsAddToPlanModalOpen] = useState(false);
  const [savedMealPlans, setSavedMealPlans] = useState([]);
  const [loadingSavedPlans, setLoadingSavedPlans] = useState(false);

  // State for Edit Recipe modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // ============================================================================
  // DATA LOADING - Load recipe from Firestore
  // ============================================================================

  /**
   * Load recipe from Firestore when component mounts or recipeId changes
   */
  useEffect(() => {
    async function loadRecipe() {
      if (recipeId) {
        try {
          console.log('🔍 RECIPE DETAIL: Loading recipe with ID:', recipeId);
          setLoading(true);

          const recipeData = await getRecipeById(recipeId);
          console.log('📗 RECIPE DETAIL: Loaded recipe data:', recipeData);

          if (recipeData) {
            setRecipe(recipeData);
          } else {
            console.warn('⚠️ RECIPE DETAIL: Recipe not found with ID:', recipeId);
            setRecipe(null);
          }
        } catch (error) {
          console.error('❌ RECIPE DETAIL: Error loading recipe:', error);
          setRecipe(null);
        } finally {
          setLoading(false);
        }
      }
    }

    loadRecipe();
  }, [recipeId]);

  /**
   * Load saved meal plans for the "Add to Meal Plan" modal
   * Allows users to add recipes to either current plan or saved plans
   */
  useEffect(() => {
    async function loadSavedPlans() {
      try {
        setLoadingSavedPlans(true);
        const plans = await getAllSavedMealPlans();
        console.log(`📋 Loaded ${plans.length} saved meal plans`);
        setSavedMealPlans(plans);
      } catch (error) {
        console.error('Error loading saved meal plans:', error);
        setSavedMealPlans([]);
      } finally {
        setLoadingSavedPlans(false);
      }
    }

    loadSavedPlans();
  }, []);

  // ============================================================================
  // HANDLER FUNCTIONS
  // ============================================================================

  /**
   * Handle adding recipe to meal plan (current or saved)
   *
   * HOW IT WORKS:
   * 1. User selects a plan (current or saved), day, and meal in the modal
   * 2. If "current" plan: Uses addRecipeToSlot from MealPlanContext
   * 3. If saved plan: Loads the plan from Firestore, updates it, saves back
   * 4. Shows success message to user
   *
   * DAY NAME CONVERSION:
   * - Modal shows: "Monday", "Tuesday", etc. (capitalized, user-friendly)
   * - Firestore stores: "monday", "tuesday", etc. (lowercase, consistent)
   * - This function converts between the two formats
   *
   * @param {Object} recipe - The recipe to add
   * @param {string} planId - 'current' or ID of saved plan
   * @param {string} day - Day name (e.g., "Monday")
   * @param {string} meal - Meal name (e.g., "Breakfast")
   */
  const handleAddToMealPlan = async (selectedRecipe, planId, day, meal) => {
    try {
      // Convert day and meal to lowercase for consistency with Firestore structure
      // Modal displays: "Monday" / "Breakfast"
      // Firestore expects: "monday" / "breakfast"
      const dayLowercase = day.toLowerCase();
      const mealLowercase = meal.toLowerCase();

      if (planId === 'current') {
        // ADD TO CURRENT ACTIVE PLAN
        // Uses MealPlanContext which auto-saves to Firestore
        console.log(`➕ Adding ${selectedRecipe.name} to current plan: ${day} ${meal}`);
        addRecipeToSlot(dayLowercase, mealLowercase, selectedRecipe);

        alert(`✅ Added "${selectedRecipe.name}" to your current plan!\n${day} ${meal}`);
      } else {
        // ADD TO SAVED PLAN
        // Must load plan, update it, and save back to Firestore
        console.log(`➕ Adding ${selectedRecipe.name} to saved plan ${planId}: ${day} ${meal}`);

        const user = auth.currentUser;
        if (!user) {
          alert('You must be logged in to add recipes to saved plans');
          return;
        }

        // Load the saved plan from Firestore
        const planRef = doc(db, `users/${user.uid}/savedMealPlans`, planId);
        const savedPlan = await getSavedMealPlanById(planId);

        if (!savedPlan) {
          alert('Saved plan not found. It may have been deleted.');
          return;
        }

        // Update the saved plan's meal schedule
        // Saved plans store meals in nested structure: mealPlan.monday.breakfast
        const updatedMealPlan = {
          ...savedPlan.mealPlan,
          [dayLowercase]: {
            ...(savedPlan.mealPlan[dayLowercase] || {}),
            [mealLowercase]: selectedRecipe
          }
        };

        // Save back to Firestore
        await updateDoc(planRef, {
          mealPlan: updatedMealPlan,
          updatedAt: new Date().toISOString()
        });

        console.log(`✅ Added ${selectedRecipe.name} to saved plan: ${savedPlan.name}`);
        alert(`✅ Added "${selectedRecipe.name}" to "${savedPlan.name}"!\n${day} ${meal}`);
      }
    } catch (error) {
      console.error('Error adding to meal plan:', error);
      alert('Failed to add recipe to meal plan. Please try again.');
    }
  };

  /**
   * Handle saving edited recipe to Firestore
   *
   * HOW IT WORKS:
   * 1. User edits recipe fields in the modal
   * 2. This function validates the changes
   * 3. Updates the recipe in Firestore
   * 4. Updates local state so UI shows new data immediately
   * 5. Shows success message
   *
   * VALIDATION:
   * - Recipe name is required (cannot be empty)
   * - Other fields have sensible defaults if invalid
   *
   * @param {Object} editedRecipe - The updated recipe object
   */
  const handleSaveRecipe = async (editedRecipe) => {
    try {
      // Validate required fields
      if (!editedRecipe.name || !editedRecipe.name.trim()) {
        alert('Recipe name is required');
        return;
      }

      console.log(`💾 Saving changes to recipe: ${editedRecipe.name}`);

      // Update recipe in Firestore using the updateRecipe service function
      await updateRecipe(editedRecipe.id, editedRecipe);

      // Update local state so the page shows the new data immediately
      // Without this, user would need to refresh to see changes
      setRecipe(editedRecipe);

      console.log(`✅ Recipe "${editedRecipe.name}" updated successfully`);
      alert(`✅ Recipe updated successfully!`);

    } catch (error) {
      console.error('Error saving recipe:', error);
      alert('Failed to save recipe changes. Please try again.');
    }
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  // Show loading state while fetching recipe
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Loading recipe...</p>
          </div>
        </div>
      </div>
    );
  }

  // If recipe not found, show error
  if (!recipe) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white p-12 rounded-lg shadow-md text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Recipe Not Found</h2>
          <p className="text-gray-600 mb-6">The recipe you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate('/recipes')}
            className="bg-primary text-white px-6 py-2 rounded-md hover:bg-primary-hover transition-colors font-medium"
          >
            Back to Recipe Library
          </button>
        </div>
      </div>
    );
  }

  // Main recipe detail page
  return (
    <div className="container mx-auto px-4 py-8">
      {/* ===================================================================
          BACK BUTTON
          ===================================================================
          Navigate back to recipe library
      */}
      <button
        onClick={() => navigate('/recipes')}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6 transition-colors"
      >
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
            d="M15 19l-7-7 7-7"
          />
        </svg>
        Back to Recipes
      </button>

      {/* ===================================================================
          MAIN RECIPE CARD
          ===================================================================
          White card containing all recipe details
      */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Recipe Header: Image, Name, Description */}
        <RecipeHeader recipe={recipe} />

        {/* Recipe Content */}
        <div className="p-8">
          {/* Recipe Stats: Cook Time, Servings, Cost, Ingredients */}
          <RecipeStats
            cookTime={recipe.cookTime}
            servings={recipe.servings}
            costPerServing={recipe.costPerServing}
            ingredientCount={recipe.ingredients?.length || 0}
          />

          {/* ===============================================================
              TWO COLUMN LAYOUT FOR INGREDIENTS AND INSTRUCTIONS
              ===============================================================
              Side-by-side on desktop, stacked on mobile
          */}
          <div className="grid md:grid-cols-2 gap-8">
            {/* Ingredients Section */}
            <RecipeIngredientsList ingredients={recipe.ingredients || []} />

            {/* Instructions Section */}
            <RecipeInstructions instructions={recipe.instructions || ''} />
          </div>

          {/* Action Buttons: Add to Meal Plan, Edit Recipe, Delete */}
          <RecipeActions
            recipe={recipe}
            onOpenAddToPlanModal={() => setIsAddToPlanModalOpen(true)}
            onOpenEditModal={() => setIsEditModalOpen(true)}
          />
        </div>
      </div>

      {/* ===================================================================
          MODALS
          ===================================================================
          Rendered outside main content, shown when state is true
      */}

      {/* Add to Meal Plan Modal */}
      <AddToMealPlanModal
        isOpen={isAddToPlanModalOpen}
        onClose={() => setIsAddToPlanModalOpen(false)}
        recipe={recipe}
        savedPlans={savedMealPlans}
        onAdd={handleAddToMealPlan}
        loading={loadingSavedPlans}
      />

      {/* Edit Recipe Modal */}
      <EditRecipeModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        recipe={recipe}
        onSave={handleSaveRecipe}
      />
    </div>
  );
}

export default RecipeDetail;
