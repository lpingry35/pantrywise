import { useMealPlan } from '../context/MealPlanContext';
import MealPlannerCalendar from '../components/MealPlannerCalendar';
import SavedMealPlansManager from '../components/SavedMealPlansManager';
import { analyzeSharedIngredients } from '../utils/sharedIngredientsAnalyzer';
// Import Calendar icon for Meal Planner page header
import { Calendar } from 'lucide-react';

function MealPlanner() {
  const { mealPlan } = useMealPlan();

  // Analyze shared ingredients
  const sharedData = analyzeSharedIngredients(mealPlan);
  const hasRecipes = sharedData.totalRecipes > 0;
  const hasSharedIngredients = sharedData.totalSharedIngredients > 0;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center gap-3">
          {/* Calendar icon for Meal Planner - visually represents weekly planning */}
          <Calendar size={32} className="text-primary" aria-hidden="true" />
          <span>Meal Planner</span>
        </h1>
        <p className="text-gray-600">
          Plan your weekly meals and maximize savings by choosing recipes with shared ingredients
        </p>
      </div>

      {/* ===================================================================
          EMPTY STATE - WELCOME NEW USERS TO MEAL PLANNER
          ===================================================================
          SHOW WHEN: User has 0 recipes in their meal plan
          PURPOSE: Guide new users to browse recipes and start planning
          BENEFIT: Create organized meal plans, auto-generate shopping lists
      */}
      {!hasRecipes && (
        <div className="mb-6 p-6 bg-gradient-to-r from-purple-50 to-indigo-50 border-2 border-purple-300 rounded-lg shadow-md">
          <div className="text-center">
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              📅 Your Meal Plan is Empty
            </h3>
            <p className="text-gray-700 mb-2">
              Start planning your week! Add recipes to each day to create your personalized meal plan.
            </p>
            <ul className="text-sm text-gray-600 space-y-1 mb-4">
              <li>✓ Plan up to 21 meals per week (breakfast, lunch, dinner)</li>
              <li>✓ Shopping lists automatically update based on your plan</li>
              <li>✓ Save money by choosing recipes with shared ingredients</li>
            </ul>
            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center mt-6">
              {/* Primary action: Browse Recipes */}
              <a
                href="/recipes"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-3 rounded-md hover:from-purple-700 hover:to-indigo-700 transition-all font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                📚 Browse Recipes
              </a>
            </div>
            <p className="text-xs text-gray-500 italic mt-4">
              💡 Tip: Click any meal slot in the calendar below to add a recipe
            </p>
          </div>
        </div>
      )}

      {/* Shared Ingredients Info Section */}
      {hasRecipes && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-success rounded-lg p-6 mb-6 shadow-md">
          <div className="flex items-start gap-4">
            {/* Icon */}
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-success rounded-full flex items-center justify-center">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-800 mb-3 flex items-center gap-2">
                <span>Smart Ingredient Sharing</span>
                {hasSharedIngredients && (
                  <span className="px-3 py-1 bg-success text-white text-sm rounded-full font-semibold">
                    Active
                  </span>
                )}
              </h2>

              {hasSharedIngredients ? (
                <>
                  {/* Summary Message */}
                  <p className="text-gray-700 text-lg font-medium mb-4">
                    You're sharing <span className="text-success font-bold">{sharedData.totalSharedIngredients}</span> ingredient{sharedData.totalSharedIngredients !== 1 ? 's' : ''} across{' '}
                    <span className="text-success font-bold">{sharedData.totalRecipes}</span> recipe{sharedData.totalRecipes !== 1 ? 's' : ''} - smart planning saves money!
                  </p>

                  {/* Top Shared Ingredients */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-600 mb-2 uppercase tracking-wide">
                      Most Shared Ingredients
                    </h3>
                    <div className="flex flex-wrap gap-3">
                      {sharedData.topSharedIngredients.map((ingredient, index) => (
                        <div
                          key={index}
                          className="inline-flex flex-col bg-white border-2 border-success px-4 py-3 rounded-lg shadow-sm hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-gray-800 capitalize">
                              {ingredient.name}
                            </span>
                            <span className="px-2 py-0.5 bg-success text-white text-xs font-bold rounded-full">
                              {ingredient.recipeCount}
                            </span>
                          </div>
                          <div className="text-sm text-gray-600">
                            <span className="font-semibold text-success">
                              {ingredient.quantityDisplay}
                            </span>
                            {!ingredient.hasMultipleUnits && ' total'}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                // No shared ingredients yet
                <div className="flex items-center gap-3">
                  <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-gray-700">
                    Add more recipes to start sharing ingredients! When multiple recipes use the same ingredients, you'll see them highlighted here.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Save Current Plan Section - Right after current plan banner */}
      <div className="mb-6">
        <SavedMealPlansManager showOnlySection="save" />
      </div>

      <MealPlannerCalendar />

      {/* Saved Plans Library - At the bottom for browsing */}
      <div className="mt-8">
        <SavedMealPlansManager showOnlySection="library" />
      </div>
    </div>
  );
}

export default MealPlanner;
