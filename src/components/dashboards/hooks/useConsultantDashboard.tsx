import { useState, useEffect } from 'react';
import { Project } from '@/lib/types';
import { loadProjects } from '@/lib/db';
import { Tab } from '../types/dashboardTypes';

export const useConsultantDashboard = () => {
  const [activeTab, setActiveTab] = useState<Tab>(Tab.Projects);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showProjectDetails, setShowProjectDetails] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (activeTab === Tab.Projects) {
      loadProjectsData();
    }
  }, [activeTab]);

  const loadProjectsData = async () => {
    setIsLoading(true);
    try {
      const allProjects = await loadProjects();
      setProjects(allProjects);
    } catch (error) {
      console.error('Error loading projects:', error);
      setProjects([]);
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
    await loadProjectsData();
  };

  return {
    activeTab,
    setActiveTab,
    projects,
    selectedProject,
    showProjectDetails,
    isLoading,
    handleViewProject,
    handleCloseProjectDetails,
    loadProjectsData
  };
};