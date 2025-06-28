import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Project } from '@/lib/types';
import { getUserNameById } from '@/lib/db';
import { TrendingUp, TrendingDown, FolderOpen, Eye, Trash2, Users, Clock, Calendar } from 'lucide-react';
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
        return <span className="text-green-600 flex items-center gap-1 font-medium"><TrendingUp className="h-4 w-4" /> متقدم</span>;
      } else if (project.completion < timePercentage) {
        return <span className="text-red-600 flex items-center gap-1 font-medium"><TrendingDown className="h-4 w-4" /> متأخر</span>;
      }
      return <span className="text-blue-600 font-medium">مطابق</span>;
    }
    return <span className="text-gray-400">-</span>;
  };

  const getUserDisplayName = (userId: string | null | undefined) => {
    if (!userId) return '-';
    if (isLoadingUsers) return 'جاري التحميل...';
    return userNames[userId] || 'غير معروف';
  };

  const getCompletionColor = (completion: number) => {
    if (completion >= 80) return 'text-green-600 bg-green-50';
    if (completion >= 50) return 'text-yellow-600 bg-yellow-50';
    if (completion >= 20) return 'text-orange-600 bg-orange-50';
    return 'text-red-600 bg-red-50';
  };

  return (
    <div className="space-y-6">
      {/* Enhanced Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
            <FolderOpen className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-800">جميع المشاريع</h3>
            <p className="text-sm text-gray-600 mt-1">
              إجمالي {projects.length} مشروع
            </p>
          </div>
        </div>
        
        {/* Stats Cards - Mobile First */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
          <div className="bg-white rounded-lg p-3 border border-gray-200 text-center">
            <div className="text-lg sm:text-xl font-bold text-indigo-600">{projects.length}</div>
            <div className="text-xs sm:text-sm text-gray-600">المشاريع</div>
          </div>
          <div className="bg-white rounded-lg p-3 border border-gray-200 text-center">
            <div className="text-lg sm:text-xl font-bold text-green-600">
              {projects.filter(p => {
                const timePercentage = p.expectedDays > 0 ? (p.timeElapsed / p.expectedDays) * 100 : 0;
                return p.completion > timePercentage;
              }).length}
            </div>
            <div className="text-xs sm:text-sm text-gray-600">متقدم</div>
          </div>
          <div className="bg-white rounded-lg p-3 border border-gray-200 text-center col-span-2 sm:col-span-1">
            <div className="text-lg sm:text-xl font-bold text-red-600">
              {projects.filter(p => {
                const timePercentage = p.expectedDays > 0 ? (p.timeElapsed / p.expectedDays) * 100 : 0;
                return p.completion < timePercentage;
              }).length}
            </div>
            <div className="text-xs sm:text-sm text-gray-600">متأخر</div>
          </div>
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden lg:block">
        <Card className="overflow-hidden shadow-sm border-0 bg-white">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 border-b">
                  <TableHead className="text-right font-semibold text-gray-700 py-4">اسم المشروع</TableHead>
                  <TableHead className="text-right font-semibold text-gray-700">نسبة الانجاز</TableHead>
                  <TableHead className="text-right font-semibold text-gray-700">الوقت المنقضي</TableHead>
                  <TableHead className="text-right font-semibold text-gray-700">الأيام المتوقعة</TableHead>
                  <TableHead className="text-right font-semibold text-gray-700">الحالة</TableHead>
                  <TableHead className="text-right font-semibold text-gray-700">المقاول</TableHead>
                  <TableHead className="text-right font-semibold text-gray-700">المالك</TableHead>
                  <TableHead className="text-center font-semibold text-gray-700">التحكم</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {projects.length > 0 ? (
                  projects.map((project, index) => (
                    <TableRow key={project.id || `project-${index}`} className="border-b hover:bg-gray-50 transition-colors">
                      <TableCell className="font-medium text-gray-900 py-4">{project.name}</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-sm font-medium ${getCompletionColor(project.completion || 0)}`}>
                          {project.completion || 0}%
                        </span>
                      </TableCell>
                      <TableCell className="text-gray-600">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {project.timeElapsed || 0} يوم
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-600">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {project.expectedDays || 0} يوم
                        </div>
                      </TableCell>
                      <TableCell>{getProjectStatus(project)}</TableCell>
                      <TableCell className="text-gray-600">{getUserDisplayName(project.contractorId)}</TableCell>
                      <TableCell className="text-gray-600">{getUserDisplayName(project.ownerId)}</TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => onViewProject(project)}
                            className="text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="text-red-600 hover:text-red-800 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4" />
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
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="py-12 text-center">
                      <div className="flex flex-col items-center gap-3 text-gray-400">
                        <FolderOpen className="h-12 w-12" />
                        <p className="text-lg">لا توجد مشاريع</p>
                        <p className="text-sm">ابدأ بإضافة مشروع جديد</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>

      {/* Mobile Card View */}
      <div className="lg:hidden space-y-4">
        {projects.length > 0 ? (
          projects.map((project, index) => (
            <Card key={project.id || `project-${index}`} className="p-4 shadow-sm border-0 bg-white">
              <div className="space-y-3">
                {/* Project Name and Status */}
                <div className="flex items-start justify-between">
                  <h4 className="font-semibold text-gray-900 text-lg leading-tight">{project.name}</h4>
                  <div className="ml-2">{getProjectStatus(project)}</div>
                </div>
                
                {/* Progress */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">نسبة الإنجاز</span>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-sm font-medium ${getCompletionColor(project.completion || 0)}`}>
                      {project.completion || 0}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-indigo-600 h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${project.completion || 0}%` }}
                    ></div>
                  </div>
                </div>
                
                {/* Time Info */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Clock className="h-4 w-4" />
                    <span>الوقت المنقضي: {project.timeElapsed || 0} يوم</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span>المتوقع: {project.expectedDays || 0} يوم</span>
                  </div>
                </div>
                
                {/* People */}
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Users className="h-4 w-4" />
                    <span>المقاول: {getUserDisplayName(project.contractorId)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Users className="h-4 w-4" />
                    <span>المالك: {getUserDisplayName(project.ownerId)}</span>
                  </div>
                </div>
                
                {/* Actions */}
                <div className="flex gap-2 pt-2 border-t">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => onViewProject(project)}
                    className="flex-1 text-indigo-600 border-indigo-200 hover:bg-indigo-50"
                  >
                    <Eye className="h-4 w-4 ml-1" />
                    عرض
                  </Button>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-red-600 border-red-200 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
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
                </div>
              </div>
            </Card>
          ))
        ) : (
          <Card className="p-8 text-center bg-white">
            <div className="flex flex-col items-center gap-3 text-gray-400">
              <FolderOpen className="h-16 w-16" />
              <p className="text-lg">لا توجد مشاريع</p>
              <p className="text-sm">ابدأ بإضافة مشروع جديد</p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ProjectsListTab;