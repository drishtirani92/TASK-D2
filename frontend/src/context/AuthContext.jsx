import { createContext, useContext, useEffect, useState } from 'react';
import { apiRequest } from '../services/api.js';

const TOKEN_KEY = 'devdeakin_token';

// localStorage can throw (for example in private mode), so it is wrapped
const storage = {
  get() {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },
  set(token) {
    try {
      localStorage.setItem(TOKEN_KEY, token);
    } catch {
      /* the user just has to log in again next visit */
    }
  },
  clear() {
    try {
      localStorage.removeItem(TOKEN_KEY);
    } catch {
      /* nothing to clear */
    }
  },
};

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(storage.get);
  const [user, setUser] = useState(null);
  // true while we check a saved token with the backend
  const [loading, setLoading] = useState(Boolean(storage.get()));

  // When the site opens, check that a saved token is still valid
  // and fetch the user it belongs to (so the plan is always up to date).
  useEffect(() => {
    const saved = storage.get();
    if (!saved) return undefined;

    let cancelled = false;
    apiRequest('/api/auth/me', { token: saved })
      .then((data) => {
        if (!cancelled) setUser(data.user);
      })
      .catch((err) => {
        if (cancelled) return;
        // 401 means the token is expired or fake, so throw it away.
        // Any other error (like the server being down) keeps the token.
        if (err.status === 401) {
          storage.clear();
          setToken(null);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const login = (newToken, newUser) => {
    storage.set(newToken);
    setToken(newToken);
    setUser(newUser);
  };

  const logout = () => {
    storage.clear();
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, token, loading, login, logout, updateUser: setUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside <AuthProvider>');
  }
  return context;
}
