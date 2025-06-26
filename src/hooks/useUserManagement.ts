import { userService } from '@/services/UserService';
import { User } from '@/lib/types';
import { toast } from '@/hooks/use-toast';

export function useUserManagement() {
  const isMainConsultant = async (userId: string): Promise<boolean> => {
    try {
      return await userService.isMainConsultant(userId);
    } catch (error) {
      console.error('Is main consultant error:', error);
      return false;
    }
  };

  const addUser = async (name: string, role: "owner" | "contractor" | "consultant", isMainConsultant = false): Promise<boolean> => {
    try {
      return await userService.addUser(name, role, isMainConsultant);
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

  const deleteUser = async (userId: string): Promise<boolean> => {
    try {
      return await userService.deleteUser(userId);
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

  const getUsers = async (): Promise<User[]> => {
    try {
      return await userService.getUsers();
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

  const approveUser = async (userId: string): Promise<boolean> => {
    try {
      return await userService.approveUser(userId);
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