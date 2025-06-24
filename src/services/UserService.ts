
import { User } from '@/lib/types';
import { loadUsers, saveUsers } from '@/lib/db';
import { MAIN_CONSULTANT_NAME, MAIN_CONSULTANT_EMAIL } from '@/constants/auth';
import { toast } from '@/hooks/use-toast';

class UserService {
  isMainConsultant(userId: string): boolean {
    const users = loadUsers();
    const user = users.find(u => u.id === userId);
    return user?.role === 'mainConsultant' || !!user?.isMainConsultant;
  }

  addUser(name: string, role: "owner" | "contractor" | "consultant", isMainConsultant = false): boolean {
    try {
      const users = loadUsers();
      
      // Check if user with same name and role exists
      if (users.find(u => u.name === name && u.role === role)) {
        toast({
          title: "خطأ في إضافة المستخدم",
          description: "اسم المستخدم مستخدم بالفعل لنفس النوع.",
          variant: "destructive"
        });
        return false;
      }
      
      // Update role to mainConsultant if isMainConsultant is true
      const finalRole = (isMainConsultant && role === "consultant") ? "mainConsultant" : role;
      
      const newUser: User = {
        id: Date.now().toString(),
        name: name,
        email: `${name.replace(/\s+/g, '').toLowerCase()}@example.com`, // Generate dummy email
        phone: "0000000000", // Default phone
        role: finalRole as any,
        password: "password", // Default password
        approved: true, // Auto-approve users added by consultant
        isMainConsultant: isMainConsultant && (role === "consultant" || finalRole === "mainConsultant") // Only set true if explicitly a main consultant
      };
      
      users.push(newUser);
      saveUsers(users);
      
      let roleText = "";
      switch(finalRole) {
        case "owner": roleText = "المالك"; break;
        case "contractor": roleText = "المقاول"; break;
        case "consultant": roleText = "الاستشاري"; break;
        case "mainConsultant": roleText = "الاستشاري الرئيسي"; break;
      }
      
      toast({
        title: "تمت الإضافة بنجاح",
        description: `تم إضافة ${roleText} "${name}" بنجاح`,
      });
      
      return true;
    } catch (error) {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء إضافة المستخدم",
        variant: "destructive"
      });
      return false;
    }
  }

  deleteUser(userId: string): boolean {
    try {
      const users = loadUsers();
      
      // Check if user exists
      const userToDelete = users.find(u => u.id === userId);
      if (!userToDelete) {
        toast({
          title: "خطأ",
          description: "المستخدم غير موجود",
          variant: "destructive"
        });
        return false;
      }
      
      // Don't allow deletion of main consultant with hardcoded name/email
      if (
        userToDelete.name === MAIN_CONSULTANT_NAME || 
        userToDelete.email === MAIN_CONSULTANT_EMAIL
      ) {
        toast({
          title: "غير مسموح",
          description: "لا يمكن حذف الاستشاري الرئيسي الافتراضي",
          variant: "destructive"
        });
        return false;
      }
      
      const updatedUsers = users.filter(u => u.id !== userId);
      saveUsers(updatedUsers);
      
      toast({
        title: "تم الحذف",
        description: `تم حذف المستخدم "${userToDelete.name}" بنجاح`,
      });
      
      return true;
    } catch (error) {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء حذف المستخدم",
        variant: "destructive"
      });
      return false;
    }
  }

  getUsers(): User[] {
    return loadUsers();
  }

  approveUser(userId: string): boolean {
    try {
      const users = loadUsers();
      const user = users.find(u => u.id === userId);
      
      if (!user) {
        toast({
          title: "خطأ",
          description: "المستخدم غير موجود",
          variant: "destructive"
        });
        return false;
      }
      
      user.approved = true;
      saveUsers(users);
      
      toast({
        title: "تمت الموافقة",
        description: `تم الموافقة على حساب "${user.name}" بنجاح`,
      });
      
      return true;
    } catch (error) {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء الموافقة على المستخدم",
        variant: "destructive"
      });
      return false;
    }
  }
}

export const userService = new UserService();
