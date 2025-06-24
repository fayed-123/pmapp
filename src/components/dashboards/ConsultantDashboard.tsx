
import React from 'react';
import { useAuth } from '@/context/AuthContext';
import Modal from '@/components/Modal';
import ProjectDetails from '../projects/ProjectDetails';
import { useConsultantDashboard } from './hooks/useConsultantDashboard';
import { Tab } from './types/dashboardTypes';
import ProjectsTab from './components/ProjectsTab';
import StatsTab from './components/StatsTab';
import DashboardTabs from './components/DashboardTabs';

const ConsultantDashboard: React.FC = () => {
  const { user: currentUser } = useAuth();
  const {
    activeTab,
    setActiveTab,
    projects,
    selectedProject,
    showProjectDetails,
    handleViewProject,
    handleCloseProjectDetails
  } = useConsultantDashboard();

  const renderContent = () => {
    switch (activeTab) {
      case Tab.Projects:
        return <ProjectsTab projects={projects} onViewProject={handleViewProject} />;
      case Tab.Stats:
        return <StatsTab />;
      default:
        return null;
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-2 text-indigo-700 flex items-center gap-2">
        <i className="fa fa-clipboard-list" /> لوحة تحكم الاستشاري
      </h2>
      <hr className="mb-4" />
      
      <DashboardTabs activeTab={activeTab} onTabChange={setActiveTab} />
      
      {renderContent()}
      
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

export default ConsultantDashboard;
