// ============================================================================
// SAVED MEAL PLANS MANAGER COMPONENT - MODERN UI REDESIGN
// Phase 6.1 - Beautiful, engaging interface for managing meal plans
// ============================================================================

import { useState, useEffect } from 'react';
import { useMealPlan } from '../context/MealPlanContext';
import {
  saveNamedMealPlan,
  getAllSavedMealPlans,
  deleteSavedMealPlan
} from '../services/firestoreService';

/**
 * SavedMealPlansManager Component - Modern Redesign
 * Beautiful UI for saving, loading, and managing meal plans
 * @param {string} showOnlySection - 'save', 'library', or undefined (show both)
 */
function SavedMealPlansManager({ showOnlySection }) {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================

  const { mealPlan, setMealPlan, setCurrentPlanName, getFilledSlotsCount } = useMealPlan();

  const [savedPlans, setSavedPlans] = useState([]);
  const [planName, setPlanName] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // ============================================================================
  // LOAD SAVED PLANS ON MOUNT
  // ============================================================================

  useEffect(() => {
    loadSavedPlans();
  }, []);

  async function loadSavedPlans() {
    try {
      setFetching(true);
      const plans = await getAllSavedMealPlans();
      setSavedPlans(plans);
    } catch (error) {
      console.error('Error loading saved plans:', error);
      showMessage('error', 'Failed to load saved plans');
    } finally {
      setFetching(false);
    }
  }

  // ============================================================================
  // SAVE CURRENT MEAL PLAN
  // ============================================================================

  async function handleSavePlan() {
    if (!planName.trim()) {
      showMessage('error', 'Please enter a name for your meal plan');
      return;
    }

    const filledSlots = getFilledSlotsCount();
    if (filledSlots === 0) {
      showMessage('error', 'Cannot save an empty meal plan. Add some recipes first!');
      return;
    }

    try {
      setLoading(true);
      await saveNamedMealPlan(planName.trim(), mealPlan);

      // Update current plan name
      setCurrentPlanName(planName.trim());

      setPlanName('');
      showMessage('success', `Meal plan "${planName.trim()}" saved successfully!`);
      await loadSavedPlans();
    } catch (error) {
      console.error('Error saving meal plan:', error);
      showMessage('error', 'Failed to save meal plan. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  // ============================================================================
  // LOAD SAVED MEAL PLAN
  // ============================================================================

  async function handleLoadPlan(savedPlan) {
    try {
      setLoading(true);
      setMealPlan(savedPlan.mealPlan);
      setCurrentPlanName(savedPlan.name); // Update current plan name
      showMessage('success', `Loaded "${savedPlan.name}" successfully!`);
    } catch (error) {
      console.error('Error loading meal plan:', error);
      showMessage('error', 'Failed to load meal plan. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  // ============================================================================
  // DELETE SAVED MEAL PLAN
  // ============================================================================

  function confirmDelete(planId) {
    setDeleteConfirm(planId);
  }

  function cancelDelete() {
    setDeleteConfirm(null);
  }

  async function handleDeletePlan(planId) {
    try {
      setLoading(true);
      const plan = savedPlans.find(p => p.id === planId);
      const planNameToDelete = plan?.name || 'Meal plan';

      await deleteSavedMealPlan(planId);
      showMessage('success', `"${planNameToDelete}" deleted successfully`);
      await loadSavedPlans();
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Error deleting meal plan:', error);
      showMessage('error', 'Failed to delete meal plan. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  // ============================================================================
  // HELPER FUNCTIONS
  // ============================================================================

  function showMessage(type, text) {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  }

  function formatDate(timestamp) {
    if (!timestamp) return 'Unknown date';
    try {
      const date = timestamp.toDate();
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch (error) {
      return 'Unknown date';
    }
  }

  function countRecipes(mealPlanData) {
    let count = 0;
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const meals = ['breakfast', 'lunch', 'dinner'];
    days.forEach(day => {
      meals.forEach(meal => {
        if (mealPlanData[day]?.[meal]) count++;
      });
    });
    return count;
  }

  // ============================================================================
  // RENDER COMPONENT
  // ============================================================================

  // Determine which sections to show
  const showSave = !showOnlySection || showOnlySection === 'save';
  const showLibrary = !showOnlySection || showOnlySection === 'library';

  return (
    <div className="relative">
      {/* Success/Error Message - Floating Notification */}
      {message.text && (
        <div className="fixed top-4 right-4 z-50 animate-slide-in-right">
          <div
            className={`
              min-w-[320px] max-w-md rounded-xl shadow-2xl p-4 border-l-4
              transform transition-all duration-300 ease-out
              ${message.type === 'success'
                ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-500 text-green-800'
                : 'bg-gradient-to-r from-red-50 to-rose-50 border-red-500 text-red-800'
              }
            `}
          >
            <div className="flex items-center gap-3">
              {message.type === 'success' ? (
                <div className="flex-shrink-0 w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
              ) : (
                <div className="flex-shrink-0 w-10 h-10 bg-red-500 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
              <div className="flex-1">
                <p className="font-semibold">{message.text}</p>
              </div>
              <button
                onClick={() => setMessage({ type: '', text: '' })}
                className="flex-shrink-0 text-gray-500 hover:text-gray-700 transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Save Section */}
      {showSave && (
        <div className="relative overflow-hidden rounded-2xl border-2 border-indigo-200 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
            {/* Decorative Background Pattern */}
            <div className="absolute inset-0 opacity-5">
              <div className="absolute top-0 left-0 w-40 h-40 bg-indigo-500 rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 right-0 w-40 h-40 bg-pink-500 rounded-full blur-3xl"></div>
            </div>

            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-800">Save Current Plan</h3>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={planName}
                    onChange={(e) => setPlanName(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSavePlan()}
                    placeholder="e.g., Budget Week, Keto Plan, Family Favorites..."
                    className="w-full px-5 py-3.5 bg-white border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-200 focus:border-indigo-500 transition-all duration-200 text-gray-800 placeholder-gray-400 shadow-sm font-medium"
                    disabled={loading}
                  />
                </div>
                <button
                  onClick={handleSavePlan}
                  disabled={loading || !planName.trim()}
                  className="px-8 py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed font-bold transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transform flex items-center justify-center gap-2 whitespace-nowrap"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Save Plan</span>
                    </>
                  )}
                </button>
              </div>

              <div className="mt-4 flex items-center gap-2 text-sm">
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/80 backdrop-blur-sm rounded-lg border border-indigo-200">
                  <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <span className="font-semibold text-indigo-900">
                    {getFilledSlotsCount()} recipe{getFilledSlotsCount() !== 1 ? 's' : ''} in current plan
                  </span>
                </div>
              </div>
            </div>
          </div>
      )}

      {/* Library Section */}
      {showLibrary && (
        <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          {/* Header with Gradient */}
          <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 px-8 py-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <div>
                <h2 className="text-3xl font-bold text-white mb-1">Meal Plan Library</h2>
                <p className="text-emerald-100">Browse and load your saved meal plans</p>
              </div>
            </div>
          </div>

          {/* Saved Plans List */}
          <div className="p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-800">Your Saved Plans</h3>
              </div>
              {savedPlans.length > 0 && (
                <div className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-full font-bold shadow-lg">
                  {savedPlans.length} {savedPlans.length === 1 ? 'Plan' : 'Plans'}
                </div>
              )}
            </div>

            {fetching ? (
              // Loading State - Modern Spinner
              <div className="flex flex-col items-center justify-center py-16 space-y-4">
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-indigo-200 rounded-full"></div>
                  <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin absolute top-0"></div>
                </div>
                <p className="text-gray-600 font-medium">Loading your meal plans...</p>
              </div>
            ) : savedPlans.length === 0 ? (
              // Empty State - Beautiful Illustration
              <div className="flex flex-col items-center justify-center py-16 px-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border-2 border-dashed border-gray-300">
                <div className="w-24 h-24 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center mb-6 shadow-lg">
                  <svg className="w-14 h-14 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h4 className="text-2xl font-bold text-gray-700 mb-2">No Saved Plans Yet</h4>
                <p className="text-gray-500 text-center max-w-md mb-6">
                  Start building your meal plan library! Save your first plan above to organize and reuse your favorite weekly menus.
                </p>
                <div className="flex items-center gap-2 text-sm text-gray-600 bg-white px-4 py-2 rounded-lg border border-gray-200">
                  <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Tip: Add recipes to your calendar, then save the plan above</span>
                </div>
              </div>
            ) : (
              // Plans Grid - Modern Card Layout
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {savedPlans.map((plan) => (
                  <div
                    key={plan.id}
                    className="group relative bg-white rounded-2xl border-2 border-gray-200 hover:border-indigo-400 transition-all duration-300 overflow-hidden shadow-md hover:shadow-2xl hover:-translate-y-1 transform"
                  >
                    {/* Gradient Top Bar */}
                    <div className="h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>

                    {/* Card Content */}
                    <div className="p-6">
                      {/* Plan Name */}
                      <div className="mb-4">
                        <h4 className="text-xl font-bold text-gray-800 mb-2 line-clamp-2 group-hover:text-indigo-600 transition-colors">
                          {plan.name}
                        </h4>
                      </div>

                      {/* Metadata */}
                      <div className="space-y-2 mb-6">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                            <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <span className="font-medium">{formatDate(plan.createdAt)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                            <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                          </div>
                          <span className="font-medium">
                            {countRecipes(plan.mealPlan)} recipe{countRecipes(plan.mealPlan) !== 1 ? 's' : ''}
                          </span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleLoadPlan(plan)}
                          disabled={loading}
                          className="flex-1 px-4 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl hover:from-emerald-600 hover:to-teal-600 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed font-bold transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2 group"
                        >
                          <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                          </svg>
                          <span>Load</span>
                        </button>
                        <button
                          onClick={() => confirmDelete(plan.id)}
                          disabled={loading}
                          className="px-4 py-3 bg-gradient-to-r from-red-500 to-rose-500 text-white rounded-xl hover:from-red-600 hover:to-rose-600 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed font-bold transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center group"
                        >
                          <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal - Modern Design */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl transform animate-scale-in border-t-4 border-red-500">
            {/* Icon */}
            <div className="w-16 h-16 bg-gradient-to-br from-red-100 to-rose-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>

            {/* Content */}
            <h3 className="text-2xl font-bold text-gray-800 mb-3 text-center">Delete Meal Plan?</h3>
            <p className="text-gray-600 mb-6 text-center leading-relaxed">
              Are you sure you want to delete{' '}
              <span className="font-bold text-gray-800">
                "{savedPlans.find(p => p.id === deleteConfirm)?.name}"
              </span>
              ? This action cannot be undone.
            </p>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={cancelDelete}
                disabled={loading}
                className="flex-1 px-6 py-3.5 bg-gray-200 text-gray-800 rounded-xl hover:bg-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed font-bold transition-all duration-200 hover:shadow-lg"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeletePlan(deleteConfirm)}
                disabled={loading}
                className="flex-1 px-6 py-3.5 bg-gradient-to-r from-red-500 to-rose-500 text-white rounded-xl hover:from-red-600 hover:to-rose-600 disabled:from-red-300 disabled:to-rose-300 disabled:cursor-not-allowed font-bold transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    <span>Delete</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add custom animations to Tailwind */}
      <style jsx>{`
        @keyframes slide-in-right {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes scale-in {
          from {
            transform: scale(0.9);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
        .animate-slide-in-right {
          animation: slide-in-right 0.3s ease-out;
        }
        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }
        .animate-scale-in {
          animation: scale-in 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}

export default SavedMealPlansManager;
