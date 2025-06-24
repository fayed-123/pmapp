
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@/lib/types';
import { getCurrentUser } from '@/lib/db';
import { authService } from '@/services/AuthService';
import { userService } from '@/services/UserService';
import { AuthContextType } from '@/types/auth';

// Create the context with undefined as default value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      // Load current user from session storage
      const currentUser = getCurrentUser();
      setUser(currentUser);
      
      // Ensure main consultant exists on app start
      authService.ensureMainConsultantExists();
    } catch (error) {
      console.error("Error initializing auth context:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Wrap authentication methods for direct context usage
  const login = async (nameOrEmail: string, role: string): Promise<boolean> => {
    const loggedInUser = await authService.login(nameOrEmail, role);
    if (loggedInUser) {
      setUser(loggedInUser);
      return true;
    }
    return false;
  };

  const register = async (userData: Omit<User, 'id' | 'approved'>): Promise<boolean> => {
    return authService.register(userData);
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      setUser,
      isLoading,
      login, 
      register, 
      logout, 
      addUser: userService.addUser, 
      deleteUser: userService.deleteUser, 
      isMainConsultant: userService.isMainConsultant 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// Export auth constants for backward compatibility
export { MAIN_CONSULTANT_NAME, MAIN_CONSULTANT_EMAIL } from '@/constants/auth';
