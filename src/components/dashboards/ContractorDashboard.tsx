
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { loadProjects, loadUsers, saveProjects, getUserNameById } from '@/lib/db';
import { Project } from '@/lib/types';
import { useAuth } from '@/context/AuthContext';
import FormField from '@/components/FormField';
import { useToast } from '@/components/ui/use-toast';
import Modal from '@/components/Modal';
import ProjectDetails from '../projects/ProjectDetails';
import { deleteProject } from '@/lib/db';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { TrendingUp, TrendingDown } from 'lucide-react';

enum Tab {
  Projects = 'myprojects',
  AddProject = 'addproject'
}

const statusText = (status: string) => {
  switch (status) {
    case 'active':
      return <span className="text-green-700 font-bold">نشط</span>;
    case 'pending':
      return <span className="text-yellow-700">بانتظار الموافقة</span>;
    case 'closed':
      return <span className="text-gray-600">مغلق</span>;
    default:
      return status || '-';
  }
};

const getProjectStatus = (project: Project) => {
  if (project.completion > 0 && project.timeElapsed > 0 && project.expectedDays > 0) {
    const timePercentage = (project.timeElapsed / project.expectedDays) * 100;
    if (project.completion > timePercentage) {
      return <span className="text-green-700 font-bold flex items-center gap-1"><TrendingUp className="h-4 w-4" /> متقدم</span>;
    } else if (project.completion < timePercentage) {
      return <span className="text-red-700 flex items-center gap-1"><TrendingDown className="h-4 w-4" /> متأخر</span>;
    }
    return <span className="text-blue-700">مطابق للزمن</span>;
  }
  return "-";
};

const ContractorDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>(Tab.Projects);
  const [projects, setProjects] = useState<Project[]>([]);
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    name: '',
    desc: '',
    start: '',
    end: '',
    ownerId: '',
    consultantId: '',
  });
  
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showProjectDetails, setShowProjectDetails] = useState(false);
  
  const [owners, setOwners] = useState<{value: string, label: string}[]>([]);
  const [consultants, setConsultants] = useState<{value: string, label: string}[]>([]);

  useEffect(() => {
    if (user && user.id) {
      loadProjectData();
      
      // Load owners and consultants for the add project form
      const users = loadUsers();
      setOwners(
        users
          .filter(u => u.role === "owner" && u.approved)
          .map(u => ({ value: u.id, label: u.name }))
      );
      setConsultants(
        users
          .filter(u => u.role === "consultant" && u.approved)
          .map(u => ({ value: u.id, label: u.name }))
      );
    }
  }, [user]);

  const loadProjectData = () => {
    if (!user) return;
    const contractorProjects = loadProjects().filter(p => p.contractorId === user.id);
    setProjects(contractorProjects);
  };

  const handleFormChange = (e: any) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!user) return;
    
    const newProject: Project = {
      id: Date.now().toString(),
      name: formData.name,
      desc: formData.desc,
      start: formData.start,
      end: formData.end,
      ownerId: formData.ownerId,
      consultantId: formData.consultantId,
      contractorId: user.id,
      status: 'active',
      completion: 0,
      timeElapsed: 0,
      performance: 0,
      created: new Date().toISOString(),
      expectedDays: 0
    };
    
    const allProjects = loadProjects();
    allProjects.push(newProject);
    saveProjects(allProjects);
    
    toast({
      title: "تم إنشاء المشروع",
      description: "تم حفظ المشروع بنجاح",
    });
    
    setFormData({
      name: '',
      desc: '',
      start: '',
      end: '',
      ownerId: '',
      consultantId: '',
    });
    
    setActiveTab(Tab.Projects);
    setProjects([...projects, newProject]);
  };

  const handleViewProject = (project: Project) => {
    setSelectedProject(project);
    setShowProjectDetails(true);
  };

  const handleCloseProjectDetails = () => {
    setShowProjectDetails(false);
    setSelectedProject(null);
    // Reload project data to reflect any changes
    loadProjectData();
  };

  const handleDeleteProject = (projectId: string) => {
    deleteProject(projectId);
    loadProjectData();
    
    toast({
      title: "تم حذف المشروع",
      description: "تم حذف المشروع وجميع بياناته بنجاح",
    });
  };

  const renderContent = () => {
    switch (activeTab) {
      case Tab.Projects:
        return (
          <div>
            <h3 className="mb-2 font-bold text-lg text-gray-700 flex items-center gap-2">
              <i className="fa fa-layer-group" /> مشاريعي ({projects.length})
            </h3>
            <Card className="overflow-x-auto mb-4">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="p-2 text-right">اسم المشروع</th>
                    <th className="p-2 text-right">المالك</th>
                    <th className="p-2 text-right">الاستشاري</th>
                    <th className="p-2 text-right">الوقت المنقضي</th>
                    <th className="p-2 text-right">نسبة الانجاز الكلية</th>
                    <th className="p-2 text-right">الأيام المتوقعة للإنجاز</th>
                    <th className="p-2 text-right">الحالة</th>
                    <th className="p-2 text-right">التحكم</th>
                  </tr>
                </thead>
                <tbody>
                  {projects.length > 0 ? (
                    projects.map(project => (
                      <tr key={project.id} className="border-t hover:bg-gray-50">
                        <td className="p-2">{project.name}</td>
                        <td className="p-2">{getUserNameById(project.ownerId)}</td>
                        <td className="p-2">{getUserNameById(project.consultantId)}</td>
                        <td className="p-2">{project.timeElapsed || 0} يوم</td>
                        <td className="p-2">{project.completion || 0}%</td>
                        <td className="p-2">{project.expectedDays || 0} يوم</td>
                        <td className="p-2">{getProjectStatus(project)}</td>
                        <td className="p-2 flex gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleViewProject(project)}
                            className="text-indigo-600 hover:text-indigo-800"
                          >
                            <i className="fa fa-eye ml-1" /> عرض
                          </Button>
                          
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="text-red-600 hover:text-red-800"
                              >
                                <i className="fa fa-trash ml-1" /> حذف
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="rtl:text-right">
                              <AlertDialogHeader>
                                <AlertDialogTitle>حذف المشروع</AlertDialogTitle>
                                <AlertDialogDescription>
                                  هل أنت متأكد من حذف هذا المشروع؟ سيتم حذف جميع البيانات المرتبطة به ولا يمكن استعادتها.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter className="flex-row-reverse">
                                <AlertDialogAction 
                                  onClick={() => handleDeleteProject(project.id)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  حذف
                                </AlertDialogAction>
                                <AlertDialogCancel>إلغاء</AlertDialogCancel>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-gray-400">
                        لا توجد مشاريع
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </Card>
          </div>
        );
        
      case Tab.AddProject:
        return (
          <div>
            <h3 className="font-bold mb-3 flex items-center gap-2">
              <i className="fa fa-plus-circle" /> إنشاء مشروع جديد
            </h3>
            <Card className="p-4">
              <form onSubmit={handleSubmit} className="space-y-4">
                <FormField
                  label="اسم المشروع"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleFormChange}
                  required
                />
                
                <FormField
                  label="الوصف"
                  name="desc"
                  type="textarea"
                  value={formData.desc}
                  onChange={handleFormChange}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    label="تاريخ البداية"
                    name="start"
                    type="date"
                    value={formData.start}
                    onChange={handleFormChange}
                    required
                  />
                  
                  <FormField
                    label="تاريخ النهاية المتوقعة"
                    name="end"
                    type="date"
                    value={formData.end}
                    onChange={handleFormChange}
                    required
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    label="المالك"
                    name="ownerId"
                    type="select"
                    options={owners}
                    value={formData.ownerId}
                    onChange={handleFormChange}
                    required
                  />
                  
                  <FormField
                    label="الاستشاري المشرف"
                    name="consultantId"
                    type="select"
                    options={consultants}
                    value={formData.consultantId}
                    onChange={handleFormChange}
                    required
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="bg-blue-600 hover:bg-blue-800 text-white px-8 py-2 rounded font-bold"
                >
                  حفظ المشروع
                </Button>
              </form>
            </Card>
          </div>
        );
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-2 text-indigo-700 flex items-center gap-2">
        <i className="fa fa-tools" /> لوحة تحكم المقاول
      </h2>
      <hr className="mb-4" />
      <div className="flex flex-wrap gap-6 mb-6">
        <Button 
          variant={activeTab === Tab.Projects ? "default" : "outline"} 
          onClick={() => setActiveTab(Tab.Projects)}
          className={`${activeTab === Tab.Projects ? 'bg-indigo-600' : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'}`}
        >
          <i className="fa fa-layer-group ml-2" /> مشاريعي
        </Button>
        <Button 
          variant={activeTab === Tab.AddProject ? "default" : "outline"} 
          onClick={() => setActiveTab(Tab.AddProject)}
          className={`${activeTab === Tab.AddProject ? 'bg-indigo-600' : 'bg-green-100 text-green-700 hover:bg-green-200'}`}
        >
          <i className="fa fa-plus-circle ml-2" /> إنشاء مشروع جديد
        </Button>
      </div>
      
      {renderContent()}
      
      {/* Project Details Modal */}
      {selectedProject && user && (
        <Modal
          isOpen={showProjectDetails}
          onClose={handleCloseProjectDetails}
          title={`تفاصيل المشروع: ${selectedProject.name}`}
          size="xl"
        >
          <ProjectDetails 
            project={selectedProject} 
            currentUser={user} 
            onClose={handleCloseProjectDetails} 
          />
        </Modal>
      )}
    </div>
  );
};

export default ContractorDashboard;
