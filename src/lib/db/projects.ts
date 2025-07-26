import { Project, User } from "../types";
import { getCurrentUser } from "@/lib/db";
import { isUserAssignedToProject, hasFullAccess } from "@/lib/utils/typeMapping";
import { supabase } from "../supabase";

// Add a flag to prevent infinite loops
let isLoadingProjects = false;

/**
 * Load projects with role-based filtering at database level
 */
export async function loadProjects(currentUser?: User): Promise<Project[]> {
  if (isLoadingProjects) {
    return [];
  }

  try {
    isLoadingProjects = true;

    const user = currentUser || getCurrentUser();
    if (!user) {
      console.warn("No user found in session");
      isLoadingProjects = false;
      return [];
    }

    let query = supabase
      .from("projects")
      .select("*") // Select all fields to match database exactly
      .order("created_at", { ascending: false });

    // Apply role-based filtering at database level
    if (hasFullAccess(user.role)) {
      // Full access roles see all projects (no additional filtering needed)
    } else {
      // Filtered access - only see projects where user is assigned
      const userId = user.id;
      query = query.or(
        `owner_id.eq.${userId},consultant_id.eq.${userId},contractor_id.eq.${userId},electricalconsultantid.eq.${userId},architectconsultantid.eq.${userId},mechanicalconsultantid.eq.${userId},electricalcontractorid.eq.${userId},architectcontractorid.eq.${userId},mechanicalcontractorid.eq.${userId}`
      );
    }

    const { data: projects, error } = await query;

    if (error) {
      console.error("Supabase error:", error);
      throw error;
    }

    if (!projects || projects.length === 0) {
      isLoadingProjects = false;
      return [];
    }

    // Additional frontend filtering for status-based access control
    const filteredProjects = projects.filter((project) => {
      // Published projects are visible to all assigned users
      if (project.status === "published") {
        return true;
      }

      // Pending projects - more restrictive access
      if (project.status === "pending") {
        if (hasFullAccess(user.role)) {
          return true;
        }
        // For filtered access users, check if they're assigned
        return isUserAssignedToProject(user, project);
      }

      return false;
    });

    // ✅ Return projects as-is from database (they already match our interface)
    const processedProjects = filteredProjects.map((project) => {
      // Calculate timeElapsed for computed field
      const startDate = project.start_date ? new Date(project.start_date) : new Date();
      const now = new Date();
      const timeElapsed = Math.max(
        Math.ceil((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)),
        0
      );

      return {
        ...project, // Keep all database fields as-is
        timeElapsed, // Add computed field
        expectedDays: project.expected_days, // Copy for computed field
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

/**
 * Load projects for subcontractors based on their ID and type
 */
export async function loadProjectsForSubcontractor(subId: string, subType?: string): Promise<Project[]> {
  try {
    let query = supabase
      .from("projects")
      .select("*"); // Select all fields

    // Filter based on subcontractor type if provided
    if (subType) {
      switch (subType) {
        case 'كهربائي':
          query = query.eq('electricalcontractorid', subId);
          break;
        case 'معماري':
          query = query.eq('architectcontractorid', subId);
          break;
        case 'ميكانيكي':
          query = query.eq('mechanicalcontractorid', subId);
          break;
        default:
          // If type is unknown, check all three fields
          query = query.or(
            `electricalcontractorid.eq.${subId},architectcontractorid.eq.${subId},mechanicalcontractorid.eq.${subId}`
          );
      }
    } else {
      // If no type specified, check all three fields
      query = query.or(
        `electricalcontractorid.eq.${subId},architectcontractorid.eq.${subId},mechanicalcontractorid.eq.${subId}`
      );
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error loading projects for subcontractor:", error.message);
      return [];
    }

    // ✅ Return projects as-is from database, add computed fields
    return (data || []).map(project => {
      const startDate = project.start_date ? new Date(project.start_date) : new Date();
      const now = new Date();
      const timeElapsed = Math.max(
        Math.ceil((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)),
        0
      );

      return {
        ...project,
        timeElapsed,
        expectedDays: project.expected_days,
      };
    });
  } catch (error) {
    console.error("Error loading subcontractor projects:", error);
    return [];
  }
}

/**
 * Load projects for subconsultants based on their ID and type
 */
export async function loadProjectsForSubconsultant(subconsultantId: string, subType?: string): Promise<Project[]> {
  try {
    let query = supabase
      .from("projects")
      .select("*"); // Select all fields

    // Filter based on subconsultant type if provided
    if (subType) {
      switch (subType) {
        case 'كهربائي':
          query = query.eq('electricalconsultantid', subconsultantId);
          break;
        case 'معماري':
          query = query.eq('architectconsultantid', subconsultantId);
          break;
        case 'ميكانيكي':
          query = query.eq('mechanicalconsultantid', subconsultantId);
          break;
        default:
          // If type is unknown, check all three fields
          query = query.or(
            `electricalconsultantid.eq.${subconsultantId},architectconsultantid.eq.${subconsultantId},mechanicalconsultantid.eq.${subconsultantId}`
          );
      }
    } else {
      // If no type specified, check all three fields
      query = query.or(
        `electricalconsultantid.eq.${subconsultantId},architectconsultantid.eq.${subconsultantId},mechanicalconsultantid.eq.${subconsultantId}`
      );
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error loading projects for subconsultant:", error.message);
      return [];
    }

    // ✅ Return projects as-is from database, add computed fields
    return (data || []).map(project => {
      const startDate = project.start_date ? new Date(project.start_date) : new Date();
      const now = new Date();
      const timeElapsed = Math.max(
        Math.ceil((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)),
        0
      );

      return {
        ...project,
        timeElapsed,
        expectedDays: project.expected_days,
      };
    });
  } catch (error) {
    console.error("Error loading subconsultant projects:", error);
    return [];
  }
}

/**
 * Save project function
 */
export async function saveProject(project: Project): Promise<boolean> {
  try {
    // Prepare data for database - use only database field names
    const dbProject = {
      name: project.name,
      start_date: project.start_date,
      end_date: project.end_date,
      completion: project.completion,
      time_elapsed: project.time_elapsed,
      expected_days: project.expected_days,
      performance: project.performance,
      description: project.description,
      owner_id: project.owner_id,
      consultant_id: project.consultant_id,
      contractor_id: project.contractor_id,
      subcontractor_id: project.subcontractor_id,
      status: project.status,
      contract_value: project.contract_value,
      advance_payment_percentage: project.advance_payment_percentage,
      work_guarantee_percentage: project.work_guarantee_percentage,
      material_delivery_payment_percentage: project.material_delivery_payment_percentage,
      completed_work_payment_percentage: project.completed_work_payment_percentage,
      general_consultant_id: project.general_consultant_id,
      main_consultant_id: project.main_consultant_id,
      show_to_role: project.show_to_role,
      electricalconsultantid: project.electricalconsultantid,
      architectconsultantid: project.architectconsultantid,
      mechanicalconsultantid: project.mechanicalconsultantid,
      electricalcontractorid: project.electricalcontractorid,
      architectcontractorid: project.architectcontractorid,
      mechanicalcontractorid: project.mechanicalcontractorid,
    };

    if (project.id) {
      // Update existing project
      const { error } = await supabase
        .from("projects")
        .update(dbProject)
        .eq("id", project.id);

      if (error) {
        console.error("Update error:", error);
        throw error;
      }
    } else {
      // Insert new project
      const { error } = await supabase
        .from("projects")
        .insert(dbProject);

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

/**
 * Get project by ID
 */
export async function getProjectById(id: string): Promise<Project | undefined> {
  if (isLoadingProjects) {
    return undefined;
  }
  try {
    const { data: project, error } = await supabase
      .from("projects")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !project) return undefined;

    // ✅ Return project as-is from database, add computed fields
    const startDate = project.start_date ? new Date(project.start_date) : new Date();
    const now = new Date();
    const timeElapsed = Math.max(
      Math.ceil((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)),
      0
    );

    return {
      ...project,
      timeElapsed,
      expectedDays: project.expected_days,
    };
  } catch (error) {
    console.error("Error getting project by ID:", error);
    return undefined;
  }
}

/**
 * Delete project
 */
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