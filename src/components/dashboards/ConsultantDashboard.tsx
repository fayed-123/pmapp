
// import React from 'react';
// import { useAuth } from '@/context/AuthContext';
// import Modal from '@/components/Modal';
// import ProjectDetails from '../projects/ProjectDetails';
// import { useConsultantDashboard } from './hooks/useConsultantDashboard';
// import { Tab } from './types/dashboardTypes';
// import ProjectsTab from './components/ProjectsTab';
// import StatsTab from './components/StatsTab';
// import DashboardTabs from './components/DashboardTabs';

// const ConsultantDashboard: React.FC = () => {
//   const { user: currentUser } = useAuth();
//   const {
//     activeTab,
//     setActiveTab,
//     projects,
//     selectedProject,
//     showProjectDetails,
//     handleViewProject,
//     handleCloseProjectDetails
//   } = useConsultantDashboard();

//   const renderContent = () => {
//     switch (activeTab) {
//       case Tab.Projects:
//         return <ProjectsTab projects={projects} onViewProject={handleViewProject} />;
//       case Tab.Stats:
//         return <StatsTab />;
//       default:
//         return null;
//     }
//   };

//   return (
//     <div>
//       <h2 className="text-2xl font-bold mb-2 text-indigo-700 flex items-center gap-2">
//         <i className="fa fa-clipboard-list" /> لوحة تحكم الاستشاري
//       </h2>
//       <hr className="mb-4" />
      
//       <DashboardTabs activeTab={activeTab} onTabChange={setActiveTab} />
      
//       {renderContent()}
      
//       {selectedProject && currentUser && (
//         <Modal
//           isOpen={showProjectDetails}
//           onClose={handleCloseProjectDetails}
//           title={`تفاصيل المشروع: ${selectedProject.name}`}
//           size="xl"
//         >
//           <ProjectDetails 
//             project={selectedProject} 
//             currentUser={currentUser} 
//             onClose={handleCloseProjectDetails} 
//           />
//         </Modal>
//       )}
//     </div>
//   );
// };
// export default ConsultantDashboard;
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import Modal from '@/components/Modal';
import ProjectDetails from '../projects/ProjectDetails';
import { useConsultantDashboard } from './hooks/useConsultantDashboard';
import { Tab } from './types/dashboardTypes';
import ProjectsTab from './components/ProjectsTab';
import StatsTab from './components/StatsTab';
import DashboardTabs from './components/DashboardTabs';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import { UserPlus, Trash2 } from 'lucide-react';
import {
  addSubconsultantUser,
  deleteSubconsultant,
  loadSubconsultantsForCurrentUser
} from '@/lib/db/users'; // تأكد إن الدوال دي شغالة

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

  const renderContent = () => {
    switch (activeTab) {
      case Tab.Projects:
        return <ProjectsTab projects={projects} onViewProject={handleViewProject} subconsultants={subconsultants} />;
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

      {/* إدارة الاستشاريين الفرعيين */}
      <Card className="p-4 sm:p-6 shadow-sm border-0 bg-white mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
            <UserPlus className="w-4 h-4 text-green-600" />
          </div>
          <h4 className="text-lg font-semibold text-gray-800">إضافة استشاري فرعي</h4>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
          <div className="lg:col-span-2">
            <Input
              className="w-full"
              placeholder="اسم الاستشاري الفرعي"
              value={newSubconsultantName}
              onChange={(e) => setNewSubconsultantName(e.target.value)}
            />
          </div>

          <div>
            <select
              value={subconsultantType}
              onChange={(e) => setSubconsultantType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="معماري">أعمال معمارية</option>
              <option value="ميكانيكي">أعمال ميكانيكية</option>
              <option value="كهربائي">أعمال كهربائية</option>
            </select>
          </div>

          <Button
            onClick={handleAddSubconsultant}
            disabled={!newSubconsultantName.trim()}
            className="bg-green-600 hover:bg-green-700 disabled:bg-gray-300 flex items-center gap-2"
          >
            <UserPlus className="w-4 h-4" />
            إضافة
          </Button>
        </div>

        <Card className="overflow-x-auto">
          <table className="w-full text-right">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2">الاسم</th>
                <th className="p-2">نوع العمل</th>
                <th className="p-2">التحكم</th>
              </tr>
            </thead>
            <tbody>
              {subconsultants.length > 0 ? (
                subconsultants.map((sub) => (
                  <tr key={sub.id} className="border-t hover:bg-gray-50 text-center">
                    <td className="p-2">{sub.name}</td>
                    <td className="p-2">{sub.type}</td>
                    <td className="p-2 text-center align-middle">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-800"
                        onClick={() => handleDeleteSubconsultant(sub.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                        حذف
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="py-8 text-center text-gray-400">
                    لا يوجد استشاريون فرعيون
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </Card>
      </Card>

      {/* التابات والبيانات */}
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
            subconsultants={subconsultants}
          />
        </Modal>
      )}
    </div>
  );
};

export default ConsultantDashboard;
