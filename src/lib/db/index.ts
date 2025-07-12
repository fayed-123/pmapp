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
  deleteSubcontractor
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


// Import the functions you need here
import { deleteProject } from './projects';
import { deleteItemsByProjectId } from './items';
import { deleteContactsByProjectId } from './contacts';

// Delete project with all related data
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
