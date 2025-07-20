import { supabase } from "@/lib/supabase";

// تحميل المقاولين الفرعيين لمقاول رئيسي معين
// export async function loadSubcontractorsForCurrentUser() {
//   const {
//     data: { user },
//   } = await supabase.auth.getUser();

//   if (!user) return [];

//   const { data, error } = await supabase
//     .from("subcontractors")
//     .select("*")
//     .eq("contractor_id", user.id)
//     .order("created_at", { ascending: false });

//   if (error) throw error;
//   return data || [];
// }



// إضافة مقاول فرعي جديد
// export async function addSubcontractor(subcontractor: {
//   name: string;
//   type: string;
// }) {
//   const { data, error } = await supabase
//     .from("subcontractors")
//     .insert([subcontractor]);

//   if (error) throw error;
//   return data;
// }


// // حذف مقاول فرعي
// export async function deleteSubcontractor(id: string) {
//   const { data, error } = await supabase
//     .from("subcontractors")
//     .delete()
//     .eq("id", id);

//   if (error) throw error;
//   return data;
// }
