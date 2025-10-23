import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMealPlan } from '../context/MealPlanContext';
import RecipeCard from '../components/RecipeCard';
import sampleRecipes from '../data/sampleRecipes';
import { matchRecipesToPantry } from '../utils/ingredientMatching';
import { getAllRecipes, saveRecipe, getAllCookingHistory } from '../services/firestoreService';
// Import BookOpen icon for Recipe Library page header
import { BookOpen } from 'lucide-react';

function RecipeLibrary() {
  // ===================================================================
  // STATE MANAGEMENT
  // ===================================================================

  // IMPORTANT: Start with EMPTY array for new users
  // Recipes will be loaded from user's Firestore account, not sample recipes
  const [recipes, setRecipes] = useState([]);

  const [loading, setLoading] = useState(true);
  const { pantryItems } = useMealPlan();
  const [pantryMode, setPantryMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [cuisineFilter, setCuisineFilter] = useState('All');
  const [cookTimeFilter, setCookTimeFilter] = useState('All');
  const [priceFilter, setPriceFilter] = useState('All');
  const [seeding, setSeeding] = useState(false);
  const [seedMessage, setSeedMessage] = useState('');
  // Cooking history cache: key = recipeId, value = cooking history object
  const [cookingHistoryMap, setCookingHistoryMap] = useState({});
  const navigate = useNavigate();

  // ===================================================================
  // LOAD RECIPES FROM USER'S FIRESTORE ACCOUNT
  // ===================================================================
  // This runs once when the page loads
  // For NEW USERS: This will return an empty array (0 recipes)
  // For EXISTING USERS: This will return their saved recipes
  useEffect(() => {
    async function loadRecipes() {
      try {
        setLoading(true);

        // Load recipes from user's personal Firestore collection
        // Path: users/{userId}/recipes/
        const firestoreRecipes = await getAllRecipes();

        // Set recipes to whatever we got from Firestore (could be empty array)
        console.log(`Loaded ${firestoreRecipes.length} recipes from user's account`);
        setRecipes(firestoreRecipes);

      } catch (error) {
        console.error('Error loading recipes from Firestore:', error);
        // On error, set to empty array (don't show sample recipes)
        setRecipes([]);
      } finally {
        setLoading(false);
      }
    }

    loadRecipes();
  }, []);

  // Load cooking history for all recipes to display star ratings
  useEffect(() => {
    async function loadCookingHistory() {
      try {
        const allHistory = await getAllCookingHistory();
        console.log(`📊 Loaded cooking history for ${allHistory.length} recipes`);

        // Create map: recipeId -> cooking history object
        const historyMap = {};
        allHistory.forEach(history => {
          historyMap[history.recipeId] = history;
        });

        setCookingHistoryMap(historyMap);
      } catch (error) {
        console.error('Error loading cooking history:', error);
      }
    }

    // Only load cooking history after recipes are loaded
    if (!loading && recipes.length > 0) {
      loadCookingHistory();
    }
  }, [loading, recipes.length]);

  // ===================================================================
  // LOAD SAMPLE RECIPES FUNCTION
  // ===================================================================
  // This function copies all 25 sample recipes to the user's Firestore account
  // WHEN: User clicks "Load Sample Recipes" button (shown when they have 0 recipes)
  // WHAT: Loops through sampleRecipes array and saves each one to Firestore
  // WHERE: Saves to users/{userId}/recipes/ collection
  // RESULT: User will have 25 recipes in their account that they can view and modify
  const handleSeedDatabase = async () => {
    try {
      // Show loading state
      setSeeding(true);
      setSeedMessage('Loading sample recipes...');

      let successCount = 0;
      let errorCount = 0;

      // Loop through all 25 sample recipes
      for (const recipe of sampleRecipes) {
        try {
          // Save this recipe to user's Firestore account
          // This creates a NEW document in users/{userId}/recipes/
          await saveRecipe(recipe);
          successCount++;

          // Update progress message
          setSeedMessage(`Loading recipes... ${successCount}/${sampleRecipes.length}`);
        } catch (error) {
          console.error(`Error saving recipe ${recipe.name}:`, error);
          errorCount++;
        }
      }

      // Reload recipes from Firestore to show the newly added recipes
      const firestoreRecipes = await getAllRecipes();
      setRecipes(firestoreRecipes);

      // Show success message
      setSeedMessage(`✓ Successfully loaded ${successCount} recipes!`);

      // Clear message after 3 seconds
      setTimeout(() => {
        setSeedMessage('');
        setSeeding(false);
      }, 3000);

    } catch (error) {
      console.error('Error seeding database:', error);
      setSeedMessage('Error loading recipes. Please try again.');
      setSeeding(false);
    }
  };

  const handleSelectRecipe = (recipeId) => {
    navigate(`/recipes/${recipeId}`);
  };

  // Get unique cuisines from recipes
  const cuisines = ['All', ...new Set(recipes.map(r => r.cuisine))];

  // Apply search and filters
  let filteredRecipes = recipes;

  // Search filter
  if (searchQuery.trim()) {
    const query = searchQuery.toLowerCase();
    filteredRecipes = filteredRecipes.filter(recipe =>
      recipe.name.toLowerCase().includes(query) ||
      recipe.description.toLowerCase().includes(query)
    );
  }

  // Cuisine filter
  if (cuisineFilter !== 'All') {
    filteredRecipes = filteredRecipes.filter(recipe => recipe.cuisine === cuisineFilter);
  }

  // Cook time filter
  if (cookTimeFilter !== 'All') {
    filteredRecipes = filteredRecipes.filter(recipe => {
      if (cookTimeFilter === 'Under 30 min') return recipe.cookTime < 30;
      if (cookTimeFilter === '30-60 min') return recipe.cookTime >= 30 && recipe.cookTime <= 60;
      if (cookTimeFilter === 'Over 60 min') return recipe.cookTime > 60;
      return true;
    });
  }

  // Price filter
  if (priceFilter !== 'All') {
    filteredRecipes = filteredRecipes.filter(recipe => {
      if (priceFilter === 'Under $5') return recipe.costPerServing < 5;
      if (priceFilter === '$5-10') return recipe.costPerServing >= 5 && recipe.costPerServing <= 10;
      if (priceFilter === 'Over $10') return recipe.costPerServing > 10;
      return true;
    });
  }

  // Apply pantry mode (sort by match) if enabled
  const displayRecipes = pantryMode
    ? matchRecipesToPantry(pantryItems, filteredRecipes)
    : filteredRecipes;

  // Calculate pantry matches for all recipes when in pantry mode
  const recipesWithMatches = pantryMode
    ? displayRecipes.map(recipe => ({
        ...recipe,
        matchData: {
          matchPercentage: recipe.pantryMatchPercentage,
          matchedCount: recipe.matchedIngredientsCount,
          totalIngredients: recipe.totalIngredientsCount,
          matchedIngredients: recipe.matchedIngredients || [],
          missingIngredients: recipe.missingIngredients || [],
          partialMatches: recipe.partialMatches || []
        }
      }))
    : displayRecipes.map(recipe => ({
        ...recipe,
        matchData: null
      }));

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header with Icon */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center gap-3">
          {/* BookOpen icon for Recipe Library - visually represents recipe collection */}
          <BookOpen size={32} className="text-primary" aria-hidden="true" />
          <span>Recipe Library</span>
        </h1>
        {/* Show recipe count ONLY if user has recipes */}
        {recipes.length > 0 && (
          <p className="text-gray-600">
            Browse your collection of {recipes.length} delicious recipe{recipes.length !== 1 ? 's' : ''}
          </p>
        )}

        {/* ===================================================================
            EMPTY STATE - TWO OPTIONS FOR NEW USERS
            ===================================================================
            SHOW WHEN: User has exactly 0 recipes in their account

            PURPOSE: Give new users TWO ways to get started:
            1. Import their own recipe from any cooking website (RECOMMENDED)
            2. Load 25 sample recipes to explore features

            WHY TWO OPTIONS:
            - Some users want to immediately add their favorite recipes
            - Others prefer to explore with pre-loaded samples first
            - URL import is EASIER than manual entry (just paste a link!)
        */}
        {!loading && recipes.length === 0 && (
          <div className="mt-4 space-y-4">
            {/* ===== OPTION 1: IMPORT FROM URL (PRIMARY/RECOMMENDED) ===== */}
            <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-400 rounded-lg shadow-md">
              <div className="flex items-start justify-between gap-6">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-800 mb-2">
                    🔗 Import Your Favorite Recipes
                  </h3>
                  <p className="text-gray-700 mb-2 font-medium">
                    The easiest way to get started - just paste a recipe URL!
                  </p>
                  <p className="text-sm text-gray-600 mb-2">
                    Works with AllRecipes, Food Network, NYT Cooking, Bon Appétit, and thousands more cooking websites.
                  </p>
                  <p className="text-xs text-gray-500 italic">
                    (You can also add recipes manually if you prefer)
                  </p>
                </div>
                <button
                  onClick={() => navigate('/recipes/new')}
                  className="px-8 py-3 rounded-md font-semibold transition-all whitespace-nowrap shadow-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  🌐 Import Recipe from URL
                </button>
              </div>
            </div>

            {/* ===== OPTION 2: LOAD SAMPLE RECIPES (ALTERNATIVE) ===== */}
            <div className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-lg shadow-md">
              <div className="flex items-center justify-between gap-6">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-800 mb-2">
                    🎯 Or Explore with Sample Recipes
                  </h3>
                  <p className="text-gray-700 mb-1">
                    Not ready to add your own recipes yet? No problem!
                  </p>
                  <p className="text-sm text-gray-600">
                    Load 25 delicious pre-made recipes to explore all the features and see how everything works.
                  </p>
                </div>
                <button
                  onClick={handleSeedDatabase}
                  disabled={seeding}
                  className={`px-8 py-3 rounded-md font-semibold transition-all whitespace-nowrap shadow-lg ${
                    seeding
                      ? 'bg-gray-400 text-white cursor-not-allowed'
                      : 'bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700 hover:shadow-xl transform hover:-translate-y-0.5'
                  }`}
                >
                  {seeding ? 'Loading...' : '📚 Load Sample Recipes'}
                </button>
              </div>
              {/* Progress/Success Message */}
              {seedMessage && (
                <div className="mt-4 p-3 bg-white border border-green-200 rounded-md">
                  <p className="text-sm font-semibold text-gray-800">
                    {seedMessage}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Search and Filters - Only show if user has recipes */}
      {recipes.length > 0 && (
      <div className="mb-6 bg-white rounded-lg shadow-md p-6">
        {/* Search Bar */}
        <div className="mb-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search recipes by name or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 pl-11 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            <svg
              className="absolute left-3 top-3.5 w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>

        {/* Filters Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          {/* Cuisine Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cuisine
            </label>
            <select
              value={cuisineFilter}
              onChange={(e) => setCuisineFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              {cuisines.map(cuisine => (
                <option key={cuisine} value={cuisine}>{cuisine}</option>
              ))}
            </select>
          </div>

          {/* Cook Time Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cook Time
            </label>
            <select
              value={cookTimeFilter}
              onChange={(e) => setCookTimeFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="All">All</option>
              <option value="Under 30 min">Under 30 min</option>
              <option value="30-60 min">30-60 min</option>
              <option value="Over 60 min">Over 60 min</option>
            </select>
          </div>

          {/* Price Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Price Range
            </label>
            <select
              value={priceFilter}
              onChange={(e) => setPriceFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="All">All</option>
              <option value="Under $5">Under $5</option>
              <option value="$5-10">$5-10</option>
              <option value="Over $10">Over $10</option>
            </select>
          </div>

          {/* Add New Recipe Button */}
          <div className="flex items-end">
            <button
              onClick={() => navigate('/recipes/new')}
              className="w-full bg-success text-white px-4 py-2 rounded-md hover:bg-success-hover transition-colors font-medium"
              data-tour="add-recipe-button"
            >
              + Add New Recipe
            </button>
          </div>
        </div>

        {/* Pantry Mode Toggle */}
        <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
          <button
            onClick={() => setPantryMode(!pantryMode)}
            className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors ${
              pantryMode ? 'bg-success' : 'bg-gray-300'
            }`}
          >
            <span
              className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                pantryMode ? 'translate-x-8' : 'translate-x-1'
              }`}
            />
          </button>
          <div className="flex-1">
            <label className="font-semibold text-gray-800 cursor-pointer" onClick={() => setPantryMode(!pantryMode)}>
              Show recipes I can make with my pantry
            </label>
            <p className="text-sm text-gray-600">
              {pantryMode
                ? `Showing recipes sorted by match with your ${pantryItems.length} pantry items`
                : `Toggle to see recipes you can make with pantry ingredients`
              }
            </p>
          </div>
        </div>
      </div>
      )}

      {/* Recipe Count and Clear Filters - Only show if user has recipes */}
      {recipes.length > 0 && (
      <div className="mb-6 flex items-center justify-between">
        <div className="text-sm text-gray-600">
          Showing {displayRecipes.length} of {recipes.length} recipe{displayRecipes.length !== 1 ? 's' : ''}
          {pantryMode && ` (sorted by pantry match)`}
          {(searchQuery || cuisineFilter !== 'All' || cookTimeFilter !== 'All' || priceFilter !== 'All') && (
            <span className="ml-2 text-primary font-medium">• Filters active</span>
          )}
        </div>
        {(searchQuery || cuisineFilter !== 'All' || cookTimeFilter !== 'All' || priceFilter !== 'All') && (
          <button
            onClick={() => {
              setSearchQuery('');
              setCuisineFilter('All');
              setCookTimeFilter('All');
              setPriceFilter('All');
            }}
            className="text-sm text-gray-600 hover:text-primary transition-colors font-medium"
          >
            Clear all filters
          </button>
        )}
      </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Loading recipes...</p>
          </div>
        </div>
      ) : (
        <>
          {/* Recipe Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {recipesWithMatches.map((recipe) => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                onSelect={handleSelectRecipe}
                pantryMode={pantryMode}
                matchData={pantryMode ? recipe.matchData : null}
                cookingHistory={cookingHistoryMap[recipe.id]}
              />
            ))}
          </div>

          {/* ===================================================================
              EMPTY STATE - NO RECIPES AFTER FILTERING
              ===================================================================
              This shows when user HAS recipes but filters resulted in 0 matches
          */}
          {recipes.length > 0 && displayRecipes.length === 0 && (
            <div className="bg-white p-12 rounded-lg shadow-md text-center">
              <p className="text-gray-500 text-lg mb-2">No recipes match your current filters.</p>
              <p className="text-gray-400 text-sm mb-4">Try adjusting your search or filters.</p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setCuisineFilter('All');
                  setCookTimeFilter('All');
                  setPriceFilter('All');
                }}
                className="bg-primary text-white px-6 py-2 rounded-md hover:bg-primary-hover transition-colors font-medium"
              >
                Clear All Filters
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default RecipeLibrary;
