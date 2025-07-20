import { User } from "@/lib/types";
import { supabase } from "@/lib/supabase";
import { MAIN_CONSULTANT_NAME, MAIN_CONSULTANT_EMAIL } from "@/constants/auth";
import { toast } from "@/hooks/use-toast";

class AuthService {
  async login(nameOrEmail: string, role: string): Promise<User | null> {
    try {
      let query = supabase
        .from("users")
        .select("*")
        .or(`name.ilike.%${nameOrEmail}%,email.ilike.%${nameOrEmail}%`);

      if (role === "contractor" || role === "subcontractor") {
        query = query.in("role", ["contractor", "subcontractor"]);
      } else if (role === "consultant" || role === "subconsultant") {
        query = query.in("role", ["consultant", "subconsultant"]);
      } else {
        query = query.eq("role", role);
      }

      const { data: user, error } = await query.maybeSingle();

      if (error || !user) {
        toast({
          title: "خطأ في تسجيل الدخول",
          description: "المستخدم غير موجود أو نوع المستخدم غير صحيح!",
          variant: "destructive",
        });
        return null;
      }
console.log("ROLE:", user.role);
console.log("PARENT_ID:", user.parent_id);
console.log("APPROVED:", user.approved);
    const isSubConsultantPending =
  (user.role === "consultant" || user.role === "subconsultant") &&
  user.parent_id &&
  !user.approved;

if (!user.approved && !isSubConsultantPending) {
  toast({
    title: "الحساب غير مفعل",
    description: "انتظار موافقة الاستشاري على الحساب.",
    variant: "destructive",
  });
  return null;
}



      // افصل parent_id عن باقي الحقول واعمل تحويل لـ parentId
      const { parent_id, ...rest } = user;

      const mappedUser = {
        ...rest,
        parentId: parent_id, // هنا خليها camelCase
      };

      // خزّن المستخدم الجديد في الجلسة (sessionStorage)
      sessionStorage.setItem("ppm_current_user", JSON.stringify(mappedUser));

      toast({
        title: "تم تسجيل الدخول",
        description: `مرحباً ${user.name}`,
      });

      if (user.role === "mainConsultant") {
        const { data: pendingUsers } = await supabase
          .from("users")
          .select("*")
          .eq("approved", false);

        if (pendingUsers && pendingUsers.length > 0) {
          setTimeout(() => {
            toast({
              title: `${pendingUsers.length} طلبات تسجيل بانتظار الموافقة`,
              description:
                "يرجى الانتقال إلى 'إدارة المستخدمين' للموافقة على الطلبات",
              duration: 10000,
            });
          }, 1000);
        }
      }

      return mappedUser;
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تسجيل الدخول",
        variant: "destructive",
      });
      return null;
    }
  }

  async register(userData: Omit<User, "id" | "approved">): Promise<boolean> {
    try {
      // Check if user exists
      const { data: existingUser } = await supabase
        .from("users")
        .select("email")
        .eq("email", userData.email)
        .single();

      if (existingUser) {
        toast({
          title: "خطأ في التسجيل",
          description: "البريد الإلكتروني مستخدم بالفعل.",
          variant: "destructive",
        });
        return false;
      }

      const isMainConsultant =
        userData.name === MAIN_CONSULTANT_NAME ||
        userData.email === MAIN_CONSULTANT_EMAIL;

      // اعتبار 'subcontractor' و 'contractor' كـ 'contractor'
      const actualRole =
        userData.role === "subcontractor" || userData.role === "contractor"
          ? "contractor"
          : userData.role;

      const { error } = await supabase.from("users").insert({
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        role: isMainConsultant ? "mainConsultant" : actualRole,
        password: userData.password,
        approved: isMainConsultant,
        is_main_consultant: isMainConsultant,
        parentId: userData.parentId ?? null,
      });

      if (error) throw error;

      toast({
        title: "تم التسجيل بنجاح",
        description: isMainConsultant
          ? "تم تفعيل حسابك كاستشاري رئيسي. يمكنك تسجيل الدخول الآن."
          : "يرجى انتظار موافقة الاستشاري الرئيسي على الحساب.",
      });

      return true;
    } catch (error) {
      console.error("Registration error:", error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء التسجيل",
        variant: "destructive",
      });
      return false;
    }
  }

  logout(): void {
    sessionStorage.removeItem("ppm_current_user");
  }

  async ensureMainConsultantExists(): Promise<void> {
    try {
      const { data: mainConsultant } = await supabase
        .from("users")
        .select("*")
        .or(`name.eq.${MAIN_CONSULTANT_NAME},email.eq.${MAIN_CONSULTANT_EMAIL}`)
        .single();

      if (!mainConsultant) {
        await supabase.from("users").insert({
          name: MAIN_CONSULTANT_NAME,
          email: MAIN_CONSULTANT_EMAIL,
          phone: "0123456789",
          role: "mainConsultant",
          password: "123456",
          approved: true,
          is_main_consultant: true,
        });
      }
    } catch (error) {
      console.error("Error ensuring main consultant exists:", error);
    }
  }

  getCurrentUser(): User | null {
    try {
      const userStr = sessionStorage.getItem("ppm_current_user");
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      console.error("Error getting current user:", error);
      return null;
    }
  }
}

export const authService = new AuthService();
