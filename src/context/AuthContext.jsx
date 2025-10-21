import { createContext, useContext, useState, useEffect } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { auth } from '../firebase';

const AuthContext = createContext();

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [isGuest, setIsGuest] = useState(false);
  const [loading, setLoading] = useState(true);

  // Guest user object (mock user for guest mode)
  const guestUser = {
    uid: 'guest-user',
    email: 'Guest Mode',
    isGuest: true
  };

  // Check for guest mode in localStorage on mount
  useEffect(() => {
    const guestMode = localStorage.getItem('guestMode');
    if (guestMode === 'true') {
      setIsGuest(true);
      setLoading(false);
      console.log('👤 Restored guest mode from localStorage');
    }
  }, []);

  // Sign up with email and password
  const signup = async (email, password) => {
    return createUserWithEmailAndPassword(auth, email, password);
  };

  // Login with email and password
  const login = async (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  // Continue as guest
  const continueAsGuest = () => {
    setIsGuest(true);
    localStorage.setItem('guestMode', 'true');
    console.log('👤 Continued as guest');
  };

  // Exit guest mode
  const exitGuestMode = () => {
    setIsGuest(false);
    localStorage.removeItem('guestMode');
    // Clear all guest data from localStorage
    localStorage.removeItem('guestRecipes');
    localStorage.removeItem('guestMealPlan');
    localStorage.removeItem('guestSavedMealPlans');
    localStorage.removeItem('guestPantry');
    localStorage.removeItem('guestCookingHistory');
    console.log('👤 Exited guest mode - all guest data cleared');
  };

  // Logout
  const logout = async () => {
    if (isGuest) {
      exitGuestMode();
    } else {
      return signOut(auth);
    }
  };

  // Listen to auth state changes (only for real users, not guests)
  useEffect(() => {
    if (!isGuest) {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        setCurrentUser(user);
        setLoading(false);
        console.log('🔐 Auth state changed:', user ? `Logged in as ${user.email}` : 'Not logged in');
      });

      return unsubscribe;
    }
  }, [isGuest]);

  const value = {
    currentUser: isGuest ? guestUser : currentUser,
    isGuest,
    signup,
    login,
    logout,
    continueAsGuest,
    exitGuestMode,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
