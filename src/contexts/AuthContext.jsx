import { createContext, useContext, useEffect, useState } from 'react';
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile
} from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { auth } from '../config/firebase';
import app from '../config/firebase';

const AuthContext = createContext();

const ROLE_HIERARCHY = { admin: 3, 'content-manager': 2, viewer: 1 };

const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
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

  // Fetch the user's role from Firestore users/{uid} document
  const fetchUserRole = async (uid) => {
    try {
      const db = getFirestore(app);
      const userDoc = await getDoc(doc(db, 'users', uid));
      const role = userDoc.exists() ? (userDoc.data().role || 'viewer') : 'viewer';
      setUserRole(role);
    } catch (error) {
      console.error('Error fetching user role:', error);
      setUserRole('viewer');
    }
  };

  // Update user profile
  const updateUserProfile = async (displayName) => {
    if (currentUser) {
      await updateProfile(currentUser, { displayName });
    }
  };

  // Check if user meets the required role level
  const hasPermission = (requiredRole = 'viewer') => {
    if (!userRole) return false;
    return (ROLE_HIERARCHY[userRole] || 0) >= (ROLE_HIERARCHY[requiredRole] || 0);
  };

  // Auth state listener
  useEffect(() => {
    let unsubscribe;

    try {
      unsubscribe = onAuthStateChanged(auth, async (user) => {
        try {
          setCurrentUser(user);
          if (user) {
            await fetchUserRole(user.uid);
          } else {
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