import { Project } from "../types";
import { loadItems } from "./items";

// Add a flag to prevent infinite loops
let isLoadingProjects = false;

export function loadProjects(): Project[] {
  // Prevent recursive calls
  if (isLoadingProjects) {
    return [];
  }
  
  try {
    isLoadingProjects = true;
    const projects = JSON.parse(localStorage.getItem('ppm_projects') || "[]");
    
    // Calculate expected completion time for each project
    const processedProjects = projects.map(project => {
      // Using a simple filter instead of calling loadItems() to avoid circular dependency
      const items = isLoadingProjects 
        ? [] 
        : loadItems().filter(i => i.projectId === project.id);
      
      let totalDays = 0;
      if (project.start && project.end) {
        const startDate = new Date(project.start);
        const endDate = new Date(project.end);
        totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      }
      
      // Calculate time elapsed in days
      const startDate = project.start ? new Date(project.start) : new Date();
      const now = new Date();
      const daysElapsed = Math.max(Math.ceil((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)), 0);
      
      // Calculate expected days with improved formula to handle edge cases
      let expectedDays = 30; // Default fallback value
      let completion = 0;
      
      if (items.length > 0) {
        completion = Math.round(items.reduce((sum, item) => sum + (item.weightedProgress || 0), 0));
        
        // Handle different scenarios to avoid division by zero
        if (daysElapsed > 0 && completion > 0) {
          // Safe calculation when we have both completion and elapsed time
          expectedDays = Math.round((100 - completion) / (completion / daysElapsed));
        } else if (completion >= 100) {
          // Project is complete
          expectedDays = daysElapsed;
        } else if (totalDays > 0) {
          // Use planned duration if available
          expectedDays = totalDays;
        }
      } else if (totalDays > 0) {
        expectedDays = totalDays;
      }
      
      return {
        ...project,
        timeElapsed: daysElapsed,
        expectedDays: Math.max(1, expectedDays)
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

export function saveProjects(projects: Project[]): void {
  try {
    localStorage.setItem('ppm_projects', JSON.stringify(projects));
  } catch (error) {
    console.error("Error saving projects:", error);
  }
}

export function getProjectById(id: string): Project | undefined {
  // Don't call loadProjects if we're already in the process of loading projects
  if (isLoadingProjects) {
    // Return a minimal project object or undefined
    return undefined;
  }
  return loadProjects().find(project => project.id === id);
}

// Delete project function
export function deleteProject(projectId: string): void {
  try {
    // Delete the project
    const projects = loadProjects();
    const updatedProjects = projects.filter(p => p.id !== projectId);
    saveProjects(updatedProjects);
    
    // Delete all associated items and contacts in other modules
    // These functions are imported and called where needed
  } catch (error) {
    console.error("Error deleting project:", error);
  }
}