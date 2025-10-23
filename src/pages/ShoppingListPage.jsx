import { useState, useMemo, useEffect } from 'react';
import { useMealPlan } from '../context/MealPlanContext';
import { useAuth } from '../context/AuthContext';
import { generateShoppingList, exportShoppingListText } from '../utils/shoppingListGenerator';
import { compareShoppingListWithPantry } from '../utils/ingredientMatching';
import {
  getShoppingListItems,
  saveShoppingListItems,
  clearShoppingList,
  transferItemsToPantry,
  getPantryItems,
  addManualItemToShoppingList
} from '../services/firestoreService';
import { ShoppingCart, Trash2 } from 'lucide-react';

// Import refactored components from shoppingList folder
import ShoppingListStats from '../components/shoppingList/ShoppingListStats';
import ShoppingListHeader from '../components/shoppingList/ShoppingListHeader';
import ShoppingListGroup from '../components/shoppingList/ShoppingListGroup';
import PantryTransferModal from '../components/shoppingList/PantryTransferModal';
import AddManualItemModal from '../components/shoppingList/AddManualItemModal';

/**
 * ============================================================================
 * SHOPPING LIST PAGE - REFACTORED
 * ============================================================================
 *
 * PURPOSE:
 * Main shopping list page that coordinates all shopping list functionality.
 * Generates smart shopping list from meal plan with pantry awareness.
 *
 * REFACTORING NOTES:
 * This file was originally 831 lines. Now broken into 7 focused components:
 * 1. ShoppingListStats - Summary statistics card
 * 2. ShoppingListHeader - Controls and action buttons
 * 3. ShoppingListGroup - Three category sections
 * 4. ShoppingListItem - Individual item rendering
 * 5. AlreadyHaveItem - Items in pantry rendering
 * 6. PantryTransferModal - Transfer items to pantry
 * 7. ShoppingListPage (this file) - Coordinates everything
 *
 * RESPONSIBILITIES (This File):
 * - State management (checked items, editable items, toggles)
 * - Load shopping list from Firestore (STORED, not computed)
 * - Generate shopping list from meal plan (saves to Firestore)
 * - Compare with pantry items
 * - Handle transfer to pantry logic
 * - Coordinate child components
 * - No rendering logic (delegated to components)
 *
 * KEY FEATURES:
 * - Stored shopping list (persists across sessions)
 * - Generate from meal plan button (saves to Firestore)
 * - Clear shopping list independently of meal plan
 * - Pantry awareness (3 categories: Already Have, Need More, Need to Buy)
 * - Editable quantities for transfer to pantry
 * - Export functionality
 * - Cost and savings estimates
 *
 * PARENT: App.js (routed)
 */

function ShoppingListPage() {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================

  // Get meal plan and pantry from context
  const { mealPlan, pantryItems, transferShoppingListToPantry } = useMealPlan();
  const { currentUser } = useAuth();

  // Shopping list items (STORED in Firestore, not computed)
  const [storedShoppingList, setStoredShoppingList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  // Checkbox state for marking items as purchased
  const [checkedItems, setCheckedItems] = useState({});

  // Toggle for showing/hiding "Already Have" section
  const [showAlreadyHave, setShowAlreadyHave] = useState(true);

  // Transfer modal state
  const [showTransferConfirm, setShowTransferConfirm] = useState(false);
  const [editableItems, setEditableItems] = useState([]);
  const [transferring, setTransferring] = useState(false);

  // Add manual item modal state
  const [showAddItemModal, setShowAddItemModal] = useState(false);

  // Success/error message state
  const [transferMessage, setTransferMessage] = useState({ type: '', text: '' });

  // ============================================================================
  // LOAD SHOPPING LIST FROM FIRESTORE
  // ============================================================================

  useEffect(() => {
    async function loadShoppingList() {
      if (!currentUser) {
        setStoredShoppingList([]);
        setLoading(false);
        return;
      }

      try {
        console.log('📋 Loading shopping list from Firestore...');
        const items = await getShoppingListItems();
        setStoredShoppingList(items);
        console.log(`✅ Loaded ${items.length} shopping list items`);
      } catch (error) {
        console.error('❌ Error loading shopping list:', error);
        setTransferMessage({
          type: 'error',
          text: 'Failed to load shopping list. Please refresh the page.'
        });
      } finally {
        setLoading(false);
      }
    }

    loadShoppingList();
  }, [currentUser]);

  // ============================================================================
  // SHOPPING LIST GENERATION & CATEGORIZATION
  // ============================================================================

  // Use stored shopping list (no longer computed from meal plan)
  const allShoppingItems = storedShoppingList;

  // Compare with pantry to categorize items into 3 groups
  // 1. alreadyHave - Items in pantry with sufficient quantity
  // 2. needMore - Items in pantry but not enough quantity
  // 3. needToBuy - Items not in pantry at all
  const categorizedItems = useMemo(() => {
    return compareShoppingListWithPantry(allShoppingItems, pantryItems);
  }, [allShoppingItems, pantryItems]);

  // ============================================================================
  // CALCULATIONS
  // ============================================================================

  // Calculate estimated savings (rough estimate: $3 per item already have)
  const estimatedSavings = categorizedItems.alreadyHave.length * 3;

  // Calculate total items that need to be purchased
  const totalNeedToBuy = categorizedItems.needToBuy.length + categorizedItems.needMore.length;

  // Count checked items
  const checkedNeedToBuyCount = [...categorizedItems.needMore, ...categorizedItems.needToBuy]
    .filter(item => {
      const itemKey = `${item.name}-${item.quantity}-${item.unit}`;
      return checkedItems[itemKey];
    }).length;

  // Calculate remaining items to buy (excluding checked off)
  const remainingNeedToBuy = totalNeedToBuy - checkedNeedToBuyCount;

  // Count total checked items
  const checkedOffCount = Object.values(checkedItems).filter(Boolean).length;

  // Check if list has items
  const hasItems = allShoppingItems.length > 0;

  // Calculate total cost (rough estimate: $2.50 per item)
  const totalCost = allShoppingItems.reduce((sum, item) => sum + (item.costPerServing || 2.5), 0);

  // ============================================================================
  // HANDLERS - Generate from Meal Plan
  // ============================================================================

  /**
   * Generates shopping list from current meal plan and saves to Firestore
   * PRESERVES MANUAL ITEMS - Manual items (paper towels, etc.) are kept when regenerating
   */
  const handleGenerateFromMealPlan = async () => {
    try {
      setGenerating(true);
      console.log('🛒 Generating shopping list from meal plan...');

      // STEP 1: Get current shopping list to preserve manual items
      const currentList = await getShoppingListItems();

      // STEP 2: Filter out ONLY manual items (keep non-recipe items)
      const manualItems = currentList.filter(item => item.source === 'manual');
      console.log(`📝 Preserving ${manualItems.length} manual items`);

      // STEP 3: Generate shopping list from meal plan (computes what's needed)
      const computedList = generateShoppingList(mealPlan);

      // STEP 4: Flatten the computed list into recipe items
      const recipeItems = [];
      Object.entries(computedList.items).forEach(([category, items]) => {
        items.forEach(item => {
          recipeItems.push({
            id: `recipe_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            name: item.name,
            quantity: item.quantity,
            unit: item.unit,
            category: category,
            source: 'recipe',
            recipeIds: item.recipes?.map(r => r.id) || [],
            recipeNames: item.recipes?.map(r => r.name) || [],
            checked: false,
            costPerServing: item.costPerServing || 2.5
          });
        });
      });

      // STEP 5: Combine manual items + recipe items
      const combinedList = [...manualItems, ...recipeItems];
      console.log(`✅ Combined list: ${manualItems.length} manual + ${recipeItems.length} recipe = ${combinedList.length} total items`);

      // STEP 6: Save combined list to Firestore
      await saveShoppingListItems(combinedList);

      // STEP 7: Update local state
      setStoredShoppingList(combinedList);

      setTransferMessage({
        type: 'success',
        text: `✅ Generated shopping list with ${recipeItems.length} recipe items! (${manualItems.length} manual items preserved)`
      });

      setTimeout(() => {
        setTransferMessage({ type: '', text: '' });
      }, 5000);

      console.log(`✅ Shopping list generated successfully`);
    } catch (error) {
      console.error('❌ Error generating shopping list:', error);
      setTransferMessage({
        type: 'error',
        text: 'Failed to generate shopping list. Please try again.'
      });

      setTimeout(() => {
        setTransferMessage({ type: '', text: '' });
      }, 5000);
    } finally {
      setGenerating(false);
    }
  };

  // ============================================================================
  // HANDLERS - Clear Shopping List
  // ============================================================================

  /**
   * Clears all shopping list items from Firestore
   */
  const handleClearShoppingList = async () => {
    const confirmed = window.confirm(
      '⚠️ Clear Shopping List?\n\n' +
      'This will remove all items from your shopping list.\n\n' +
      'Your meal plan will NOT be affected.\n\n' +
      'Continue?'
    );

    if (!confirmed) return;

    try {
      console.log('🗑️ Clearing shopping list...');

      // Clear from Firestore
      await clearShoppingList();

      // Clear local state
      setStoredShoppingList([]);
      setCheckedItems({});

      setTransferMessage({
        type: 'success',
        text: '✅ Shopping list cleared! Your meal plan is still on the calendar.'
      });

      setTimeout(() => {
        setTransferMessage({ type: '', text: '' });
      }, 5000);

      console.log('✅ Shopping list cleared');
    } catch (error) {
      console.error('❌ Error clearing shopping list:', error);
      setTransferMessage({
        type: 'error',
        text: 'Failed to clear shopping list. Please try again.'
      });

      setTimeout(() => {
        setTransferMessage({ type: '', text: '' });
      }, 5000);
    }
  };

  // ============================================================================
  // HANDLERS - Add Manual Item
  // ============================================================================

  /**
   * Handles adding a manually-entered item to the shopping list
   * These are items not from recipes (paper towels, cleaning supplies, etc.)
   */
  const handleAddManualItem = async (item) => {
    try {
      console.log('➕ Adding manual item:', item);

      // Save to Firestore
      await addManualItemToShoppingList(item);

      // Add to local state immediately for instant UI update
      setStoredShoppingList(prev => [...prev, item]);

      setTransferMessage({
        type: 'success',
        text: `✅ Added "${item.name}" to shopping list!`
      });

      setTimeout(() => {
        setTransferMessage({ type: '', text: '' });
      }, 3000);

      console.log('✅ Manual item added to shopping list');
    } catch (error) {
      console.error('❌ Error adding manual item:', error);
      setTransferMessage({
        type: 'error',
        text: 'Failed to add item. Please try again.'
      });

      setTimeout(() => {
        setTransferMessage({ type: '', text: '' });
      }, 5000);
    }
  };

  // ============================================================================
  // HANDLERS - Checkbox Toggle
  // ============================================================================

  /**
   * Toggles checkbox state for an item
   * @param {string} itemKey - Unique key for the item
   */
  const toggleItem = (itemKey) => {
    setCheckedItems(prev => ({
      ...prev,
      [itemKey]: !prev[itemKey]
    }));
  };

  // ============================================================================
  // HANDLERS - Export
  // ============================================================================

  /**
   * Exports shopping list as text
   * Currently shows in alert and logs to console
   * Future: Download as file, copy to clipboard, email
   */
  const handleExport = () => {
    // Create a shoppingList object structure expected by exportShoppingListText
    const formattedList = {
      items: { all: allShoppingItems },
      totalItems: allShoppingItems.length,
      totalCost: totalCost
    };
    const text = exportShoppingListText(formattedList);
    alert(text);
    console.log(text);
  };

  // ============================================================================
  // HANDLERS - Transfer to Pantry Modal
  // ============================================================================

  /**
   * Opens transfer dialog and initializes editable items
   * Pre-fills quantities with recipe amounts (user can edit)
   */
  const openTransferDialog = () => {
    const itemsToTransfer = [...categorizedItems.needMore, ...categorizedItems.needToBuy];

    if (itemsToTransfer.length === 0) {
      setTransferMessage({
        type: 'error',
        text: 'No items to transfer! All items are already in your pantry.'
      });
      return;
    }

    // Initialize editable items with recipe quantities
    const initialEditableItems = itemsToTransfer.map((item, index) => ({
      id: `${item.name}-${index}`,
      originalName: item.name,
      name: item.name,
      recipeQuantity: item.needQty || item.quantity,
      recipeUnit: item.unit || '',
      purchasedQuantity: item.needQty || item.quantity,
      purchasedUnit: item.unit || '',
      skip: false
    }));

    setEditableItems(initialEditableItems);
    setShowTransferConfirm(true);
  };

  /**
   * Updates a field for a specific editable item
   */
  const updateEditableItem = (itemId, field, value) => {
    setEditableItems(prev =>
      prev.map(item =>
        item.id === itemId ? { ...item, [field]: value } : item
      )
    );
  };

  /**
   * Resets all items to use their recipe amounts
   */
  const useRecipeAmounts = () => {
    setEditableItems(prev =>
      prev.map(item => ({
        ...item,
        purchasedQuantity: item.recipeQuantity,
        purchasedUnit: item.recipeUnit,
        skip: false
      }))
    );
  };

  /**
   * Handles transfer of shopping items to pantry using SEQUENTIAL writes (NO RACE CONDITIONS)
   * NOTE: clearAfterTransfer parameter is ignored - meal plan always stays intact
   */
  const handleTransferToPantry = async (clearAfterTransfer = false) => {
    try {
      setTransferring(true);
      console.log('🚀 Starting pantry transfer...');

      // Filter out skipped items and validate
      const itemsToTransfer = editableItems
        .filter(item => !item.skip)
        .map(item => ({
          name: item.name,
          quantity: parseFloat(item.purchasedQuantity) || 0,
          unit: item.purchasedUnit.trim()
        }))
        .filter(item => item.quantity > 0);

      if (itemsToTransfer.length === 0) {
        setTransferMessage({
          type: 'error',
          text: 'No items to transfer! Please specify quantities or uncheck "Skip" for at least one item.'
        });
        setTransferring(false);
        return;
      }

      // Transfer to pantry using NEW SEQUENTIAL function
      const results = await transferItemsToPantry(itemsToTransfer);

      console.log('✅ Transfer complete:', results);

      // Show transfer summary in console for debugging
      if (itemsToTransfer.length > 0) {
        console.log('📊 Transferred items:', itemsToTransfer.map(i => `${i.name} (${i.quantity} ${i.unit})`));
      }

      // CRITICAL: Wait for Firestore to fully propagate changes
      // Firestore writes are async and need time to replicate across clients
      console.log('⏳ Waiting 1 second for Firestore to propagate changes...');
      await new Promise(resolve => setTimeout(resolve, 1000));

      console.log('🔄 Reloading page to refresh pantry data and recategorize shopping list...');

      // Close modal before reload
      setShowTransferConfirm(false);

      // Force page reload to:
      // 1. Reload pantry from Firestore (via MealPlanContext)
      // 2. Trigger shopping list recategorization with updated pantry
      // 3. Show items in correct categories (Already Have, Need More, Need to Buy)
      window.location.reload();

    } catch (error) {
      console.error('Error during transfer:', error);
      setTransferMessage({
        type: 'error',
        text: `❌ Transfer failed: ${error.message}\n\nYour meal plan is still on the calendar.`
      });

      setTimeout(() => {
        setTransferMessage({ type: '', text: '' });
      }, 5000);
    } finally {
      setTransferring(false);
    }
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  // Show loading state while fetching shopping list
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600 text-lg">Loading shopping list...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      {/* Page Header with Icon */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center gap-3">
          <ShoppingCart size={32} className="text-primary" aria-hidden="true" />
          <span>Shopping List</span>
        </h1>
        <p className="text-gray-600">
          Stored shopping list - persists across sessions
        </p>
      </div>

      {/* Success/Error Message Notification */}
      {transferMessage.text && (
        <div
          className={`mb-6 p-4 rounded-lg border-2 flex items-start gap-3 animate-slide-in ${
            transferMessage.type === 'success'
              ? 'bg-green-50 border-green-500 text-green-800'
              : 'bg-red-50 border-red-500 text-red-800'
          }`}
        >
          {transferMessage.type === 'success' ? (
            <svg className="w-6 h-6 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
          ) : (
            <svg className="w-6 h-6 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
          )}
          <div className="flex-1">
            <p className="font-semibold">{transferMessage.text}</p>
          </div>
          <button
            onClick={() => setTransferMessage({ type: '', text: '' })}
            className="flex-shrink-0 hover:opacity-70"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      )}

      {/* Header with Controls and Actions - ALWAYS VISIBLE */}
      <ShoppingListHeader
        showAlreadyHave={showAlreadyHave}
        onToggleAlreadyHave={() => setShowAlreadyHave(!showAlreadyHave)}
        hasAlreadyHaveItems={categorizedItems.alreadyHave.length > 0}
        hasPantryItems={pantryItems.length > 0}
        onOpenTransferDialog={openTransferDialog}
        transferring={transferring}
        hasItemsToTransfer={totalNeedToBuy > 0}
        onExport={handleExport}
        onGenerate={handleGenerateFromMealPlan}
        generating={generating}
        onClear={handleClearShoppingList}
        hasItems={hasItems}
        onAddManualItem={() => setShowAddItemModal(true)}
      />

      {hasItems ? (
        <>
          {/* Summary Statistics Card */}
          <ShoppingListStats
            totalItems={allShoppingItems.length}
            totalCost={totalCost}
            estimatedSavings={estimatedSavings}
            remainingNeedToBuy={remainingNeedToBuy}
            checkedOffCount={checkedOffCount}
          />

          {/* Three-Category Shopping List */}
          <ShoppingListGroup
            categorizedItems={categorizedItems}
            checkedItems={checkedItems}
            onToggleItem={toggleItem}
            showAlreadyHave={showAlreadyHave}
          />
        </>
      ) : (
        /* Empty State - No Items */
        <div className="mt-4 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-lg shadow-md">
          <div className="text-center">
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              🛒 Your Shopping List is Empty
            </h3>
            <p className="text-gray-700 mb-4">
              Generate a shopping list from your meal plan to get started!
            </p>
            <ul className="text-sm text-gray-600 space-y-2 mb-6">
              <li className="flex items-center justify-center gap-2">
                <span className="text-blue-600 font-bold">1.</span>
                Add recipes to your meal plan calendar
              </li>
              <li className="flex items-center justify-center gap-2">
                <span className="text-blue-600 font-bold">2.</span>
                Click "Generate from Meal Plan" button above
              </li>
              <li className="flex items-center justify-center gap-2">
                <span className="text-blue-600 font-bold">3.</span>
                Shopping list auto-creates with all ingredients!
              </li>
            </ul>
            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center mt-6">
              <a
                href="/meal-planner"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-md hover:from-blue-700 hover:to-indigo-700 transition-all font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                📅 Go to Meal Planner
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Info Banner */}
      {hasItems && (
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
                Pantry-Aware Shopping List
              </h3>
              <p className="text-sm text-blue-800">
                This list automatically compares your shopping needs with your pantry inventory.
                Items are color-coded:{' '}
                <span className="font-semibold text-green-700">Green</span> = already have,
                <span className="font-semibold text-yellow-700"> Yellow</span> = need more,
                <span className="font-semibold text-orange-700"> Orange</span> = need to buy.
                {pantryItems.length === 0 && (
                  <span className="block mt-1 italic">
                    Add items to your pantry to see which ingredients you already have!
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Clear All Button - Now clears shopping list independently */}
      {hasItems && (
        <div className="mt-6 flex justify-end">
          <button
            onClick={handleClearShoppingList}
            disabled={!hasItems}
            className="px-6 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-semibold flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Clear Shopping List
          </button>
        </div>
      )}

      {/* Pantry Transfer Modal */}
      <PantryTransferModal
        isOpen={showTransferConfirm}
        onClose={() => {
          setShowTransferConfirm(false);
          setEditableItems([]);
        }}
        editableItems={editableItems}
        onUpdateItem={updateEditableItem}
        onUseRecipeAmounts={useRecipeAmounts}
        onTransfer={handleTransferToPantry}
        transferring={transferring}
      />

      {/* Add Manual Item Modal */}
      <AddManualItemModal
        isOpen={showAddItemModal}
        onClose={() => setShowAddItemModal(false)}
        onAdd={handleAddManualItem}
      />
    </div>
  );
}

export default ShoppingListPage;
