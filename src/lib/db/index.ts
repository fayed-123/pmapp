// Export all database functions from this central file

// User related functions
export {
  loadUsers,
  saveUsers,
  getUserById,
  getUserNameById,
  getCurrentUser,
  setCurrentUser,
  loadSubcontractorsForCurrentUser,
  addSubcontractorUser, 
  deleteSubcontractor,
  addSubconsultantUser,
  loadSubconsultantsForCurrentUser,
  deleteSubconsultant,
  getSubconsultantsForProject
} from './users';

// Project related functions
export {
  loadProjects,
  saveProject,
  getProjectById,
  deleteProject,
  loadProjectsForSubcontractor,
  loadProjectsForSubconsultant
} from './projects';

// Project items related functions
export {
  loadItems,
  loadProjectItems, // Main function for loading project items with filtering
  saveItem,
  deleteItemsByProjectId,
  updateItemRiskLevels
} from './items';

// Contact related functions
export {
  loadContacts,
  saveContact,
  deleteContact,
  deleteContactsByProjectId
} from './contacts';

// Project metrics related functions
export {
  updateProjectCompletion
} from './projectMetrics';

// Utility functions for project deletion
import { deleteProject } from './projects';
import { deleteItemsByProjectId } from './items';
import { deleteContactsByProjectId } from './contacts';

/**
 * Delete project with all related data
 */
export async function deleteProjectWithAllData(projectId: string): Promise<void> {
  try {
    // Delete related items and contacts first
    await deleteItemsByProjectId(projectId);
    await deleteContactsByProjectId(projectId);

    // Finally delete the project
    await deleteProject(projectId);
  } catch (error) {
    console.error("Error deleting project with all data:", error);
    throw error;
  }
}