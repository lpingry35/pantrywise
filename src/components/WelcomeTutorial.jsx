/**
 * ============================================================================
 * WELCOME TUTORIAL COMPONENT (Custom Modal-Based)
 * ============================================================================
 *
 * PURPOSE:
 * Interactive onboarding tour for new users and guest accounts.
 * Shows 7-step walkthrough of PantryWise features using custom modals.
 *
 * FEATURES:
 * - Custom modal-based tutorial (React 19 compatible)
 * - Remembers completion in localStorage
 * - Can be restarted from settings
 * - Skippable at any time
 * - Mobile responsive
 * - Progress indicator
 *
 * TRIGGERS:
 * - First-time visitors (hasSeenTutorial = false)
 * - New account creation
 * - Guest users
 * - Manual restart from settings
 *
 * USAGE:
 * <WelcomeTutorial />
 *
 * Add this component to App.jsx at the root level.
 */

import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

function WelcomeTutorial() {
  const { currentUser } = useAuth();
  const [showTutorial, setShowTutorial] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  // Tutorial steps configuration
  const steps = [
    {
      title: "Welcome to PantryWise! 🎉",
      content: (
        <div>
          <p className="mb-3">
            Let's show you around! This quick 2-minute tour will help you get started.
          </p>
          <p className="mb-2 font-semibold">We'll show you how to:</p>
          <ul className="list-disc list-inside mb-3 space-y-1 text-gray-700">
            <li>Import recipes from websites or add them manually</li>
            <li>Plan your weekly meals and save different meal plans</li>
            <li>Generate shopping lists automatically</li>
            <li>Reduce food waste and stay organized</li>
          </ul>
          <p className="font-semibold text-primary">Ready to start? Let's go! 🚀</p>
        </div>
      ),
    },
    {
      title: "Your Recipe Library 📚",
      content: (
        <div>
          <p className="mb-2">
            This is where all your recipes live. Start by importing recipes from any
            cooking website or add sample recipes to explore.
          </p>
          <p className="font-semibold text-primary">
            Click "Add Recipe" (in the Recipes page) to import from sites like AllRecipes,
            Food Network, and more!
          </p>
        </div>
      ),
    },
    {
      title: "Import Recipes Easily 🔗",
      content: (
        <div>
          <p className="mb-2">Paste any recipe URL and we'll automatically extract:</p>
          <ul className="list-disc list-inside mb-2 space-y-1 text-gray-700">
            <li>Ingredients</li>
            <li>Instructions</li>
            <li>Cook time & servings</li>
            <li>Even the photo!</li>
          </ul>
          <p className="mb-2">You can also manually add your own recipes if you prefer.</p>
          <p className="font-semibold text-primary">Try it with your favorite recipes!</p>
        </div>
      ),
    },
    {
      title: "Plan Your Week 📅",
      content: (
        <div>
          <p className="mb-2">
            Click any meal slot to add a recipe. Plan breakfast, lunch, and dinner
            for the entire week!
          </p>
          <p className="mb-2">
            You can save different meal plans (like "Budget Week" or "Keto Plan")
            and switch between them anytime.
          </p>
          <p className="font-semibold text-primary">
            Your meal plan automatically generates a shopping list with all the
            ingredients you need.
          </p>
        </div>
      ),
    },
    {
      title: "Track What You Have 🥫",
      content: (
        <div>
          <p className="mb-2">
            Add ingredients you already have at home. The app will:
          </p>
          <ul className="list-disc list-inside mb-2 space-y-1 text-gray-700">
            <li>Remove them from your shopping list</li>
            <li>Show you recipes you can make right now</li>
            <li>Track when leftovers expire</li>
          </ul>
          <p className="mb-2">
            When you mark a meal as completed (click the checkmark on any recipe
            in your meal plan), ingredients are automatically deducted from your pantry!
          </p>
          <p className="font-semibold text-primary">Reduce waste by using what you have!</p>
        </div>
      ),
    },
    {
      title: "Smart Shopping Lists 🛒",
      content: (
        <div>
          <p className="mb-2">
            Your shopping list is automatically generated from your meal plan!
          </p>
          <p className="mb-2">It's organized by:</p>
          <ul className="list-disc list-inside mb-2 space-y-1 text-gray-700">
            <li>What you already have (in green)</li>
            <li>What you need to buy (by grocery store section)</li>
          </ul>
          <p className="mb-2">
            You can also manually add other groceries you need.
          </p>
          <p className="font-semibold text-primary">
            Check off items as you shop, then transfer them to your pantry!
          </p>
        </div>
      ),
    },
    {
      title: "Track Your Success 📊",
      content: (
        <div>
          <p className="mb-3">
            See your cooking stats, favorite recipes, and how much waste you've
            reduced by using what you have!
          </p>
          <p className="text-lg font-bold mb-2 text-primary">You're all set! 🎉</p>
          <p>
            Start by adding some recipes or loading sample recipes to explore.
            Happy meal planning!
          </p>
        </div>
      ),
    },
  ];

  // Check if user has seen tutorial before
  useEffect(() => {
    if (currentUser) {
      const hasSeenTutorial = localStorage.getItem('pantrywise_hasSeenTutorial');

      // Show tutorial if:
      // 1. User hasn't seen it before
      // 2. OR it's a guest user (always show for guests)
      if (!hasSeenTutorial || currentUser.isAnonymous) {
        // Delay to ensure app has loaded
        setTimeout(() => {
          setShowTutorial(true);
        }, 1000);
      }
    }
  }, [currentUser]);

  // Handle navigation
  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleFinish();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    localStorage.setItem('pantrywise_hasSeenTutorial', 'true');
    setShowTutorial(false);
    setCurrentStep(0);
  };

  const handleFinish = () => {
    localStorage.setItem('pantrywise_hasSeenTutorial', 'true');
    setShowTutorial(false);
    setCurrentStep(0);
  };

  if (!showTutorial) return null;

  const step = steps[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === steps.length - 1;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 rounded-t-lg">
          <h2 className="text-2xl font-bold text-white mb-2">{step.title}</h2>
          {/* Progress indicator */}
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-white bg-opacity-30 rounded-full h-2">
              <div
                className="bg-white h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
              />
            </div>
            <span className="text-white text-sm font-medium">
              {currentStep + 1} / {steps.length}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="text-gray-800">{step.content}</div>
        </div>

        {/* Footer with navigation buttons */}
        <div className="p-6 pt-0 flex justify-between items-center gap-4">
          <button
            onClick={handleSkip}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
          >
            Skip Tour
          </button>

          <div className="flex gap-2">
            {!isFirstStep && (
              <button
                onClick={handleBack}
                className="px-6 py-2 border-2 border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 font-medium transition-colors"
              >
                Back
              </button>
            )}
            <button
              onClick={handleNext}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium transition-colors shadow-md hover:shadow-lg"
            >
              {isLastStep ? 'Finish Tutorial' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default WelcomeTutorial;
