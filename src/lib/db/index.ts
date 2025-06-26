
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
  saveProject,
  getProjectById,
  deleteProject
} from './projects';

// Project items related functions
export {
  loadItems,
  saveItem,
  deleteItemsByProjectId
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

// Delete project with all related data
export async function deleteProjectWithAllData(projectId: string): Promise<void> {
  try {
    // Import specific functions to avoid circular dependencies
    // Import specific functions to avoid circular dependencies
    const { deleteProject } = require('./projects');
    const { deleteItemsByProjectId } = require('./items');
    const { deleteContactsByProjectId } = require('./contacts');

    // Delete related items and contacts first
    await deleteItemsByProjectId(projectId);
    await deleteContactsByProjectId(projectId);

    // Finally delete the project
    await deleteProject(projectId);
  } catch (error) {
    console.error("Error deleting project with all data:", error);
  }
}
