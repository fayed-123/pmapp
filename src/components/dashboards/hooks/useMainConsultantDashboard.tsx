
import { useState, useEffect, useRef } from 'react';
import { loadProjects, loadUsers, saveUsers, saveProjects } from '@/lib/db';
import { useToast } from '@/components/ui/use-toast';
import { Project, User } from '@/lib/types';
import { useAuth } from '@/context/AuthContext';
import { useUserManagement } from '@/hooks/useUserManagement';
import { Tab } from '../types/dashboardTypes';
import { MAIN_CONSULTANT_NAME, MAIN_CONSULTANT_EMAIL } from '@/constants/auth';

export const useMainConsultantDashboard = () => {
  const [activeTab, setActiveTab] = useState<Tab>(Tab.Projects);
  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showProjectDetails, setShowProjectDetails] = useState(false);
  const { toast } = useToast();
  const { user: currentUser, addUser, deleteUser } = useAuth();
  const shownPendingRef = useRef<string[]>([]);
  
  // User management custom hook
  const userManagement = useUserManagement();

  useEffect(() => {
    if (activeTab === Tab.Projects) {
      setProjects(loadProjects());
    } else if (activeTab === Tab.Users || activeTab === Tab.Consultants) {
      setUsers(loadUsers().sort((a, b) => a.role.localeCompare(b.role)));
    }
  }, [activeTab]);

  useEffect(() => {
    if (!currentUser || currentUser.role !== 'mainConsultant') return;
    
    const allUsers = loadUsers();
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
  }, [currentUser, users, toast]);

  const handleApproveUser = (userId: string) => {
    const updatedUsers = users.map(user => 
      user.id === userId ? { ...user, approved: true } : user
    );
    saveUsers(updatedUsers);
    setUsers(updatedUsers);
    toast({
      title: "تمت الموافقة",
      description: "تم تفعيل حساب المستخدم بنجاح",
    });
  };

  const handleDeleteProject = (projectId: string) => {
    const updatedProjects = projects.filter(p => p.id !== projectId);
    saveProjects(updatedProjects);
    setProjects(updatedProjects);
    toast({
      title: "تم الحذف",
      description: "تم حذف المشروع بنجاح",
    });
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
    
    const success = await addUser(name, role as any, isMainConsultant);
    if (success) {
      setUsers(loadUsers().sort((a, b) => a.role.localeCompare(b.role)));
    }
  };

  const handleViewProject = (project: Project) => {
    setSelectedProject(project);
    setShowProjectDetails(true);
  };

  const handleCloseProjectDetails = () => {
    setShowProjectDetails(false);
    setSelectedProject(null);
    setProjects(loadProjects());
  };

  const handleDeleteUser = async (userId: string) => {
    const success = await deleteUser(userId);
    if (success) {
      setUsers(loadUsers().sort((a, b) => a.role.localeCompare(b.role)));
    }
  };

  return {
    activeTab,
    setActiveTab,
    projects,
    users,
    selectedProject,
    showProjectDetails,
    handleApproveUser,
    handleDeleteProject,
    handleAddUser,
    handleViewProject,
    handleCloseProjectDetails,
    handleDeleteUser,
    currentUser
  };
};
