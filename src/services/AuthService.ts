import { User } from '@/lib/types';
import { loadUsers, saveUsers, setCurrentUser, getCurrentUser } from '@/lib/db';
import { MAIN_CONSULTANT_NAME, MAIN_CONSULTANT_EMAIL } from '@/constants/auth';
import { toast } from '@/hooks/use-toast';

class AuthService {
  login(nameOrEmail: string, role: string): User | null {
    try {
      const users = loadUsers();
      
      // Special case for main consultant login
      if (nameOrEmail === MAIN_CONSULTANT_NAME || nameOrEmail === MAIN_CONSULTANT_EMAIL) {
        const mainConsultant = users.find(u => 
          u.name === MAIN_CONSULTANT_NAME || 
          u.email === MAIN_CONSULTANT_EMAIL
        );
        
        if (mainConsultant) {
          // Ensure the role is updated to mainConsultant
          if (mainConsultant.role !== "mainConsultant") {
            mainConsultant.role = "mainConsultant";
            mainConsultant.isMainConsultant = true;
            saveUsers(users);
          }
          
          setCurrentUser(mainConsultant);
          
          toast({
            title: "تم تسجيل الدخول",
            description: `مرحباً ${mainConsultant.name}`,
          });
          
          // Show pending users to consultant
          const pendingUsers = users.filter(u => 
            !u.approved && 
            u.name !== MAIN_CONSULTANT_NAME && 
            u.email !== MAIN_CONSULTANT_EMAIL
          );
          
          if (pendingUsers.length > 0) {
            setTimeout(() => {
              toast({
                title: `${pendingUsers.length} طلبات تسجيل بانتظار الموافقة`,
                description: "يرجى الانتقال إلى 'إدارة المستخدمين' للموافقة على الطلبات",
                duration: 10000,
              });
            }, 1000);
          }
          
          return mainConsultant;
        }
        
        toast({
          title: "خطأ في تسجيل الدخول",
          description: "حساب الاستشاري الرئيسي غير موجود!",
          variant: "destructive"
        });
        return null;
      }
      
      // For all users, find by name and role
      const user = users.find(u => u.name === nameOrEmail && u.role === role);
      
      if (!user) {
        toast({
          title: "خطأ في تسجيل الدخول",
          description: "المستخدم غير موجود أو نوع المستخدم غير صحيح!",
          variant: "destructive"
        });
        return null;
      }
      
      if (!user.approved) {
        toast({
          title: "الحساب غير مفعل",
          description: "انتظار موافقة الاستشاري على الحساب.",
          variant: "destructive"
        });
        return null;
      }
      
      setCurrentUser(user);
      
      toast({
        title: "تم تسجيل الدخول",
        description: `مرحباً ${user.name}`,
      });
      
      return user;
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تسجيل الدخول",
        variant: "destructive"
      });
      return null;
    }
  }

  register(userData: Omit<User, 'id' | 'approved'>): boolean {
    try {
      const users = loadUsers();
      
      if (users.find(u => u.email === userData.email)) {
        toast({
          title: "خطأ في التسجيل",
          description: "البريد الإلكتروني مستخدم بالفعل.",
          variant: "destructive"
        });
        return false;
      }
      
      // If this is the main consultant name or email, automatically approve and set as main consultant
      const isMainConsultant = 
        userData.name === MAIN_CONSULTANT_NAME || 
        userData.email === MAIN_CONSULTANT_EMAIL;
      
      const newUser: User = {
        ...userData,
        id: Date.now().toString(),
        approved: isMainConsultant,
        role: isMainConsultant ? 'mainConsultant' : userData.role,
        isMainConsultant: isMainConsultant
      };
      
      users.push(newUser);
      saveUsers(users);
      
      if (isMainConsultant) {
        toast({
          title: "تم التسجيل بنجاح",
          description: "تم تفعيل حسابك كاستشاري رئيسي. يمكنك تسجيل الدخول الآن.",
        });
      } else {
        toast({
          title: "تم التسجيل بنجاح",
          description: "يرجى انتظار موافقة الاستشاري الرئيسي على الحساب.",
        });
      }
      
      return true;
    } catch (error) {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء التسجيل",
        variant: "destructive"
      });
      return false;
    }
  }

  logout(): void {
    setCurrentUser(null);
  }

  ensureMainConsultantExists(): void {
    const users = loadUsers();
    const mainConsultant = users.find(u => 
      u.name === MAIN_CONSULTANT_NAME || 
      u.email === MAIN_CONSULTANT_EMAIL
    );
    
    if (!mainConsultant) {
      const newMainConsultant: User = {
        id: Date.now().toString(),
        name: MAIN_CONSULTANT_NAME,
        email: MAIN_CONSULTANT_EMAIL,
        phone: "0123456789",
        role: "mainConsultant",
        password: "123456", // Simple default password
        approved: true,
        isMainConsultant: true, // Mark as main consultant
      };
      
      users.push(newMainConsultant);
      saveUsers(users);
    } else if (mainConsultant.role !== "mainConsultant") {
      // Update existing main consultant to have the proper role
      mainConsultant.role = "mainConsultant";
      mainConsultant.isMainConsultant = true;
      saveUsers(users);
    }
  }

  getCurrentUser(): User | null {
    try {
      return getCurrentUser();
    } catch (error) {
      console.error("Error getting current user:", error);
      return null;
    }
  }
}

export const authService = new AuthService();
