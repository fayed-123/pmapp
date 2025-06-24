import { ProjectItem, Project } from "../types";
import { getProjectById } from "./projects";

// Add a flag to prevent infinite loops
let isLoadingItems = false;

export function loadItems(): ProjectItem[] {
  // Prevent recursive calls
  if (isLoadingItems) {
    return [];
  }
  
  try {
    isLoadingItems = true;
    const items = JSON.parse(localStorage.getItem('ppm_items') || "[]");
    
    // Group items by project
    const itemsByProject: { [key: string]: ProjectItem[] } = {};
    items.forEach(item => {
      if (!itemsByProject[item.projectId]) {
        itemsByProject[item.projectId] = [];
      }
      itemsByProject[item.projectId].push(item);
    });
    
    // Process each project's items
    const processedItems: ProjectItem[] = [];
    
    for (const projectId in itemsByProject) {
      const projectItems = itemsByProject[projectId];
      
      // Calculate total execution time for the project
      const totalExecutionTime = projectItems.reduce((sum, item) => sum + (item.executionTime || 0), 0);
      
      // Calculate weight and weighted progress for each item
      projectItems.forEach(item => {
        const weight = totalExecutionTime > 0 ? (item.executionTime || 0) / totalExecutionTime : 0;
        const weightedProgress = weight * (item.progress || 0);
        
        // Calculate the execution time if startDate and endDate are provided
        let executionTime = item.executionTime || 0;
        if (item.startDate && item.endDate) {
          const startDate = new Date(item.startDate);
          const endDate = new Date(item.endDate);
          const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
          executionTime = Math.max(1, daysDiff); // Ensure at least 1 day
        }
        
        // Pass only the projectId for risk calculation to avoid project lookup during item loading
        const riskLevel = calculateRiskLevel(item);
        
        processedItems.push({
          ...item,
          weight,
          weightedProgress,
          executionTime,
          riskLevel
        });
      });
    }
    
    isLoadingItems = false;
    return processedItems;
  } catch (error) {
    console.error("Error loading items:", error);
    isLoadingItems = false;
    return [];
  }
}

// Modified to not use getProjectById during initial loading
function calculateRiskLevel(item: ProjectItem): "low" | "medium" | "high" {
  let riskLevel: "low" | "medium" | "high" = "low";
  
  if (item.startDate && item.endDate) {
    // Get current date
    const now = new Date();
    const startDate = new Date(item.startDate);
    const endDate = new Date(item.endDate);
    
    // Calculate elapsed time as percentage of total item duration
    const totalItemDuration = endDate.getTime() - startDate.getTime();
    const elapsedTime = now.getTime() - startDate.getTime();
    const elapsedPercentage = totalItemDuration > 0 ? (elapsedTime / totalItemDuration) * 100 : 0;
    
    // If current date is past the item end date and progress is not 100%, high risk
    if (now > endDate && item.progress < 100) {
      riskLevel = "high";
    } 
    // If elapsed time percentage is significantly higher than progress percentage, item is behind schedule
    else if (elapsedPercentage > 0 && item.progress < elapsedPercentage * 0.7) {
      riskLevel = "high";  // More than 30% behind schedule relative to time
    } 
    else if (elapsedPercentage > 0 && item.progress < elapsedPercentage * 0.8) {
      riskLevel = "medium";  // Between 20% and 30% behind schedule relative to time
    }
  }
  
  return riskLevel;
}

export function saveItems(items: ProjectItem[]): void {
  try {
    localStorage.setItem('ppm_items', JSON.stringify(items));
  } catch (error) {
    console.error("Error saving items:", error);
  }
}

// Function to delete items by project ID
export function deleteItemsByProjectId(projectId: string): void {
  try {
    const items = loadItems();
    const updatedItems = items.filter(i => i.projectId !== projectId);
    saveItems(updatedItems);
  } catch (error) {
    console.error("Error deleting items by project ID:", error);
  }
}

// Add this function to update risk levels after projects are loaded
export function updateItemRiskLevels(): ProjectItem[] {
  try {
    const items = loadItems();
    
    // Now that projects are loaded, we can safely get project info for risk calculation
    const updatedItems = items.map(item => {
      // Only calculate risk if we haven't already during loading
      return item;
    });
    
    return updatedItems;
  } catch (error) {
    console.error("Error updating risk levels:", error);
    return [];
  }
}