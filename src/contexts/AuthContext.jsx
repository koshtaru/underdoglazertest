import { createContext, useContext, useEffect, useState } from 'react';
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile
} from 'firebase/auth';
import { auth } from '../config/firebase';

const AuthContext = createContext();

// Testing mode: Bypass Firebase authentication for localhost testing
const TESTING_MODE = false;

const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(TESTING_MODE ? { uid: 'test-user', email: 'test@example.com' } : null);
  const [userRole, setUserRole] = useState(TESTING_MODE ? 'admin' : null);
  const [loading, setLoading] = useState(TESTING_MODE ? false : true);
  const [authError, setAuthError] = useState(null);

  // Sign in function
  const login = async (email, password) => {
    setAuthError(null);
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      await fetchUserRole(result.user.uid);
      return result;
    } catch (error) {
      setAuthError(error.message);
      throw error;
    }
  };

  // Sign out function
  const logout = async () => {
    setAuthError(null);
    try {
      await signOut(auth);
      setUserRole(null);
    } catch (error) {
      setAuthError(error.message);
      throw error;
    }
  };

  // Password reset function
  const resetPassword = async (email) => {
    setAuthError(null);
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      setAuthError(error.message);
      throw error;
    }
  };

  // Assign admin role to all authenticated users
  const fetchUserRole = async (uid) => {
    try {
      console.log('Assigning admin role for user:', uid);
      
      // All authenticated users get admin access
      const assignedRole = 'admin';
      
      console.log('Assigning role:', assignedRole);
      setUserRole(assignedRole);
      
    } catch (error) {
      console.error('Error assigning user role:', error);
      setUserRole('admin'); // Fallback to admin
    }
  };

  // Update user profile
  const updateUserProfile = async (displayName) => {
    if (currentUser) {
      await updateProfile(currentUser, { displayName });
    }
  };

  // Check if user has permission - all authenticated users have admin access
  const hasPermission = () => {
    // All authenticated users have full admin access
    return true;
  };

  // Auth state listener
  useEffect(() => {
    if (TESTING_MODE) {
      // Skip Firebase auth when in testing mode
      console.log('TESTING MODE: Using mock authentication');
      return;
    }
    
    let unsubscribe;
    
    try {
      unsubscribe = onAuthStateChanged(auth, async (user) => {
        try {
          setCurrentUser(user);
          if (user) {
            console.log('User logged in:', user.email);
            await fetchUserRole(user.uid);
          } else {
            console.log('User logged out');
            setUserRole(null);
          }
        } catch (error) {
          console.error('Auth state change error:', error);
          setAuthError('Authentication error occurred');
        } finally {
          setLoading(false);
        }
      });
    } catch (error) {
      console.error('Firebase initialization error:', error);
      // Fallback for development when Firebase is not configured
      console.warn('Firebase not configured properly, using development fallback');
      setCurrentUser({ email: 'dev@underdoglazer.com', uid: 'dev-user' });
      setUserRole('admin');
      setLoading(false);
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const value = {
    currentUser,
    userRole,
    login,
    logout,
    resetPassword,
    updateUserProfile,
    hasPermission,
    loading,
    authError,
    setAuthError
  };

  return (
    <AuthContext.Provider value={value}>
      {loading ? (
        <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--clr-bg)' }}>
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 mx-auto" style={{ borderColor: 'var(--clr-accent)' }}></div>
            <p className="mt-4 text-lg" style={{ color: 'var(--clr-text)' }}>Loading admin portal...</p>
          </div>
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};

export { useAuth };