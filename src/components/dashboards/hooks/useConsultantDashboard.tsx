
import { useState, useEffect } from 'react';
import { Project } from '@/lib/types';
import { loadProjects } from '@/lib/db';
import { Tab } from '../types/dashboardTypes';

export const useConsultantDashboard = () => {
  const [activeTab, setActiveTab] = useState<Tab>(Tab.Projects);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showProjectDetails, setShowProjectDetails] = useState(false);

  useEffect(() => {
    if (activeTab === Tab.Projects) {
      setProjects(loadProjects());
    }
  }, [activeTab]);

  const handleViewProject = (project: Project) => {
    setSelectedProject(project);
    setShowProjectDetails(true);
  };

  const handleCloseProjectDetails = () => {
    setShowProjectDetails(false);
    setSelectedProject(null);
    // Reload projects to reflect any changes
    setProjects(loadProjects());
  };

  return {
    activeTab,
    setActiveTab,
    projects,
    selectedProject,
    showProjectDetails,
    handleViewProject,
    handleCloseProjectDetails
  };
};
