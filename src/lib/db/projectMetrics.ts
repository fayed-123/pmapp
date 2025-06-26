import { loadItems } from "./items";
import { loadProjects, saveProject } from "./projects";

// Update project completion
export async function updateProjectCompletion(projectId: string): Promise<void> {
  try {
    const projects = await loadProjects();
    const project = projects.find(p => p.id === projectId);
    const items = (await loadItems()).filter(i => i.projectId === projectId);
    
    if (!project || !items.length) return;
    
    // Calculate total weighted progress
    const totalWeightedProgress = items.reduce((sum, item) => sum + (item.weightedProgress || 0), 0);
    
    // Calculate time elapsed in days
    let daysElapsed = 0;
    if (project.start) {
      const startDate = new Date(project.start);
      const now = new Date();
      daysElapsed = Math.max(Math.ceil((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)), 0);
    }
    
    // Update project metrics
    project.completion = Math.round(totalWeightedProgress);
    project.timeElapsed = daysElapsed; // Store as days
    project.performance = 0; // Setting performance to 0 as requested
    
    // Calculate expected days using the formula: (100 - completion) / (completion / timeElapsed)
    let expectedDays = 0;
    
    // Fix for division by zero and edge cases
    if (daysElapsed > 0 && project.completion > 0) {
      // Safe calculation with completion > 0
      expectedDays = Math.round((100 - project.completion) / (project.completion / daysElapsed));
    } else if (project.completion >= 100) {
      // Project is complete
      expectedDays = daysElapsed;
    } else if (project.end && project.start) {
      // Fallback: use planned duration from project dates
      expectedDays = Math.ceil((new Date(project.end).getTime() - new Date(project.start).getTime()) / (1000 * 60 * 60 * 24));
    } else {
      // Default fallback value
      expectedDays = 30;
    }
    
    project.expectedDays = Math.max(1, expectedDays);
    
    await saveProject(project);
  } catch (error) {
    console.error("Error updating project completion:", error);
  }
}