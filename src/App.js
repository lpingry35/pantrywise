import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { MealPlanProvider } from './context/MealPlanContext';
import MobileNav from './components/layout/MobileNav';
import DesktopNav from './components/layout/DesktopNav';
import WelcomeTutorial from './components/WelcomeTutorial';
import InstallBanner from './components/InstallBanner';
import Home from './pages/Home';
import RecipeLibrary from './pages/RecipeLibrary';
import RecipeDetail from './pages/RecipeDetail';
import AddRecipe from './pages/AddRecipe';
import MyPantry from './pages/MyPantry';
import MealPlanner from './pages/MealPlanner';
import ShoppingListPage from './pages/ShoppingListPage';
import StatsAndInsights from './pages/StatsAndInsights';
import InstallApp from './pages/InstallApp';
import FirebaseTest from './pages/FirebaseTest';
import FirebaseDebug from './pages/FirebaseDebug';
import Login from './pages/Login';
import Signup from './pages/Signup';

/**
 * Responsive Navigation Component
 * Shows MobileNav on screens < 768px (Tailwind 'md' breakpoint)
 * Shows DesktopNav on screens >= 768px
 */
function ResponsiveNav() {
  return (
    <>
      {/* Mobile Navigation - visible only on small screens */}
      <div className="md:hidden">
        <MobileNav />
      </div>

      {/* Desktop Navigation - visible only on medium+ screens */}
      <div className="hidden md:block">
        <DesktopNav />
      </div>
    </>
  );
}

// Protected Route wrapper - redirects to login if not authenticated
function ProtectedRoute({ children }) {
  const { currentUser } = useAuth();

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function App() {
  return (
    <AuthProvider>
      <MealPlanProvider>
        <Router>
          <div className="min-h-screen bg-gray-50">
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />

              {/* Protected Routes */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <>
                      <ResponsiveNav />
                      <Home />
                    </>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/recipes"
                element={
                  <ProtectedRoute>
                    <>
                      <ResponsiveNav />
                      <RecipeLibrary />
                    </>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/recipes/new"
                element={
                  <ProtectedRoute>
                    <>
                      <ResponsiveNav />
                      <AddRecipe />
                    </>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/recipes/:recipeId"
                element={
                  <ProtectedRoute>
                    <>
                      <ResponsiveNav />
                      <RecipeDetail />
                    </>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/pantry"
                element={
                  <ProtectedRoute>
                    <>
                      <ResponsiveNav />
                      <MyPantry />
                    </>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/meal-planner"
                element={
                  <ProtectedRoute>
                    <>
                      <ResponsiveNav />
                      <MealPlanner />
                    </>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/shopping-list"
                element={
                  <ProtectedRoute>
                    <>
                      <ResponsiveNav />
                      <ShoppingListPage />
                    </>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/stats"
                element={
                  <ProtectedRoute>
                    <>
                      <ResponsiveNav />
                      <StatsAndInsights />
                    </>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/install"
                element={
                  <ProtectedRoute>
                    <>
                      <ResponsiveNav />
                      <InstallApp />
                    </>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/firebase-test"
                element={
                  <ProtectedRoute>
                    <>
                      <ResponsiveNav />
                      <FirebaseTest />
                    </>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/firebase-debug"
                element={
                  <ProtectedRoute>
                    <>
                      <ResponsiveNav />
                      <FirebaseDebug />
                    </>
                  </ProtectedRoute>
                }
              />
            </Routes>

            {/* Welcome Tutorial - Shows on first visit for new users and guest accounts */}
            <WelcomeTutorial />

            {/* Install Banner - Prompts iOS users to install PWA */}
            <InstallBanner />
          </div>
        </Router>
      </MealPlanProvider>
    </AuthProvider>
  );
}

export default App;