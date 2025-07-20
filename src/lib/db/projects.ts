import { supabase } from "@/lib/supabase";
import { Project } from "../types";
import { loadItems } from "./items";
import { getCurrentUser } from "@/lib/db";

// Add a flag to prevent infinite loops
let isLoadingProjects = false;

export async function loadProjects(): Promise<Project[]> {
  if (isLoadingProjects) {
    return [];
  }

  try {
    isLoadingProjects = true;

    const { data: projects, error } = await supabase
      .from("projects")
      .select(
        `
      id, name, description, start_date, end_date, completion, 
        time_elapsed, expected_days, performance, created_at, 
        status, owner_id, consultant_id, contractor_id, created_by, 
        general_consultant_id, contract_value, advance_payment_percentage, 
        work_guarantee_percentage, material_delivery_payment_percentage, 
        completed_work_payment_percentage, main_consultant_id,
        subcontractor_id,
        electricalconsultantid,
        architectconsultantid,
        mechanicalconsultantid,
        electricalcontractorid, 
        architectcontractorid,
        mechanicalcontractorid,
        show_to_role
      `
      )
      .order("created_at", { ascending: false });
    console.log("Loaded projects:", projects);

    if (error) {
      console.error("Supabase error:", error);
      throw error;
    }

    if (!projects || projects.length === 0) {
      isLoadingProjects = false;
      return [];
    }

    const currentUser = getCurrentUser();
    if (!currentUser) {
      console.warn("No user found in session");
      isLoadingProjects = false;
      return [];
    }

    const filteredProjects = projects.filter((project) => {
      const userRole = currentUser.role;
      const userId = currentUser.id;

      if (project.status === "published") {
        return true;
      }

      if (project.status === "pending") {
        return (
          userRole === "mainConsultant" || // المشرف العام يشوف الكل
          userId === project.consultant_id ||
          userId === project.owner_id ||
          userId === project.contractor_id
        );
      }

      return false;
    });

    const processedProjects = filteredProjects.map((project) => {
      const convertedProject = {
        id: project.id,
        name: project.name,
        description: project.description,
        desc: project.description,
        start: project.start_date,
        end: project.end_date,
        completion: project.completion || 0,
        timeElapsed: project.time_elapsed || 0,
        expectedDays: project.expected_days || 30,
        performance: project.performance || 0,
        created: project.created_at,
        status: project.status || "active",
        ownerId: project.owner_id,
        consultantId: project.consultant_id,
        contractorId: project.contractor_id,
        createdBy: project.created_by,
        generalConsultantId: project.general_consultant_id,
        contractValue: project.contract_value || 0,
        advancePaymentPercentage: project.advance_payment_percentage || 0,
        workGuaranteePercentage: project.work_guarantee_percentage || 0,
        materialDeliveryPaymentPercentage:
          project.material_delivery_payment_percentage || 0,
        completedWorkPaymentPercentage:
          project.completed_work_payment_percentage || 0,
        mainConsultantId: project.main_consultant_id,
        subcontractorId: project.subcontractor_id,
        electricalConsultantId: project.electricalconsultantid || null,
        architectConsultantId: project.architectconsultantid || null,
        mechanicalConsultantId: project.mechanicalconsultantid || null,

        electricalContractorId: project.electricalcontractorid || null,
        architectContractorId: project.architectcontractorid || null,
        mechanicalContractorId: project.mechanicalcontractorid || null,
      };

      const startDate = convertedProject.start
        ? new Date(convertedProject.start)
        : new Date();
      const now = new Date();
      const daysElapsed = Math.max(
        Math.ceil(
          (now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
        ),
        0
      );

      return {
        ...convertedProject,
        timeElapsed: daysElapsed,
      };
    });

    isLoadingProjects = false;
    return processedProjects;
  } catch (error) {
    console.error("Error loading projects:", error);
    isLoadingProjects = false;
    return [];
  }
}

export async function loadProjectsForSubcontractor(subId: string): Promise<Project[]> {
  try {
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .or(
        `electricalcontractorid.eq.${subId},architectcontractorid.eq.${subId},mechanicalcontractorid.eq.${subId}`
      );

    if (error) {
      console.error("Error loading projects for subcontractor:", error.message);
      return [];
    }

    return (data || []).map((project) => ({
      ...project,
      start: project.start_date,
      end: project.end_date,
      timeElapsed: project.time_elapsed,
      expectedDays: project.expected_days,
      consultantId: project.consultant_id,
      contractorId: project.contractor_id,
      subcontractorId: project.subcontractor_id,
      mainConsultantId: project.main_consultant_id,
      electricalConsultantId: project.electricalconsultantid,
      architectConsultantId: project.architectconsultantid,
      mechanicalConsultantId: project.mechanicalconsultantid,
      electricalContractorId: project.electricalcontractorid,
      architectContractorId: project.architectcontractorid,
      mechanicalContractorId: project.mechanicalcontractorid,
    }));
  } catch (error) {
    console.error("Error loading subcontractor projects:", error);
    return [];
  }
}

export async function saveProject(project: Project): Promise<boolean> {
  try {
    console.log("Saving project with data:", project);

    if (project.id) {
      // Update existing project
      const { error } = await supabase
        .from("projects")
        .update({
          name: project.name,
          start_date: project.start,
          end_date: project.end,
          completion: project.completion,
          time_elapsed: project.timeElapsed,
          expected_days: project.expectedDays,
          performance: project.performance,
          description: project.description || project.desc || null,
          owner_id: project.ownerId || null,
          consultant_id: project.consultantId || null,
          contractor_id: project.contractorId || null,
          subcontractor_id: project.subcontractorId || null, // <-- أضفت السطر ده
          // status: project.status || "active",
          // status: project.status || "pending",
          status:
            project.status === "pending" || project.status === "published"
              ? project.status
              : "pending",

          contract_value: project.contractValue || 0,
          advance_payment_percentage: project.advancePaymentPercentage || 0,
          work_guarantee_percentage: project.workGuaranteePercentage || 0,
          material_delivery_payment_percentage:
            project.materialDeliveryPaymentPercentage || 0,
          completed_work_payment_percentage:
            project.completedWorkPaymentPercentage || 0,
          general_consultant_id: project.generalConsultantId || null,
          main_consultant_id: project.mainConsultantId || null,
          show_to_role: project.showToRole || "mainConsultant",
          electricalconsultantid: project.electricalConsultantId || null,
          architectconsultantid: project.architectConsultantId || null,
          mechanicalconsultantid: project.mechanicalConsultantId || null,

          electricalcontractorid: project.electricalContractorId || null,
          architectcontractorid: project.architectContractorId || null,
          mechanicalcontractorid: project.mechanicalContractorId || null,
        })
        .eq("id", project.id);

      if (error) {
        console.error("Update error:", error);
        throw error;
      }
    } else {
      // Insert new project
      const insertData = {
        name: project.name,
        start_date: project.start,
        end_date: project.end,
        completion: project.completion || 0,
        time_elapsed: project.timeElapsed || 0,
        expected_days: project.expectedDays || 30,
        performance: project.performance || 0,
        description: project.description || project.desc || null,
        owner_id: project.ownerId || null,
        consultant_id: project.consultantId || null,
        contractor_id: project.contractorId || null,
        subcontractor_id: project.subcontractorId || null, // <-- أضفت السطر ده
        // status: project.status || "active",
        // status: project.status || "pending",
        status:
          project.status === "pending" || project.status === "published"
            ? project.status
            : "pending",

        contract_value: project.contractValue || 0,
        advance_payment_percentage: project.advancePaymentPercentage || 0,
        work_guarantee_percentage: project.workGuaranteePercentage || 0,
        material_delivery_payment_percentage:
          project.materialDeliveryPaymentPercentage || 0,
        completed_work_payment_percentage:
          project.completedWorkPaymentPercentage || 0,
        general_consultant_id: project.generalConsultantId || null,
        main_consultant_id: project.mainConsultantId || null,
        show_to_role: project.showToRole || "mainConsultant",
        electricalconsultantid: project.electricalConsultantId || null,
        architectconsultantid: project.architectConsultantId || null,
        mechanicalconsultantid: project.mechanicalConsultantId || null,

        electricalcontractorid: project.electricalContractorId || null,
        architectcontractorid: project.architectContractorId || null,
        mechanicalcontractorid: project.mechanicalContractorId || null,
      };

      console.log("Inserting project data:", insertData);

      const { error } = await supabase.from("projects").insert(insertData);

      if (error) {
        console.error("Insert error:", error);
        throw error;
      }
    }
    return true;
  } catch (error) {
    console.error("Error saving project:", error);
    return false;
  }
}

export async function getProjectById(id: string): Promise<Project | undefined> {
  // Don't call loadProjects if we're already in the process of loading projects
  if (isLoadingProjects) {
    // Return a minimal project object or undefined
    return undefined;
  }
  try {
    const { data: project, error } = await supabase
      .from("projects")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !project) return undefined;

    return {
      ...project,
      start: project.start_date,
      end: project.end_date,
      timeElapsed: project.time_elapsed,
      expectedDays: project.expected_days,
      consultantId: project.consultant_id,
      contractorId: project.contractor_id,
      subcontractorId: project.subcontractor_id,
      mainConsultantId: project.main_consultant_id,
      electricalConsultantId: project.electricalconsultantid,
      architectConsultantId: project.architectconsultantid,
      mechanicalConsultantId: project.mechanicalconsultantid,

      electricalContractorId: project.electricalcontractorid,
      architectContractorId: project.architectcontractorid,
      mechanicalContractorId: project.mechanicalcontractorid,
    };
  } catch (error) {
    console.error("Error getting project by ID:", error);
    return undefined;
  }
}

// Delete project function
export async function deleteProject(projectId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from("projects")
      .delete()
      .eq("id", projectId);

    if (error) throw error;
  } catch (error) {
    console.error("Error deleting project:", error);
  }
}

export async function loadSubcontractorsForCurrentUser(contractorId: string) {
  const { data, error } = await supabase
    .from("users")
    .select("id, name, type, parent_id") // حقول الجدول اللي محتاجها
    .eq("role", "subcontractor") // تأكد إننا بنجيب المقاولين الفرعيين فقط
    .eq("parent_id", contractorId); // المقاولين التابعين للمقاول الرئيسي

  if (error) {
    console.error("Error loading subcontractors:", error);
    return [];
  }

  return (data || []).map((sub) => ({
    id: sub.id,
    name: sub.name,
    type: sub.type,
    contractor_id: sub.parent_id, // لكي تتوافق مع نوع Subcontractor في كودك
  }));
}

// إضافة مقاول فرعي جديد
export async function addSubcontractorUser(subcontractor: {
  name: string;
  type: string;
  parent_id: string;
}) {
  const { data, error } = await supabase.from("users").insert([
    {
      ...subcontractor,
      role: "subcontractor", // ضروري تحدد الدور عشان تبقى مقاول فرعي
    },
  ]);

  if (error) throw error;
  return data;
}

// حذف مقاول فرعي
export async function deleteSubcontractor(id: string) {
  const { data, error } = await supabase
    .from("users")
    .delete()
    .eq("id", id)
    .eq("role", "subcontractor"); // عشان ما تحذفش أي مستخدم غير مقاول فرعي

  if (error) throw error;
  return data;
}
