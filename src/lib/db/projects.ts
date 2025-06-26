import { supabase } from "@/lib/supabase";
import { Project } from "../types";
import { loadItems } from "./items";

// Add a flag to prevent infinite loops
let isLoadingProjects = false;

export async function loadProjects(): Promise<Project[]> {
  if (isLoadingProjects) {
    return [];
  }

  try {
    isLoadingProjects = true;
    const { data: projects, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Supabase error:", error);
      throw error;
    }

    if (!projects || projects.length === 0) {
      isLoadingProjects = false;
      return [];
    }

    console.log("Raw projects from DB:", projects); // Debug log

    const processedProjects = projects.map(project => {
      // Map database columns to expected properties
      const convertedProject = {
        id: project.id,
        name: project.name,
        description: project.description,
        desc: project.description, // Alias for backward compatibility
        start: project.start_date,
        end: project.end_date,
        completion: project.completion || 0,
        timeElapsed: project.time_elapsed || 0,
        expectedDays: project.expected_days || 30,
        performance: project.performance || 0,
        created: project.created_at,
        status: project.status || 'active',
        // Handle user references - check if these columns exist
        ownerId: project.owner_id,
        consultantId: project.consultant_id,
        contractorId: project.contractor_id,
        createdBy: project.created_by
      };

      // Calculate time elapsed
      const startDate = convertedProject.start ? new Date(convertedProject.start) : new Date();
      const now = new Date();
      const daysElapsed = Math.max(Math.ceil((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)), 0);

      return {
        ...convertedProject,
        timeElapsed: daysElapsed
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


export async function saveProject(project: Project): Promise<boolean> {
  try {
    console.log("Saving project with data:", project);

    if (project.id) {
      // Update existing project
      const { error } = await supabase
        .from('projects')
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
          status: project.status || 'active'
        })
        .eq('id', project.id);

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
        created_by: project.contractorId || null,
        status: project.status || 'active'
      };

      console.log("Inserting project data:", insertData);

      const { error } = await supabase
        .from('projects')
        .insert(insertData);

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
      .from('projects')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !project) return undefined;

    return {
      ...project,
      start: project.start_date,
      end: project.end_date,
      timeElapsed: project.time_elapsed,
      expectedDays: project.expected_days
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
      .from('projects')
      .delete()
      .eq('id', projectId);

    if (error) throw error;
  } catch (error) {
    console.error("Error deleting project:", error);
  }
}