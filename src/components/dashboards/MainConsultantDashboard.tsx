import React, { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMainConsultantDashboard } from './hooks/useMainConsultantDashboard';
import ProjectsListTab from './components/ProjectsListTab';
import UsersTab from './components/UsersTab';
import ConsultantsTab from './components/ConsultantsTab';
import StatsTab from './components/StatsTab';
import Modal from '@/components/Modal';
import ProjectDetails from '../projects/ProjectDetails';
import { Tab } from './types/dashboardTypes';
import { FolderOpen, Users, BarChart3, Settings, User2 } from 'lucide-react';

const MainConsultantDashboard: React.FC = () => {
  const {
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
    handleProjectCreated,
    currentUser
  } = useMainConsultantDashboard();

  // ✅ Create generalConsultants array from users data
  const generalConsultants = useMemo(() => {
    if (!users) return [];
    
    return users
      .filter(user => user.role === 'generalConsultant')
      .map(user => ({
        value: user.id,
        label: user.name,
        role: user.role // ✅ Add the role property
      }));
  }, [users]);

  const tabs = [
    {
      id: Tab.Projects,
      label: 'جميع المشاريع',
      icon: FolderOpen,
      color: 'indigo',
      bgColor: 'bg-indigo-600',
      lightBg: 'bg-indigo-100',
      textColor: 'text-indigo-700',
      hoverBg: 'hover:bg-indigo-200'
    },
    {
      id: Tab.Users,
      label: 'إدارة المالك والمقاول',
      icon: Users,
      color: 'green',
      bgColor: 'bg-green-600',
      lightBg: 'bg-green-100',
      textColor: 'text-green-700',
      hoverBg: 'hover:bg-green-200'
    },
    {
      id: Tab.Consultants,
      label: 'إدارة الاستشاريين',
      icon: User2,
      color: 'blue',
      bgColor: 'bg-blue-600',
      lightBg: 'bg-blue-100',
      textColor: 'text-blue-700',
      hoverBg: 'hover:bg-blue-200'
    },
    {
      id: Tab.Stats,
      label: 'إحصائيات عامة',
      icon: BarChart3,
      color: 'yellow',
      bgColor: 'bg-yellow-600',
      lightBg: 'bg-yellow-100',
      textColor: 'text-yellow-700',
      hoverBg: 'hover:bg-yellow-200'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Enhanced Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
            <Settings className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">لوحة تحكم المشرف العام</h2>
            <p className="text-gray-600 text-sm mt-1">إدارة شاملة للمشاريع والمستخدمين</p>
          </div>
        </div>
      </div>

      {/* Enhanced Navigation Tabs */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6">
        {/* Desktop Navigation */}
        <div className="hidden lg:flex gap-3">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <Button
                key={tab.id}
                variant={isActive ? "default" : "outline"}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                  isActive
                    ? `${tab.bgColor} text-white shadow-lg hover:shadow-xl`
                    : `${tab.lightBg} ${tab.textColor} ${tab.hoverBg} border-0`
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="whitespace-nowrap">{tab.label}</span>
              </Button>
            );
          })}
        </div>

        {/* Mobile/Tablet Navigation */}
        <div className="lg:hidden">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <Button
                  key={tab.id}
                  variant={isActive ? "default" : "outline"}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 p-4 rounded-xl font-medium transition-all duration-200 text-right justify-start ${
                    isActive
                      ? `${tab.bgColor} text-white shadow-lg`
                      : `${tab.lightBg} ${tab.textColor} ${tab.hoverBg} border-0`
                  }`}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <span className="text-sm sm:text-base">{tab.label}</span>
                </Button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 sm:p-6 lg:p-8">
          {/* Render the active tab content */}
          {activeTab === Tab.Projects && (
            <ProjectsListTab 
              projects={projects || []} 
              onViewProject={handleViewProject} 
              onDeleteProject={handleDeleteProject} 
              onProjectCreated={handleProjectCreated}
            />
          )}
          
          {activeTab === Tab.Users && (
            <UsersTab 
              users={users || []} 
              onAddUser={handleAddUser} 
              onApproveUser={handleApproveUser} 
              onDeleteUser={handleDeleteUser} 
            />
          )}
          
          {activeTab === Tab.Consultants && (
            <ConsultantsTab 
              users={users || []} 
              onAddUser={handleAddUser} 
              onApproveUser={handleApproveUser} 
              onDeleteUser={handleDeleteUser} 
            />
          )}
          
          {activeTab === Tab.Stats && (
            <StatsTab />
          )}
        </div>
      </div>
      
      {/* Project Details Modal */}
      {selectedProject && currentUser && (
        <Modal
          isOpen={showProjectDetails}
          onClose={handleCloseProjectDetails}
          title={`تفاصيل المشروع: ${selectedProject.name}`}
          size="xl"
        >
          <ProjectDetails 
            project={selectedProject} 
            currentUser={currentUser} 
            onClose={handleCloseProjectDetails} 
          />
        </Modal>
      )}
    </div>
  );
};

export default MainConsultantDashboard;