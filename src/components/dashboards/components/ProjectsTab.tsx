
import React from 'react';
import { Project } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { getUserNameById } from '@/lib/db';
import { getProjectStatus } from '../utils/projectUtils';

interface ProjectsTabProps {
  projects: Project[];
  onViewProject: (project: Project) => void;
}

const ProjectsTab: React.FC<ProjectsTabProps> = ({ projects, onViewProject }) => {
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
              projects.map(project => (
                <tr key={project.id} className="border-t hover:bg-gray-50">
                  <td className="p-2">{project.name}</td>
                  <td className="p-2">{project.completion || 0}%</td>
                  <td className="p-2">{project.timeElapsed || 0} يوم</td>
                  <td className="p-2">{project.expectedDays || 0} يوم</td>
                  <td className="p-2">{getProjectStatus(project)}</td>
                  <td className="p-2">{getUserNameById(project.contractorId)}</td>
                  <td className="p-2">{getUserNameById(project.ownerId)}</td>
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
