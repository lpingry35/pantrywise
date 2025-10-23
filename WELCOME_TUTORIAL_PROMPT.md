# Welcome Tutorial / Onboarding Flow - Implementation Prompt

**FEATURE: Interactive welcome tutorial for new users and guest accounts**

**Priority:** High (helps users understand the app)  
**Time:** 2-3 hours  
**Difficulty:** 4/10 (Medium-Easy)  
**Status:** Ready to implement after security rules ✅

---

## Context

PantryWise needs a welcome tutorial to help new users understand how to use the app. Currently, new users see an empty app and may not know where to start or what the workflow is.

**Problem:**
- New users don't know where to begin
- Empty app can be confusing
- No guidance on the workflow (recipes → meal plan → shopping list)
- Lower user activation rate

**Solution:**
- Interactive 7-step tutorial
- Shows key features in order
- Quick (2 minutes)
- Skippable at any time
- Shows only once per browser (localStorage)

---

## Implementation Approach

### OPTION A: React Joyride (RECOMMENDED)

**Why Recommended:**
- Professional tour library
- Handles spotlight, tooltips, scrolling automatically
- Mobile responsive out of the box
- Well-maintained and popular
- Easy to implement

**Installation:**
```bash
npm install react-joyride
```

**Pros:**
- ✅ Professional appearance
- ✅ Less code to write
- ✅ Handles edge cases
- ✅ Battle-tested

**Cons:**
- ⚠️ External dependency (adds ~50KB)
- ⚠️ Less control over styling

---

### OPTION B: Custom Modal Tour (SIMPLER)

**Why Consider:**
- No external dependency
- Complete control over styling
- Simpler to understand
- Matches your exact brand

**Implementation:**
- Series of modals with arrows
- Manual positioning
- Custom spotlight overlay

**Pros:**
- ✅ No external dependency
- ✅ Full control
- ✅ Exact brand match

**Cons:**
- ⚠️ More code to write
- ⚠️ Manual positioning needed
- ⚠️ Have to handle edge cases

---

## RECOMMENDED: Use React Joyride (Option A)

For this prompt, we'll use React Joyride because it's faster and more professional.

---

## Tutorial Steps (7 Total)

### Step 1: Welcome Screen
**Location:** Home page or Recipe Library  
**Title:** "Welcome to PantryWise! 🎉"  
**Content:**
```
Let's show you around! This quick 2-minute tour will help you get started.

We'll show you how to:
• Import recipes from websites or add them manually
• Plan your weekly meals and save different meal plans
• Generate shopping lists automatically
• Reduce food waste and stay organized

Ready to start? Let's go! 🚀
```
**Button:** "Start Tour" (primary) / "Skip" (secondary)

---

### Step 2: Recipe Library
**Location:** Recipe Library page  
**Target:** Recipe cards section or "Add Recipe" button  
**Title:** "Your Recipe Library 📚"  
**Content:**
```
This is where all your recipes live. Start by importing recipes from any cooking website or add sample recipes to explore.

Click "Add Recipe" to import from sites like AllRecipes, Food Network, and more!
```
**Button:** "Next" / "Skip Tour"

---

### Step 3: Add Recipe Button
**Location:** Recipe Library page  
**Target:** "Add Recipe" button  
**Title:** "Import Recipes Easily 🔗"  
**Content:**
```
Paste any recipe URL and we'll automatically extract:
• Ingredients
• Instructions  
• Cook time & servings
• Even the photo!

You can also manually add your own recipes if you prefer.

Try it with your favorite recipes!
```
**Button:** "Next" / "Skip Tour"

---

### Step 4: Meal Planner
**Location:** Meal Planner page  
**Target:** Calendar grid  
**Title:** "Plan Your Week 📅"  
**Content:**
```
Click any meal slot to add a recipe. Plan breakfast, lunch, and dinner for the entire week!

You can save different meal plans (like "Budget Week" or "Keto Plan") and switch between them anytime.

Your meal plan automatically generates a shopping list with all the ingredients you need.
```
**Button:** "Next" / "Skip Tour"

---

### Step 5: My Pantry
**Location:** Pantry page  
**Target:** Pantry items list  
**Title:** "Track What You Have 🥫"  
**Content:**
```
Add ingredients you already have at home. The app will:
• Remove them from your shopping list
• Show you recipes you can make right now
• Track when leftovers expire

When you mark a meal as completed (click the checkmark on any recipe in your meal plan), ingredients are automatically deducted from your pantry!

Reduce waste by using what you have!
```
**Button:** "Next" / "Skip Tour"

---

### Step 6: Shopping List
**Location:** Shopping List page  
**Target:** Shopping list section  
**Title:** "Smart Shopping Lists 🛒"  
**Content:**
```
Your shopping list is automatically generated from your meal plan!

It's organized by:
• What you already have (in green)
• What you need to buy (by grocery store section)

You can also manually add other groceries you need. Check off items as you shop, then transfer them to your pantry!
```
**Button:** "Next" / "Skip Tour"

---

### Step 7: Insights (Final Step)
**Location:** Insights page  
**Target:** Stats cards  
**Title:** "Track Your Success 📊"  
**Content:**
```
See your cooking stats, favorite recipes, and how much waste you've reduced by using what you have!

You're all set! 🎉

Start by adding some recipes or loading sample recipes to explore. Happy meal planning!
```
**Button:** "Finish Tutorial" (primary) / "Restart Later" (secondary)

---

## Implementation Code

### File 1: Create `src/components/WelcomeTutorial.jsx`

```javascript
/**
 * ============================================================================
 * WELCOME TUTORIAL COMPONENT
 * ============================================================================
 * 
 * PURPOSE:
 * Interactive onboarding tour for new users and guest accounts.
 * Shows 7-step walkthrough of PantryWise features.
 * 
 * FEATURES:
 * - Uses React Joyride for professional tour experience
 * - Remembers completion in localStorage
 * - Can be restarted from settings
 * - Skippable at any time
 * - Mobile responsive
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

import React, { useState, useEffect } from 'react';
import Joyride, { STATUS } from 'react-joyride';
import { useAuth } from '../context/AuthContext';

function WelcomeTutorial() {
  const { user } = useAuth();
  const [runTour, setRunTour] = useState(false);
  
  // Check if user has seen tutorial before
  useEffect(() => {
    if (user) {
      const hasSeenTutorial = localStorage.getItem('pantrywise_hasSeenTutorial');
      
      // Show tutorial if:
      // 1. User hasn't seen it before
      // 2. OR it's a guest user (always show for guests)
      if (!hasSeenTutorial || user.isGuest) {
        // Delay to ensure app has loaded
        setTimeout(() => {
          setRunTour(true);
        }, 1000);
      }
    }
  }, [user]);
  
  // Tutorial steps configuration
  const steps = [
    {
      target: 'body',
      content: (
        <div>
          <h2 className="text-2xl font-bold mb-2">Welcome to PantryWise! 🎉</h2>
          <p className="mb-3">
            Let's show you around! This quick 2-minute tour will help you get started.
          </p>
          <p className="mb-2">We'll show you how to:</p>
          <ul className="list-disc list-inside mb-3 space-y-1">
            <li>Import recipes from websites or add them manually</li>
            <li>Plan your weekly meals and save different meal plans</li>
            <li>Generate shopping lists automatically</li>
            <li>Reduce food waste and stay organized</li>
          </ul>
          <p className="font-semibold">Ready to start? Let's go! 🚀</p>
        </div>
      ),
      placement: 'center',
      disableBeacon: true,
    },
    {
      target: '[data-tour="recipe-library"]',
      content: (
        <div>
          <h3 className="text-xl font-bold mb-2">Your Recipe Library 📚</h3>
          <p className="mb-2">
            This is where all your recipes live. Start by importing recipes from any 
            cooking website or add sample recipes to explore.
          </p>
          <p className="font-semibold">
            Click "Add Recipe" to import from sites like AllRecipes, Food Network, and more!
          </p>
        </div>
      ),
      placement: 'bottom',
    },
    {
      target: '[data-tour="add-recipe-button"]',
      content: (
        <div>
          <h3 className="text-xl font-bold mb-2">Import Recipes Easily 🔗</h3>
          <p className="mb-2">Paste any recipe URL and we'll automatically extract:</p>
          <ul className="list-disc list-inside mb-2 space-y-1">
            <li>Ingredients</li>
            <li>Instructions</li>
            <li>Cook time & servings</li>
            <li>Even the photo!</li>
          </ul>
          <p className="mb-2">You can also manually add your own recipes if you prefer.</p>
          <p className="font-semibold">Try it with your favorite recipes!</p>
        </div>
      ),
      placement: 'right',
    },
    {
      target: '[data-tour="meal-planner"]',
      content: (
        <div>
          <h3 className="text-xl font-bold mb-2">Plan Your Week 📅</h3>
          <p className="mb-2">
            Click any meal slot to add a recipe. Plan breakfast, lunch, and dinner 
            for the entire week!
          </p>
          <p className="mb-2">
            You can save different meal plans (like "Budget Week" or "Keto Plan") 
            and switch between them anytime.
          </p>
          <p className="font-semibold">
            Your meal plan automatically generates a shopping list with all the 
            ingredients you need.
          </p>
        </div>
      ),
      placement: 'bottom',
    },
    {
      target: '[data-tour="pantry"]',
      content: (
        <div>
          <h3 className="text-xl font-bold mb-2">Track What You Have 🥫</h3>
          <p className="mb-2">
            Add ingredients you already have at home. The app will:
          </p>
          <ul className="list-disc list-inside mb-2 space-y-1">
            <li>Remove them from your shopping list</li>
            <li>Show you recipes you can make right now</li>
            <li>Track when leftovers expire</li>
          </ul>
          <p className="mb-2">
            When you mark a meal as completed (click the checkmark on any recipe 
            in your meal plan), ingredients are automatically deducted from your pantry!
          </p>
          <p className="font-semibold">Reduce waste by using what you have!</p>
        </div>
      ),
      placement: 'bottom',
    },
    {
      target: '[data-tour="shopping-list"]',
      content: (
        <div>
          <h3 className="text-xl font-bold mb-2">Smart Shopping Lists 🛒</h3>
          <p className="mb-2">
            Your shopping list is automatically generated from your meal plan!
          </p>
          <p className="mb-2">It's organized by:</p>
          <ul className="list-disc list-inside mb-2 space-y-1">
            <li>What you already have (in green)</li>
            <li>What you need to buy (by grocery store section)</li>
          </ul>
          <p className="mb-2">
            You can also manually add other groceries you need.
          </p>
          <p className="font-semibold">
            Check off items as you shop, then transfer them to your pantry!
          </p>
        </div>
      ),
      placement: 'bottom',
    },
    {
      target: '[data-tour="insights"]',
      content: (
        <div>
          <h3 className="text-xl font-bold mb-2">Track Your Success 📊</h3>
          <p className="mb-3">
            See your cooking stats, favorite recipes, and how much waste you've 
            reduced by using what you have!
          </p>
          <p className="text-lg font-bold mb-2">You're all set! 🎉</p>
          <p>
            Start by adding some recipes or loading sample recipes to explore. 
            Happy meal planning!
          </p>
        </div>
      ),
      placement: 'bottom',
    },
  ];
  
  // Handle tour completion or skip
  const handleJoyrideCallback = (data) => {
    const { status } = data;
    
    // Check if tour finished or skipped
    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
      // Mark as seen in localStorage
      localStorage.setItem('pantrywise_hasSeenTutorial', 'true');
      setRunTour(false);
    }
  };
  
  // Joyride styling to match PantryWise theme
  const joyrideStyles = {
    options: {
      primaryColor: '#3b82f6', // PantryWise blue
      textColor: '#1f2937',
      backgroundColor: '#ffffff',
      arrowColor: '#ffffff',
      overlayColor: 'rgba(0, 0, 0, 0.5)',
      zIndex: 10000,
    },
    tooltip: {
      borderRadius: '8px',
      padding: '20px',
    },
    buttonNext: {
      backgroundColor: '#3b82f6',
      borderRadius: '6px',
      padding: '10px 20px',
      fontSize: '16px',
    },
    buttonBack: {
      color: '#6b7280',
      marginRight: '10px',
    },
    buttonSkip: {
      color: '#6b7280',
    },
  };
  
  return (
    <Joyride
      steps={steps}
      run={runTour}
      continuous
      showProgress
      showSkipButton
      callback={handleJoyrideCallback}
      styles={joyrideStyles}
      locale={{
        back: 'Back',
        close: 'Close',
        last: 'Finish Tutorial',
        next: 'Next',
        skip: 'Skip Tour',
      }}
    />
  );
}

export default WelcomeTutorial;
```

---

### File 2: Add Data Attributes to Navigation

Update your navigation component to include `data-tour` attributes:

```javascript
// In your Navigation component or wherever nav links are

<nav>
  <Link to="/recipes" data-tour="recipe-library">
    📚 Recipes
  </Link>
  
  <Link to="/meal-planner" data-tour="meal-planner">
    📅 Meal Planner
  </Link>
  
  <Link to="/pantry" data-tour="pantry">
    🥫 My Pantry
  </Link>
  
  <Link to="/shopping-list" data-tour="shopping-list">
    🛒 Shopping List
  </Link>
  
  <Link to="/insights" data-tour="insights">
    📊 Insights
  </Link>
</nav>
```

Also add to "Add Recipe" button in Recipe Library:
```javascript
<button data-tour="add-recipe-button">
  Add Recipe
</button>
```

---

### File 3: Add Tutorial to App.jsx

```javascript
// In App.jsx or your root component

import WelcomeTutorial from './components/WelcomeTutorial';

function App() {
  return (
    <div className="App">
      {/* Existing app structure */}
      <Navigation />
      <Routes>
        {/* Your routes */}
      </Routes>
      
      {/* Add Welcome Tutorial */}
      <WelcomeTutorial />
    </div>
  );
}
```

---

### File 4: Add "Restart Tutorial" Option

In your Settings page or Footer:

```javascript
// Add a button to restart the tutorial

function Settings() {
  const handleRestartTutorial = () => {
    // Remove the localStorage flag
    localStorage.removeItem('pantrywise_hasSeenTutorial');
    
    // Reload page to trigger tutorial
    window.location.reload();
  };
  
  return (
    <div>
      {/* Other settings */}
      
      <button
        onClick={handleRestartTutorial}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        🎓 Restart Welcome Tutorial
      </button>
    </div>
  );
}
```

---

## Testing Checklist

After implementation:

- [ ] Tutorial runs on first visit
- [ ] Tutorial shows all 7 steps
- [ ] Can skip at any time
- [ ] Spotlight highlights correct elements
- [ ] Navigation between steps works
- [ ] "Finish" button on last step works
- [ ] localStorage remembers completion
- [ ] Tutorial doesn't show again after completion
- [ ] "Restart Tutorial" button works
- [ ] Mobile responsive (test on phone)
- [ ] Tooltips position correctly
- [ ] No console errors
- [ ] Guest users always see tutorial
- [ ] Registered users see tutorial once

---

## LocalStorage Key

**Key:** `pantrywise_hasSeenTutorial`  
**Value:** `'true'` (string)  
**Purpose:** Remember if user has completed tutorial  
**Scope:** Per-browser (different on phone vs desktop is OK)  

To test again, run in console:
```javascript
localStorage.removeItem('pantrywise_hasSeenTutorial');
```
Then refresh page.

---

## Optional Enhancements

### 1. Add Progress Bar
```javascript
// In Joyride config
showProgress: true,
```

### 2. Add Sample Data Button
Add button at end of tutorial:
```javascript
<button onClick={loadSampleData}>
  Load Sample Recipes to Explore
</button>
```

### 3. Track Completion Analytics
```javascript
// After tutorial finishes
analytics.track('Tutorial Completed', {
  steps_viewed: data.step + 1,
  completed: true,
});
```

### 4. Different Tours for Different User Types
```javascript
// Show different tour for guest vs registered users
const steps = user.isGuest ? guestSteps : registeredSteps;
```

---

## Styling Notes

**PantryWise Theme Colors:**
- Primary Blue: `#3b82f6`
- Purple: `#9333ea`
- Text Dark: `#1f2937`
- Text Light: `#6b7280`

**Joyride will automatically:**
- Add spotlight effect
- Handle scrolling to elements
- Position tooltips responsively
- Work on mobile devices

---

## Success Criteria

Tutorial is successful if:
- ✅ New users understand the workflow
- ✅ Completion rate > 60%
- ✅ Users add first recipe within 5 minutes
- ✅ Users create first meal plan within 10 minutes
- ✅ Activation rate increases
- ✅ Support questions decrease

---

## Next Steps After Tutorial

Once user completes tutorial, consider:
1. Showing "Load Sample Recipes" button
2. Highlighting empty states with helpful tips
3. Adding tooltips to complex features
4. Email follow-up with tips and tricks

---

Please implement this welcome tutorial using React Joyride. This will significantly improve the new user experience and help users understand the app's workflow!
