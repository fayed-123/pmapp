
// Export all database functions from this central file

// User related functions
export {
  loadUsers,
  saveUsers,
  getUserById,
  getUserNameById,
  getCurrentUser,
  setCurrentUser
} from './users';

// Project related functions
export {
  loadProjects,
  saveProjects,
  getProjectById,
  deleteProject
} from './projects';

// Project items related functions
export {
  loadItems,
  saveItems,
  deleteItemsByProjectId
} from './items';

// Contact related functions
export {
  loadContacts,
  saveContacts,
  deleteContactsByProjectId
} from './contacts';

// Project metrics related functions
export {
  updateProjectCompletion
} from './projectMetrics';

// Delete project with all related data
export function deleteProjectWithAllData(projectId: string): void {
  try {
    // Import specific functions to avoid circular dependencies
    const { deleteProject } = require('./projects');
    const { deleteItemsByProjectId } = require('./items');
    const { deleteContactsByProjectId } = require('./contacts');
    
    // Delete related items and contacts first
    deleteItemsByProjectId(projectId);
    deleteContactsByProjectId(projectId);
    
    // Finally delete the project
    deleteProject(projectId);
  } catch (error) {
    console.error("Error deleting project with all data:", error);
  }
}
