import { useState, useEffect, useRef } from "react";
import {
  loadProjects,
  loadUsers,
  saveProject,
  deleteProjectWithAllData,
  getUserNameById,
} from "@/lib/db";
import { useToast } from "@/components/ui/use-toast";
import { Project, User } from "@/lib/types";
import { useAuth } from "@/context/AuthContext";
import { useUserManagement } from "@/hooks/useUserManagement";
import { Tab } from "../types/dashboardTypes";
import { MAIN_CONSULTANT_NAME, MAIN_CONSULTANT_EMAIL } from "@/constants/auth";
import { userService } from "@/services/UserService";
import { supabase } from "@/lib/supabase";

export const useMainConsultantDashboard = () => {
  const [activeTab, setActiveTab] = useState<Tab>(Tab.Projects);
  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showProjectDetails, setShowProjectDetails] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [userNames, setUserNames] = useState<{ [key: string]: string }>({});
  const { toast } = useToast();
  const { user: currentUser, addUser, deleteUser } = useAuth();
  const shownPendingRef = useRef<string[]>([]);

  // User management custom hook
  const userManagement = useUserManagement();

  useEffect(() => {
    if (currentUser) {
      loadData();
    }
  }, [currentUser]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const allProjects = await loadProjects();

      let filteredProjects = allProjects;

      if (currentUser?.role === "mainConsultant") {
        filteredProjects = allProjects.filter((project) => {
          const match =
            project.main_consultant_id === currentUser.id ||
            project.owner_id === currentUser.id ||
            project.consultant_id === currentUser.id ||        // ADD THIS LINE
            project.created_by === currentUser.id;             // ADD THIS LINE TOO
          return match;
        });
      } else if (currentUser?.role === "generalConsultant") {
        filteredProjects = allProjects.filter((project) => {
          const match = project.generalConsultantId === currentUser.id;
          return match;
        });
      }

      // جمع معرفات المستخدمين
      const userIds = [
        ...new Set(
          [
            ...filteredProjects.map((p) => p.owner_id),
            ...filteredProjects.map((p) => p.consultant_id),
            ...filteredProjects.map((p) => p.contractor_id),
            ...filteredProjects.map((p) => p.generalConsultantId),
            ...filteredProjects.map((p) => p.mainConsultantId),
          ].filter(Boolean)
        ),
      ];

      // تحميل أسماء المستخدمين
      const names: { [key: string]: string } = {};
      for (const userId of userIds) {
        const userName = await getUserNameById(userId);
        names[userId] = userName;
      }
      setUserNames(names);

      // دمج الأسماء داخل المشاريع
      const projectsWithNames = filteredProjects.map((project) => ({
        ...project,
        ownerName: names[project.owner_id] || "-",
        consultantName: names[project.consultant_id] || "-",
        contractorName: names[project.contractor_id] || "-",
        generalConsultantName: names[project.generalConsultantId] || "-",
        mainConsultantName: names[project.mainConsultantId] || "-",
      }));

      setProjects(projectsWithNames);

      // تحميل جميع المستخدمين
      const allUsers = await loadUsers();
      setUsers(allUsers.sort((a, b) => a.role.localeCompare(b.role)));
    } catch (error) {
      console.error("Error loading data:", error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تحميل البيانات",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!currentUser || currentUser.role !== "mainConsultant") return;

    const checkPendingUsers = async () => {
      try {
        const allUsers = await loadUsers();
        const pending = allUsers.filter(
          (u) =>
            !u.approved &&
            u.name !== MAIN_CONSULTANT_NAME &&
            u.email !== MAIN_CONSULTANT_EMAIL
        );

        pending.forEach((u) => {
          if (!shownPendingRef.current.includes(u.id)) {
            toast({
              title: "طلب موافقة مستخدم جديد",
              description: `المستخدم "${u.name}" بحاجة للموافقة.`,
              variant: "default",
            });
            shownPendingRef.current.push(u.id);
          }
        });
      } catch (error) {
        console.error("Error checking pending users:", error);
      }
    };

    checkPendingUsers();
  }, [currentUser, users, toast]);

  const handleApproveUser = async (userId: string) => {
    try {
      const success = await userService.approveUser(userId);
      if (success) {
        const updatedUsers = await loadUsers();
        setUsers(updatedUsers.sort((a, b) => a.role.localeCompare(b.role)));
      }
    } catch (error) {
      console.error("Error approving user:", error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء الموافقة على المستخدم",
        variant: "destructive",
      });
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    try {
      await deleteProjectWithAllData(projectId);
      await loadData();

      toast({
        title: "تم الحذف",
        description: "تم حذف المشروع وجميع بياناته بنجاح",
      });
    } catch (error) {
      console.error("Error deleting project:", error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء حذف المشروع",
        variant: "destructive",
      });
    }
  };

  const handleAddUser = async (
    name: string,
    role:
      | "owner"
      | "contractor"
      | "consultant"
      | "generalConsultant"
      | "mainConsultant",
    isMainConsultant = false
  ) => {
    if (!name.trim()) {
      toast({
        title: "خطأ",
        description: "يرجى إدخال اسم المستخدم",
        variant: "destructive",
      });
      return;
    }

    try {
      // إذا كان الدور "mainConsultant" فنعامله كاستشاري رئيسي
      let baseRole = role;
      let mainConsultantFlag = isMainConsultant;

      if (role === "mainConsultant") {
        baseRole = "consultant";
        mainConsultantFlag = true;
      }

      const success = await addUser(name, baseRole as any, mainConsultantFlag);
      if (success) {
        const updatedUsers = await loadUsers();
        setUsers(updatedUsers.sort((a, b) => a.role.localeCompare(b.role)));
        const newUser = updatedUsers.find(
          (u) => u.name === name && u.role === baseRole
        );

        if (newUser) {
          await supabase.from("notifications").insert([
            {
              title: "تمت إضافتك",
              message: `تمت إضافتك إلى النظام بواسطة ${currentUser.name}`,
              type: "system",
              from_user_id: currentUser.id,
              from_user_name: currentUser.name,
              from_user_role: currentUser.role,
              to_user_id: newUser.id,
              data: {
                action: "added_user",
                role: newUser.role,
              },
            },
          ]);
        }
      }
    } catch (error) {
      console.error("Error adding user:", error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء إضافة المستخدم",
        variant: "destructive",
      });
    }
  };

  const handleViewProject = (project: Project) => {
    setSelectedProject(project);
    setShowProjectDetails(true);
  };

  const handleCloseProjectDetails = async () => {
    setShowProjectDetails(false);
    setSelectedProject(null);

    try {
      await loadData();
    } catch (error) {
      console.error("Error reloading projects:", error);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      const success = await deleteUser(userId);
      if (success) {
        const updatedUsers = await loadUsers();
        setUsers(updatedUsers.sort((a, b) => a.role.localeCompare(b.role)));
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء حذف المستخدم",
        variant: "destructive",
      });
    }
  };
  const handleProjectCreated = async () => {
    try {
      await loadData();
    } catch (error) {
      console.error("Error loading projects after creation:", error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تحديث قائمة المشاريع",
        variant: "destructive",
      });
    }
  };

  return {
    activeTab,
    setActiveTab,
    projects,
    users,
    selectedProject,
    showProjectDetails,
    isLoading,
    userNames,
    handleApproveUser,
    handleDeleteProject,
    handleAddUser,
    handleViewProject,
    handleCloseProjectDetails,
    handleDeleteUser,
    currentUser,
    handleProjectCreated,
  };
};
