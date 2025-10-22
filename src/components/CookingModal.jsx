import { useState, useEffect } from 'react';
import { Star } from 'lucide-react';

/**
 * CookingModal Component
 *
 * Modal dialog for marking recipes as cooked with rating functionality
 *
 * Features:
 * - 5-star rating system (required on first cook, optional on repeat)
 * - Optional notes/comments field
 * - Shows pantry check results (sufficient or insufficient ingredients)
 * - "Cook Anyway" option for insufficient ingredients
 * - Displays cooking history (times cooked, average rating)
 */
function CookingModal({
  isOpen,
  onClose,
  onConfirm,
  recipe,
  cookingHistory,
  insufficientItems,
  canProceed
}) {
  // State for rating and notes
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  // State for expanding/collapsing insufficient ingredients list
  const [showAllInsufficientItems, setShowAllInsufficientItems] = useState(false);

  // ============================================================================
  // LEFTOVER TRACKING STATE
  // ============================================================================
  // WHY: Track leftovers to reduce food waste
  // WHEN: User checks the "Do you have leftovers?" box after cooking
  // WHAT: Stores whether they have leftovers and how many servings
  // ============================================================================
  const [hasLeftovers, setHasLeftovers] = useState(false);
  const [leftoverServings, setLeftoverServings] = useState(1);

  // Determine if this is first cook
  const isFirstCook = !cookingHistory || cookingHistory.cookedCount === 0;

  // Debug logging
  useEffect(() => {
    if (isOpen) {
      console.log('🎨 CookingModal opened with data:', {
        recipe: recipe?.name,
        cookingHistory,
        isFirstCook,
        cookedCount: cookingHistory?.cookedCount,
        averageRating: cookingHistory?.averageRating
      });
    }
  }, [isOpen, recipe, cookingHistory, isFirstCook]);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setRating(0);
      setHoveredRating(0);
      setNotes('');
      setIsSubmitting(false);
      setShowAllInsufficientItems(false);
      setHasLeftovers(false);
      setLeftoverServings(1);
    }
  }, [isOpen]);

  // Handle form submission
  const handleSubmit = async () => {
    // Validate rating on first cook
    if (isFirstCook && rating === 0) {
      alert('Please rate this recipe before marking it as cooked!');
      return;
    }

    setIsSubmitting(true);

    try {
      // Call the confirm handler with rating, notes, and leftover data
      await onConfirm(rating, notes, hasLeftovers, leftoverServings);
    } catch (error) {
      console.error('Error in cooking submission:', error);
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !recipe) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full animate-scale-in max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-6 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-white">
                {isFirstCook ? 'Cook & Rate Recipe' : 'Mark as Cooked'}
              </h3>
              <p className="text-green-100 text-sm mt-1">
                {recipe.name}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Cooking History (if not first cook) */}
          {!isFirstCook && cookingHistory && (
            <div className="mb-6 p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700">
                    You've cooked this <span className="font-bold text-blue-700">{cookingHistory.cookedCount}</span> time{cookingHistory.cookedCount !== 1 ? 's' : ''}
                  </p>
                  {cookingHistory.averageRating > 0 && (
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm text-gray-600">Average rating:</span>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            size={16}
                            className={star <= cookingHistory.averageRating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                          />
                        ))}
                        <span className="text-sm font-bold text-gray-700 ml-1">
                          {cookingHistory.averageRating.toFixed(1)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Rating Section */}
          <div className="mb-6">
            <label className="block text-sm font-bold text-gray-800 mb-3">
              How would you rate this recipe?
              {isFirstCook && <span className="text-red-600 ml-1">*</span>}
              {!isFirstCook && <span className="text-gray-500 text-xs ml-2">(optional)</span>}
            </label>
            <div className="flex items-center gap-3">
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                    className="focus:outline-none focus:ring-2 focus:ring-green-500 rounded transition-transform hover:scale-110"
                  >
                    <Star
                      size={40}
                      className={
                        star <= (hoveredRating || rating)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300 hover:text-yellow-200'
                      }
                    />
                  </button>
                ))}
              </div>
              {rating > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-gray-800">{rating}</span>
                  <span className="text-sm text-gray-600">
                    {rating === 5 && '🎉 Excellent!'}
                    {rating === 4 && '👍 Great!'}
                    {rating === 3 && '👌 Good'}
                    {rating === 2 && '😐 Okay'}
                    {rating === 1 && '😕 Not great'}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Notes Section */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes (optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="How did it turn out? Any modifications you made?"
              rows={3}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none"
            />
          </div>

          {/* ====================================================================
              LEFTOVER TRACKING SECTION
              ====================================================================
              WHY: Track leftovers to reduce food waste
              WHAT: Ask user if they have leftovers and how many servings
              WHERE: Saves to users/{userId}/leftovers in Firestore
              WHEN: After cooking, leftovers expire in 3 days by default
              ==================================================================== */}
          <div className="mb-6 p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={hasLeftovers}
                onChange={(e) => setHasLeftovers(e.target.checked)}
                className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
              />
              <span className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                🍱 Do you have leftovers?
              </span>
            </label>

            {/* Servings input - only show when hasLeftovers is checked */}
            {hasLeftovers && (
              <div className="mt-4 ml-8">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  How many servings left?
                </label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={leftoverServings}
                  onChange={(e) => setLeftoverServings(parseInt(e.target.value) || 1)}
                  className="w-32 px-3 py-2 border-2 border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="text-xs text-gray-500 mt-2">
                  📅 Will expire in 3 days (you can remove it earlier if needed)
                </p>
              </div>
            )}
          </div>

          {/* Insufficient Ingredients Warning */}
          {insufficientItems && insufficientItems.length > 0 && (
            <div className="mb-6 p-4 bg-yellow-50 border-2 border-yellow-300 rounded-lg">
              <div className="flex gap-3">
                <svg className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-yellow-900 mb-2">
                    ⚠️ Insufficient Ingredients
                  </p>
                  <p className="text-sm text-yellow-800 mb-3">
                    You don't have enough of some ingredients. Available ingredients will still be deducted if you continue.
                  </p>

                  {/* Scrollable ingredients list */}
                  <div
                    className={`space-y-2 ${
                      showAllInsufficientItems && insufficientItems.length > 5
                        ? 'max-h-48 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-yellow-400 scrollbar-track-yellow-100'
                        : ''
                    }`}
                  >
                    {(showAllInsufficientItems ? insufficientItems : insufficientItems.slice(0, 5)).map((item, index) => (
                      <div key={index} className="text-sm text-yellow-900 bg-white/50 px-3 py-2 rounded-md">
                        <span className="font-semibold capitalize">{item.name}:</span>{' '}
                        <span className="text-yellow-800">
                          need <span className="font-medium">{item.needed}</span>, have <span className="font-medium">{item.have}</span>
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Expand/Collapse button for long lists */}
                  {insufficientItems.length > 5 && (
                    <button
                      onClick={() => setShowAllInsufficientItems(!showAllInsufficientItems)}
                      className="mt-3 text-sm font-medium text-yellow-700 hover:text-yellow-900 underline decoration-dotted flex items-center gap-1 transition-colors"
                    >
                      {showAllInsufficientItems ? (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                          </svg>
                          Show less
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                          Show all {insufficientItems.length} items ({insufficientItems.length - 5} more)
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Pantry Deduction Info */}
          {canProceed && (!insufficientItems || insufficientItems.length === 0) && (
            <div className="mb-6 p-4 bg-green-50 border-2 border-green-200 rounded-lg">
              <div className="flex gap-3">
                <svg className="w-6 h-6 text-green-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <p className="text-sm text-green-800">
                  ✓ All ingredients are available in your pantry and will be deducted automatically
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
          <div className="flex gap-3">
            {/* Confirm Button */}
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || (isFirstCook && rating === 0)}
              className={`flex-1 py-3 px-4 rounded-lg font-bold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 ${
                isFirstCook && rating === 0
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : insufficientItems && insufficientItems.length > 0
                  ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600'
                  : 'bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700'
              }`}
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>
                    {insufficientItems && insufficientItems.length > 0
                      ? 'Cook Anyway'
                      : isFirstCook
                      ? 'Cook & Rate'
                      : 'Mark as Cooked'}
                  </span>
                </>
              )}
            </button>

            {/* Cancel Button */}
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 bg-gray-200 text-gray-800 py-3 px-4 rounded-lg hover:bg-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors font-medium"
            >
              Cancel
            </button>
          </div>

          {isFirstCook && rating === 0 && (
            <p className="text-sm text-red-600 text-center mt-3">
              Please rate the recipe before continuing
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default CookingModal;
