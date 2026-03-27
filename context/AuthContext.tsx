import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface UserInfo {
  id?: string;
  name: string;
  picture: string;
  email?: string;
  role?: 'client' | 'workshop';
  workshop_id?: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  accessToken: string;
  userInfo: UserInfo | null;
  login: (token: string, user: UserInfo) => void;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const AUTH_KEY = '@meu-app-expo:auth_v1';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [accessToken, setAccessToken] = useState('');
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      const stored = await AsyncStorage.getItem(AUTH_KEY);
      if (stored) {
        const { token, user } = JSON.parse(stored);
        if (token && user) {
          setAccessToken(token);
          setUserInfo(user);
          setIsAuthenticated(true);
        }
      }
    } catch (e) {
      console.error('Failed to load auth state', e);
    } finally {
      setLoading(false);
    }
  };

  const login = async (token: string, user: UserInfo) => {
    try {
      setAccessToken(token);
      setUserInfo(user);
      setIsAuthenticated(true);
      await AsyncStorage.setItem(AUTH_KEY, JSON.stringify({ token, user }));
    } catch (e) {
      console.error('Failed to save auth state', e);
    }
  };

  const logout = async () => {
    try {
      setAccessToken('');
      setUserInfo(null);
      setIsAuthenticated(false);
      await AsyncStorage.removeItem(AUTH_KEY);
    } catch (e) {
      console.error('Failed to remove auth state', e);
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, accessToken, userInfo, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
