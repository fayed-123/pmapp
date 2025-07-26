import { supabase } from "@/lib/supabase"; 
import { User } from "../types";
import { MAIN_CONSULTANT_NAME, MAIN_CONSULTANT_EMAIL } from "@/context/AuthContext";

// Helper functions
const genId = (): string => Date.now().toString() + Math.floor(Math.random() * 100000).toString();

// User functions
export async function loadUsers(): Promise<User[]> {
  try {
    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    // تحويل بيانات الداتا من قاعدة البيانات لصيغة التطبيق
    const convertedUsers = (users || []).map(user => ({
      ...user,
      isMainConsultant: user.is_main_consultant,
      parentId: user.parent_id,
      subcontractorType: user.subcontractor_type, // ✅ ده هو العمود الصح من الجدول
      approved: user.approved,
    }));


    // إنشاء مستشار رئيسي افتراضي لو ما فيش مستخدمين
    if (convertedUsers.length === 0) {
      await supabase
        .from('users')
        .insert({
          name: MAIN_CONSULTANT_NAME,
          email: MAIN_CONSULTANT_EMAIL,
          phone: "0500000000",
          role: "mainConsultant",
          password: "123456",
          approved: true,
          is_main_consultant: true
        });

      return await loadUsers(); // إعادة تحميل المستخدمين بعد الإضافة
    }

    return convertedUsers;
  } catch (error) {
    console.error("Error loading users:", error);
    return [];
  }
}

export function saveUsers(users: User[]): void {
  try {
    localStorage.setItem('ppm_users', JSON.stringify(users));
  } catch (error) {
    console.error("Error saving users:", error);
  }
}

export async function getUserById(id: string): Promise<User | undefined> {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error || !user) return undefined;
    
    return {
      ...user,
      isMainConsultant: user.is_main_consultant
    };
  } catch (error) {
    console.error("Error getting user by ID:", error);
    return undefined;
  }
}

export async function getUserNameById(id: string): Promise<string> {
  if (!id) {
    return "-";
  }

  try {
    
    const { data: user, error } = await supabase
      .from('users')
      .select('id, name, role')
      .eq('id', id)
      .single();
    
    
    if (error) {
      console.error("getUserNameById: database error:", error);
      return "-";
    }
    
    if (!user) {
      return "-";
    }
    
    return user.name || "-";
  } catch (error) {
    console.error("getUserNameById: exception:", error);
    return "-";
  }
}

// Session management
export function getCurrentUser(): User | null {
  try {
    return JSON.parse(sessionStorage.getItem('ppm_current_user') || "null");
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
}

export function setCurrentUser(user: User | null): void {
  try {
    if (user) {
      sessionStorage.setItem('ppm_current_user', JSON.stringify(user));
    } else {
      sessionStorage.removeItem('ppm_current_user');
    }
  } catch (error) {
    console.error("Error setting current user:", error);
  }
}

export async function addSubcontractorUser({ name, type, contractorId }: {
  name: string;
  type: string;
  contractorId: string;
}) {
  const email = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}@sub.com`;
  const password = "123456"; // باسورد افتراضي، أو سيبه فاضي حسب نظامك

  const { data, error } = await supabase
    .from('users')
    .insert({
      name,
      email,
      password,
      role: 'subcontractor',
      parent_id: contractorId,
      subcontractor_type: type,
      type,
      approved: true
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function loadSubcontractorsForCurrentUser(contractorId: string) {
  const { data, error } = await supabase
    .from('users')
    // أضف contractor_id أو parent_id (حسب تسميتك في قاعدة البيانات)
    .select('id, name, type, parent_id')
    .eq('role', 'subcontractor')
    .eq('parent_id', contractorId);

  if (error) {
    console.error('Error loading subcontractors:', error);
    return [];
  }

  // عدل الحقول في البيانات لتطابق Subcontractor
  return (data || []).map(sub => ({
    id: sub.id,
    name: sub.name,
    type: sub.type,
    contractor_id: sub.parent_id,  // عشان يتوافق مع النوع
  }));
}


export async function deleteSubcontractor(id: string): Promise<void> {

  const { data, error } = await supabase
    .from('users')
    .delete()
    .eq('id', id)
    .eq('role', 'subcontractor')
    .select();

  if (error) {
    console.error('Error deleting subcontractor:', error);
    throw new Error(error.message);
  }

}

// إضافة استشاري فرعي
export async function addSubconsultantUser({
  name,
  type,
  consultantId,
}: {
  name: string;
  type: string;
  consultantId: string;
}) {
  // انشئ ايميل وهمي
  const email = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}@subconsultant.com`;

  const { error } = await supabase.from("users").insert({
    name,
    type,
    role: "subconsultant",
    parent_id: consultantId,
    email,            // لازم تبعت الايميل
    password: "123456" // او أي باسورد افتراضي لازم لو الحقل موجود ومطلوب
  });

  if (error) throw error;
}


// تحميل الاستشاريين الفرعيين
export async function loadSubconsultantsForCurrentUser(consultantId: string) {
  
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      // .eq('parent_id', consultantId) // عدل هنا من parent_consultant_id إلى parent_id
      .eq('role', 'subconsultant');
    
    if (error) {
      console.error('Error loading subconsultants:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('Exception in loadSubconsultants:', error);
    return [];
  }
}


// حذف استشاري فرعي
export async function deleteSubconsultant(id: string) {
  const { error } = await supabase.from("users").delete().eq("id", id).eq("role", "subconsultant");
  if (error) throw error;
}

export async function getSubconsultantsForProject(projectId: string) {
  const { data: project, error } = await supabase
    .from('projects')
    .select('electricalconsultantid, architectconsultantid, mechanicalconsultantid')
    .eq('id', projectId)
    .single();

  if (error || !project) {
    console.error('Error loading project subconsultants:', error);
    return [];
  }

  const consultantIds = [
    project.electricalconsultantid,
    project.architectconsultantid,
    project.mechanicalconsultantid,
  ].filter(Boolean); // يشيل الـ nulls

  if (consultantIds.length === 0) return [];

  const { data: subconsultants, error: usersError } = await supabase
    .from('users')
    .select('id, name, type, role')
    .in('id', consultantIds);

  if (usersError) {
    console.error('Error fetching subconsultants:', usersError);
    return [];
  }

  return subconsultants;
}



