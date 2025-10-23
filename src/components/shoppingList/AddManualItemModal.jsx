import { useState } from 'react';
import { X } from 'lucide-react';

/**
 * ============================================================================
 * ADD MANUAL ITEM MODAL
 * ============================================================================
 *
 * PURPOSE:
 * Allows users to add items to shopping list that aren't from recipes.
 * Examples: paper towels, cleaning supplies, pet food, toiletries.
 *
 * USAGE:
 * User clicks "Add Item" button → This modal opens → User fills form →
 * Item gets added to shopping list with source: 'manual'
 *
 * @param {boolean} isOpen - Whether modal is visible
 * @param {function} onClose - Function to close modal
 * @param {function} onAdd - Function to handle adding the item
 */

function AddManualItemModal({ isOpen, onClose, onAdd }) {
  const [itemName, setItemName] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [unit, setUnit] = useState('unit');
  const [category, setCategory] = useState('Other');

  // Categories for dropdown
  const categories = [
    'Produce',
    'Meat & Seafood',
    'Dairy & Eggs',
    'Grains & Pasta',
    'Canned & Jarred',
    'Seasonings & Spices',
    'Oils & Condiments',
    'Snacks & Baking',
    'Frozen',
    'Household',
    'Personal Care',
    'Pet Supplies',
    'Other'
  ];

  // Common units for dropdown
  const units = [
    'unit', 'units',
    'lb', 'lbs', 'oz',
    'cup', 'cups', 'tbsp', 'tsp',
    'bottle', 'bottles',
    'box', 'boxes',
    'bag', 'bags',
    'can', 'cans',
    'jar', 'jars',
    'pack', 'packs'
  ];

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!itemName.trim()) {
      alert('Please enter an item name');
      return;
    }

    // Create manual item
    const manualItem = {
      id: `manual_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: itemName.trim(),
      quantity: parseFloat(quantity) || 1,
      unit: unit,
      category: category,
      source: 'manual',  // Mark as manually added
      addedAt: new Date().toISOString(),
      checked: false,
      costPerServing: 0 // Manual items don't have cost estimates
    };

    onAdd(manualItem);

    // Reset form
    setItemName('');
    setQuantity('1');
    setUnit('unit');
    setCategory('Other');

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800">Add Item</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <p className="text-gray-600 mb-6">
          Add items not from recipes (paper towels, cleaning supplies, etc.)
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Item Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Item Name *
            </label>
            <input
              type="text"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              placeholder="e.g., Paper towels, Laundry detergent"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
            />
          </div>

          {/* Quantity and Unit (side by side) */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Quantity
              </label>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                min="0.1"
                step="0.1"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Unit
              </label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                {units.map(u => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all shadow-md"
            >
              Add to List
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddManualItemModal;
