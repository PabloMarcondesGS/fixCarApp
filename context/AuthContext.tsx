import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface UserInfo {
  name: string;
  picture: string;
  email?: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  accessToken: string;
  userInfo: UserInfo | null;
  login: (token: string, user: UserInfo) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [accessToken, setAccessToken] = useState('');
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

  const login = (token: string, user: UserInfo) => {
    setAccessToken(token);
    setUserInfo(user);
    setIsAuthenticated(true);
  };

  const logout = () => {
    setAccessToken('');
    setUserInfo(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, accessToken, userInfo, login, logout }}>
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
