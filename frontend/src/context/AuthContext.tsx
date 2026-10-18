import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthResponse } from '../types';
import { authApi, LoginPayload, RegisterPayload } from '../api/auth.api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (credentials: LoginPayload) => Promise<AuthResponse>;
  register: (payload: RegisterPayload) => Promise<AuthResponse>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  getDefaultRouteForRole: (role?: string) => string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('hostelcare_token'));
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('hostelcare_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const getDefaultRouteForRole = (role?: string): string => {
    switch (role) {
      case 'STUDENT':
        return '/student';
      case 'WARDEN':
      case 'ADMIN':
        return '/warden';
      case 'STAFF':
        return '/staff';
      default:
        return '/login';
    }
  };

  const refreshUser = async () => {
    if (!token) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const userData = await authApi.getMe();
      setUser(userData);
      localStorage.setItem('hostelcare_user', JSON.stringify(userData));
    } catch (error) {
      console.error('Session verification failed:', error);
      logout();
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, [token]);

  const login = async (credentials: LoginPayload) => {
    const authData = await authApi.login(credentials);
    setToken(authData.token);
    setUser(authData.user);
    localStorage.setItem('hostelcare_token', authData.token);
    localStorage.setItem('hostelcare_user', JSON.stringify(authData.user));
    return authData;
  };

  const register = async (payload: RegisterPayload) => {
    const authData = await authApi.register(payload);
    setToken(authData.token);
    setUser(authData.user);
    localStorage.setItem('hostelcare_token', authData.token);
    localStorage.setItem('hostelcare_user', JSON.stringify(authData.user));
    return authData;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('hostelcare_token');
    localStorage.removeItem('hostelcare_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        register,
        logout,
        refreshUser,
        getDefaultRouteForRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
