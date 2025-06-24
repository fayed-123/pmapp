
import { userService } from '@/services/UserService';
import { User } from '@/lib/types';
import { toast } from '@/hooks/use-toast';

export function useUserManagement() {
  const isMainConsultant = (userId: string): boolean => {
    return userService.isMainConsultant(userId);
  };

  const addUser = (name: string, role: "owner" | "contractor" | "consultant", isMainConsultant = false): boolean => {
    try {
      return userService.addUser(name, role, isMainConsultant);
    } catch (error) {
      console.error('Add user error:', error);
      toast({
        title: "خطأ في إضافة المستخدم",
        description: "حدث خطأ أثناء إضافة المستخدم",
        variant: "destructive"
      });
      return false;
    }
  };

  const deleteUser = (userId: string): boolean => {
    try {
      return userService.deleteUser(userId);
    } catch (error) {
      console.error('Delete user error:', error);
      toast({
        title: "خطأ في حذف المستخدم",
        description: "حدث خطأ أثناء حذف المستخدم",
        variant: "destructive"
      });
      return false;
    }
  };

  const getUsers = (): User[] => {
    try {
      return userService.getUsers();
    } catch (error) {
      console.error('Get users error:', error);
      toast({
        title: "خطأ في جلب المستخدمين",
        description: "حدث خطأ أثناء جلب المستخدمين",
        variant: "destructive"
      });
      return [];
    }
  };

  const approveUser = (userId: string): boolean => {
    try {
      return userService.approveUser(userId);
    } catch (error) {
      console.error('Approve user error:', error);
      toast({
        title: "خطأ في الموافقة على المستخدم",
        description: "حدث خطأ أثناء الموافقة على المستخدم",
        variant: "destructive"
      });
      return false;
    }
  };

  return {
    isMainConsultant,
    addUser,
    deleteUser,
    getUsers,
    approveUser
  };
}
