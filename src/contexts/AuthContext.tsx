import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '@/lib/api';

interface AuthContextType {
  isAuthenticated: boolean;
  username: string | null;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(api.isAuthenticated());
  const [username, setUsername] = useState(api.getUsername());

  useEffect(() => {
    setIsAuthenticated(api.isAuthenticated());
    setUsername(api.getUsername());
  }, []);

  const login = async (username: string, password: string) => {
    const response = await api.login(username, password);
    setIsAuthenticated(true);
    setUsername(response.username);
  };

  const register = async (username: string, password: string) => {
    await api.register(username, password);
  };

  const logout = () => {
    api.logout();
    setIsAuthenticated(false);
    setUsername(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, username, login, register, logout }}>
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
