import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { loadProjects, getUserNameById } from '@/lib/db';
import { Project } from '@/lib/types';
import { useAuth } from '@/context/AuthContext';
import { Bar, BarChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useToast } from '@/components/ui/use-toast';
import Modal from '@/components/Modal';
import ProjectDetails from '../projects/ProjectDetails';
import { TrendingUp, TrendingDown } from 'lucide-react';

enum Tab {
  Projects = 'myprojects',
  Stats = 'stats'
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

const OwnerDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>(Tab.Projects);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [userNames, setUserNames] = useState<{[key: string]: string}>({});
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showProjectDetails, setShowProjectDetails] = useState(false);
  
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user?.id) {
      loadOwnerProjects();
    }
  }, [user]);

  const loadOwnerProjects = async () => {
    setIsLoading(true);
    try {
      const allProjects = await loadProjects();
      const ownerProjects = allProjects.filter(p => p.owner_id === user?.id);
      setProjects(ownerProjects);

      // Load user names for display
      const userIds = [...new Set([
        ...ownerProjects.map(p => p.consultant_id),
        ...ownerProjects.map(p => p.contractorid)
      ].filter(Boolean))];

      const names: {[key: string]: string} = {};
      for (const userId of userIds) {
        if (userId) {
          const userName = await getUserNameById(userId);
          names[userId] = userName;
        }
      }
      setUserNames(names);
    } catch (error) {
      console.error('Error loading owner projects:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تحميل المشاريع",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewProject = (project: Project) => {
    setSelectedProject(project);
    setShowProjectDetails(true);
  };

  const handleCloseProjectDetails = async () => {
    setShowProjectDetails(false);
    setSelectedProject(null);
    // Reload projects to reflect any changes
    await loadOwnerProjects();
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">جاري تحميل المشاريع...</div>
        </div>
      );
    }

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
                  <tr className="bg-gray-50">
                    <th className="p-2 text-right">اسم المشروع</th>
                    <th className="p-2 text-right">الاستشاري</th>
                    <th className="p-2 text-right">المقاول</th>
                    <th className="p-2 text-right">الزمن المنقضي</th>
                    <th className="p-2 text-right">نسبة الانجاز الكلية</th>
                    <th className="p-2 text-right">الأيام المتوقعة للإنجاز</th>
                    <th className="p-2 text-right">الحالة</th>
                    <th className="p-2 text-right">عرض التفاصيل</th>
                  </tr>
                </thead>
                <tbody>
                  {projects.length > 0 ? (
                    projects.map((project, index) => (
                      <tr key={project.id || `project-${index}`} className="border-t hover:bg-gray-50">
                        <td className="p-2">{project.name}</td>
                        <td className="p-2">{userNames[project.consultant_id] || '-'}</td>
                        <td className="p-2">{userNames[project.contractorid] || '-'}</td>
                        <td className="p-2">{project.timeElapsed || 0} يوم</td>
                        <td className="p-2">{project.completion || 0}%</td>
                        <td className="p-2">{project.expectedDays || 0} يوم</td>
                        <td className="p-2">{getProjectStatus(project)}</td>
                        <td className="p-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-indigo-600 hover:text-indigo-800"
                            onClick={() => handleViewProject(project)}
                          >
                            <i className="fa fa-eye ml-1" /> عرض
                          </Button>
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
        
      case Tab.Stats:
        return (
          <div>
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <i className="fa fa-chart-bar" /> مؤشرات الأداء لمشاريعي
            </h3>
            
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card className="p-4 text-center">
                <div className="text-2xl font-bold text-indigo-600">{projects.length}</div>
                <div className="text-sm text-gray-600">إجمالي المشاريع</div>
              </Card>
              <Card className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">
                  {projects.filter(p => (p.completion || 0) >= 100).length}
                </div>
                <div className="text-sm text-gray-600">المشاريع المكتملة</div>
              </Card>
              <Card className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {projects.length > 0 ? Math.round(projects.reduce((sum, p) => sum + (p.completion || 0), 0) / projects.length) : 0}%
                </div>
                <div className="text-sm text-gray-600">متوسط نسبة الإنجاز</div>
              </Card>
            </div>

            {/* Chart */}
            <Card className="p-4">
              <h4 className="font-bold mb-3">نسبة الإنجاز للمشاريع</h4>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart 
                  data={projects.map(p => ({
                    name: p.name.length > 15 ? p.name.substring(0, 15) + '...' : p.name,
                    completion: p.completion || 0,
                    timeElapsed: p.timeElapsed || 0,
                    expectedDays: p.expectedDays || 0
                  }))}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="completion" name="نسبة الإنجاز %" fill="#6366f1" />
                  <Bar dataKey="timeElapsed" name="الوقت المنقضي (أيام)" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </div>
        );
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-2 text-indigo-700 flex items-center gap-2">
        <i className="fa fa-eye" /> لوحة تحكم المالك
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
          variant={activeTab === Tab.Stats ? "default" : "outline"} 
          onClick={() => setActiveTab(Tab.Stats)}
          className={`${activeTab === Tab.Stats ? 'bg-indigo-600' : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'}`}
        >
          <i className="fa fa-chart-bar ml-2" /> مؤشرات الأداء
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

export default OwnerDashboard;