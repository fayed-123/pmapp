import { useState, useEffect, useRef } from 'react';
import { loadProjects, loadUsers, saveProject, deleteProjectWithAllData, getUserNameById } from '@/lib/db';
import { useToast } from '@/components/ui/use-toast';
import { Project, User } from '@/lib/types';
import { useAuth } from '@/context/AuthContext';
import { useUserManagement } from '@/hooks/useUserManagement';
import { Tab } from '../types/dashboardTypes';
import { MAIN_CONSULTANT_NAME, MAIN_CONSULTANT_EMAIL } from '@/constants/auth';
import { userService } from '@/services/UserService';

export const useMainConsultantDashboard = () => {
  const [activeTab, setActiveTab] = useState<Tab>(Tab.Projects);
  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showProjectDetails, setShowProjectDetails] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [userNames, setUserNames] = useState<{[key: string]: string}>({});
  const { toast } = useToast();
  const { user: currentUser, addUser, deleteUser } = useAuth();
  const shownPendingRef = useRef<string[]>([]);
  
  // User management custom hook
  const userManagement = useUserManagement();

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      if (activeTab === Tab.Projects) {
        const allProjects = await loadProjects();
        setProjects(allProjects);
        
        // Load user names for projects
        const userIds = [...new Set([
          ...allProjects.map(p => p.ownerId),
          ...allProjects.map(p => p.consultantId),
          ...allProjects.map(p => p.contractorId)
        ].filter(Boolean))];
        
        const names: {[key: string]: string} = {};
        for (const userId of userIds) {
          const userName = await getUserNameById(userId);
          names[userId] = userName;
        }
        setUserNames(names);
      } else if (activeTab === Tab.Users || activeTab === Tab.Consultants || activeTab === Tab.Stats) {
        // Load users for user management tabs and stats
        const allUsers = await loadUsers();
        setUsers(allUsers.sort((a, b) => a.role.localeCompare(b.role)));
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تحميل البيانات",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!currentUser || currentUser.role !== 'mainConsultant') return;
    
    const checkPendingUsers = async () => {
      try {
        const allUsers = await loadUsers();
        const pending = allUsers.filter(u => 
          !u.approved && 
          u.name !== MAIN_CONSULTANT_NAME && 
          u.email !== MAIN_CONSULTANT_EMAIL
        );
        
        pending.forEach(u => {
          if (!shownPendingRef.current.includes(u.id)) {
            toast({
              title: "طلب موافقة مستخدم جديد",
              description: `المستخدم "${u.name}" بحاجة للموافقة.`,
              variant: "default"
            });
            shownPendingRef.current.push(u.id);
          }
        });
      } catch (error) {
        console.error('Error checking pending users:', error);
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
      console.error('Error approving user:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء الموافقة على المستخدم",
        variant: "destructive"
      });
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    try {
      await deleteProjectWithAllData(projectId);
      const updatedProjects = await loadProjects();
      setProjects(updatedProjects);
      
      toast({
        title: "تم الحذف",
        description: "تم حذف المشروع وجميع بياناته بنجاح",
      });
    } catch (error) {
      console.error('Error deleting project:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء حذف المشروع",
        variant: "destructive"
      });
    }
  };

  const handleAddUser = async (name: string, role: "owner" | "contractor" | "consultant", isMainConsultant = false) => {
    if (!name.trim()) {
      toast({
        title: "خطأ",
        description: "يرجى إدخال اسم المستخدم",
        variant: "destructive"
      });
      return;
    }
    
    try {
      const success = await addUser(name, role as any, isMainConsultant);
      if (success) {
        const updatedUsers = await loadUsers();
        setUsers(updatedUsers.sort((a, b) => a.role.localeCompare(b.role)));
      }
    } catch (error) {
      console.error('Error adding user:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء إضافة المستخدم",
        variant: "destructive"
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
      const updatedProjects = await loadProjects();
      setProjects(updatedProjects);
    } catch (error) {
      console.error('Error reloading projects:', error);
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
      console.error('Error deleting user:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء حذف المستخدم",
        variant: "destructive"
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
    currentUser
  };
};