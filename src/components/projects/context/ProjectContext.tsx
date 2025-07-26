import React, {
  createContext,
  useContext,
  ReactNode,
  useState,
  useEffect,
} from "react";
import { Project, User, ProjectItem, Contact } from "@/lib/types";
import { useProjectItems } from "../hooks/useProjectItems";
import { useProjectContacts } from "../hooks/useProjectContacts";
import { useProjectEdit } from "../hooks/useProjectEdit";
import { getAnalysisData } from "../utils/projectAnalysis";
import { supabase } from "@/lib/supabase";
import { hasFullAccess, hasFilteredAccess, getItemTypeForUser } from "@/lib/utils/typeMapping";

interface UserOption {
  value: string;
  label: string;
}

interface ProjectContextType {
  project: Project;
  currentUser: User;
  items: ProjectItem[];
  contacts: Contact[];
  canEdit: boolean;
  canReview: boolean;
  isLoading: boolean;
  owners: UserOption[];
  consultants: UserOption[];
  addItem: (item: Partial<ProjectItem>) => Promise<ProjectItem | undefined>;
  updateItem: (item: ProjectItem) => Promise<boolean>;
  deleteItem: (itemId: string) => Promise<void>;
  importItems: (items: ProjectItem[]) => Promise<void>;
  addContact: (contact: Partial<Contact>) => Promise<Contact | undefined>;
  deleteContact: (contactId: string) => Promise<void>;
  editProject: ReturnType<typeof useProjectEdit>;
  analysisData: ReturnType<typeof getAnalysisData>;
  refreshProject: () => Promise<void>;
  refreshItems: () => Promise<void>; // Add this new function
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider: React.FC<{
  children: ReactNode;
  project: Project;
  currentUser: User;
  owners?: UserOption[];
  consultants?: UserOption[];
}> = ({ 
  children, 
  project: initialProject, 
  currentUser, 
  owners = [],
  consultants = [] 
}) => {
  const [project, setProject] = useState<Project>(initialProject);

  // Refresh project data from database
  const refreshProject = async () => {
    try {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("id", project.id)
        .single();

      if (!error && data) {
        // Convert database format to application format
        const convertedProject = {
          ...data,
          start: data.start_date,
          end: data.end_date,
          timeElapsed: data.time_elapsed,
          expectedDays: data.expected_days,
          consultantId: data.consultant_id,
          contractorId: data.contractor_id,
          ownerId: data.owner_id,
          contractValue: data.contract_value,
          advancePaymentPercentage: data.advance_payment_percentage,
          workGuaranteePercentage: data.work_guarantee_percentage,
          materialDeliveryPaymentPercentage: data.material_delivery_payment_percentage,
          completedWorkPaymentPercentage: data.completed_work_payment_percentage,
          electricalconsultantid: data.electricalconsultantid,
          architectconsultantid: data.architectconsultantid,
          mechanicalconsultantid: data.mechanicalconsultantid,
          electricalcontractorid: data.electricalcontractorid,
          architectcontractorid: data.architectcontractorid,
          mechanicalcontractorid: data.mechanicalcontractorid,
        };
        setProject(convertedProject);
      } else {
        console.error("فشل في تحديث بيانات المشروع:", error);
      }
    } catch (error) {
      console.error("خطأ في تحديث المشروع:", error);
    }
  };

  // Use the updated hook that includes database filtering
  const {
    items,
    isLoading: itemsLoading,
    addItem,
    updateItem,
    deleteItem,
    importItems,
    refreshItems, // Get this from the hook
  } = useProjectItems(project.id);

  const {
    contacts,
    isLoading: contactsLoading,
    addContact,
    deleteContact,
  } = useProjectContacts(project.id);

  const editProject = useProjectEdit(project);

  const [isContextLoading, setIsContextLoading] = useState(true);

  useEffect(() => {
    setIsContextLoading(
      itemsLoading || contactsLoading || editProject.isLoading
    );
  }, [itemsLoading, contactsLoading, editProject.isLoading]);

  // Enhanced canEdit function with database-level filtering awareness
  const canEdit = (): boolean => {
    const role = currentUser.role;
    
    // Full access roles can edit
    if (hasFullAccess(role)) {
      return true;
    }
    
    // Filtered access roles can edit items of their type
    if (hasFilteredAccess(role)) {
      return true;
    }
    
    return false;
  };

  // Enhanced canReview function with proper workflow logic for individual items
  const canReview = (): boolean => {
    const role = currentUser.role;
    const userId = currentUser.id;

    // Main Consultant can review everything
    if (role === "mainConsultant") return true;

    // Consultant can review subconsultant-approved items
    if (role === "consultant" && project.consultant_id === userId) {
      return items.some(item => item.status === 'subconsultant_approved');
    }

    // Main Contractors can review pending items
    if (role === "contractor" && project.contractor_id === userId) {
      return items.some(item => item.status === 'pending');
    }

    // Subconsultants can review contractor-approved items of their specialty
    if (role === "subconsultant") {
      const userType = currentUser.type;
      const userItemType = getItemTypeForUser(userType || '');

      // Check if assigned to project
      const isAssigned = (
        (userType === "كهربائي" && project.electricalconsultantid === userId) ||
        (userType === "معماري" && project.architectconsultantid === userId) ||
        (userType === "ميكانيكي" && project.mechanicalconsultantid === userId)
      );

      if (isAssigned && userItemType) {
        // Check if there are contractor_approved items of their type
        return items.some(item => {
          return item.status === 'contractor_approved' && 
                 item.subcontractorType === userItemType;
        });
      }
    }

    return false;
  };

  // Analysis data based on filtered items (only items user can see)
  const analysisData = getAnalysisData(items);

  const value: ProjectContextType = {
    project,
    currentUser,
    items, // These are already filtered by the database
    contacts,
    canEdit: canEdit(),
    canReview: canReview(),
    isLoading: isContextLoading,
    owners,
    consultants,
    addItem,
    updateItem,
    deleteItem,
    importItems,
    addContact,
    deleteContact,
    editProject,
    analysisData,
    refreshProject,
    refreshItems, // Add this to the context value
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
    throw new Error("useProject must be used within a ProjectProvider");
  }
  return context;
};