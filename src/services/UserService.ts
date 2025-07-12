import { User } from "@/lib/types";
import { supabase } from "@/lib/supabase";
import { MAIN_CONSULTANT_NAME, MAIN_CONSULTANT_EMAIL } from "@/constants/auth";
import { toast } from "@/hooks/use-toast";

class UserService {
  async isMainConsultant(userId: string): Promise<boolean> {
    try {
      const { data: user } = await supabase
        .from("users")
        .select("role, is_main_consultant")
        .eq("id", userId)
        .single();

      return user?.role === "mainConsultant" || !!user?.is_main_consultant;
    } catch (error) {
      console.error("Error checking main consultant:", error);
      return false;
    }
  }

  async addUser(
    name: string,
    role:
      | "owner"
      | "contractor"
      | "consultant"
      | "generalConsultant"
      | "subcontractor",
    isMainConsultant = false,
    parentId?: string
  ): Promise<boolean> {
    try {
      if (role === "subcontractor" && !parentId) {
        toast({
          title: "خطأ في الإضافة",
          description: "يجب اختيار المقاول الرئيسي للمقاول الفرعي.",
          variant: "destructive",
        });
        return false;
      }
      // Check if user exists
      const { data: existingUser } = await supabase
        .from("users")
        .select("*")
        .eq("name", name)
        .eq("role", role)
        .maybeSingle();

      if (existingUser) {
        toast({
          title: "خطأ في إضافة المستخدم",
          description: "اسم المستخدم مستخدم بالفعل لنفس النوع.",
          variant: "destructive",
        });
        return false;
      }

      const finalRole =
        isMainConsultant && role === "consultant" ? "mainConsultant" : role;

      const { error } = await supabase.from("users").insert({
        name: name,
        email: `${name.replace(/\s+/g, "").toLowerCase()}@example.com`,
        phone: "0000000000",
        role: finalRole,
        password: "password",
        approved: true,
        is_main_consultant:
          isMainConsultant &&
          (role === "consultant" || finalRole === "mainConsultant"),
        parentId: parentId || null,
      });

      if (error) {
        console.error("Supabase Insert Error:", error);
        throw error;
      }

      let roleText = "";
      switch (finalRole) {
        case "owner":
          roleText = "المالك";
          break;
        case "contractor":
          roleText = "المقاول";
          break;
        case "subcontractor":
          roleText = "المقاول الفرعي";
          break;
        case "consultant":
          roleText = "الاستشاري";
          break;
        case "mainConsultant":
          roleText = "الاستشاري الرئيسي";
          break;
        case "generalConsultant":
          roleText = "الاستشاري العام";
          break;
      }

      toast({
        title: "تمت الإضافة بنجاح",
        description: `تم إضافة ${roleText} "${name}" بنجاح`,
      });

      return true;
    } catch (error) {
      console.error("Error adding user:", error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء إضافة المستخدم",
        variant: "destructive",
      });
      return false;
    }
  }

  async deleteUser(userId: string): Promise<boolean> {
    try {
      // Get user first
      const { data: userToDelete } = await supabase
        .from("users")
        .select("*")
        .eq("id", userId)
        .single();

      if (!userToDelete) {
        toast({
          title: "خطأ",
          description: "المستخدم غير موجود",
          variant: "destructive",
        });
        return false;
      }

      // Don't allow deletion of main consultant
      if (
        userToDelete.name === MAIN_CONSULTANT_NAME ||
        userToDelete.email === MAIN_CONSULTANT_EMAIL
      ) {
        toast({
          title: "غير مسموح",
          description: "لا يمكن حذف الاستشاري الرئيسي الافتراضي",
          variant: "destructive",
        });
        return false;
      }

      const { error } = await supabase.from("users").delete().eq("id", userId);

      if (error) throw error;

      toast({
        title: "تم الحذف",
        description: `تم حذف المستخدم "${userToDelete.name}" بنجاح`,
      });

      return true;
    } catch (error) {
      console.error("Error deleting user:", error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء حذف المستخدم",
        variant: "destructive",
      });
      return false;
    }
  }

  async getUsers(): Promise<User[]> {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error getting users:", error);
      return [];
    }
  }

  async approveUser(userId: string): Promise<boolean> {
    try {
      const { data: user, error: selectError } = await supabase
        .from("users")
        .select("name")
        .eq("id", userId)
        .single();

      if (selectError || !user) {
        toast({
          title: "خطأ",
          description: "المستخدم غير موجود",
          variant: "destructive",
        });
        return false;
      }

      const { error } = await supabase
        .from("users")
        .update({ approved: true })
        .eq("id", userId);

      if (error) throw error;

      toast({
        title: "تمت الموافقة",
        description: `تم الموافقة على حساب "${user.name}" بنجاح`,
      });

      return true;
    } catch (error) {
      console.error("Error approving user:", error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء الموافقة على المستخدم",
        variant: "destructive",
      });
      return false;
    }
  }
}

export const userService = new UserService();
