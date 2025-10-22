import { Star } from 'lucide-react';

/**
 * ============================================================================
 * MEAL SLOT COMPONENT
 * ============================================================================
 *
 * PURPOSE:
 * Renders a single cell in the meal plan grid (7 days × 3 meals = 21 slots).
 * Shows either a filled slot (with recipe) or an empty slot (clickable to add).
 *
 * WHY SEPARATE COMPONENT:
 * - Reduces MealPlannerCalendar.jsx complexity
 * - Handles all slot-specific logic and UI
 * - Makes it easy to modify individual slot appearance
 * - Improves code reusability
 *
 * FEATURES:
 * - Fixed height (140px) for consistent grid layout
 * - Filled slots: Show recipe image, name, cost, star rating
 * - Filled slots: Cooked recipes have checkmark overlay and green styling
 * - Hover actions: Mark as cooked, remove recipe
 * - Empty slots: Dashed border, clickable to add recipe
 * - Full width to match table column exactly
 *
 * STYLING NOTES:
 * - All slots are EXACTLY the same size (140px height, 100% width)
 * - This prevents grid from "jumping" when adding/removing recipes
 * - Uses line-clamp-3 for recipe names (wraps up to 3 lines)
 * - Shows star rating from cooking history cache
 *
 * PARENT: MealPlanGrid.jsx
 *
 * @param {object} recipe - Recipe object (or null/undefined for empty slot)
 * @param {string} day - Day name (lowercase: monday, tuesday, etc.)
 * @param {string} meal - Meal name (lowercase: breakfast, lunch, dinner)
 * @param {boolean} isCooked - Whether recipe has been marked as cooked
 * @param {object} cookingHistoryCache - Cached cooking history for all recipes
 * @param {function} onOpenRecipeModal - Callback to open recipe selection modal
 * @param {function} onToggleCooked - Callback to toggle cooked status
 * @param {function} onRemoveRecipe - Callback to remove recipe from slot
 */

function MealSlot({
  recipe,
  day,
  meal,
  isCooked,
  cookingHistoryCache,
  onOpenRecipeModal,
  onToggleCooked,
  onRemoveRecipe
}) {
  // ============================================================================
  // EMPTY SLOT - USER CAN CLICK TO ADD RECIPE
  // ============================================================================
  // WHY: Provides clear visual cue that slot is empty and clickable
  // SIZE: 140px height, 100% width (matches filled slots exactly)
  // ICON: Plus sign centered in dashed border box
  // ============================================================================
  if (!recipe) {
    return (
      <button
        onClick={() => onOpenRecipeModal(day, meal)}
        className="w-full h-[140px] min-h-[140px] border-2 border-dashed border-gray-300 rounded-lg hover:border-primary hover:bg-blue-50 transition-all flex items-center justify-center text-gray-400 hover:text-primary"
      >
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </button>
    );
  }

  // ============================================================================
  // FILLED SLOT - SHOWS RECIPE DETAILS
  // ============================================================================
  // SIZE: 140px height, 100% width (matches empty slots exactly)
  // CONTENT: Image, name, cost, star rating
  // STATES: Normal (blue) or Cooked (green with checkmark)
  // HOVER: Shows action buttons (mark cooked, remove)
  // ============================================================================

  return (
    <div className={`relative group rounded-lg p-2 hover:shadow-md transition-all w-full h-[140px] min-h-[140px] flex flex-col ${
      isCooked
        ? 'bg-green-50 border-2 border-green-500 opacity-90'
        : 'bg-blue-50 border-2 border-primary'
    }`}>
      {/* ===================================================================
          COOKED CHECKMARK OVERLAY
          ===================================================================
          Shown in top-left corner when recipe has been marked as cooked
      */}
      {isCooked && (
        <div className="absolute top-1 left-1 bg-green-500 rounded-full w-6 h-6 flex items-center justify-center shadow-lg z-10">
          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </div>
      )}

      {/* ===================================================================
          RECIPE CONTENT
          ===================================================================
          Image + text info (name, cost, rating)
      */}
      <div className="flex gap-2 flex-1">
        {/* Recipe Image (50x50px thumbnail) */}
        <img
          src={recipe.imageUrl}
          alt={recipe.name}
          className={`w-12 h-12 object-cover rounded flex-shrink-0 ${isCooked ? 'opacity-70' : ''}`}
        />

        {/* Recipe Details */}
        <div className="flex-1 min-w-0 flex flex-col">
          {/* Recipe Name - Line-clamp-3 allows wrapping up to 3 lines for long names */}
          <p className={`text-xs font-semibold text-gray-800 line-clamp-3 mb-1 leading-tight ${isCooked ? 'line-through opacity-70' : ''}`}>
            {recipe.name}
          </p>

          {/* Recipe Cost - Total cost (cost per serving × servings) */}
          <p className={`text-xs font-bold ${isCooked ? 'text-green-600' : 'text-primary'}`}>
            ${(recipe.costPerServing * recipe.servings).toFixed(2)}
          </p>

          {/* Star Rating - Only shown if recipe has been cooked and rated */}
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

      {/* ===================================================================
          ACTION BUTTONS (Shown on Hover)
          ===================================================================
          Two buttons appear in top-right corner when user hovers:
          1. Mark as Cooked / Unmark (green or gray checkmark)
          2. Remove Recipe (red X)
      */}
      <div className="absolute -top-2 -right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {/* Mark as Cooked / Unmark Button */}
        <button
          onClick={() => onToggleCooked(day, meal)}
          className={`rounded-full w-6 h-6 flex items-center justify-center shadow-md transition-colors ${
            isCooked
              ? 'bg-gray-500 hover:bg-gray-600 text-white'
              : 'bg-green-500 hover:bg-green-600 text-white'
          }`}
          title={isCooked ? 'Unmark as cooked' : 'Mark as cooked'}
        >
          {isCooked ? (
            // X icon (unmark)
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            // Checkmark icon (mark as cooked)
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          )}
        </button>

        {/* Remove Recipe Button */}
        <button
          onClick={() => onRemoveRecipe(day, meal)}
          className="bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center shadow-md hover:bg-red-600"
          title="Remove recipe"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}

export default MealSlot;
