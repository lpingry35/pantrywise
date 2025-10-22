import { useMealPlan } from '../context/MealPlanContext';
import { BarChart3 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getAllRecipes } from '../services/firestoreService';

// ============================================================================
// STATS & INSIGHTS PAGE
// ============================================================================
// PURPOSE: Display simple kitchen statistics
// DATA: Recipes, cooking history, pantry items (all from MealPlanContext)
// SHOWS: Recipe count, cooking history, pantry count, future features
// ============================================================================

function StatsAndInsights() {
  // ============================================================================
  // GET DATA FROM CONTEXT
  // ============================================================================
  // WHY: All data is already loaded in MealPlanContext
  // WHAT: cookingHistoryCache has all cooking data with ratings
  // WHERE: This data comes from Firestore users/{userId}/cookingHistory
  // ============================================================================
  const { pantryItems, cookingHistoryCache } = useMealPlan();

  // State for recipes (need to load separately)
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);

  // ============================================================================
  // LOAD RECIPES FROM FIRESTORE
  // ============================================================================
  // WHY: Recipes aren't in MealPlanContext, so we load them here
  // WHEN: Once when the page first loads
  // ============================================================================
  useEffect(() => {
    async function loadRecipes() {
      try {
        setLoading(true);
        const allRecipes = await getAllRecipes();
        setRecipes(allRecipes);
      } catch (error) {
        console.error('Error loading recipes:', error);
        setRecipes([]);
      } finally {
        setLoading(false);
      }
    }

    loadRecipes();
  }, []);

  // ============================================================================
  // CALCULATE STATISTICS
  // ============================================================================
  // WHY: Turn raw data into simple numbers to display
  // ============================================================================

  // RECIPE LIBRARY STATS
  const totalRecipes = recipes.length;

  // COOKING HISTORY STATS
  // cookingHistoryCache is an object like: { recipeId: { cookedCount, averageRating, ... } }
  const cookingEntries = Object.values(cookingHistoryCache);
  const totalRecipesCooked = cookingEntries.reduce((sum, entry) => sum + (entry.cookedCount || 0), 0);

  // Find highest rated recipe
  const ratedRecipes = cookingEntries.filter(entry => entry.averageRating > 0);
  const highestRated = ratedRecipes.length > 0
    ? ratedRecipes.reduce((max, entry) => entry.averageRating > max.averageRating ? entry : max)
    : null;

  // Find most cooked recipe
  const mostCooked = cookingEntries.length > 0
    ? cookingEntries.reduce((max, entry) => (entry.cookedCount || 0) > (max.cookedCount || 0) ? entry : max)
    : null;

  // PANTRY STATS
  const totalPantryItems = pantryItems.length;

  // Check if user has ANY data at all
  const hasAnyData = totalRecipes > 0 || totalRecipesCooked > 0 || totalPantryItems > 0;

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* ===================================================================
          PAGE HEADER
          ===================================================================
          SHOWS: Page title with icon and description
      */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center gap-3">
          <BarChart3 size={32} className="text-primary" aria-hidden="true" />
          <span>Stats & Insights</span>
        </h1>
        <p className="text-gray-600">
          Track your kitchen activity and recipe collection
        </p>
      </div>

      {loading ? (
        // LOADING STATE - Show while fetching recipes
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="text-gray-600 mt-4">Loading your stats...</p>
        </div>
      ) : !hasAnyData ? (
        // EMPTY STATE - Show when user has no data yet
        <div className="p-8 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-lg shadow-md text-center">
          <div className="mb-6">
            <BarChart3 size={64} className="text-blue-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-800 mb-2">
              Start Using PantryWise to See Your Stats!
            </h3>
            <p className="text-gray-700 mb-6">
              As you add recipes, cook meals, and track your pantry, your personalized insights will appear here.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href="/recipes"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-md hover:from-blue-700 hover:to-indigo-700 transition-all font-semibold shadow-lg"
            >
              📚 Add Your First Recipe
            </a>
            <a
              href="/pantry"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-md hover:from-green-700 hover:to-emerald-700 transition-all font-semibold shadow-lg"
            >
              🏠 Add Pantry Items
            </a>
          </div>
        </div>
      ) : (
        // STATS GRID - Show when user has data
        <div className="grid md:grid-cols-2 gap-6">
          {/* ===============================================================
              CARD 1: RECIPE LIBRARY
              ===============================================================
              SHOWS: Total number of recipes in user's collection
              SOURCE: users/{userId}/recipes in Firestore
          */}
          <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              📚 Recipe Library
            </h3>
            <p className="text-5xl font-bold mb-2">{totalRecipes}</p>
            <p className="text-purple-100">
              {totalRecipes === 1 ? 'Recipe' : 'Recipes'} in your collection
            </p>
          </div>

          {/* ===============================================================
              CARD 2: COOKING HISTORY
              ===============================================================
              SHOWS: Total times cooked, highest rated recipe, most cooked
              SOURCE: cookingHistoryCache from MealPlanContext
          */}
          <div className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              🍳 Cooking History
            </h3>
            <p className="text-5xl font-bold mb-2">{totalRecipesCooked}</p>
            <p className="text-blue-100 mb-4">
              {totalRecipesCooked === 1 ? 'Meal' : 'Meals'} cooked
            </p>

            {/* Show highest rated recipe if exists */}
            {highestRated && (
              <div className="pt-3 border-t border-white/20">
                <p className="text-blue-100 text-sm mb-1">⭐ Highest Rated</p>
                <p className="font-semibold truncate">{highestRated.recipeName || 'Unknown Recipe'}</p>
                <p className="text-yellow-300 text-sm">
                  {highestRated.averageRating.toFixed(1)} stars ({highestRated.cookedCount} {highestRated.cookedCount === 1 ? 'time' : 'times'})
                </p>
              </div>
            )}

            {/* Show most cooked recipe if different from highest rated */}
            {mostCooked && mostCooked.cookedCount > 1 && mostCooked !== highestRated && (
              <div className="pt-3 border-t border-white/20 mt-3">
                <p className="text-blue-100 text-sm mb-1">🏆 Most Cooked</p>
                <p className="font-semibold truncate">{mostCooked.recipeName || 'Unknown Recipe'}</p>
                <p className="text-blue-200 text-sm">{mostCooked.cookedCount} times</p>
              </div>
            )}
          </div>

          {/* ===============================================================
              CARD 3: PANTRY
              ===============================================================
              SHOWS: Number of ingredients currently in pantry
              SOURCE: pantryItems from MealPlanContext
          */}
          <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              🥫 My Pantry
            </h3>
            <p className="text-5xl font-bold mb-2">{totalPantryItems}</p>
            <p className="text-green-100">
              {totalPantryItems === 1 ? 'Ingredient' : 'Ingredients'} stocked
            </p>
          </div>

          {/* ===============================================================
              CARD 4: COMING SOON
              ===============================================================
              SHOWS: Placeholder for future features
              PURPOSE: Set expectations for upcoming enhancements
          */}
          <div className="bg-gradient-to-br from-gray-400 to-gray-500 rounded-xl p-6 text-white shadow-lg">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              🔮 Coming Soon
            </h3>
            <p className="text-gray-100 mb-4">More insights on the way!</p>
            <ul className="text-sm text-gray-200 space-y-2">
              <li className="flex items-start gap-2">
                <span>•</span>
                <span>Leftover tracking & waste reduction</span>
              </li>
              <li className="flex items-start gap-2">
                <span>•</span>
                <span>Cost savings analysis</span>
              </li>
              <li className="flex items-start gap-2">
                <span>•</span>
                <span>Shopping pattern insights</span>
              </li>
              <li className="flex items-start gap-2">
                <span>•</span>
                <span>Meal planning trends</span>
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

export default StatsAndInsights;
