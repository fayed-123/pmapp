
import React, { useState } from 'react';
import { Project, User, ProjectItem, Contact } from '@/lib/types';
import { useItemForm } from './hooks/useItemForm';
import { handleExcelExport } from './handlers/exportHandler';
import { useToast } from '@/components/ui/use-toast';

// Import components
import ProjectHeader from './sections/ProjectHeader';
import ItemsSection from './sections/ItemsSection';
import ContactsSection from './sections/ContactsSection';

// Import modals
import AddItemModal from './modals/AddItemModal';
import EditItemModal from './modals/EditItemModal';
import AddContactModal from './modals/AddContactModal';
import EditProjectModal from './modals/EditProjectModal';
import ImportItemsModal from './modals/ImportItemsModal';
import ProjectAnalysisModal from './modals/ProjectAnalysisModal';

// Import context provider
import { ProjectProvider, useProject } from './context/ProjectContext';

interface ProjectDetailsProps {
  project: Project;
  currentUser: User;
  onClose: () => void;
}

const ProjectDetailsContent: React.FC = () => {
  // State for modal visibility
  const [showAddItem, setShowAddItem] = useState(false);
  const [showEditItem, setShowEditItem] = useState(false);
  const [showAddContact, setShowAddContact] = useState(false);
  const [showImportItems, setShowImportItems] = useState(false);
  const [showEditProject, setShowEditProject] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);
  
  // Get project context
  const {
    project,
    items,
    addItem,
    updateItem,
    deleteItem,
    importItems,
    contacts,
    addContact,
    deleteContact,
    canEdit,
    canReview,
    editProject,
    analysisData
  } = useProject();
  
  const { toast } = useToast();
  
  // Form handling hooks
  const itemForm = useItemForm();
  const [editingItem, setEditingItem] = useState<ProjectItem | null>(null);
  const [newContact, setNewContact] = useState<Partial<Contact>>({ name: '', phone: '', role: '' });
  
  // Event handlers
  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    addItem(itemForm.newItem);
    itemForm.resetItemForm();
    setShowAddItem(false);
  };
  
  const handleEditItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    if (updateItem(editingItem)) {
      setEditingItem(null);
      setShowEditItem(false);
    }
  };
  
  const handleStartEditItem = (item: ProjectItem) => {
    setEditingItem({...item});
    setShowEditItem(true);
  };
  
  const handleEditingItemChange = (e: any) => {
    if (!editingItem) return;
    
    const { name, value } = e.target;
    
    // For date fields, check if they're valid and calculate execution time
    if (name === 'startDate' || name === 'endDate') {
      const updatedItem = {
        ...editingItem,
        [name]: value,
      };
      
      // If both dates are valid, calculate the execution time
      if (updatedItem.startDate && updatedItem.endDate) {
        const startDate = new Date(updatedItem.startDate);
        const endDate = new Date(updatedItem.endDate);
        
        if (endDate >= startDate) {
          const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
          updatedItem.executionTime = Math.max(1, daysDiff); // Ensure at least 1 day
        }
      }
      
      setEditingItem(updatedItem);
    } else {
      setEditingItem({
        ...editingItem,
        [name]: name === 'progress' || name === 'executionTime' ? Number(value) : value,
      });
    }
  };
  
  const handleContactChange = (e: any) => {
    const { name, value } = e.target;
    setNewContact({
      ...newContact,
      [name]: value,
    });
  };
  
  const handleAddContact = (e: React.FormEvent) => {
    e.preventDefault();
    addContact(newContact);
    setNewContact({ name: '', phone: '', role: '' });
    setShowAddContact(false);
  };
  
  const handleImportComplete = (importedItems: ProjectItem[]) => {
    importItems(importedItems);
    setShowImportItems(false);
  };
  
  const handleExportToExcel = () => {
    const result = handleExcelExport(items, project.name);
    
    toast({
      title: result.success ? "تم التصدير" : "خطأ",
      description: result.message,
      variant: result.success ? "default" : "destructive"
    });
  };

  return (
    <div>
      <ProjectHeader 
        project={project}
        canEdit={canEdit}
        canReview={canReview}
        onEditProject={() => setShowEditProject(true)}
      />
      
      <ItemsSection 
        items={items}
        canEdit={canEdit}
        canReview={canReview}
        timeElapsed={project.timeElapsed}
        expectedDays={project.expectedDays}
        onAddItem={() => setShowAddItem(true)}
        onImportItems={() => setShowImportItems(true)}
        onExportToExcel={handleExportToExcel}
        onShowAnalysis={() => setShowAnalysis(true)}
        onEditItem={handleStartEditItem}
        onDeleteItem={deleteItem}
      />
      
      <ContactsSection 
        contacts={contacts}
        canEdit={canEdit}
        onAddContact={() => setShowAddContact(true)}
        onDeleteContact={deleteContact}
      />
      
      {/* Modals */}
      <AddItemModal 
        isOpen={showAddItem}
        onClose={() => setShowAddItem(false)}
        newItem={itemForm.newItem}
        onItemChange={itemForm.handleItemChange}
        onSubmit={handleAddItem}
      />
      
      <EditItemModal 
        isOpen={showEditItem}
        onClose={() => setShowEditItem(false)}
        editingItem={editingItem}
        onItemChange={handleEditingItemChange}
        onSubmit={handleEditItem}
      />
      
      <AddContactModal 
        isOpen={showAddContact}
        onClose={() => setShowAddContact(false)}
        newContact={newContact}
        onContactChange={handleContactChange}
        onSubmit={handleAddContact}
      />
      
      <ImportItemsModal 
        isOpen={showImportItems}
        onClose={() => setShowImportItems(false)}
        projectId={project.id}
        onImportComplete={handleImportComplete}
      />
      
      <EditProjectModal 
        isOpen={showEditProject}
        onClose={() => setShowEditProject(false)}
        editProject={editProject.editProject}
        owners={editProject.owners}
        consultants={editProject.consultants}
        onProjectChange={editProject.handleEditProjectChange}
        onSubmit={editProject.saveProjectEdit}
      />
      
      <ProjectAnalysisModal 
        isOpen={showAnalysis}
        onClose={() => setShowAnalysis(false)}
        analysisData={analysisData}
      />
    </div>
  );
};

const ProjectDetails: React.FC<ProjectDetailsProps> = ({ project, currentUser, onClose }) => {
  return (
    <ProjectProvider project={project} currentUser={currentUser}>
      <ProjectDetailsContent />
    </ProjectProvider>
  );
};

export default ProjectDetails;
