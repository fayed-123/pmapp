
import { authService } from '@/services/AuthService';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/hooks/use-toast';

export function useAuthentication() {
  const { user, setUser } = useAuth();
  
  const login = async (nameOrEmail: string, role: string): Promise<boolean> => {
    try {
      const loggedInUser = await authService.login(nameOrEmail, role);
      if (loggedInUser) {
        setUser(loggedInUser);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "خطأ في تسجيل الدخول",
        description: "حدث خطأ أثناء تسجيل الدخول",
        variant: "destructive"
      });
      return false;
    }
  };

  const register = async (userData: any): Promise<boolean> => {
    try {
      return await authService.register(userData);
    } catch (error) {
      console.error('Registration error:', error);
      toast({
        title: "خطأ في التسجيل",
        description: "حدث خطأ أثناء التسجيل",
        variant: "destructive"
      });
      return false;
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };
  
  return {
    login,
    register,
    logout,
    user
  };
}
