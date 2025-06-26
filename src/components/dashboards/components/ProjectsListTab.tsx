import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Project } from '@/lib/types';
import { getUserNameById } from '@/lib/db';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

interface ProjectsListTabProps {
  projects: Project[];
  onViewProject: (project: Project) => void;
  onDeleteProject: (projectId: string) => void;
}

const ProjectsListTab: React.FC<ProjectsListTabProps> = ({ projects, onViewProject, onDeleteProject }) => {
  const [userNames, setUserNames] = useState<{[key: string]: string}>({});
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  
  useEffect(() => {
    const loadUserNames = async () => {
      setIsLoadingUsers(true);
      try {
        // Get unique user IDs from projects
        const userIds = [...new Set([
          ...projects.map(p => p.contractorId),
          ...projects.map(p => p.ownerId),
          ...projects.map(p => p.consultantId)
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
  
  const getProjectStatus = (project: Project) => {
    if (project.completion > 0 && project.timeElapsed > 0 && project.expectedDays > 0) {
      const timePercentage = (project.timeElapsed / project.expectedDays) * 100;
      if (project.completion > timePercentage) {
        return <span className="text-green-600 flex items-center gap-1"><TrendingUp className="h-4 w-4" /> متقدم</span>;
      } else if (project.completion < timePercentage) {
        return <span className="text-red-600 flex items-center gap-1"><TrendingDown className="h-4 w-4" /> متأخر</span>;
      }
      return <span className="text-blue-600">مطابق</span>;
    }
    return "-";
  };

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
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-100">
              <TableHead className="text-right">اسم المشروع</TableHead>
              <TableHead className="text-right">نسبة الانجاز الكلية</TableHead>
              <TableHead className="text-right">الوقت المنقضي</TableHead>
              <TableHead className="text-right">الأيام المتوقعة للإنجاز</TableHead>
              <TableHead className="text-right">الحالة</TableHead>
              <TableHead className="text-right">المقاول</TableHead>
              <TableHead className="text-right">المالك</TableHead>
              <TableHead className="text-right">التحكم</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {projects.length > 0 ? (
              projects.map((project, index) => (
                <TableRow key={project.id || `project-${index}`} className="border-t hover:bg-gray-50">
                  <TableCell>{project.name}</TableCell>
                  <TableCell>{project.completion || 0}%</TableCell>
                  <TableCell>{project.timeElapsed || 0} يوم</TableCell>
                  <TableCell>{project.expectedDays || 0} يوم</TableCell>
                  <TableCell>{getProjectStatus(project)}</TableCell>
                  <TableCell>{getUserDisplayName(project.contractorId)}</TableCell>
                  <TableCell>{getUserDisplayName(project.ownerId)}</TableCell>
                  <TableCell className="flex gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => onViewProject(project)}
                      className="text-indigo-600 hover:text-indigo-800"
                    >
                      <i className="fa fa-eye ml-1" /> عرض
                    </Button>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-red-600 hover:text-red-800"
                        >
                          <i className="fa fa-trash ml-1" /> حذف
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="rtl:text-right">
                        <AlertDialogHeader>
                          <AlertDialogTitle>حذف المشروع</AlertDialogTitle>
                          <AlertDialogDescription>
                            هل أنت متأكد من حذف المشروع "{project.name}"؟ سيتم حذف جميع البيانات المرتبطة به ولا يمكن استعادتها.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter className="flex-row-reverse">
                          <AlertDialogAction 
                            onClick={() => onDeleteProject(project.id)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            حذف
                          </AlertDialogAction>
                          <AlertDialogCancel>إلغاء</AlertDialogCancel>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} className="py-8 text-center text-gray-400">
                  لا توجد مشاريع
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

export default ProjectsListTab;