import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, X } from 'lucide-react';
import { suggestRecipes } from '../utils/ingredientMatching';
import { formatQuantity } from '../utils/unitConverter';
import { getRecipeById, getAllRecipes, getCookingHistory, getAllSavedMealPlans, getSavedMealPlanById, updateRecipe } from '../services/firestoreService';
import { useMealPlan } from '../context/MealPlanContext';
import { doc, updateDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';

function RecipeDetail() {
  const { recipeId } = useParams();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [allRecipes, setAllRecipes] = useState([]);
  const [cookingHistory, setCookingHistory] = useState(null);
  const [loadingHistory, setLoadingHistory] = useState(true);

  // Get meal plan context for adding recipes to current plan
  const { addRecipeToSlot } = useMealPlan();

  // State for Add to Meal Plan modal
  const [isAddToPlanModalOpen, setIsAddToPlanModalOpen] = useState(false);
  const [savedMealPlans, setSavedMealPlans] = useState([]);
  const [loadingSavedPlans, setLoadingSavedPlans] = useState(false);

  // State for Edit Recipe modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Load recipe from Firestore
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

  // Load all recipes for suggestions
  useEffect(() => {
    async function loadAllRecipes() {
      try {
        const recipes = await getAllRecipes();
        console.log('📚 RECIPE DETAIL: Loaded all recipes for suggestions:', recipes.length);
        setAllRecipes(recipes);
      } catch (error) {
        console.error('❌ RECIPE DETAIL: Error loading all recipes:', error);
        setAllRecipes([]);
      }
    }

    loadAllRecipes();
  }, []);

  // Get recipe suggestions if recipe exists
  const suggestedRecipes = recipe && allRecipes.length > 0
    ? suggestRecipes(recipe, allRecipes, 5)
    : [];

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

  // Load cooking history for this recipe
  useEffect(() => {
    async function loadCookingHistory() {
      if (recipeId) {
        try {
          setLoadingHistory(true);
          const history = await getCookingHistory(recipeId);
          console.log('📜 Loaded cooking history for recipe detail:', history);
          setCookingHistory(history);
        } catch (error) {
          console.error('Error loading cooking history:', error);
        } finally {
          setLoadingHistory(false);
        }
      }
    }

    loadCookingHistory();
  }, [recipeId]);

  // Load saved meal plans for the "Add to Meal Plan" modal
  // This allows users to add recipes to either their current plan or saved plans
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

  // Show loading state
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

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back Button */}
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

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Recipe Image */}
        <div className="relative h-96 overflow-hidden">
          <img
            src={recipe.imageUrl}
            alt={recipe.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-4 right-4 bg-primary text-white px-4 py-2 rounded-full text-lg font-medium">
            {recipe.cuisine}
          </div>
        </div>

        {/* Recipe Content */}
        <div className="p-8">
          {/* Header Section */}
          <div className="mb-6">
            <h1 className="text-4xl font-bold text-gray-800 mb-3">
              {recipe.name}
            </h1>
            <p className="text-lg text-gray-600">
              {recipe.description}
            </p>
          </div>

          {/* Quick Info Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 p-6 bg-gray-50 rounded-lg">
            <div className="text-center">
              <div className="text-sm text-gray-600 mb-1">Cook Time</div>
              <div className="text-2xl font-bold text-gray-800">{recipe.cookTime}</div>
              <div className="text-xs text-gray-500">minutes</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-600 mb-1">Servings</div>
              <div className="text-2xl font-bold text-gray-800">{recipe.servings}</div>
              <div className="text-xs text-gray-500">people</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-600 mb-1">Cost</div>
              <div className="text-2xl font-bold text-primary">${recipe.costPerServing.toFixed(2)}</div>
              <div className="text-xs text-gray-500">per serving</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-600 mb-1">Ingredients</div>
              <div className="text-2xl font-bold text-gray-800">{recipe.ingredients.length}</div>
              <div className="text-xs text-gray-500">items</div>
            </div>
          </div>

          {/* Two Column Layout for Ingredients and Instructions */}
          <div className="grid md:grid-cols-2 gap-8">
            {/* Ingredients Section */}
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <svg
                  className="w-6 h-6 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
                Ingredients
              </h2>
              <ul className="space-y-3">
                {recipe.ingredients.map((ingredient, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex-shrink-0 w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-sm font-medium mt-0.5">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <span className="font-medium text-gray-800">
                        {formatQuantity(ingredient.quantity, ingredient.unit)} {ingredient.unit}
                      </span>
                      <span className="text-gray-600"> {ingredient.name}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Instructions Section */}
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <svg
                  className="w-6 h-6 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                Instructions
              </h2>
              <div className="prose prose-lg max-w-none">
                <p className="text-gray-700 leading-relaxed whitespace-pre-line bg-gray-50 p-6 rounded-lg">
                  {recipe.instructions}
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex gap-4 pt-6 border-t border-gray-200">
            <button
              onClick={() => setIsAddToPlanModalOpen(true)}
              className="flex-1 bg-primary text-white py-3 px-6 rounded-md hover:bg-primary-hover transition-colors font-medium text-lg"
            >
              Add to Meal Plan
            </button>
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="flex-1 bg-gray-200 text-gray-800 py-3 px-6 rounded-md hover:bg-gray-300 transition-colors font-medium text-lg"
            >
              Edit Recipe
            </button>
          </div>

          {/* Cooking History Section */}
          {!loadingHistory && cookingHistory && cookingHistory.cookedCount > 0 && (
            <div className="mt-8 pt-8 border-t border-gray-200">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <svg
                  className="w-6 h-6 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Cooking History
              </h2>

              {/* Summary Card */}
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-lg p-6 mb-6">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  {/* Cooked Count */}
                  <div>
                    <p className="text-gray-700 text-lg mb-2">
                      You've cooked this{' '}
                      <span className="font-bold text-2xl text-primary">
                        {cookingHistory.cookedCount}
                      </span>{' '}
                      time{cookingHistory.cookedCount !== 1 ? 's' : ''}
                    </p>
                    {cookingHistory.firstCookedDate && (
                      <p className="text-sm text-gray-600">
                        First cooked: {new Date(cookingHistory.firstCookedDate.seconds * 1000).toLocaleDateString()}
                      </p>
                    )}
                  </div>

                  {/* Average Rating */}
                  {cookingHistory.averageRating > 0 && (
                    <div className="text-center">
                      <p className="text-sm text-gray-600 mb-2">Average Rating</p>
                      <div className="flex items-center gap-2">
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              size={24}
                              className={
                                star <= cookingHistory.averageRating
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-gray-300'
                              }
                            />
                          ))}
                        </div>
                        <span className="text-2xl font-bold text-gray-800">
                          {cookingHistory.averageRating.toFixed(1)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Individual Cooking Entries */}
              {cookingHistory.ratings && cookingHistory.ratings.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">
                    Cooking Log ({cookingHistory.ratings.length} rated session{cookingHistory.ratings.length !== 1 ? 's' : ''})
                  </h3>
                  <div className="space-y-3">
                    {cookingHistory.ratings
                      .slice()
                      .reverse() // Show most recent first
                      .map((entry, index) => (
                        <div
                          key={index}
                          className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-start justify-between gap-4 flex-wrap">
                            {/* Date and Rating */}
                            <div className="flex-1 min-w-[200px]">
                              <div className="flex items-center gap-2 mb-2">
                                {/* Star Rating */}
                                <div className="flex gap-1">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <Star
                                      key={star}
                                      size={16}
                                      className={
                                        star <= entry.rating
                                          ? 'fill-yellow-400 text-yellow-400'
                                          : 'text-gray-300'
                                      }
                                    />
                                  ))}
                                </div>
                                <span className="font-bold text-gray-800">
                                  {entry.rating.toFixed(1)}
                                </span>
                              </div>
                              <p className="text-sm text-gray-600">
                                {entry.date
                                  ? new Date(entry.date).toLocaleDateString('en-US', {
                                      month: 'short',
                                      day: 'numeric',
                                      year: 'numeric',
                                    })
                                  : 'Date unknown'}
                              </p>
                            </div>

                            {/* Notes */}
                            {entry.notes && entry.notes.trim() && (
                              <div className="flex-1 min-w-[250px]">
                                <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-md italic">
                                  "{entry.notes}"
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* No ratings message */}
              {(!cookingHistory.ratings || cookingHistory.ratings.length === 0) && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
                  <p className="text-gray-600 text-sm">
                    You've cooked this recipe but haven't rated it yet. Rate it next time you cook!
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Recipe Suggestions Section */}
      {suggestedRecipes.length > 0 && (
        <div className="mt-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Recipes That Share Ingredients
            </h2>
            <p className="text-gray-600">
              Cook these recipes together to save money by buying shared ingredients once
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {suggestedRecipes.map((suggestedRecipe) => (
              <div
                key={suggestedRecipe.id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300"
              >
                {/* Recipe Image with Match Badge */}
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={suggestedRecipe.imageUrl}
                    alt={suggestedRecipe.name}
                    className="w-full h-full object-cover"
                  />
                  {/* Match Percentage Badge */}
                  <div className="absolute top-2 right-2 bg-success text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                    {suggestedRecipe.matchScore}% Match
                  </div>
                  <div className="absolute top-2 left-2 bg-primary text-white px-3 py-1 rounded-full text-xs font-medium">
                    {suggestedRecipe.cuisine}
                  </div>
                </div>

                {/* Recipe Details */}
                <div className="p-4">
                  <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-2">
                    {suggestedRecipe.name}
                  </h3>

                  {/* Shared Ingredients */}
                  <div className="mb-3">
                    <p className="text-xs font-semibold text-gray-700 mb-2">
                      Shared Ingredients ({suggestedRecipe.sharedIngredients.length}):
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {suggestedRecipe.sharedIngredients.slice(0, 4).map((ingredient, index) => (
                        <span
                          key={index}
                          className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded capitalize"
                        >
                          {ingredient}
                        </span>
                      ))}
                      {suggestedRecipe.sharedIngredients.length > 4 && (
                        <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">
                          +{suggestedRecipe.sharedIngredients.length - 4} more
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-2 gap-2 mb-3 text-xs text-gray-600">
                    <div className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {suggestedRecipe.cookTime} min
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="font-semibold text-primary">
                        ${suggestedRecipe.costPerServing.toFixed(2)}
                      </span>
                      <span>/ serving</span>
                    </div>
                  </div>

                  {/* View Recipe Button */}
                  <button
                    onClick={() => navigate(`/recipes/${suggestedRecipe.id}`)}
                    className="w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-primary-hover transition-colors font-medium text-sm"
                  >
                    View Recipe
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Savings Info */}
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex gap-3">
              <svg
                className="w-6 h-6 text-blue-600 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div>
                <h3 className="font-semibold text-blue-900 mb-1">
                  Save Money by Planning Together
                </h3>
                <p className="text-sm text-blue-800">
                  These recipes share ingredients with "{recipe.name}". By planning them in the same week,
                  you'll buy shared ingredients once and save money!
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================================
          ADD TO MEAL PLAN MODAL
          ============================================================================
          Allows users to add this recipe to either:
          1. Current active meal plan (My Meal Plan)
          2. Any saved meal plan

          User selects: Plan → Day → Meal
          Then clicks "Add to Plan" to save
      */}
      <AddToMealPlanModal
        isOpen={isAddToPlanModalOpen}
        onClose={() => setIsAddToPlanModalOpen(false)}
        recipe={recipe}
        savedPlans={savedMealPlans}
        onAdd={handleAddToMealPlan}
        loading={loadingSavedPlans}
      />

      {/* ============================================================================
          EDIT RECIPE MODAL
          ============================================================================
          Allows users to edit any field of the recipe
          Changes are saved to Firestore immediately
      */}
      <EditRecipeModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        recipe={recipe}
        onSave={handleSaveRecipe}
      />
    </div>
  );
}

/**
 * ============================================================================
 * ADD TO MEAL PLAN MODAL COMPONENT
 * ============================================================================
 *
 * This modal allows users to add a recipe to a meal plan.
 *
 * FEATURES:
 * - Select between Current Plan and Saved Plans (radio buttons)
 * - Select Day (Monday through Sunday - FULL NAMES ONLY)
 * - Select Meal (Breakfast, Lunch, Dinner)
 * - Validates selections before adding
 * - Shows loading state while fetching saved plans
 *
 * WHY FULL DAY NAMES:
 * - Consistency across the entire UI
 * - User-friendly (easier to read than abbreviations)
 * - Converted to lowercase in handler function for Firestore
 *
 * @param {boolean} isOpen - Whether modal is visible
 * @param {function} onClose - Function to close modal
 * @param {Object} recipe - The recipe to add
 * @param {Array} savedPlans - List of user's saved meal plans
 * @param {function} onAdd - Function to call when adding (planId, day, meal)
 * @param {boolean} loading - Whether saved plans are still loading
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

  // Helper function to format date for display
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

  // Helper function to count recipes in a meal plan
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
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800">Add to Meal Plan</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Recipe Preview */}
        <div className="mb-4 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
          <p className="font-semibold text-gray-800">{recipe.name}</p>
          <p className="text-sm text-gray-600">
            ${recipe.costPerServing.toFixed(2)} per serving • {recipe.cookTime} min
          </p>
        </div>

        {/* MEAL PLAN SELECTION */}
        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Which meal plan?
          </label>
          <div className="space-y-2">
            {/* Current/Active Plan */}
            <button
              onClick={() => setSelectedPlan('current')}
              className={`w-full px-4 py-3 rounded-lg border-2 text-left transition-colors ${
                selectedPlan === 'current'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <div className="flex items-center gap-2">
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

            {/* Saved Plans */}
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

        {/* Day Selection - FULL NAMES ONLY, NO ABBREVIATIONS */}
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

        {/* Meal Selection */}
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

        {/* Action Buttons */}
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

/**
 * ============================================================================
 * EDIT RECIPE MODAL COMPONENT
 * ============================================================================
 *
 * This modal allows users to edit all fields of a recipe.
 *
 * FEATURES:
 * - Edit name, description, cuisine, cook time, servings, cost
 * - Edit ingredients (formatted as "quantity unit name")
 * - Edit instructions
 * - Validates required fields before saving
 * - Shows clear Cancel/Save buttons
 *
 * LIMITATIONS:
 * - Ingredients are edited as plain text strings
 * - User must format as "quantity unit name" (e.g., "2 cups flour")
 * - A future enhancement could parse ingredients into structured data
 *
 * @param {boolean} isOpen - Whether modal is visible
 * @param {function} onClose - Function to close modal
 * @param {Object} recipe - The recipe to edit
 * @param {function} onSave - Function to call when saving (editedRecipe)
 */
function EditRecipeModal({ isOpen, onClose, recipe, onSave }) {
  const [editedRecipe, setEditedRecipe] = useState(recipe);

  // Update local state when recipe prop changes
  useEffect(() => {
    if (recipe) {
      setEditedRecipe(recipe);
    }
  }, [recipe]);

  const handleChange = (field, value) => {
    setEditedRecipe(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleIngredientChange = (index, field, value) => {
    const newIngredients = [...editedRecipe.ingredients];
    newIngredients[index] = {
      ...newIngredients[index],
      [field]: value
    };
    setEditedRecipe(prev => ({
      ...prev,
      ingredients: newIngredients
    }));
  };

  const handleSave = async () => {
    // Validate required fields
    if (!editedRecipe.name || !editedRecipe.name.trim()) {
      alert('Recipe name is required');
      return;
    }

    await onSave(editedRecipe);
    onClose();
  };

  if (!isOpen || !recipe) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto m-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800">Edit Recipe</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Recipe Name */}
        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Recipe Name: <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={editedRecipe.name}
            onChange={(e) => handleChange('name', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter recipe name"
          />
        </div>

        {/* Description */}
        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Description:
          </label>
          <input
            type="text"
            value={editedRecipe.description}
            onChange={(e) => handleChange('description', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Brief description of the recipe"
          />
        </div>

        {/* Cuisine */}
        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Cuisine:
          </label>
          <input
            type="text"
            value={editedRecipe.cuisine}
            onChange={(e) => handleChange('cuisine', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., Italian, Mexican, Asian"
          />
        </div>

        {/* Cook Time, Servings, Cost */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Cook Time (min):
            </label>
            <input
              type="number"
              value={editedRecipe.cookTime}
              onChange={(e) => handleChange('cookTime', parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Servings:
            </label>
            <input
              type="number"
              value={editedRecipe.servings}
              onChange={(e) => handleChange('servings', parseInt(e.target.value) || 1)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Cost ($/serving):
            </label>
            <input
              type="number"
              step="0.01"
              value={editedRecipe.costPerServing}
              onChange={(e) => handleChange('costPerServing', parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Ingredients */}
        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Ingredients:
          </label>
          <div className="space-y-2 max-h-48 overflow-y-auto p-2 border border-gray-200 rounded-lg">
            {editedRecipe.ingredients && editedRecipe.ingredients.map((ingredient, index) => (
              <div key={index} className="grid grid-cols-3 gap-2">
                <input
                  type="number"
                  step="0.01"
                  value={ingredient.quantity}
                  onChange={(e) => handleIngredientChange(index, 'quantity', parseFloat(e.target.value) || 0)}
                  className="px-2 py-1 border border-gray-300 rounded text-sm"
                  placeholder="Qty"
                />
                <input
                  type="text"
                  value={ingredient.unit}
                  onChange={(e) => handleIngredientChange(index, 'unit', e.target.value)}
                  className="px-2 py-1 border border-gray-300 rounded text-sm"
                  placeholder="Unit"
                />
                <input
                  type="text"
                  value={ingredient.name}
                  onChange={(e) => handleIngredientChange(index, 'name', e.target.value)}
                  className="px-2 py-1 border border-gray-300 rounded text-sm"
                  placeholder="Ingredient"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Instructions */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Instructions:
          </label>
          <textarea
            value={editedRecipe.instructions}
            onChange={(e) => handleChange('instructions', e.target.value)}
            rows={6}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Step-by-step cooking instructions..."
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

export default RecipeDetail;
