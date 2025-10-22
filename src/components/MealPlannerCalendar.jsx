import { useState, useEffect } from 'react';
import { useMealPlan } from '../context/MealPlanContext';
import RecipeSelectionModal from './RecipeSelectionModal';
import CookingModal from './CookingModal';
import sampleRecipes from '../data/sampleRecipes';
import { getAllRecipes, saveNamedMealPlan } from '../services/firestoreService';

// Import refactored meal planner components
import MealPlannerHeader from './mealPlanner/MealPlannerHeader';
import MealPlanGrid from './mealPlanner/MealPlanGrid';

/**
 * ============================================================================
 * MEAL PLANNER CALENDAR COMPONENT (MAIN COORDINATOR)
 * ============================================================================
 *
 * PURPOSE:
 * Main component for the weekly meal planning calendar.
 * Coordinates all child components and manages state/data loading.
 *
 * THIS FILE WAS REFACTORED FROM 682 LINES TO ~250 LINES
 * By extracting components into focused, reusable pieces
 *
 * RESPONSIBILITIES:
 * - Load recipes from Firestore
 * - Manage modal state (recipe selection, cooking)
 * - Handle cooking workflow (with rating system)
 * - Handle save plan functionality
 * - Coordinate child components
 * - Manage success/error messages
 *
 * CHILD COMPONENTS:
 * - MealPlannerHeader: Blue gradient banner with plan name and stats
 * - MealPlanGrid: 7×3 table of meal slots
 * - MealSlot: Individual meal cell (rendered by MealPlanGrid)
 * - RecipeSelectionModal: Modal for selecting recipes
 * - CookingModal: Modal for cooking workflow with rating
 *
 * DATA FLOW:
 * 1. Load recipes from Firestore on mount
 * 2. Get meal plan data from MealPlanContext
 * 3. Pass data down to child components
 * 4. Handle user actions via callbacks
 * 5. Update context and Firestore as needed
 */

function MealPlannerCalendar() {
  // ============================================================================
  // CONTEXT - MEAL PLAN DATA AND FUNCTIONS
  // ============================================================================
  // Get all meal plan state and functions from context
  // This provides access to the meal plan, cooking history, leftover tracking, etc.
  // ============================================================================
  const {
    mealPlan,
    currentPlanName,
    setCurrentPlanName,
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

  // ============================================================================
  // STATE - MODALS AND UI
  // ============================================================================

  // Recipe selection modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null); // {day, meal}

  // Recipe data
  const [recipes, setRecipes] = useState(sampleRecipes);
  const [loadingRecipes, setLoadingRecipes] = useState(true);

  // Cooking modal state (with rating system)
  const [showCookingModal, setShowCookingModal] = useState(false);
  const [cookingSlot, setCookingSlot] = useState(null); // {day, meal, recipe}
  const [cookingHistory, setCookingHistory] = useState(null);
  const [insufficientIngredients, setInsufficientIngredients] = useState(null);
  const [canProceed, setCanProceed] = useState(true);
  const [cookingMessage, setCookingMessage] = useState({ type: '', text: '' });

  // Save plan state
  const [planName, setPlanName] = useState('');
  const [savingPlan, setSavingPlan] = useState(false);

  // ============================================================================
  // DATA LOADING - LOAD RECIPES FROM FIRESTORE
  // ============================================================================
  // Load all recipes when component mounts
  // Recipes are needed for the recipe selection modal
  // ============================================================================

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

  // ============================================================================
  // HANDLER FUNCTIONS - RECIPE SELECTION
  // ============================================================================

  /**
   * Opens recipe selection modal for a specific slot
   */
  const openRecipeModal = (day, meal) => {
    console.log('🔍 MEAL PLANNER: Opening recipe selection modal');
    console.log('📚 MEAL PLANNER: Current recipes state:', recipes);
    console.log('📚 MEAL PLANNER: Recipes count:', recipes.length);
    console.log('📚 MEAL PLANNER: Recipe names in modal:', recipes.map(r => r.name));
    setSelectedSlot({ day, meal });
    setModalOpen(true);
  };

  /**
   * Adds selected recipe to meal plan slot
   */
  const handleSelectRecipe = (recipe) => {
    if (selectedSlot) {
      addRecipeToSlot(selectedSlot.day, selectedSlot.meal, recipe);
    }
    setModalOpen(false);
    setSelectedSlot(null);
  };

  /**
   * Removes recipe from meal plan slot
   */
  const removeRecipe = (day, meal) => {
    removeRecipeFromSlot(day, meal);
  };

  // ============================================================================
  // COOKING WORKFLOW HANDLERS (WITH RATING SYSTEM)
  // ============================================================================

  /**
   * Opens cooking modal with rating system
   * Loads cooking history and checks pantry availability
   * Uses checkOnly mode to avoid premature deduction
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

    // Check pantry availability WITHOUT deducting (checkOnly = true)
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
   * This is where ACTUAL ingredient deduction happens (checkOnly = false)
   */
  const handleConfirmCooking = async (rating, notes, hasLeftovers, leftoverServings) => {
    if (!cookingSlot) return;

    const { day, meal, recipe } = cookingSlot;
    console.log('✅ User confirmed cooking. Now ACTUALLY deducting ingredients...');

    try {
      // Force deduct if there are insufficient ingredients
      const forceDeduct = !canProceed;
      console.log('Force deduct:', forceDeduct);

      // Mark as cooked with rating and notes (checkOnly = false)
      // THIS is where ingredients are actually deducted from pantry!
      const result = await markRecipeAsCooked(day, meal, forceDeduct, rating, notes, false);
      console.log('🎯 Cooking result:', result);

      if (result.success) {
        // Add leftover if user indicated they have leftovers
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
   * Shows a cooking message notification (auto-dismisses after 5 seconds)
   */
  const showCookingMessage = (type, text) => {
    setCookingMessage({ type, text });
    setTimeout(() => {
      setCookingMessage({ type: '', text: '' });
    }, 5000);
  };

  /**
   * Toggles cooked status (unmarks if already cooked, initiates cooking if not)
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

  // ============================================================================
  // SAVE MEAL PLAN HANDLER
  // ============================================================================

  /**
   * Saves current meal plan with a custom name
   * Validates plan name and ensures plan has at least 1 recipe
   * Saves to users/{userId}/savedMealPlans in Firestore
   */
  const handleSavePlan = async () => {
    if (!planName.trim()) {
      showCookingMessage('error', 'Please enter a name for your meal plan');
      return;
    }

    const filledSlots = getFilledSlotsCount();
    if (filledSlots === 0) {
      showCookingMessage('error', 'Cannot save an empty meal plan. Add some recipes first!');
      return;
    }

    try {
      setSavingPlan(true);
      await saveNamedMealPlan(planName.trim(), mealPlan);

      // Update current plan name in context
      setCurrentPlanName(planName.trim());

      setPlanName('');
      showCookingMessage('success', `Meal plan "${planName.trim()}" saved successfully!`);
    } catch (error) {
      console.error('Error saving meal plan:', error);
      showCookingMessage('error', 'Failed to save meal plan. Please try again.');
    } finally {
      setSavingPlan(false);
    }
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div>
      {/* ===================================================================
          SUCCESS/ERROR MESSAGE NOTIFICATION
          ===================================================================
          Shows feedback for cooking actions and save operations
          Auto-dismisses after 5 seconds
          Green for success, red for error
      */}
      {cookingMessage.text && (
        <div className={`mb-6 p-4 rounded-lg border-2 flex items-start gap-3 animate-slide-in ${
          cookingMessage.type === 'success'
            ? 'bg-green-50 border-green-500 text-green-800'
            : 'bg-red-50 border-red-500 text-red-800'
        }`}>
          {/* Icon (checkmark for success, X for error) */}
          {cookingMessage.type === 'success' ? (
            <svg className="w-6 h-6 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg className="w-6 h-6 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          )}
          {/* Message Text */}
          <div className="flex-1">
            <p className="font-semibold">{cookingMessage.text}</p>
          </div>
          {/* Close Button */}
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

      {/* ===================================================================
          MEAL PLANNER HEADER
          ===================================================================
          Blue gradient banner showing plan name and stats
          Includes save plan functionality
      */}
      <MealPlannerHeader
        currentPlanName={currentPlanName}
        weeklyCost={getTotalWeeklyCost()}
        filledSlotsCount={getFilledSlotsCount()}
        planName={planName}
        onPlanNameChange={setPlanName}
        onSavePlan={handleSavePlan}
        savingPlan={savingPlan}
      />

      {/* ===================================================================
          MEAL PLAN GRID
          ===================================================================
          7-day × 3-meal calendar grid
          Each cell is a MealSlot (filled or empty)
      */}
      <MealPlanGrid
        mealPlan={mealPlan}
        cookedRecipes={cookedRecipes}
        cookingHistoryCache={cookingHistoryCache}
        onOpenRecipeModal={openRecipeModal}
        onToggleCooked={handleToggleCooked}
        onRemoveRecipe={removeRecipe}
      />

      {/* ===================================================================
          CLEAR ALL BUTTON
          ===================================================================
          Removes all recipes from meal plan
          Shows warning before clearing
          Disabled if plan is already empty
      */}
      <div className="mt-6">
        <button
          onClick={() => {
            const confirmed = window.confirm(
              '⚠️ Clear Entire Meal Plan?\n\n' +
              'This will:\n' +
              '• Remove all recipes from your weekly calendar\n' +
              '• Clear your shopping list (it\'s generated from your meal plan)\n\n' +
              'This action cannot be undone. Continue?'
            );
            if (confirmed) {
              clearMealPlan();
              console.log('✅ Meal plan and shopping list cleared');
            }
          }}
          disabled={getFilledSlotsCount() === 0}
          className="px-6 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-semibold flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          Clear All
        </button>
      </div>

      {/* ===================================================================
          RECIPE SELECTION MODAL
          ===================================================================
          Popup for selecting a recipe to add to meal plan
          Shows all available recipes with filtering
      */}
      <RecipeSelectionModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedSlot(null);
        }}
        onSelectRecipe={handleSelectRecipe}
        recipes={recipes}
      />

      {/* ===================================================================
          COOKING MODAL (WITH RATING SYSTEM)
          ===================================================================
          Popup for cooking workflow
          Shows rating interface, cooking history, and pantry check results
          Includes leftover tracking
      */}
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
