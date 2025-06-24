
import { useState, useEffect } from 'react';
import { Project, User } from '@/lib/types';
import { loadProjects, saveProjects, loadUsers } from '@/lib/db';
import { useToast } from '@/components/ui/use-toast';

export interface UserOption {
  value: string;
  label: string;
  role: string;
}

export const useProjectEdit = (project: Project) => {
  const [editProject, setEditProject] = useState<Project>({...project});
  const [users, setUsers] = useState<UserOption[]>([]);
  const { toast } = useToast();
  
  useEffect(() => {
    // Load all contractors, owners and consultants for the edit project form
    const allUsers = loadUsers();
    const userOptions = allUsers
      .filter(u => u.approved && (u.role === "owner" || u.role === "consultant"))
      .map(u => ({ value: u.id, label: u.name, role: u.role }));
    
    setUsers(userOptions);
  }, []);

  const handleEditProjectChange = (e: any) => {
    const { name, value } = e.target;
    setEditProject({
      ...editProject,
      [name]: value,
    });
  };

  const saveProjectEdit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const allProjects = loadProjects();
    const updatedProjects = allProjects.map(p => 
      p.id === project.id ? editProject : p
    );
    
    saveProjects(updatedProjects);
    
    toast({
      title: "تم التعديل",
      description: "تم تعديل بيانات المشروع بنجاح",
    });
    
    // Update local project data to reflect changes
    project.start = editProject.start;
    project.end = editProject.end;
    project.ownerId = editProject.ownerId;
    project.consultantId = editProject.consultantId;
    
    return true;
  };

  // Filter users by role for dropdown lists
  const owners = users.filter(u => u.role === "owner").map(u => ({ value: u.value, label: u.label }));
  const consultants = users.filter(u => u.role === "consultant").map(u => ({ value: u.value, label: u.label }));

  return {
    editProject,
    setEditProject,
    handleEditProjectChange,
    saveProjectEdit,
    users,
    owners,
    consultants
  };
};
