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

  const canEdit = true; // عشان تظهر الأزرار لكل المستخدمين
  const canReview = true; // عشان تظهر الأزرار لكل المستخدمين

  const analysisData = getAnalysisData(items);

  const value: ProjectContextType = {
    project,
    currentUser,
    items,
    contacts,
    canEdit,
    canReview,
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
