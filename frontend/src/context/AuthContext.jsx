import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  auth, 
  googleProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  isFirebaseConfigured 
} from '../firebase/config';

const AuthContext = createContext();

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);

  // Check if we should use Mock Auth
  const isMock = !isFirebaseConfigured || import.meta.env.VITE_MOCK_MODE === 'true';

  // Load token and user session on mount
  useEffect(() => {
    async function initAuth() {
      if (isMock) {
        // Mock Session Restore
        const savedToken = localStorage.getItem('gs_token');
        const savedUser = localStorage.getItem('gs_user');
        if (savedToken && savedUser) {
          setToken(savedToken);
          setUser(JSON.parse(savedUser));
          // Sync profile from backend if backend is running
          try {
            const res = await fetch(`${API_URL}/auth/me`, {
              headers: { 'Authorization': `Bearer ${savedToken}` }
            });
            if (res.ok) {
              const data = await res.json();
              setUser(data.user);
              localStorage.setItem('gs_user', JSON.stringify(data.user));
            }
          } catch (e) {
            console.warn('Backend sync failed, using offline mock profile.');
          }
        }
        setLoading(false);
      } else {
        // Firebase Session Listen
        const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
          if (firebaseUser) {
            try {
              const idToken = await firebaseUser.getIdToken();
              setToken(idToken);
              localStorage.setItem('gs_token', idToken);
              
              // Call login API to sync profile
              const res = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${idToken}`
                }
              });
              
              if (res.ok) {
                const data = await res.json();
                setUser(data.user);
                localStorage.setItem('gs_user', JSON.stringify(data.user));
              } else {
                console.error('Failed to sync profile with server');
              }
            } catch (err) {
              console.error('Auth sync error:', err);
            }
          } else {
            setUser(null);
            setToken(null);
            localStorage.removeItem('gs_token');
            localStorage.removeItem('gs_user');
          }
          setLoading(false);
        });

        return unsubscribe;
      }
    }

    initAuth();
  }, [isMock]);

  // Email Login
  const loginWithEmail = async (email, password) => {
    setLoading(true);
    try {
      if (isMock) {
        // Simulate local validation
        const mockName = email.split('@')[0];
        const formattedName = mockName.charAt(0).toUpperCase() + mockName.slice(1);
        const mockToken = `mock-token-${email}|${formattedName}`;
        
        // Fetch to trigger sync on server in-memory database
        const res = await fetch(`${API_URL}/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${mockToken}`
          }
        });

        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
          setToken(mockToken);
          localStorage.setItem('gs_token', mockToken);
          localStorage.setItem('gs_user', JSON.stringify(data.user));
          setLoading(false);
          return { success: true };
        } else {
          throw new Error('Server mock verification failed');
        }
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        return { success: true };
      }
    } catch (error) {
      setLoading(false);
      return { success: false, error: error.message };
    }
  };

  // Register with Email
  const registerWithEmail = async (name, email, password, state, city) => {
    setLoading(true);
    try {
      if (isMock) {
        const mockToken = `mock-token-${email}|${name}`;
        
        // Sync with mock/live DB to create profile first
        // We PUT the state/city details during the first login callback
        const registerResponse = await fetch(`${API_URL}/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${mockToken}`
          }
        });

        if (registerResponse.ok) {
          const registerData = await registerResponse.json();
          
          // Now update details
          const updateRes = await fetch(`${API_URL}/users/profile`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${mockToken}`
            },
            body: JSON.stringify({ name, state, city })
          });

          if (updateRes.ok) {
            const updatedData = await updateRes.json();
            setUser(updatedData.user);
            setToken(mockToken);
            localStorage.setItem('gs_token', mockToken);
            localStorage.setItem('gs_user', JSON.stringify(updatedData.user));
            setLoading(false);
            return { success: true };
          }
        }
        throw new Error('Server registration sync failed');
      } else {
        // 1. Create firebase auth user
        const credential = await createUserWithEmailAndPassword(auth, email, password);
        const idToken = await credential.user.getIdToken();
        
        // 2. Sync profile
        const syncRes = await fetch(`${API_URL}/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${idToken}`
          }
        });

        if (syncRes.ok) {
          // 3. Set state and city
          const updateRes = await fetch(`${API_URL}/users/profile`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${idToken}`
            },
            body: JSON.stringify({ name, state, city })
          });
          
          if (updateRes.ok) {
            const updatedData = await updateRes.json();
            setUser(updatedData.user);
            setToken(idToken);
            localStorage.setItem('gs_token', idToken);
            localStorage.setItem('gs_user', JSON.stringify(updatedData.user));
            setLoading(false);
            return { success: true };
          }
        }
        throw new Error('Registration profile syncing failed.');
      }
    } catch (error) {
      setLoading(false);
      return { success: false, error: error.message };
    }
  };

  // Google Login
  const loginWithGoogle = async () => {
    setLoading(true);
    try {
      if (isMock) {
        // Simulated google login
        const email = 'google.citizen@greensteps.in';
        const name = 'Google Green Citizen';
        const mockToken = `mock-token-${email}|${name}`;

        const res = await fetch(`${API_URL}/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${mockToken}`
          }
        });

        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
          setToken(mockToken);
          localStorage.setItem('gs_token', mockToken);
          localStorage.setItem('gs_user', JSON.stringify(data.user));
          setLoading(false);
          return { success: true };
        } else {
          throw new Error('Google mock verification failed');
        }
      } else {
        await signInWithPopup(auth, googleProvider);
        return { success: true };
      }
    } catch (error) {
      setLoading(false);
      return { success: false, error: error.message };
    }
  };

  // Logout
  const logout = async () => {
    setLoading(true);
    if (isMock) {
      setUser(null);
      setToken(null);
      localStorage.removeItem('gs_token');
      localStorage.removeItem('gs_user');
      setLoading(false);
    } else {
      await signOut(auth);
      setUser(null);
      setToken(null);
      localStorage.removeItem('gs_token');
      localStorage.removeItem('gs_user');
      setLoading(false);
    }
  };

  // Update Profile on server & context
  const updateUserProfile = async (profileData) => {
    if (!token) return { success: false, error: 'Unauthorized' };
    try {
      const res = await fetch(`${API_URL}/users/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(profileData)
      });

      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        localStorage.setItem('gs_user', JSON.stringify(data.user));
        return { success: true, user: data.user };
      } else {
        const err = await res.json();
        throw new Error(err.message || 'Failed to update profile');
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const value = {
    user,
    token,
    loading,
    isMock,
    loginWithEmail,
    registerWithEmail,
    loginWithGoogle,
    logout,
    updateUserProfile
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
