import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { MealPlanProvider } from './context/MealPlanContext';
import Navigation from './components/Navigation';
import Home from './pages/Home';
import RecipeLibrary from './pages/RecipeLibrary';
import RecipeDetail from './pages/RecipeDetail';
import AddRecipe from './pages/AddRecipe';
import MyPantry from './pages/MyPantry';
import MealPlanner from './pages/MealPlanner';
import ShoppingListPage from './pages/ShoppingListPage';
import FirebaseTest from './pages/FirebaseTest';
import FirebaseDebug from './pages/FirebaseDebug';
import Login from './pages/Login';
import Signup from './pages/Signup';

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
                      <Navigation />
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
                      <Navigation />
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
                      <Navigation />
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
                      <Navigation />
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
                      <Navigation />
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
                      <Navigation />
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
                      <Navigation />
                      <ShoppingListPage />
                    </>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/firebase-test"
                element={
                  <ProtectedRoute>
                    <>
                      <Navigation />
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
                      <Navigation />
                      <FirebaseDebug />
                    </>
                  </ProtectedRoute>
                }
              />
            </Routes>
          </div>
        </Router>
      </MealPlanProvider>
    </AuthProvider>
  );
}

export default App;