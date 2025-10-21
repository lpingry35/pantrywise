import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star } from 'lucide-react';
import { suggestRecipes } from '../utils/ingredientMatching';
import { formatQuantity } from '../utils/unitConverter';
import { getRecipeById, getAllRecipes, getCookingHistory } from '../services/firestoreService';

function RecipeDetail() {
  const { recipeId } = useParams();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [allRecipes, setAllRecipes] = useState([]);
  const [cookingHistory, setCookingHistory] = useState(null);
  const [loadingHistory, setLoadingHistory] = useState(true);

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
            <button className="flex-1 bg-primary text-white py-3 px-6 rounded-md hover:bg-primary-hover transition-colors font-medium text-lg">
              Add to Meal Plan
            </button>
            <button className="flex-1 bg-gray-200 text-gray-800 py-3 px-6 rounded-md hover:bg-gray-300 transition-colors font-medium text-lg">
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
    </div>
  );
}

export default RecipeDetail;
