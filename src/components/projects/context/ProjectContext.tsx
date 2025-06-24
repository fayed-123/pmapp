
import React, { createContext, useContext, ReactNode } from 'react';
import { Project, User, ProjectItem, Contact } from '@/lib/types';
import { useProjectItems } from '../hooks/useProjectItems';
import { useProjectContacts } from '../hooks/useProjectContacts';
import { useProjectEdit } from '../hooks/useProjectEdit';
import { getAnalysisData } from '../utils/projectAnalysis';

interface ProjectContextType {
  project: Project;
  currentUser: User;
  items: ProjectItem[];
  contacts: Contact[];
  canEdit: boolean;
  canReview: boolean;
  addItem: (item: Partial<ProjectItem>) => ProjectItem | undefined;
  updateItem: (item: ProjectItem) => boolean;
  deleteItem: (itemId: string) => void;
  importItems: (items: ProjectItem[]) => void;
  addContact: (contact: Partial<Contact>) => Contact | undefined;
  deleteContact: (contactId: string) => void;
  editProject: ReturnType<typeof useProjectEdit>;
  analysisData: ReturnType<typeof getAnalysisData>;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider: React.FC<{
  children: ReactNode;
  project: Project;
  currentUser: User;
}> = ({ children, project, currentUser }) => {
  const { items, addItem, updateItem, deleteItem, importItems } = useProjectItems(project.id);
  const { contacts, addContact, deleteContact } = useProjectContacts(project.id);
  const editProject = useProjectEdit(project);
  
  const canEdit = currentUser.role === "contractor" && currentUser.id === project.contractorId;
  const canReview = currentUser.role === "consultant";
  
  // Get analysis data
  const analysisData = getAnalysisData(items);
  
  const value = {
    project,
    currentUser,
    items,
    contacts,
    canEdit,
    canReview,
    addItem,
    updateItem,
    deleteItem,
    importItems,
    addContact,
    deleteContact,
    editProject,
    analysisData
  };
  
  return (
    <ProjectContext.Provider value={value}>
      {children}
    </ProjectContext.Provider>
  );
};

export const useProject = () => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
};
