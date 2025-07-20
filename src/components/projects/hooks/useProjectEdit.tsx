import { useState, useEffect } from 'react';
import { Project, User } from '@/lib/types';
import { loadProjects, saveProject, loadUsers } from '@/lib/db';
import { useToast } from '@/components/ui/use-toast';

export interface UserOption {
  value: string;
  label: string;
  role: string;
}

export const useProjectEdit = (project: Project) => {
  const [editProject, setEditProject] = useState<Project>({...project});
  const [users, setUsers] = useState<UserOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  
  useEffect(() => {
    // Load all contractors, owners and consultants for the edit project form
    const loadUserOptions = async () => {
      setIsLoading(true);
      try {
        const allUsers = await loadUsers();
        const userOptions = allUsers
          .filter(u => u.approved && (u.role === "owner" || u.role === "consultant"))
          .map(u => ({ value: u.id, label: u.name, role: u.role }));
        
        setUsers(userOptions);
      } catch (error) {
        console.error('Error loading users:', error);
        toast({
          title: "خطأ",
          description: "حدث خطأ أثناء تحميل المستخدمين",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadUserOptions();
  }, []);

  const handleEditProjectChange = (e: any) => {
    const { name, value } = e.target;
    setEditProject({
      ...editProject,
      [name]: value,
    });
  };

  const saveProjectEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      const success = await saveProject(editProject);
      if (success) {
        toast({
          title: "تم التعديل",
          description: "تم تعديل بيانات المشروع بنجاح",
        });
        
        // Update local project data to reflect changes
        project.start = editProject.start;
        project.end = editProject.end;
        project.ownerId = editProject.ownerId;
        project.consultantId = editProject.consultantId;
        project.name = editProject.name;
        
        return true;
      } else {
        toast({
          title: "خطأ",
          description: "حدث خطأ أثناء حفظ التعديلات",
          variant: "destructive"
        });
        return false;
      }
    } catch (error) {
      console.error('Error saving project:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء حفظ التعديلات",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsSaving(false);
    }
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
    consultants,
    isLoading,
    isSaving
  };
};