import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Menu, X, Home, BookOpen, Package, Calendar, ShoppingCart, BarChart3, LogOut } from 'lucide-react';

/**
 * ============================================================================
 * MOBILE NAVIGATION COMPONENT
 * ============================================================================
 *
 * PURPOSE:
 * Provides a mobile-friendly hamburger menu navigation for screens < 768px.
 * Eliminates white space caused by wrapping navigation items on mobile.
 *
 * FEATURES:
 * - Compact top header (60px height)
 * - Hamburger menu icon that opens slide-out panel
 * - Full-screen overlay when menu is open
 * - Smooth slide-in animation from right
 * - Large touch-friendly navigation buttons
 * - Guest mode badge and account creation
 * - Logout/Exit functionality
 *
 * USED IN:
 * - App.jsx (conditionally rendered for mobile < 768px)
 */

function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
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
      setIsOpen(false); // Close menu after logout
    } catch (error) {
      console.error('❌ Logout error:', error);
    }
  };

  const handleNavClick = () => {
    setIsOpen(false); // Close menu when navigating
  };

  // Navigation links with icons
  const navLinks = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/recipes', label: 'Recipes', icon: BookOpen },
    { path: '/pantry', label: 'My Pantry', icon: Package },
    { path: '/meal-planner', label: 'Meal Planner', icon: Calendar },
    { path: '/shopping-list', label: 'Shopping List', icon: ShoppingCart },
    { path: '/stats', label: 'Insights', icon: BarChart3 },
  ];

  return (
    <>
      {/* ===================================================================
          TOP HEADER - Compact mobile header (60px)
          ===================================================================
          Always visible, contains logo and hamburger menu button
      */}
      <nav className="bg-white shadow-md fixed top-0 left-0 right-0 z-40">
        <div className="flex items-center justify-between h-16 px-4">
          {/* Logo/Brand */}
          <Link to="/" className="text-2xl font-bold text-primary" onClick={handleNavClick}>
            PantryWise
          </Link>

          {/* Hamburger Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
            aria-label="Toggle menu"
          >
            {isOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </nav>

      {/* Add padding to content to prevent it from going under fixed header */}
      <div className="h-16" />

      {/* ===================================================================
          OVERLAY - Dark background when menu is open
          ===================================================================
          Clicking overlay closes the menu
      */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* ===================================================================
          SLIDE-OUT MENU PANEL
          ===================================================================
          Slides in from right side of screen
          Full height with scrolling if needed
      */}
      <div
        className={`fixed top-0 right-0 h-full w-80 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Menu Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">Menu</h2>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
            aria-label="Close menu"
          >
            <X size={24} />
          </button>
        </div>

        {/* Scrollable Menu Content */}
        <div className="overflow-y-auto h-full pb-24">
          {/* Navigation Links */}
          <div className="p-4 space-y-2">
            {navLinks.map((link) => {
              const IconComponent = link.icon;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={handleNavClick}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium transition-colors ${
                    isActive(link.path)
                      ? 'bg-primary text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <IconComponent size={20} />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Divider */}
          <div className="border-t border-gray-200 my-4" />

          {/* User Info Section */}
          <div className="p-4 space-y-3">
            {isGuest ? (
              <>
                {/* Guest Mode Badge */}
                <div className="flex items-center gap-2 px-4 py-2 bg-blue-100 border-2 border-blue-300 rounded-lg">
                  <svg className="w-5 h-5 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span className="text-sm font-semibold text-blue-700">Guest Mode</span>
                </div>

                {/* Create Account Button */}
                <button
                  onClick={() => {
                    navigate('/signup');
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-base font-medium bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700 transition-all"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span>Create Account</span>
                </button>

                {/* Exit Guest Mode */}
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-base font-medium text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  <LogOut size={20} />
                  <span>Exit Guest Mode</span>
                </button>
              </>
            ) : (
              <>
                {/* Regular User Email */}
                <div className="px-4 py-2 bg-gray-100 rounded-lg">
                  <p className="text-sm text-gray-600">Signed in as</p>
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {currentUser?.email}
                  </p>
                </div>

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-base font-medium text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut size={20} />
                  <span>Logout</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default MobileNav;
