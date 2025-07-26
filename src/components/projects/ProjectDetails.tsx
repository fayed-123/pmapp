// export default ProjectDetails;
import React, { useState, useEffect } from "react";
import {
  Project,
  User,
  ProjectItem,
  Contact,
  Subcontractor,
} from "@/lib/types";
import { useItemForm } from "./hooks/useItemForm";
import { handleExcelExport } from "./handlers/exportHandler";
import { useToast } from "@/components/ui/use-toast";

// Import components
import ProjectHeader from "./sections/ProjectHeader";
import ItemsSection from "./sections/ItemsSection";
import ContactsSection from "./sections/ContactsSection";

// Import modals
import AddItemModal from "./modals/AddItemModal";
import EditItemModal from "./modals/EditItemModal";
import AddContactModal from "./modals/AddContactModal";
import EditProjectModal from "./modals/EditProjectModal";
import ImportItemsModal from "./modals/ImportItemsModal";
import ProjectAnalysisModal from "./modals/ProjectAnalysisModal";

// Import context provider
import { ProjectProvider, useProject } from "./context/ProjectContext";
import { UserOption } from "./hooks/useProjectEdit";

// ** استيراد دالة تحميل الاستشاريين الفرعيين **
import { loadSubcontractorsForCurrentUser } from "@/lib/db";
import ExtractSummaryPage from "../dashboards/ExtractSummaryPage";
import {
  getSubconsultantsForProject,
  loadSubconsultantsForCurrentUser,
  loadUsers,
} from "@/lib/db/users";

interface ProjectDetailsProps {
  project: Project;
  currentUser: User;
  owners?: UserOption[]; 
  consultants?: UserOption[];
  subcontractors?: Subcontractor[];
  subconsultants?: User[];
  onClose: () => void;
}

interface ProjectDetailsContentProps {
  subcontractors?: Subcontractor[];
  subconsultants?: User[];
  owners?: UserOption[]; 
  consultants?: UserOption[];
  currentUser: User;
}

const ProjectDetailsContent: React.FC<ProjectDetailsContentProps> = ({
  subcontractors,
  subconsultants: initialSubconsultants,
  owners,
  consultants,
  currentUser,
}) => {
  const [showAddItem, setShowAddItem] = useState(false);
  const [showEditItem, setShowEditItem] = useState(false);
  const [showAddContact, setShowAddContact] = useState(false);
  const [showImportItems, setShowImportItems] = useState(false);
  const [showEditProject, setShowEditProject] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);

  // ** 1. أنشأنا state جديد لحفظ الاستشاريين الفرعيين **
  const [subconsultants, setSubconsultants] = useState<User[]>(
    initialSubconsultants || []
  );

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
    analysisData,
    refreshProject,
    refreshItems, // Add this new function from context
  } = useProject();

  const [selectedSubcontractorId, setSelectedSubcontractorId] =
    useState<string>((project as any).subcontractor_id || "");

  const { toast } = useToast();
  const itemForm = useItemForm();
  const [editingItem, setEditingItem] = useState<ProjectItem | null>(null);
  const [newContact, setNewContact] = useState<Partial<Contact>>({
    name: "",
    phone: "",
    role: "",
  });

  useEffect(() => {
    async function fetchSubconsultants() {
      // استخدم generalConsultantId بدلاً من consultantId
      const consultantId = project.consultant_id || project.generalConsultantId;

      if (!consultantId) {
        return;
      }

      try {
        let subs = await loadSubconsultantsForCurrentUser(consultantId);
        let sub2 = await getSubconsultantsForProject(project.id);
        const merged = [...subs, ...sub2].filter(
          (user, index, self) =>
            index === self.findIndex((u) => u.id === user.id)
        );
        setSubconsultants(merged);
      } catch (error) {
        console.error("❌ Error loading subconsultants:", error);
      }
    }

    fetchSubconsultants();
  }, [project.consultant_id, project.generalConsultantId]); 

  // باقي الدوال handlers كما هي
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
    setEditingItem({ ...item });
    setShowEditItem(true);
  };

  const handleEditingItemChange = (e: any) => {
    if (!editingItem) return;
    const { name, value } = e.target;

    if (name === "startDate" || name === "endDate") {
      const updatedItem = { ...editingItem, [name]: value };

      if (updatedItem.startDate && updatedItem.endDate) {
        const startDate = new Date(updatedItem.startDate);
        const endDate = new Date(updatedItem.endDate);

        if (endDate >= startDate) {
          const daysDiff = Math.ceil(
            (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
          );
          updatedItem.executionTime = Math.max(1, daysDiff);
        }
      }

      setEditingItem(updatedItem);
    } else {
      setEditingItem({
        ...editingItem,
        [name]:
          name === "progress" || name === "executionTime"
            ? Number(value)
            : value,
      });
    }
  };

  const handleContactChange = (e: any) => {
    const { name, value } = e.target;
    setNewContact({ ...newContact, [name]: value });
  };

  const handleAddContact = (e: React.FormEvent) => {
    e.preventDefault();
    addContact(newContact);
    setNewContact({ name: "", phone: "", role: "" });
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
      variant: result.success ? "default" : "destructive",
    });
  };

  const handleSubmitItems = async () => {
    // Implementation needed - will update all pending items to submitted status
    // This could be used to change status from draft to pending
  };

  // Individual item approval functions - now handled in ItemsCards directly
  const handleApproveItem = async (itemId: string) => {
    // This will be handled by ItemsCards component directly
    console.log('Approve item:', itemId);
  };
  
  const handleRejectItem = async (itemId: string) => {
    // This will be handled by ItemsCards component directly
    console.log('Reject item:', itemId);
  };

  return (
    <div>
      {/* 3. مررنا الـ subconsultants المحملين كـ prop ل ProjectHeader */}
      <ProjectHeader
        project={project}
        canEdit={canEdit}
        canReview={canReview}
        onEditProject={() => setShowEditProject(true)}
        subcontractors={subcontractors}
        subconsultants={subconsultants}
        selectedSubcontractorId={selectedSubcontractorId}
        setSelectedSubcontractorId={setSelectedSubcontractorId}
        currentUser={currentUser}
        role={currentUser?.role || ""}
        refreshProject={refreshProject}
        items={items}
      />

      <ItemsSection
        items={items}
        canEdit={canEdit}
        canReview={canReview}
        project={project}
        timeElapsed={project.timeElapsed}
        expectedDays={project.expectedDays}
        onAddItem={() => setShowAddItem(true)}
        onImportItems={() => setShowImportItems(true)}
        onExportToExcel={handleExportToExcel}
        onShowAnalysis={() => setShowAnalysis(true)}
        onEditItem={handleStartEditItem}
        onDeleteItem={deleteItem}
        onSubmitItems={handleSubmitItems} 
        onApproveItem={handleApproveItem} 
        onRejectItem={handleRejectItem}
        refreshItems={refreshItems} // Pass the refresh function
      />

      <ExtractSummaryPage
        projectValue={project.contractValue}
        advancePaymentPercentage={project.advancePaymentPercentage}
        workGuaranteePercentage={project.workGuaranteePercentage}
        materialDeliveryPaymentPercentage={
          project.materialDeliveryPaymentPercentage
        }
        completedWorkPaymentPercentage={project.completedWorkPaymentPercentage}
        items={items}
      />

      <ContactsSection
        contacts={contacts}
        canEdit={canEdit}
        onAddContact={() => setShowAddContact(true)}
        onDeleteContact={deleteContact}
      />

      {/* المودالات */}
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
        owners={owners} 
        consultants={consultants}
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

const ProjectDetails: React.FC<ProjectDetailsProps> = ({
  project,
  currentUser,
  owners: initialOwners,
  consultants: initialConsultants,
  subcontractors,
  subconsultants,
  onClose,
}) => {
  const [owners, setOwners] = useState<UserOption[]>(initialOwners || []);
  const [consultants, setConsultants] = useState<UserOption[]>(
    initialConsultants || []
  );
  
  useEffect(() => {
    async function fetchUsers() {
      const users = await loadUsers();
      setOwners(
        users
          .filter((u) => u.role === "owner" && u.approved)
          .map((u) => ({ value: u.id, label: u.name, role: u.role }))
      );

      setConsultants(
        users
          .filter((u) => u.role === "consultant" && u.approved)
          .map((u) => ({ value: u.id, label: u.name, role: u.role }))
      );
    }
    fetchUsers();
  }, []);
  
  return (
    <ProjectProvider
      project={project}
      currentUser={currentUser}
    >
      <ProjectDetailsContent
        subcontractors={subcontractors}
        subconsultants={subconsultants}
        owners={owners}
        consultants={consultants}
        currentUser={currentUser}
      />
    </ProjectProvider>
  );
};

export default ProjectDetails;