import { useState, useEffect } from 'react';
import { useMealPlan } from '../context/MealPlanContext';
import RecipeSelectionModal from './RecipeSelectionModal';
import CookingModal from './CookingModal';
import sampleRecipes from '../data/sampleRecipes';
import { getAllRecipes } from '../services/firestoreService';
import { Star } from 'lucide-react';

function MealPlannerCalendar() {
  // Use context for meal plan state
  const {
    mealPlan,
    currentPlanName,
    addRecipeToSlot,
    removeRecipeFromSlot,
    clearMealPlan,
    getTotalWeeklyCost,
    getFilledSlotsCount,
    cookedRecipes,
    markRecipeAsCooked,
    unmarkRecipeAsCooked,
    getRecipeCookingHistory,
    cookingHistoryCache,
    addLeftover
  } = useMealPlan();

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);

  // BUG FIX #2: Load recipes from Firestore instead of using hardcoded sampleRecipes
  const [recipes, setRecipes] = useState(sampleRecipes);
  const [loadingRecipes, setLoadingRecipes] = useState(true);

  // State for NEW cooking modal with rating system (Phase 7.5.2)
  const [showCookingModal, setShowCookingModal] = useState(false);
  const [cookingSlot, setCookingSlot] = useState(null); // {day, meal, recipe}
  const [cookingHistory, setCookingHistory] = useState(null); // Cooking history for current recipe
  const [insufficientIngredients, setInsufficientIngredients] = useState(null);
  const [canProceed, setCanProceed] = useState(true);
  const [cookingMessage, setCookingMessage] = useState({ type: '', text: '' });

  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const dayLabels = {
    monday: 'Monday',
    tuesday: 'Tuesday',
    wednesday: 'Wednesday',
    thursday: 'Thursday',
    friday: 'Friday',
    saturday: 'Saturday',
    sunday: 'Sunday'
  };
  const meals = ['breakfast', 'lunch', 'dinner'];
  const mealLabels = {
    breakfast: 'Breakfast',
    lunch: 'Lunch',
    dinner: 'Dinner'
  };

  // BUG FIX #2: Load all recipes from Firestore on component mount
  useEffect(() => {
    console.log('🔍 MEAL PLANNER: useEffect triggered');

    async function loadRecipes() {
      try {
        console.log('📚 MEAL PLANNER: Starting to load recipes from Firestore...');
        setLoadingRecipes(true);

        const firestoreRecipes = await getAllRecipes();
        console.log('📚 MEAL PLANNER: getAllRecipes returned:', firestoreRecipes);
        console.log('📚 MEAL PLANNER: Number of recipes:', firestoreRecipes.length);

        if (firestoreRecipes.length > 0) {
          console.log('📚 MEAL PLANNER: Recipe IDs:', firestoreRecipes.map(r => r.id));
          console.log('📚 MEAL PLANNER: Recipe names:', firestoreRecipes.map(r => r.name));
          console.log('✅ MEAL PLANNER: Setting recipes state with Firestore recipes');
          setRecipes(firestoreRecipes);
          console.log('✅ MEAL PLANNER: Recipes state updated');
        } else {
          console.log('⚠️ MEAL PLANNER: No recipes in Firestore, using sample recipes');
          console.log('⚠️ MEAL PLANNER: Sample recipes count:', sampleRecipes.length);
          setRecipes(sampleRecipes);
        }
      } catch (error) {
        console.error('❌ MEAL PLANNER: Error loading recipes:', error);
        console.error('❌ MEAL PLANNER: Error details:', {
          message: error.message,
          code: error.code,
          stack: error.stack
        });
        console.log('📚 MEAL PLANNER: Falling back to sample recipes');
        setRecipes(sampleRecipes);
      } finally {
        setLoadingRecipes(false);
        console.log('📚 MEAL PLANNER: Recipe loading completed');
      }
    }

    loadRecipes();
  }, []);

  // Open modal for recipe selection
  const openRecipeModal = (day, meal) => {
    console.log('🔍 MEAL PLANNER: Opening recipe selection modal');
    console.log('📚 MEAL PLANNER: Current recipes state:', recipes);
    console.log('📚 MEAL PLANNER: Recipes count:', recipes.length);
    console.log('📚 MEAL PLANNER: Recipe names in modal:', recipes.map(r => r.name));
    setSelectedSlot({ day, meal });
    setModalOpen(true);
  };

  // Add recipe to meal plan
  const handleSelectRecipe = (recipe) => {
    if (selectedSlot) {
      addRecipeToSlot(selectedSlot.day, selectedSlot.meal, recipe);
    }
    setModalOpen(false);
    setSelectedSlot(null);
  };

  // Remove recipe from meal plan (now uses context function)
  const removeRecipe = (day, meal) => {
    removeRecipeFromSlot(day, meal);
  };

  // ============================================================================
  // COOKING WORKFLOW HANDLERS (Phase 7.5.2 - WITH RATING SYSTEM)
  // ============================================================================

  /**
   * Opens the cooking modal with rating system
   * Loads cooking history and checks pantry availability
   * BUG FIX #7: Now uses checkOnly mode to avoid premature deduction
   */
  const handleInitiateCooking = async (day, meal) => {
    console.log('🎬 handleInitiateCooking called for:', day, meal);
    const recipe = mealPlan[day]?.[meal];
    if (!recipe) return;

    // Check if already cooked today
    const recipeKey = `${day}-${meal}`;
    if (cookedRecipes[recipeKey]) {
      showCookingMessage('error', 'This recipe has already been marked as cooked.');
      return;
    }

    // Load cooking history for this recipe
    console.log('📚 Loading cooking history for recipe:', recipe.id);
    try {
      const history = await getRecipeCookingHistory(recipe.id);
      console.log('📚 Cooking history loaded:', history);
      setCookingHistory(history);
    } catch (error) {
      console.error('Error loading cooking history:', error);
      setCookingHistory(null);
    }

    // BUG FIX #7: Check pantry availability WITHOUT deducting (checkOnly = true)
    console.log('🔍 Checking pantry availability (CHECK-ONLY mode)...');
    const result = await markRecipeAsCooked(day, meal, false, 0, '', true);
    console.log('🔍 Pantry check result:', result);

    if (!result.success && result.insufficientItems) {
      // Insufficient ingredients
      console.log('⚠️ Insufficient ingredients, will show warning in modal');
      setInsufficientIngredients(result.insufficientItems);
      setCanProceed(false);
    } else if (result.success && result.checkOnly) {
      // Sufficient ingredients - checkOnly mode worked!
      console.log('✅ Pantry check passed (sufficient ingredients)');
      setInsufficientIngredients(null);
      setCanProceed(true);
    } else {
      // Other error
      console.error('❌ Unexpected error during pantry check:', result);
      showCookingMessage('error', result.message);
      return;
    }

    // Open the cooking modal
    console.log('🎨 Opening cooking modal');
    setCookingSlot({ day, meal, recipe });
    setShowCookingModal(true);
  };

  /**
   * Confirms cooking with rating, notes, and leftover tracking
   * Called from CookingModal when user submits
   * BUG FIX #7: This is where ACTUAL deduction happens (checkOnly = false)
   * NEW: Adds leftover tracking for food waste reduction
   */
  const handleConfirmCooking = async (rating, notes, hasLeftovers, leftoverServings) => {
    if (!cookingSlot) return;

    const { day, meal, recipe } = cookingSlot;
    console.log('✅ User confirmed cooking. Now ACTUALLY deducting ingredients...');

    try {
      // Force deduct if there are insufficient ingredients
      const forceDeduct = !canProceed;
      console.log('Force deduct:', forceDeduct);

      // BUG FIX #7: Mark as cooked with rating and notes (checkOnly = false)
      // THIS is where ingredients are actually deducted from pantry!
      const result = await markRecipeAsCooked(day, meal, forceDeduct, rating, notes, false);
      console.log('🎯 Cooking result:', result);

      if (result.success) {
        // ====================================================================
        // ADD LEFTOVER IF USER INDICATED THEY HAVE LEFTOVERS
        // ====================================================================
        if (hasLeftovers && leftoverServings > 0) {
          console.log('🍱 Adding leftover:', recipe.name, leftoverServings, 'servings');
          try {
            const expirationDate = new Date();
            expirationDate.setDate(expirationDate.getDate() + 3); // 3 days from now

            await addLeftover({
              recipeName: recipe.name,
              recipeId: recipe.id,
              servings: leftoverServings,
              expirationDate: expirationDate.toISOString()
            });

            console.log('✅ Leftover added successfully!');
          } catch (error) {
            console.error('❌ Error adding leftover:', error);
            // Don't fail the whole operation if leftover addition fails
          }
        }

        // Show success message with rating
        let message = result.message;
        if (result.rating) {
          message += ` You rated it ${result.rating} star${result.rating !== 1 ? 's' : ''}!`;
        }
        if (hasLeftovers) {
          message += ` 🍱 Leftover tracked!`;
        }
        console.log('🎉 Cooking successful! Message:', message);
        showCookingMessage('success', message);

        // Close modal
        setShowCookingModal(false);
        setCookingSlot(null);
        setCookingHistory(null);
        setInsufficientIngredients(null);
        setCanProceed(true);
      } else {
        console.error('❌ Cooking failed:', result.message);
        showCookingMessage('error', result.message);
      }
    } catch (error) {
      console.error('❌ Error marking recipe as cooked:', error);
      showCookingMessage('error', 'Failed to mark recipe as cooked. Please try again.');
    }
  };

  /**
   * Closes the cooking modal
   */
  const handleCloseCookingModal = () => {
    setShowCookingModal(false);
    setCookingSlot(null);
    setCookingHistory(null);
    setInsufficientIngredients(null);
    setCanProceed(true);
  };

  /**
   * Shows a cooking message notification
   */
  const showCookingMessage = (type, text) => {
    setCookingMessage({ type, text });
    setTimeout(() => {
      setCookingMessage({ type: '', text: '' });
    }, 5000);
  };

  /**
   * Toggles cooked status (unmarks if already cooked)
   */
  const handleToggleCooked = (day, meal) => {
    const recipeKey = `${day}-${meal}`;
    if (cookedRecipes[recipeKey]) {
      // Already cooked - unmark it
      unmarkRecipeAsCooked(day, meal);
      showCookingMessage('success', 'Recipe unmarked as cooked.');
    } else {
      // Not cooked yet - initiate cooking workflow
      handleInitiateCooking(day, meal);
    }
  };

  return (
    <div>
      {/* Cooking Success/Error Message */}
      {cookingMessage.text && (
        <div className={`mb-6 p-4 rounded-lg border-2 flex items-start gap-3 animate-slide-in ${
          cookingMessage.type === 'success'
            ? 'bg-green-50 border-green-500 text-green-800'
            : 'bg-red-50 border-red-500 text-red-800'
        }`}>
          {cookingMessage.type === 'success' ? (
            <svg className="w-6 h-6 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg className="w-6 h-6 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          )}
          <div className="flex-1">
            <p className="font-semibold">{cookingMessage.text}</p>
          </div>
          <button
            onClick={() => setCookingMessage({ type: '', text: '' })}
            className="flex-shrink-0 hover:opacity-70"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      )}

      {/* Current Plan Name Banner - Prominent Display */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-2xl shadow-2xl mb-6">
        {/* Decorative Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white rounded-full blur-3xl"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            {/* Plan Name Section */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                </div>
                <div>
                  <div className="text-blue-100 text-sm font-medium uppercase tracking-wide">
                    Current Meal Plan
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold text-white mt-1">
                    {currentPlanName}
                  </h2>
                </div>
              </div>
              <p className="text-blue-100 ml-15 text-sm">
                Click any meal slot below to add or change recipes
              </p>
            </div>

            {/* Stats Section */}
            <div className="flex gap-4 md:gap-6">
              {/* Weekly Cost */}
              <div className="bg-white/10 backdrop-blur-sm rounded-xl px-6 py-4 border border-white/20">
                <div className="text-blue-100 text-xs font-medium uppercase tracking-wide mb-1">
                  Weekly Cost
                </div>
                <div className="text-3xl font-bold text-white">
                  ${getTotalWeeklyCost().toFixed(2)}
                </div>
              </div>

              {/* Meals Planned */}
              <div className="bg-white/10 backdrop-blur-sm rounded-xl px-6 py-4 border border-white/20">
                <div className="text-blue-100 text-xs font-medium uppercase tracking-wide mb-1">
                  Meals Planned
                </div>
                <div className="text-3xl font-bold text-white">
                  {getFilledSlotsCount()}<span className="text-xl text-blue-200">/21</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-3 text-left font-semibold text-gray-700 border-r border-gray-200 w-32">
                  Meal
                </th>
                {days.map(day => (
                  <th key={day} className="p-3 text-center font-semibold text-gray-700 border-r border-gray-200 last:border-r-0">
                    {dayLabels[day]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {meals.map((meal, mealIndex) => (
                <tr key={meal} className={mealIndex !== meals.length - 1 ? 'border-b border-gray-200' : ''}>
                  <td className="p-3 font-medium text-gray-700 bg-gray-50 border-r border-gray-200 capitalize">
                    {mealLabels[meal]}
                  </td>
                  {days.map(day => {
                    const recipe = mealPlan[day][meal];
                    const recipeKey = `${day}-${meal}`;
                    const isCooked = cookedRecipes[recipeKey];
                    return (
                      <td key={`${day}-${meal}`} className="p-2 border-r border-gray-200 last:border-r-0">
                        {recipe ? (
                          // Filled Slot
                          <div className={`relative group rounded-lg p-2 hover:shadow-md transition-all ${
                            isCooked
                              ? 'bg-green-50 border-2 border-green-500 opacity-90'
                              : 'bg-blue-50 border-2 border-primary'
                          }`}>
                            {/* Cooked Checkmark Overlay */}
                            {isCooked && (
                              <div className="absolute top-1 left-1 bg-green-500 rounded-full w-6 h-6 flex items-center justify-center shadow-lg z-10">
                                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              </div>
                            )}

                            <div className="flex gap-2">
                              <img
                                src={recipe.imageUrl}
                                alt={recipe.name}
                                className={`w-12 h-12 object-cover rounded flex-shrink-0 ${isCooked ? 'opacity-70' : ''}`}
                              />
                              <div className="flex-1 min-w-0">
                                <p className={`text-xs font-semibold text-gray-800 line-clamp-2 mb-1 ${isCooked ? 'line-through opacity-70' : ''}`}>
                                  {recipe.name}
                                </p>
                                <p className={`text-xs font-bold ${isCooked ? 'text-green-600' : 'text-primary'}`}>
                                  ${(recipe.costPerServing * recipe.servings).toFixed(2)}
                                </p>
                                {/* Show star rating if recipe has been cooked */}
                                {isCooked && cookingHistoryCache[recipe.id]?.averageRating > 0 && (
                                  <div className="flex items-center gap-1 mt-1">
                                    <Star size={10} className="fill-yellow-400 text-yellow-400" />
                                    <span className="text-xs font-bold text-yellow-600">
                                      {cookingHistoryCache[recipe.id].averageRating.toFixed(1)}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Action Buttons - Show on Hover */}
                            <div className="absolute -top-2 -right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              {/* Mark as Cooked / Unmark Button */}
                              <button
                                onClick={() => handleToggleCooked(day, meal)}
                                className={`rounded-full w-6 h-6 flex items-center justify-center shadow-md transition-colors ${
                                  isCooked
                                    ? 'bg-gray-500 hover:bg-gray-600 text-white'
                                    : 'bg-green-500 hover:bg-green-600 text-white'
                                }`}
                                title={isCooked ? 'Unmark as cooked' : 'Mark as cooked'}
                              >
                                {isCooked ? (
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                ) : (
                                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                  </svg>
                                )}
                              </button>

                              {/* Remove Button */}
                              <button
                                onClick={() => removeRecipe(day, meal)}
                                className="bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center shadow-md hover:bg-red-600"
                                title="Remove recipe"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        ) : (
                          // Empty Slot
                          <button
                            onClick={() => openRecipeModal(day, meal)}
                            className="w-full h-24 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary hover:bg-blue-50 transition-all flex items-center justify-center text-gray-400 hover:text-primary"
                          >
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                          </button>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-6">
        <button
          onClick={() => {
            if (window.confirm('Are you sure you want to clear all meals?')) {
              clearMealPlan();
            }
          }}
          className="px-6 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors font-medium"
        >
          Clear All
        </button>
      </div>

      {/* Recipe Selection Modal */}
      <RecipeSelectionModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedSlot(null);
        }}
        onSelectRecipe={handleSelectRecipe}
        recipes={recipes}
      />

      {/* ========================================================================
          NEW COOKING MODAL WITH RATING SYSTEM (Phase 7.5.2)
          Shows rating interface, cooking history, and pantry check results
          ======================================================================== */}
      <CookingModal
        isOpen={showCookingModal}
        onClose={handleCloseCookingModal}
        onConfirm={handleConfirmCooking}
        recipe={cookingSlot?.recipe}
        cookingHistory={cookingHistory}
        insufficientItems={insufficientIngredients}
        canProceed={canProceed}
      />
    </div>
  );
}

export default MealPlannerCalendar;
