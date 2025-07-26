import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import Modal from '@/components/Modal';
import ProjectDetails from '../projects/ProjectDetails';
import { useConsultantDashboard } from './hooks/useConsultantDashboard';
import { Tab } from './types/dashboardTypes';
import ProjectsTab from './components/ProjectsTab';
import StatsTab from './components/StatsTab';
import { 
  FolderOpen, 
  BarChart3, 
  Settings, 
  UserPlus, 
  Trash2, 
  User2,
  Users
} from 'lucide-react';
import {
  addSubconsultantUser,
  deleteSubconsultant,
  loadSubconsultantsForCurrentUser
} from '@/lib/db/users';

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

  // --- إدارة الاستشاريين الفرعيين ---
  const [subconsultants, setSubconsultants] = useState<any[]>([]);
  const [newSubconsultantName, setNewSubconsultantName] = useState('');
  const [subconsultantType, setSubconsultantType] = useState('معماري');

  useEffect(() => {
    if (currentUser?.id) {
      loadSubconsultantsForCurrentUser(currentUser.id).then(setSubconsultants);
    }
  }, [currentUser]);

  const handleAddSubconsultant = async () => {
    if (!newSubconsultantName.trim()) return;

    try {
      await addSubconsultantUser({
        name: newSubconsultantName,
        type: subconsultantType,
        consultantId: currentUser.id
      });

      toast({ title: "تم الإضافة", description: "تم إضافة استشاري فرعي بنجاح" });

      const updated = await loadSubconsultantsForCurrentUser(currentUser.id);
      setSubconsultants(updated);
      setNewSubconsultantName('');
    } catch (error) {
      toast({ title: "خطأ", description: "حدث خطأ أثناء الإضافة", variant: "destructive" });
      console.error(error);
    }
  };

  const handleDeleteSubconsultant = async (id: string) => {
    try {
      await deleteSubconsultant(id);
      toast({ title: "تم الحذف", description: "تم حذف الاستشاري الفرعي بنجاح" });
      const updated = await loadSubconsultantsForCurrentUser(currentUser.id);
      setSubconsultants(updated);
    } catch (error) {
      toast({ title: "خطأ", description: "حدث خطأ أثناء الحذف", variant: "destructive" });
      console.error(error);
    }
  };

  // Define tabs with consistent styling
  const tabs = [
    {
      id: Tab.Projects,
      label: 'مشاريعي',
      icon: FolderOpen,
      color: 'indigo',
      bgColor: 'bg-indigo-600',
      lightBg: 'bg-indigo-100',
      textColor: 'text-indigo-700',
      hoverBg: 'hover:bg-indigo-200'
    },
    {
      id: Tab.Subconsultants,
      label: 'الاستشاريين الفرعيين',
      icon: User2,
      color: 'blue',
      bgColor: 'bg-blue-600',
      lightBg: 'bg-blue-100',
      textColor: 'text-blue-700',
      hoverBg: 'hover:bg-blue-200'
    },
    {
      id: Tab.Stats,
      label: 'إحصائيات عامة',
      icon: BarChart3,
      color: 'yellow',
      bgColor: 'bg-yellow-600',
      lightBg: 'bg-yellow-100',
      textColor: 'text-yellow-700',
      hoverBg: 'hover:bg-yellow-200'
    }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case Tab.Projects:
        return <ProjectsTab projects={projects} onViewProject={handleViewProject} subconsultants={subconsultants} />;
      
      case Tab.Subconsultants:
        return (
          <div className="space-y-6">
            {/* Add Subconsultant Section */}
            <Card className="p-6 shadow-sm border-0 bg-gradient-to-r from-blue-50 to-indigo-50">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <UserPlus className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">إضافة استشاري فرعي جديد</h3>
                  <p className="text-sm text-gray-600">أضف استشاري فرعي للمساعدة في إدارة المشاريع</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    اسم الاستشاري الفرعي
                  </label>
                  <Input
                    placeholder="اسم الاستشاري الفرعي"
                    value={newSubconsultantName}
                    onChange={(e) => setNewSubconsultantName(e.target.value)}
                    className="focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    نوع التخصص
                  </label>
                  <select
                    value={subconsultantType}
                    onChange={(e) => setSubconsultantType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="معماري">أعمال معمارية</option>
                    <option value="ميكانيكي">أعمال ميكانيكية</option>
                    <option value="كهربائي">أعمال كهربائية</option>
                  </select>
                </div>

                <div className="flex items-end">
                  <Button
                    onClick={handleAddSubconsultant}
                    disabled={!newSubconsultantName.trim()}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 flex items-center justify-center gap-2"
                  >
                    <UserPlus className="w-4 h-4" />
                    إضافة استشاري
                  </Button>
                </div>
              </div>
            </Card>

            {/* Subconsultants List */}
            <Card className="p-6 shadow-sm border-0 bg-white">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                  <Users className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">الاستشاريين الفرعيين</h3>
                  <p className="text-sm text-gray-600">
                    {subconsultants.length > 0 
                      ? `لديك ${subconsultants.length} استشاري فرعي` 
                      : 'لم تقم بإضافة أي استشاري فرعي بعد'
                    }
                  </p>
                </div>
              </div>

              {subconsultants.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 border-b">
                        <th className="p-4 text-right font-semibold text-gray-700">الاسم</th>
                        <th className="p-4 text-right font-semibold text-gray-700">نوع التخصص</th>
                        <th className="p-4 text-right font-semibold text-gray-700">تاريخ الإضافة</th>
                        <th className="p-4 text-center font-semibold text-gray-700">الإجراءات</th>
                      </tr>
                    </thead>
                    <tbody>
                      {subconsultants.map((sub, index) => (
                        <tr key={sub.id} className="border-b hover:bg-gray-50 transition-colors">
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                <User2 className="w-4 h-4 text-blue-600" />
                              </div>
                              <span className="font-medium text-gray-800">{sub.name}</span>
                            </div>
                          </td>
                          <td className="p-4">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                              sub.type === 'معماري' ? 'bg-green-100 text-green-800' :
                              sub.type === 'ميكانيكي' ? 'bg-orange-100 text-orange-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {sub.type}
                            </span>
                          </td>
                          <td className="p-4 text-gray-600">
                            {sub.created_at ? new Date(sub.created_at).toLocaleDateString('ar-SA') : '-'}
                          </td>
                          <td className="p-4">
                            <div className="flex justify-center">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-600 hover:text-red-800 hover:bg-red-50"
                                onClick={() => handleDeleteSubconsultant(sub.id)}
                              >
                                <Trash2 className="w-4 h-4 mr-1" />
                                حذف
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <User2 className="w-8 h-8 text-gray-400" />
                  </div>
                  <h4 className="text-lg font-medium text-gray-800 mb-2">لا يوجد استشاريون فرعيون</h4>
                  <p className="text-gray-600 mb-4">ابدأ بإضافة استشاري فرعي للمساعدة في إدارة المشاريع</p>
                  <Button
                    onClick={() => setNewSubconsultantName('')}
                    variant="outline"
                    className="border-blue-200 text-blue-600 hover:bg-blue-50"
                  >
                    <UserPlus className="w-4 h-4 mr-1" />
                    إضافة أول استشاري فرعي
                  </Button>
                </div>
              )}
            </Card>
          </div>
        );
      
      case Tab.Stats:
        return <StatsTab />;
      
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Enhanced Header - Same as MainConsultant */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
            <Settings className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">لوحة تحكم الاستشاري</h2>
            <p className="text-gray-600 text-sm mt-1">إدارة المشاريع والاستشاريين الفرعيين</p>
          </div>
        </div>
      </div>

      {/* Enhanced Navigation Tabs - Same as MainConsultant */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6">
        {/* Desktop Navigation */}
        <div className="hidden lg:flex gap-3">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <Button
                key={tab.id}
                variant={isActive ? "default" : "outline"}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                  isActive
                    ? `${tab.bgColor} text-white shadow-lg hover:shadow-xl`
                    : `${tab.lightBg} ${tab.textColor} ${tab.hoverBg} border-0`
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="whitespace-nowrap">{tab.label}</span>
              </Button>
            );
          })}
        </div>

        {/* Mobile/Tablet Navigation */}
        <div className="lg:hidden">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <Button
                  key={tab.id}
                  variant={isActive ? "default" : "outline"}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 p-4 rounded-xl font-medium transition-all duration-200 text-right justify-start ${
                    isActive
                      ? `${tab.bgColor} text-white shadow-lg`
                      : `${tab.lightBg} ${tab.textColor} ${tab.hoverBg} border-0`
                  }`}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <span className="text-sm sm:text-base">{tab.label}</span>
                </Button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content Area - Same as MainConsultant */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 sm:p-6 lg:p-8">
          {renderContent()}
        </div>
      </div>

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
            subconsultants={subconsultants}
          />
        </Modal>
      )}
    </div>
  );
};

export default ConsultantDashboard;