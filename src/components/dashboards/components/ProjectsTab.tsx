import React, { useState, useEffect } from 'react';
import { Project } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { getUserNameById } from '@/lib/db';
import { getProjectStatus } from '../utils/projectUtils';

interface ProjectsTabProps {
  projects: Project[];
  onViewProject: (project: Project) => void;
  subconsultants: any[];
}

const ProjectsTab: React.FC<ProjectsTabProps> = ({ projects, onViewProject ,subconsultants}) => {
  const [userNames, setUserNames] = useState<{[key: string]: string}>({});
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  
  useEffect(() => {
    const loadUserNames = async () => {
      setIsLoadingUsers(true);
      try {
        // Get unique user IDs from projects
        const userIds = [...new Set([
          ...projects.map(p => p.contractor_id),
          ...projects.map(p => p.owner_id),
          ...projects.map(p => p.consultant_id)
        ].filter(Boolean))]; // Filter out null/undefined values

        const names: {[key: string]: string} = {};
        
        // Load names for each user ID
        for (const userId of userIds) {
          if (userId) {
            const userName = await getUserNameById(userId);
            names[userId] = userName;
          }
        }
        
        setUserNames(names);
      } catch (error) {
        console.error('Error loading user names:', error);
      } finally {
        setIsLoadingUsers(false);
      }
    };

    if (projects.length > 0) {
      loadUserNames();
    } else {
      setIsLoadingUsers(false);
    }
  }, [projects]);

  const getUserDisplayName = (userId: string | null | undefined) => {
    if (!userId) return '-';
    if (isLoadingUsers) return 'جاري التحميل...';
    return userNames[userId] || 'غير معروف';
  };

  return (
    <div>
      <h3 className="text-lg font-bold text-gray-700 mb-2 flex items-center gap-2">
        <i className="fa fa-folder" /> جميع المشاريع ({projects.length})
      </h3>
      <Card className="overflow-x-auto mb-4">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 text-right">اسم المشروع</th>
              <th className="p-2 text-right">نسبة الانجاز الكلية</th>
              <th className="p-2 text-right">الوقت المنقضي</th>
              <th className="p-2 text-right">الأيام المتوقعة للإنجاز</th>
              <th className="p-2 text-right">الحالة</th>
              <th className="p-2 text-right">المقاول</th>
              <th className="p-2 text-right">المالك</th>
              <th className="p-2 text-right">التحكم</th>
            </tr>
          </thead>
          <tbody>
            {projects.length > 0 ? (
              projects.map((project, index) => (
                <tr key={project.id || `project-${index}`} className="border-t hover:bg-gray-50">
                  <td className="p-2">{project.name}</td>
                  <td className="p-2">{project.completion || 0}%</td>
                  <td className="p-2">{project.timeElapsed || 0} يوم</td>
                  <td className="p-2">{project.expectedDays || 0} يوم</td>
                  <td className="p-2">{getProjectStatus(project)}</td>
                  <td className="p-2">{getUserDisplayName(project.contractor_id)}</td>
                  <td className="p-2">{getUserDisplayName(project.owner_id)}</td>
                  <td className="p-2 flex gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => onViewProject(project)}
                      className="text-indigo-600 hover:text-indigo-800"
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
};

export default ProjectsTab;