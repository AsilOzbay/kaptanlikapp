import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';

export interface User {
  id: string;
  email: string;
  displayName: string;
  role: 'user' | 'admin';
}

export interface Profile {
  id: string;
  display_name: string;
  avatar_url?: string;
  subscription_tier: 'free' | 'pro';
  subscription_status: 'active' | 'inactive' | 'cancelled';
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  isAdmin: boolean;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  isAdmin: false,
  isLoading: true,
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {},
  resetPassword: async () => {},
});

const STORAGE_KEY = 'kaptanlik_auth_user';
const PROFILE_KEY = 'kaptanlik_auth_profile';

function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

function getMockUser(email: string, displayName: string): User {
  return {
    id: generateId(),
    email,
    displayName: displayName || email.split('@')[0],
    role: email === 'admin@kaptanlik.app' ? 'admin' : 'user',
  };
}

function getMockProfile(userId: string, displayName: string): Profile {
  return {
    id: userId,
    display_name: displayName,
    subscription_tier: 'free',
    subscription_status: 'active',
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem(STORAGE_KEY);
      const storedProfile = localStorage.getItem(PROFILE_KEY);
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
      if (storedProfile) {
        setProfile(JSON.parse(storedProfile));
      }
    } catch {
      // ignore parse errors
    } finally {
      setIsLoading(false);
    }
  }, []);

  const persistUser = useCallback((newUser: User | null, newProfile: Profile | null) => {
    if (newUser) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
    if (newProfile) {
      localStorage.setItem(PROFILE_KEY, JSON.stringify(newProfile));
    } else {
      localStorage.removeItem(PROFILE_KEY);
    }
  }, []);

  const signIn = useCallback(async (email: string, _password: string) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const displayName = email.split('@')[0];
    const newUser = getMockUser(email, displayName);
    const newProfile = getMockProfile(newUser.id, displayName);
    setUser(newUser);
    setProfile(newProfile);
    persistUser(newUser, newProfile);
  }, [persistUser]);

  const signUp = useCallback(async (email: string, _password: string, displayName: string) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const newUser = getMockUser(email, displayName);
    const newProfile = getMockProfile(newUser.id, displayName);
    setUser(newUser);
    setProfile(newProfile);
    persistUser(newUser, newProfile);
  }, [persistUser]);

  const signOut = useCallback(async () => {
    await new Promise((resolve) => setTimeout(resolve, 200));
    setUser(null);
    setProfile(null);
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(PROFILE_KEY);
  }, []);

  const resetPassword = useCallback(async (_email: string) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isAdmin,
        isLoading,
        signIn,
        signUp,
        signOut,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
