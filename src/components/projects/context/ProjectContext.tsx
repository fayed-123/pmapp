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
import { supabase } from "@/lib/supabase"; // تأكد إنك تستورد supabase

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
  // generalConsultants: UserOption[];
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
  refreshProject: () => Promise<void>;  // إضافة دالة التحديث لل Context
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider: React.FC<{
  children: ReactNode;
  project: Project;
  currentUser: User;
  // generalConsultants?: UserOption[];
  owners?: UserOption[];
  consultants?: UserOption[];
}> = ({ children, project: initialProject, currentUser, /*generalConsultants = []*/owners = [],
  consultants = [], }) => {
    const [project, setProject] = useState<Project>(initialProject);

    // دالة لتحديث بيانات المشروع من الداتابيز
    const refreshProject = async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("id", project.id)
        .single();

      if (!error && data) {
        setProject(data);
      } else {
        console.error("فشل في تحديث بيانات المشروع:", error);
      }
    };

    const {
      items,
      isLoading: itemsLoading,
      addItem,
      updateItem,
      deleteItem,
      importItems,
    } = useProjectItems(project.id);

    const {
      contacts,
      isLoading: contactsLoading,
      addContact,
      deleteContact,
    } = useProjectContacts(project.id);

    const editProject = useProjectEdit(project);

    useEffect(() => {
      setIsContextLoading(
        itemsLoading || contactsLoading || editProject.isLoading
      );
    }, [itemsLoading, contactsLoading, editProject.isLoading]);

    const [isContextLoading, setIsContextLoading] = useState(true);

    const canEdit = () => {
      const role = currentUser.role;
      return (
        role === "mainConsultant" ||
        role === "consultant" ||
        role === "contractor" ||
        role === "subcontractor" ||
        role === "subconsultant"
      );
    };

    const canReview = () => {
      const role = currentUser.role;
      const userId = currentUser.id;

      console.log('🔍 canReview Debug:', {
        userRole: role,
        userId: userId,
        projectElectricalConsultant: project.electricalConsultantId,
        projectArchitectConsultant: project.architectConsultantId,
        projectMechanicalConsultant: project.mechanicalConsultantId,
        items: items.map(item => ({ id: item.id, status: item.status }))
      });

      // Main Consultant can review everything
      if (role === "mainConsultant") return true;

      // Main Consultant can review subconsultant-approved items
      if (role === "consultant" && project.consultantId === userId) return true;

      // Main Contractors can review only PENDING items
      if (role === "contractor" && project.contractorId === userId) {
        const hasPendingItems = items.some(item => item.status === 'pending');
        return hasPendingItems;
      }


      // Sub Consultants can review contractor-approved items of their specialty
      if (role === "subconsultant") {
        const userType = currentUser.type; // "كهربائي", "معماري", "ميكانيكي"

        // Check if assigned to project
        const isAssigned = (
          (userType === "كهربائي" && project.electricalConsultantId === userId) ||
          (userType === "معماري" && project.architectConsultantId === userId) ||
          (userType === "ميكانيكي" && project.mechanicalConsultantId === userId)
        );

        if (isAssigned) {
          // Check if there are contractor_approved items of their type
          const typeMap = {
            "electrical": "كهربائي",
            "architect": "معماري",
            "mechanical": "ميكانيكي"
          };

          const hasRelevantItems = items.some(item => {
            if (item.status !== 'contractor_approved') return false;
            return typeMap[item.subcontractorType] === userType;
          });

          console.log('✅ Subconsultant review check:', {
            isAssigned,
            hasRelevantItems,
            userType,
            itemsOfMyType: items.filter(i => i.status === 'contractor_approved' && typeMap[i.subcontractorType] === userType).length
          });

          return hasRelevantItems;
        }

        return false;
      }

      console.log('❌ Cannot review');
      return false;
    };

    const analysisData = getAnalysisData(items);

    const value: ProjectContextType = {
      project,
      currentUser,
      items,
      contacts,
      canEdit: canEdit(), // Call the function
      canReview: canReview(), // Call the function
      isLoading: isContextLoading,
      // generalConsultants,
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
      refreshProject,  // تمرير الدالة لل Context
    };

    return (
      <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>
    );
  };

export const useProject = () => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error("useProject must be used within a ProjectProvider");
  }
  return context;
};
