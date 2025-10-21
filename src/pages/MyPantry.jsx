import { useState } from 'react';
import { useMealPlan } from '../context/MealPlanContext';
// Import Package icon for Pantry page header
import { Package } from 'lucide-react';
// Import formatQuantity for clean display of can units
import { formatQuantity } from '../utils/unitConverter';

function MyPantry() {
  const { pantryItems, addPantryItem, removePantryItem, clearPantry } = useMealPlan();
  const [newIngredient, setNewIngredient] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('cup');
  const [error, setError] = useState('');

  const commonUnits = [
    'cup', 'tbsp', 'tsp', 'oz', 'lb', 'g', 'kg', 'ml', 'l',
    'piece', 'whole', 'clove', 'can', 'package'
  ];

  // Handle adding new ingredient
  const handleAddIngredient = (e) => {
    e.preventDefault();

    // Validate input
    if (!newIngredient.trim()) {
      setError('Please enter an ingredient name');
      return;
    }

    if (!quantity || parseFloat(quantity) <= 0) {
      setError('Please enter a valid quantity');
      return;
    }

    // Add ingredient via context
    const result = addPantryItem(newIngredient, quantity, unit);
    if (result.success) {
      setNewIngredient('');
      setQuantity('');
      setUnit('cup');
      setError('');
    } else {
      setError(result.error);
    }
  };

  // Handle removing ingredient
  const handleRemoveIngredient = (indexToRemove) => {
    removePantryItem(indexToRemove);
  };

  // Handle clearing all ingredients
  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to clear all pantry items?')) {
      clearPantry();
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header with Icon */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center gap-3">
          {/* Package icon for Pantry - visually represents storage/ingredients */}
          <Package size={32} className="text-primary" aria-hidden="true" />
          <span>My Pantry</span>
        </h1>
        <p className="text-gray-600">
          Keep track of ingredients you already have at home to find recipes you can make
        </p>

        {/* ===================================================================
            EMPTY STATE - WELCOME NEW USERS TO PANTRY
            ===================================================================
            SHOW WHEN: User has exactly 0 pantry items
            PURPOSE: Help new users understand the value of adding pantry items
            BENEFIT: See recipe matches, reduce shopping costs
        */}
        {pantryItems.length === 0 && (
          <div className="mt-6 p-6 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-lg shadow-md">
            <div className="text-center">
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                🏠 Your Pantry is Empty
              </h3>
              <p className="text-gray-700 mb-2">
                Add ingredients you already have at home to unlock powerful features:
              </p>
              <ul className="text-sm text-gray-600 space-y-1 mb-4">
                <li>✓ See which recipes you can make right now</li>
                <li>✓ Reduce your shopping costs by using what you have</li>
                <li>✓ Get smart shopping lists that skip items you own</li>
              </ul>
              <p className="text-xs text-gray-500 italic">
                Use the form below to add your first ingredient →
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Add Ingredient Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            Add Ingredient
          </h2>

          <form onSubmit={handleAddIngredient} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ingredient Name
              </label>
              <input
                type="text"
                value={newIngredient}
                onChange={(e) => {
                  setNewIngredient(e.target.value);
                  setError('');
                }}
                placeholder="e.g., chicken breast, flour, onions"
                className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent ${
                  error ? 'border-red-500' : 'border-gray-300'
                }`}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantity
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={quantity}
                  onChange={(e) => {
                    setQuantity(e.target.value);
                    setError('');
                  }}
                  placeholder="e.g., 2"
                  className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent ${
                    error ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Unit
                </label>
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  {commonUnits.map(u => (
                    <option key={u} value={u}>{u}</option>
                  ))}
                </select>
              </div>
            </div>

            {error && (
              <p className="text-red-500 text-sm">{error}</p>
            )}

            <button
              type="submit"
              className="w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-primary-hover transition-colors font-medium"
            >
              Add to Pantry
            </button>
          </form>

          {/* Stats */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Ingredients</p>
                <p className="text-3xl font-bold text-primary">
                  {pantryItems.length}
                </p>
              </div>
              <div className="text-right">
                {pantryItems.length > 0 && (
                  <button
                    onClick={handleClearAll}
                    className="text-sm text-red-600 hover:text-red-800 transition-colors"
                  >
                    Clear All
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Pantry Items List */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            Your Pantry Items
          </h2>

          {pantryItems.length === 0 ? (
            <div className="text-center py-12">
              <svg
                className="w-16 h-16 text-gray-400 mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                />
              </svg>
              <p className="text-gray-500">Your pantry is empty</p>
              <p className="text-sm text-gray-400 mt-2">
                Add ingredients you have at home to get started
              </p>
            </div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {pantryItems.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-gray-800 font-medium capitalize block">
                        {item.name}
                      </span>
                      <span className="text-sm text-gray-600">
                        {formatQuantity(item.quantity, item.unit)} {item.unit}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoveIngredient(index)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-red-600 hover:text-red-800 p-1 flex-shrink-0"
                    title="Remove ingredient"
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
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Info Section */}
      {pantryItems.length > 0 && (
        <div className="mt-8 bg-green-50 border border-success rounded-lg p-6">
          <div className="flex gap-3">
            <svg
              className="w-6 h-6 text-success flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div>
              <h3 className="font-semibold text-gray-800 mb-1">
                Recipe Matching Active!
              </h3>
              <p className="text-sm text-gray-700">
                Visit the <a href="/recipes" className="font-semibold text-success hover:underline">Recipe Library</a> and
                toggle "Show recipes I can make with my pantry" to see which recipes match your ingredients!
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MyPantry;
