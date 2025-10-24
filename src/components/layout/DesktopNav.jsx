import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Home, BookOpen, Package, Calendar, ShoppingCart, BarChart3, LogOut } from 'lucide-react';

/**
 * ============================================================================
 * DESKTOP NAVIGATION COMPONENT
 * ============================================================================
 *
 * PURPOSE:
 * Provides horizontal navigation bar for desktop screens >= 768px.
 * Same design as original Navigation.jsx, just separated for responsiveness.
 *
 * FEATURES:
 * - Horizontal layout with logo on left
 * - Navigation links in center
 * - User info and logout on right
 * - Guest mode badge and account creation
 * - Active link highlighting
 *
 * USED IN:
 * - App.jsx (conditionally rendered for desktop >= 768px)
 */

function DesktopNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, isGuest, logout } = useAuth();

  const isActive = (path) => {
    return location.pathname === path;
  };

  const handleLogout = async () => {
    try {
      await logout();
      console.log('✅ Logged out successfully');
      navigate('/login');
    } catch (error) {
      console.error('❌ Logout error:', error);
    }
  };

  // Navigation links with icons
  const navLinks = [
    { path: '/', label: 'Home', icon: Home, dataTour: null },
    { path: '/recipes', label: 'Recipes', icon: BookOpen, dataTour: 'recipe-library' },
    { path: '/pantry', label: 'My Pantry', icon: Package, dataTour: 'pantry' },
    { path: '/meal-planner', label: 'Meal Planner', icon: Calendar, dataTour: 'meal-planner' },
    { path: '/shopping-list', label: 'Shopping List', icon: ShoppingCart, dataTour: 'shopping-list' },
    { path: '/stats', label: 'Insights', icon: BarChart3, dataTour: 'insights' },
  ];

  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo/Brand */}
          <Link to="/" className="text-2xl font-bold text-primary">
            PantryWise
          </Link>

          {/* Navigation Links with Icons */}
          <div className="flex items-center gap-6">
            {navLinks.map((link) => {
              const IconComponent = link.icon;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive(link.path)
                      ? 'bg-primary text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  aria-label={link.label}
                  data-tour={link.dataTour || undefined}
                >
                  <IconComponent size={18} aria-hidden="true" />
                  <span>{link.label}</span>
                </Link>
              );
            })}

            {/* User Info and Logout/Exit */}
            <div className="flex items-center gap-3 ml-4 pl-4 border-l border-gray-300">
              {isGuest ? (
                <>
                  {/* Guest Mode Badge */}
                  <div className="flex items-center gap-2 px-3 py-1 bg-blue-100 border-2 border-blue-300 rounded-full">
                    <svg className="w-4 h-4 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span className="text-sm font-semibold text-blue-700">Guest Mode</span>
                  </div>

                  {/* Create Account Button */}
                  <button
                    onClick={() => navigate('/signup')}
                    className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700 transition-all"
                    title="Create account to save your data"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    <span>Create Account</span>
                  </button>

                  {/* Exit Guest Mode */}
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
                    title="Exit guest mode"
                  >
                    <LogOut size={18} />
                    <span>Exit</span>
                  </button>
                </>
              ) : (
                <>
                  {/* Regular User Email */}
                  <span className="text-sm text-gray-700">
                    {currentUser?.email}
                  </span>

                  {/* Logout Button */}
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                    title="Log out"
                  >
                    <LogOut size={18} />
                    <span>Logout</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default DesktopNav;
