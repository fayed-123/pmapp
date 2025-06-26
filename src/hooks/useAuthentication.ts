import { useAuth } from '@/context/AuthContext';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';

export function useAuthentication() {
  const { user, setUser } = useAuth();
  
  const login = async (nameOrEmail: string, role: string): Promise<boolean> => {
    try {
      const { data: users, error } = await supabase.from('users')
      .select('*')
      .or(`name.eq.${nameOrEmail},email.eq.${nameOrEmail}`)
      .eq('role', role)
      .single();
    
    if (error || !users) {
      toast({
        title: "خطأ في تسجيل الدخول",
        description: "المستخدم غير موجود أو الدور غير صحيح",
        variant: "destructive"
      });
      return false;
    }
    
    setUser(users);
    // Still use sessionStorage for current user session
    sessionStorage.setItem('ppm_current_user', JSON.stringify(users));
    return true;
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
    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('email')
      .eq('email', userData.email)
      .single();
    
    if (existingUser) {
      toast({
        title: "خطأ في التسجيل",
        description: "البريد الإلكتروني مستخدم بالفعل.",
        variant: "destructive"
      });
      return false;
    }
    
    // Insert new user
    const { error } = await supabase
      .from('users')
      .insert({
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        role: userData.role,
        password: userData.password,
        approved: userData.role === 'mainConsultant', // Auto-approve main consultants
        is_main_consultant: userData.role === 'mainConsultant'
      });
    
    if (error) throw error;
    
    toast({
      title: "تم التسجيل بنجاح",
      description: userData.role === 'mainConsultant' 
        ? "تم تفعيل حسابك كاستشاري رئيسي. يمكنك تسجيل الدخول الآن."
        : "يرجى انتظار موافقة الاستشاري الرئيسي على الحساب.",
    });
    
    return true;
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

// Update the logout function:
const logout = () => {
  setUser(null);
  sessionStorage.removeItem('ppm_current_user');
};
  
  return {
    login,
    register,
    logout,
    user
  };
}
