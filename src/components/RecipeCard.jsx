import { useState } from 'react';
import { Star } from 'lucide-react';

function RecipeCard({ recipe, onSelect, pantryMode, matchData, cookingHistory }) {
  const [showMatchedTooltip, setShowMatchedTooltip] = useState(false);
  const [showMissingTooltip, setShowMissingTooltip] = useState(false);

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 cursor-pointer">
      {/* Recipe Image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={recipe.imageUrl}
          alt={recipe.name}
          className="w-full h-full object-cover"
        />
        {/* Cuisine Badge */}
        <div className="absolute top-2 right-2 bg-primary text-white px-3 py-1 rounded-full text-sm font-medium">
          {recipe.cuisine}
        </div>

        {/* Star Rating Badge - Show if recipe has been cooked */}
        {cookingHistory && cookingHistory.averageRating > 0 && (
          <div className="absolute bottom-2 right-2 bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
            <Star size={12} className="fill-white" />
            <span>{cookingHistory.averageRating.toFixed(1)}</span>
          </div>
        )}

        {/* Pantry Match Badge */}
        {pantryMode && matchData && (
          <div className="absolute top-2 left-2 bg-success text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
            {matchData.matchPercentage}% match
          </div>
        )}
      </div>

      {/* Recipe Details */}
      <div className="p-4">
        {/* Recipe Name */}
        <h3 className="text-xl font-bold text-gray-800 mb-2 line-clamp-2">
          {recipe.name}
        </h3>

        {/* Description */}
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {recipe.description}
        </p>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {/* Cook Time */}
          <div className="flex items-center gap-2">
            <svg
              className="w-5 h-5 text-gray-500"
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
            <span className="text-sm text-gray-700">{recipe.cookTime} min</span>
          </div>

          {/* Ingredient Count */}
          <div className="flex items-center gap-2">
            <svg
              className="w-5 h-5 text-gray-500"
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
            <span className="text-sm text-gray-700">
              {recipe.ingredients.length} ingredients
            </span>
          </div>
        </div>

        {/* Pantry Match Details */}
        {pantryMode && matchData && (
          <div className="mb-3 space-y-2">
            {/* Summary */}
            <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-md">
              <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm font-semibold text-gray-800">
                You have {matchData.matchedCount} of {matchData.totalIngredients} ingredients
              </span>
            </div>

            {/* Matched Ingredients (Full matches only) */}
            {matchData.matchedIngredients && matchData.matchedIngredients.length > 0 && (
              <div className="p-2 bg-green-50 border border-success rounded-md">
                <div className="flex items-start gap-2">
                  <svg className="w-4 h-4 text-success mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-success mb-1">You Have (Sufficient Qty):</div>
                    <div className="text-xs text-gray-700">
                      {matchData.matchedIngredients.slice(0, 3).map((ing, idx) => (
                        <span key={idx} className="capitalize">
                          {ing}{idx < Math.min(matchData.matchedIngredients.length, 3) - 1 ? ', ' : ''}
                        </span>
                      ))}
                      {matchData.matchedIngredients.length > 3 && (
                        <span
                          className="relative inline-block"
                          onMouseEnter={() => setShowMatchedTooltip(true)}
                          onMouseLeave={() => setShowMatchedTooltip(false)}
                        >
                          <span className="text-gray-500 cursor-help underline decoration-dotted">
                            {' '}+{matchData.matchedIngredients.length - 3} more
                          </span>
                          {showMatchedTooltip && (
                            <div className="absolute z-50 bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-48 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg shadow-lg">
                              <div className="space-y-1">
                                {matchData.matchedIngredients.slice(3).map((ing, idx) => (
                                  <div key={idx} className="capitalize">• {ing}</div>
                                ))}
                              </div>
                              {/* Arrow */}
                              <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                                <div className="w-2 h-2 bg-gray-900 transform rotate-45"></div>
                              </div>
                            </div>
                          )}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Partial Matches */}
            {matchData.partialMatches && matchData.partialMatches.length > 0 && (
              <div className="p-2 bg-yellow-50 border border-yellow-400 rounded-md">
                <div className="flex items-start gap-2">
                  <svg className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-yellow-700 mb-1">Partial Match:</div>
                    <div className="text-xs text-gray-700 space-y-1">
                      {matchData.partialMatches.slice(0, 2).map((item, idx) => (
                        <div key={idx} className="capitalize">
                          <span className="font-medium">{item.displayName || item.name}:</span>{' '}
                          {item.unit === 'mixed' ? (
                            <span>Have {item.has}, need {item.needs}</span>
                          ) : (
                            <span>
                              Have {item.has} of {item.needs} {item.unit} ({item.matchPercent}%)
                            </span>
                          )}
                        </div>
                      ))}
                      {matchData.partialMatches.length > 2 && (
                        <div className="text-gray-500">
                          +{matchData.partialMatches.length - 2} more partial
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Missing Ingredients */}
            {matchData.missingIngredients && matchData.missingIngredients.length > 0 && (
              <div className="p-2 bg-orange-50 border border-orange-400 rounded-md">
                <div className="flex items-start gap-2">
                  <svg className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-orange-700 mb-1">Need to Buy:</div>
                    <div className="text-xs text-gray-700">
                      {matchData.missingIngredients.slice(0, 3).map((ing, idx) => (
                        <span key={idx} className="capitalize">
                          {ing}{idx < Math.min(matchData.missingIngredients.length, 3) - 1 ? ', ' : ''}
                        </span>
                      ))}
                      {matchData.missingIngredients.length > 3 && (
                        <span
                          className="relative inline-block"
                          onMouseEnter={() => setShowMissingTooltip(true)}
                          onMouseLeave={() => setShowMissingTooltip(false)}
                        >
                          <span className="text-gray-500 cursor-help underline decoration-dotted">
                            {' '}+{matchData.missingIngredients.length - 3} more
                          </span>
                          {showMissingTooltip && (
                            <div className="absolute z-50 bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-48 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg shadow-lg">
                              <div className="space-y-1">
                                {matchData.missingIngredients.slice(3).map((ing, idx) => (
                                  <div key={idx} className="capitalize">• {ing}</div>
                                ))}
                              </div>
                              {/* Arrow */}
                              <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                                <div className="w-2 h-2 bg-gray-900 transform rotate-45"></div>
                              </div>
                            </div>
                          )}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Cost and Servings */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-200">
          <div>
            <span className="text-2xl font-bold text-primary">
              ${recipe.costPerServing.toFixed(2)}
            </span>
            <span className="text-sm text-gray-500 ml-1">/ serving</span>
          </div>
          <div className="text-sm text-gray-600">
            Serves {recipe.servings}
          </div>
        </div>

        {/* View Details Button */}
        <button
          onClick={() => onSelect && onSelect(recipe.id)}
          className="w-full mt-4 bg-primary text-white py-2 px-4 rounded-md hover:bg-primary-hover transition-colors duration-200 font-medium"
        >
          View Details
        </button>
      </div>
    </div>
  );
}

export default RecipeCard;
