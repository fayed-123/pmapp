import React, { useState, useEffect } from 'react';
import { Project, User } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Edit, Calendar, Users, Building2, Wrench, UserCheck, Clock, CalendarDays } from 'lucide-react';
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
  const [userNames, setUserNames] = useState<{[key: string]: string}>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadUserNames = async () => {
      setIsLoading(true);
      try {
        const names: {[key: string]: string} = {};
        
        // Load consultant name
        if (project.consultantId) {
          names.consultant = await getUserNameById(project.consultantId);
        }
        
        // Load owner name
        if (project.ownerId) {
          names.owner = await getUserNameById(project.ownerId);
        }
        
        // Load contractor name
        if (project.contractorId) {
          names.contractor = await getUserNameById(project.contractorId);
        }
        
        setUserNames(names);
      } catch (error) {
        console.error('Error loading user names:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUserNames();
  }, [project.consultantId, project.ownerId, project.contractorId]);

  const projectDetails = [
    {
      icon: CalendarDays,
      label: 'تاريخ البداية',
      value: project.start || 'غير محدد',
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      icon: Calendar,
      label: 'تاريخ النهاية المتوقعة',
      value: project.end || 'غير محدد',
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      icon: UserCheck,
      label: 'الاستشاري',
      value: isLoading ? 'جاري التحميل...' : 
        (userNames.consultant || (project.consultantId ? 'غير معروف' : 'غير مُعيّن')),
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100'
    },
    {
      icon: Building2,
      label: 'المالك',
      value: isLoading ? 'جاري التحميل...' : 
        (userNames.owner || (project.ownerId ? 'غير معروف' : 'غير مُعيّن')),
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100'
    },
    {
      icon: Wrench,
      label: 'المقاول',
      value: isLoading ? 'جاري التحميل...' : 
        (userNames.contractor || (project.contractorId ? 'غير معروف' : 'غير مُعيّن')),
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Enhanced Project Title */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
              <Building2 className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-800 leading-tight">
                {project.name}
              </h3>
              <p className="text-sm text-gray-600 mt-1">تفاصيل المشروع ومعلوماته الأساسية</p>
            </div>
          </div>
        </div>
        
        {/* Edit Button */}
        {(canEdit || canReview) && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onEditProject}
            className="bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100 hover:border-indigo-300 flex items-center gap-2 self-start"
          >
            <Edit className="h-4 w-4" />
            <span className="hidden sm:inline">تعديل بيانات المشروع</span>
            <span className="sm:hidden">تعديل</span>
          </Button>
        )}
      </div>

      {/* Project Metrics */}
      <Card className="p-4 sm:p-6 shadow-sm border-0 bg-white">
        <ProjectMetrics 
          completion={project.completion} 
          timeElapsed={project.timeElapsed} 
          performance={project.performance}
          expectedDays={project.expectedDays}
        />
      </Card>

      {/* Project Description */}
      {(project.description || project.desc) && (
        <Card className="p-4 sm:p-6 shadow-sm border-0 bg-white">
          <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <div className="w-6 h-6 bg-gray-100 rounded-md flex items-center justify-center">
              <svg className="w-3 h-3 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            وصف المشروع
          </h4>
          <p className="text-gray-700 leading-relaxed">
            {project.description || project.desc}
          </p>
        </Card>
      )}

      {/* Project Details Grid */}
      <Card className="p-4 sm:p-6 shadow-sm border-0 bg-white">
        <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <div className="w-6 h-6 bg-gray-100 rounded-md flex items-center justify-center">
            <Users className="w-3 h-3 text-gray-600" />
          </div>
          معلومات المشروع
        </h4>
        
        {/* Desktop Grid View */}
        <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projectDetails.map((detail, index) => {
            const Icon = detail.icon;
            return (
              <div key={index} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                <div className={`w-10 h-10 ${detail.bgColor} rounded-lg flex items-center justify-center flex-shrink-0`}>
                  <Icon className={`w-5 h-5 ${detail.color}`} />
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-medium text-gray-600 mb-1">
                    {detail.label}
                  </div>
                  <div className="text-sm text-gray-800 font-medium truncate">
                    {detail.value}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Mobile Stack View */}
        <div className="md:hidden space-y-3">
          {projectDetails.map((detail, index) => {
            const Icon = detail.icon;
            return (
              <div key={index} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
                <div className={`w-10 h-10 ${detail.bgColor} rounded-lg flex items-center justify-center flex-shrink-0`}>
                  <Icon className={`w-5 h-5 ${detail.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-600 mb-1">
                    {detail.label}
                  </div>
                  <div className="text-sm text-gray-800 font-medium">
                    {detail.value}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="mt-4 flex items-center gap-2 text-sm text-gray-500">
            <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-indigo-500"></div>
            جاري تحميل معلومات الأشخاص المسؤولين...
          </div>
        )}
      </Card>
    </div>
  );
};

export default ProjectHeader;