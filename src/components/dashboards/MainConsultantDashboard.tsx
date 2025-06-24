
import React from 'react';
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
    currentUser
  } = useMainConsultantDashboard();

  return (
    <div>
      <h2 className="text-2xl font-bold mb-2 text-indigo-700 flex items-center gap-2">
        <i className="fa fa-clipboard-list" /> لوحة تحكم المشرف العام
      </h2>
      <hr className="mb-4" />

      <div className="flex flex-wrap gap-6 mb-6">
        <Button 
          variant={activeTab === Tab.Projects ? "default" : "outline"} 
          onClick={() => setActiveTab(Tab.Projects)}
          className={`${activeTab === Tab.Projects ? 'bg-indigo-600' : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'}`}
        >
          <i className="fa fa-layer-group ml-2" /> جميع المشاريع
        </Button>
        <Button 
          variant={activeTab === Tab.Users ? "default" : "outline"} 
          onClick={() => setActiveTab(Tab.Users)}
          className={`${activeTab === Tab.Users ? 'bg-indigo-600' : 'bg-green-100 text-green-700 hover:bg-green-200'}`}
        >
          <i className="fa fa-users ml-2" /> إدارة المالك والمقاول
        </Button>
        <Button 
          variant={activeTab === Tab.Consultants ? "default" : "outline"} 
          onClick={() => setActiveTab(Tab.Consultants)}
          className={`${activeTab === Tab.Consultants ? 'bg-indigo-600' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'}`}
        >
          <i className="fa fa-user-tie ml-2" /> إدارة الاستشاريين
        </Button>
        <Button 
          variant={activeTab === Tab.Stats ? "default" : "outline"} 
          onClick={() => setActiveTab(Tab.Stats)}
          className={`${activeTab === Tab.Stats ? 'bg-indigo-600' : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'}`}
        >
          <i className="fa fa-chart-bar ml-2" /> إحصائيات عامة
        </Button>
      </div>
      
      {/* Render the active tab content */}
      {activeTab === Tab.Projects && (
        <ProjectsListTab 
          projects={projects} 
          onViewProject={handleViewProject} 
          onDeleteProject={handleDeleteProject} 
        />
      )}
      
      {activeTab === Tab.Users && (
        <UsersTab 
          users={users} 
          onAddUser={handleAddUser} 
          onApproveUser={handleApproveUser} 
          onDeleteUser={handleDeleteUser} 
        />
      )}
      
      {activeTab === Tab.Consultants && (
        <ConsultantsTab 
          users={users} 
          onAddUser={handleAddUser} 
          onApproveUser={handleApproveUser} 
          onDeleteUser={handleDeleteUser} 
        />
      )}
      
      {activeTab === Tab.Stats && (
        <StatsTab />
      )}
      
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
