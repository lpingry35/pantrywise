# Smart Meal Planner - Lean MVP Development Plan
**Last Updated**: October 20, 2025

## Money-Saving Meal Planning with Ingredient Sharing
### 4-Week Launch Strategy

---

## ✅ COMPLETED PHASES

### Phase 1: Recipe Management ✅ COMPLETED
- Recipe library with CRUD operations
- Recipe detail view
- Add/Edit recipe form

### Phase 2: Recipe Management ✅ COMPLETED  
- Recipe filtering and search
- Recipe categories/tags

### Phase 3: Ingredient Matching ✅ COMPLETED
- Ingredient normalization logic
- Recipe matching algorithm
- Shared ingredients display

### Phase 4: Meal Planning & Shopping List ✅ COMPLETED
- 7-day meal planner grid
- Drag-and-drop or click-to-add recipes
- Shopping list generator
- Ingredient consolidation
- Cost savings calculator

### Phase 5: Pantry Tracking ✅ COMPLETED
- Pantry inventory management
- Pantry matching with recipes
- "You have X of Y ingredients" display

---

## ✅ PHASE 6: Polish & Launch Ready (95% COMPLETE)

**Timeline**: Days 29-28 (Week 4)  
**Status**: NEARLY COMPLETE

### ✅ Completed:
- **6.0 Firebase Testing & Verification** - Connected and working
- **6.1 Save & Load Meal Plans** ✅ (Completed Oct 20, 2025)
  - ✅ Save meal plans with custom names
  - ✅ Show list of saved meal plans
  - ✅ Load previous meal plans
  - ✅ Delete individual saved plans
  - ✅ UI improvements implemented
- **6.2 Data Persistence** - All data saves to Firebase
- **6.3 UI Polish** (Partial):
  - ✅ Confirmation dialogs before deleting
  - ✅ Success messages when saving
  - ⚠️ "Check console" message (minor issue)
  - ❓ Mobile-friendly design (untested)
- **6.4 Sample Data & Demo** - 20-25 recipes loaded

### ⬜ Remaining:
- Test mobile responsiveness
- Deploy to Vercel/Netlify

---

## 🔮 PHASE 7: Advanced Features (Post-MVP)

**Estimated Timeline**: Weeks 7+  
**Status**: IN PROGRESS - Working on 7.5.1

### ✅ Completed Items:
- **7.0 Home Page Redesign** ✅ COMPLETED
- **7.1.1 URL/Website Scraping** ✅ COMPLETED
  - Three-tier parsing strategy (JSON-LD, Microdata, HTML)
  - Comprehensive browser headers
  - Works with AllRecipes, Food Network, most schema.org sites
  - *Note*: Has TD-008 (833 lines, needs refactoring)
- **7.4.1 Unit Conversion System** ✅ COMPLETED
  - Volume-to-volume, weight-to-weight, count conversions
  - 400+ lines implemented
  - Handles conversion failures gracefully
- **7.5.1a Shopping List → Pantry Transfer (Basic)** ✅ COMPLETED (Oct 20, 2025)
  - Transfer purchased items to pantry
  - Prompt for actual quantities purchased (not recipe amounts)
  - User enters what they actually bought
  - Handle quantity additions for existing items
  - *Note*: ShoppingListPage.jsx now 800+ lines (TD-009)

### 🚧 In Progress:
- **7.5 Pantry Lifecycle Management** (Added Oct 20, 2025)
  
  **7.5.1b Common Package Suggestions** (Future Enhancement)
  - Show common retail package sizes (8 oz bag, 1 lb box, etc.)
  - Quick-select buttons for standard quantities
  - Learn from user patterns over time
  
  **7.5.1c Retail Intelligence** (Long-term)
  - Integrate with grocery store APIs
  - Show actual products and prices
  - Auto-suggest based on local store inventory
  
  **7.5.2 Recipe Completion Tracking** (Starting Now)
  - Mark recipes as "cooked/completed" from meal planner
  - Deduct used ingredients from pantry
  - Track cooking history
  - Handle partial quantities
  - Prevent negative pantry quantities
  
  **Questions to Consider When Implementing 7.5.2:**
  - Where should "Mark as Cooked" button live? (meal planner calendar, recipe cards, or both?)
  - How to handle partial recipe cooking? (if someone makes half a recipe)
  - Should we track cooking history? (show "You made this 3 times", help with suggestions)
  - How to handle insufficient pantry quantities? (warning with override option?)
  
  **7.5.3 Manual Pantry Editing** (NEW - Oct 20, 2025)
  - **Issue**: Users cook things outside of meal plans (leftovers, snacks, non-recipe meals)
  - **Solution**: Make every pantry item quantity editable
  - Features needed:
    - Edit quantity for any pantry item (increase or decrease)
    - Quick subtract buttons (-1 cup, -1/2 cup, etc.)
    - Delete individual items
    - Manual add items not from shopping
    - "Used for other cooking" quick deduction
  - **Use Cases**:
    - Made sandwiches (deduct bread, lunch meat)
    - Used ingredients for non-planned meals
    - Gave some ingredients to neighbor
    - Some food went bad
    - Manual corrections
  
  **7.5.4 Pantry Intelligence** (Future Enhancement - renamed from 7.5.3)
  - Low stock warnings
  - Expiration date tracking (optional)
  - Pantry analytics (most used ingredients)
  - Smart shopping suggestions based on pantry
  
  **Implementation Order:**
  1. Shopping → Pantry Transfer with quantity adjustment 🚧 CURRENT
  2. Recipe Completion Tracking (more complex, needs UI decisions)  
  3. Pantry Intelligence (analytics, future enhancement)

### ⬜ Not Started:
- **7.1.2 Screenshot/Image OCR**
- **7.1.3 Manual Ingredient Library**
- **7.1.4 Recipe Import from PDF/Document**
- **7.1.5 Google Search Integration**
- **7.2 User Accounts & Authentication**
- **7.3 Dietary Preferences**
- **7.4.2 Advanced Unit Features** (user preferences, temperature, etc.)
- **7.6 Shopping List & Meal Plan Clear Functions** (NEW - Oct 20, 2025)
  - **Issue**: Shopping list and meal plan are synchronized - need proper clear functionality
  - **Design Decision Needed**: How to handle clearing when they're connected
  
  **Option A: Clear Shopping List Regenerates from Meal Plan**
  - Clear Shopping List button clears and immediately regenerates from current meal plan
  - Useful for "recalculating" if something got messed up
  - Keeps meal plan as source of truth
  
  **Option B: Separate the Generation (Snapshot Model)**
  - Shopping list becomes a "snapshot" when generated
  - Changes to meal plan don't auto-update shopping list
  - User must explicitly regenerate
  - More control but less synchronized
  
  **Option C: Both Clear Buttons in Appropriate Places**
  - "Clear Meal Plan" on the Meal Planner page (where it belongs)
  - "Clear & Regenerate List" on Shopping List page
  - Each page manages its own data
  - Most explicit but potentially more complex
  
  **To Decide Later During Refactor**:
  - Which model best fits user workflow?
  - Should lists be synchronized or snapshots?
  - Where should clear functions live?
- **7.5 Pantry Lifecycle Management** (NEW - Added Oct 20, 2025)
  
  **7.5.1 Shopping List → Pantry Transfer**
  - Mark shopping list as "purchased/complete"
  - Auto-add all ingredients to pantry
  - Handle quantity additions for existing items
  - Show confirmation of transfer
  - Clear or archive completed shopping lists
  
  **7.5.2 Recipe Completion Tracking**
  - Mark recipes as "cooked/completed"
  - Deduct used ingredients from pantry
  - Track cooking history
  - Handle partial quantities
  - Prevent negative pantry quantities
  
  **Questions to Consider When Implementing:**
  - Where should "Mark as Cooked" button live? (meal planner calendar, recipe cards, or both?)
  - How to handle partial recipe cooking? (if someone makes half a recipe)
  - Should we track cooking history? (show "You made this 3 times", help with suggestions)
  - How to handle insufficient pantry quantities? (warning with override option?)
  
  **7.5.3 Pantry Intelligence** (Future Enhancement)
  - Low stock warnings
  - Expiration date tracking (optional)
  - Pantry analytics (most used ingredients)
  - Smart shopping suggestions based on pantry
  
  **Implementation Order:**
  1. Shopping → Pantry Transfer (simpler, immediate value)
  2. Recipe Completion Tracking (more complex, needs UI decisions)  
  3. Pantry Intelligence (analytics, future enhancement)

---

## 🐛 BUG TRACKER

### ✅ Fixed Bugs:
- **Bug #1**: Pantry Match Percentage Not Displaying ✅
- **Bug #2**: Missing Ingredients Display Incomplete ✅
- **Bug #3**: Shopping List Not Combining Ingredients ✅
- **Bug #4**: Singular/Plural Unit Mismatch ✅
- **Bug #5**: No Partial Matches Shown ✅
- **Bug #6**: Recipe URL Import Fails on Some Sites ✅

### 🎯 No Open Bugs!

---

## 🔧 TECHNICAL DEBT STATUS

**Total Items**: 10 (See separate Technical Debt Tracker document for details)  
**Completed**: 0  
**High Priority**: 3 (TD-001, TD-008, TD-009)  
**Critical Issue**: ShoppingListPage.jsx now 800+ lines (TD-009)

---

## 📋 IMMEDIATE NEXT STEPS

### ✅ Completed:
- ~~Complete Phase 6.1 (Meal Plan Management)~~ ✅ Done Oct 20, 2025

### 🚧 Currently Working On:
**Phase 7.5.1 - Shopping List → Pantry Transfer**
- Claude Code is implementing this feature
- Will allow automatic transfer of purchased items to pantry
- Smart quantity merging for existing items

### 📝 Next in Queue:
1. **Test mobile responsiveness** (Phase 6 completion)
2. **Deploy to Vercel/Netlify** (Phase 6 completion)  
3. **Phase 7.5.2** - Recipe Completion → Pantry Deduction
4. **TD-008** - Refactor 833-line function (Critical tech debt)

---

## 🚀 LAUNCH CHECKLIST

### Before Launch:
- ✅ Complete Phase 6.1 (meal plan saves)
- ⬜ Fix "check console" message (minor)
- ⬜ Test mobile responsive
- ⬜ Deploy to Vercel
- ⬜ Test with 5-10 beta users

### MVP Success Criteria:
- ✅ Users can browse and search recipes
- ✅ Users can manually add new recipes
- ✅ Users can plan a full week of meals
- ✅ Users see which recipes share ingredients
- ✅ Users see a consolidated shopping list
- ✅ Users see how much they're saving
- ✅ Data persists between sessions
- ✅ Users can save/load multiple meal plans
- ✅ Mobile-friendly design (assumed, needs testing)
- ⬜ Deployed and accessible online

---

## 📈 PROGRESS SUMMARY

**Last Updated**: October 20, 2025 (Evening)

- **Phases 1-5**: 100% Complete ✅
- **Phase 6**: 95% Complete ✅ (just needs mobile test & deployment)
- **Phase 7**: 3.5/11 features complete (32%) - 7.5.1 in progress
- **Bugs**: 0 remaining ✅
- **Technical Debt**: 0/7 addressed ⚠️
- **Overall MVP**: ~95% Complete

**Estimated Hours to Full MVP Launch**: 2-3 hours
- Test mobile: 30 minutes
- Deploy to Vercel: 1-2 hours
- Final testing: 30 minutes

**Currently Active Development**: Phase 7.5.1 (Shopping → Pantry Transfer)