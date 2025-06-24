
import React from 'react';
import { Project, User } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Edit } from 'lucide-react';
import { getUserNameById } from '@/lib/db';
import ProjectMetrics from '../ProjectMetrics';

interface ProjectHeaderProps {
  project: Project;
  canEdit: boolean;
  canReview: boolean;
  onEditProject: () => void;
}

const ProjectHeader: React.FC<ProjectHeaderProps> = ({ 
  project, 
  canEdit, 
  canReview, 
  onEditProject 
}) => {
  return (
    <>
      <h3 className="font-bold mb-3 text-indigo-700 flex items-center gap-2">
        <i className="fa fa-cube" /> تفاصيل المشروع: {project.name}
      </h3>
      
      <ProjectMetrics 
        completion={project.completion} 
        timeElapsed={project.timeElapsed} 
        performance={project.performance}
        expectedDays={project.expectedDays}
      />
      
      <p className="mb-3 text-gray-600">{project.desc || ""}</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
        <div><strong>تاريخ البداية:</strong> {project.start || '-'}</div>
        <div><strong>تاريخ النهاية المتوقعة:</strong> {project.end || '-'}</div>
        <div><strong>الاستشاري:</strong> {getUserNameById(project.consultantId)}</div>
        <div><strong>المالك:</strong> {getUserNameById(project.ownerId)}</div>
        <div><strong>المقاول:</strong> {getUserNameById(project.contractorId)}</div>
      </div>
      
      {(canEdit || canReview) && (
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onEditProject}
          className="mb-4 bg-indigo-100 text-indigo-700"
        >
          <Edit className="h-4 w-4 mr-2" /> تعديل بيانات المشروع
        </Button>
      )}
      
      <hr className="my-4" />
    </>
  );
};

export default ProjectHeader;
