import { useState } from 'react';
import { useMealPlan } from '../context/MealPlanContext';
// Import Package icon for Pantry page header
import { Package } from 'lucide-react';
// Import formatQuantity for clean display of can units
import { formatQuantity } from '../utils/unitConverter';

function MyPantry() {
  const { pantryItems, addPantryItem, updatePantryItem, removePantryItem, clearPantry } = useMealPlan();
  const [newIngredient, setNewIngredient] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('cup');
  const [error, setError] = useState('');

  // ============================================================================
  // EDIT MODAL STATE
  // ============================================================================
  // WHY: Track which item is being edited and show/hide the edit modal
  // editModalOpen: true = modal is visible, false = modal is hidden
  // editingIndex: the position (index) of the item being edited
  // editIngredient/editQuantity/editUnit: temporary values while editing
  // ============================================================================
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editIngredient, setEditIngredient] = useState('');
  const [editQuantity, setEditQuantity] = useState('');
  const [editUnit, setEditUnit] = useState('cup');

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

  // ============================================================================
  // EDIT HANDLERS
  // ============================================================================
  // WHY: Handle opening edit modal, saving changes, and canceling edits
  // WHEN: User clicks Edit button, Save button, or Cancel button
  // WHAT: Open modal with current values, save changes to context, or close modal
  // ============================================================================

  /**
   * Opens the edit modal for a specific pantry item
   * Pre-fills the form with the current values
   * @param {number} index - Position of the item to edit
   */
  const handleEditIngredient = (index) => {
    const item = pantryItems[index];
    setEditingIndex(index);
    setEditIngredient(item.name);
    setEditQuantity(item.quantity.toString());
    setEditUnit(item.unit);
    setError(''); // Clear any previous errors
    setEditModalOpen(true);
  };

  /**
   * Saves the edited pantry item
   * Validates input and calls updatePantryItem from context
   */
  const handleSaveEdit = (e) => {
    e.preventDefault();

    // VALIDATION: Make sure all fields are filled
    if (!editIngredient.trim()) {
      setError('Please enter an ingredient name');
      return;
    }

    if (!editQuantity || parseFloat(editQuantity) <= 0) {
      setError('Please enter a valid quantity');
      return;
    }

    // SAVE: Call the updatePantryItem function from context
    const result = updatePantryItem(editingIndex, editIngredient, editQuantity, editUnit);

    if (result.success) {
      // SUCCESS: Close modal and reset form
      setEditModalOpen(false);
      setEditingIndex(null);
      setEditIngredient('');
      setEditQuantity('');
      setEditUnit('cup');
      setError('');
    } else {
      // ERROR: Show the error message from context
      setError(result.error);
    }
  };

  /**
   * Cancels editing and closes the modal
   * Discards any changes made
   */
  const handleCancelEdit = () => {
    setEditModalOpen(false);
    setEditingIndex(null);
    setEditIngredient('');
    setEditQuantity('');
    setEditUnit('cup');
    setError('');
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
                  {/* Action Buttons - Edit and Delete */}
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {/* EDIT BUTTON - Opens modal to edit this item */}
                    <button
                      onClick={() => handleEditIngredient(index)}
                      className="text-blue-600 hover:text-blue-800 p-1 flex-shrink-0"
                      title="Edit ingredient"
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
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                    </button>

                    {/* DELETE BUTTON - Removes this item */}
                    <button
                      onClick={() => handleRemoveIngredient(index)}
                      className="text-red-600 hover:text-red-800 p-1 flex-shrink-0"
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

      {/* ========================================================================
          EDIT MODAL - Edit existing pantry item
          ========================================================================
          SHOW WHEN: User clicks the Edit button on a pantry item
          PURPOSE: Allow users to modify ingredient name, quantity, or unit
          BENEFIT: Fix typos or update amounts without deleting and re-adding
      */}
      {editModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full animate-scale-in">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 rounded-t-2xl">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">Edit Pantry Item</h3>
                  <p className="text-blue-100 text-sm mt-1">Update the ingredient details below</p>
                </div>
              </div>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveEdit} className="p-6">
              <div className="space-y-4">
                {/* Ingredient Name Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ingredient Name
                  </label>
                  <input
                    type="text"
                    value={editIngredient}
                    onChange={(e) => {
                      setEditIngredient(e.target.value);
                      setError('');
                    }}
                    placeholder="e.g., chicken breast, flour, onions"
                    className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      error ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                </div>

                {/* Quantity and Unit Fields */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Quantity
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={editQuantity}
                      onChange={(e) => {
                        setEditQuantity(e.target.value);
                        setError('');
                      }}
                      placeholder="e.g., 2"
                      className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        error ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Unit
                    </label>
                    <select
                      value={editUnit}
                      onChange={(e) => setEditUnit(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {commonUnits.map(u => (
                        <option key={u} value={u}>{u}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-red-600 text-sm">{error}</p>
                  </div>
                )}
              </div>

              {/* Modal Action Buttons */}
              <div className="mt-6 flex gap-3">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-4 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all font-semibold shadow-lg hover:shadow-xl"
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="flex-1 bg-gray-200 text-gray-800 py-3 px-4 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default MyPantry;
