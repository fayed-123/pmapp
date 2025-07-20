// import React, { useState } from 'react';
// import { Button } from '@/components/ui/button';
// import { Card } from '@/components/ui/card';
// import Modal from '@/components/Modal';
// import ProjectDetails from '../projects/ProjectDetails';
// import { useToast } from '@/components/ui/use-toast';
// import { useAuth } from '@/context/AuthContext';
// import { deleteProjectWithAllData } from '@/lib/db';
// import {
//   AlertDialog,
//   AlertDialogAction,
//   AlertDialogCancel,
//   AlertDialogContent,
//   AlertDialogFooter,
//   AlertDialogDescription,
//   AlertDialogHeader,
//   AlertDialogTitle,
//   AlertDialogTrigger,
// } from "@/components/ui/alert-dialog";
// import { useMainConsultantDashboard } from './hooks/useMainConsultantDashboard';

// const GeneralConsultantDashboard: React.FC = () => {
//   const { projects, users, handleAddUser, handleApproveUser, handleDeleteUser } = useMainConsultantDashboard();

//   const [selectedProject, setSelectedProject] = useState(null);
//   const [showProjectDetails, setShowProjectDetails] = useState(false);
//   const { user } = useAuth();
//   const { toast } = useToast();

//   // ✅ دالة تحديد الحالة
//   const getProjectStatus = (project) => {
//     if (
//       project.completion > 0 &&
//       project.timeElapsed > 0 &&
//       project.expectedDays > 0
//     ) {
//       const timePercentage = (project.timeElapsed / project.expectedDays) * 100;
//       if (project.completion > timePercentage) {
//         return (
//           <span className="text-green-600 font-medium">متقدم</span>
//         );
//       } else if (project.completion < timePercentage) {
//         return (
//           <span className="text-red-600 font-medium">متأخر</span>
//         );
//       }
//       return <span className="text-blue-600 font-medium">مطابق</span>;
//     }
//     return <span className="text-gray-400">-</span>;
//   };

//   const handleViewProject = (project) => {
//     setSelectedProject(project);
//     setShowProjectDetails(true);
//   };

//   const handleCloseProjectDetails = () => {
//     setShowProjectDetails(false);
//     setSelectedProject(null);
//   };

//   const handleDeleteProject = async (projectId) => {
//     try {
//       await deleteProjectWithAllData(projectId);
//       toast({
//         title: "تم حذف المشروع",
//         description: "تم حذف المشروع وجميع بياناته بنجاح",
//       });
//     } catch (error) {
//       toast({
//         title: "خطأ",
//         description: "حدث خطأ أثناء حذف المشروع",
//         variant: "destructive",
//       });
//     }
//   };

//   return (
//     <div className="space-y-6" dir="rtl">
//       <div>
//         <h3 className="mb-2 font-bold text-lg text-gray-700 flex items-center gap-2">
//           <i className="fa fa-layer-group" /> المشاريع المكلف بها ({projects.length})
//         </h3>
//         <Card className="overflow-x-auto mb-4">
//           <table className="w-full">
//             <thead>
//               <tr className="bg-gray-100">
//                 <th className="p-2 text-right">اسم المشروع</th>
//                 <th className="p-2 text-right">المالك</th>
//                 <th className="p-2 text-right">الاستشاري</th>
//                 <th className="p-2 text-right">المقاول</th>
//                 <th className="p-2 text-right">الوقت المنقضي</th>
//                 <th className="p-2 text-right">نسبة الإنجاز الكلية</th>
//                 <th className="p-2 text-right">الأيام المتوقعة للإنجاز</th>
//                 <th className="p-2 text-right">الحالة</th>
//                 <th className="p-2 text-right">التحكم</th>
//               </tr>
//             </thead>
//             <tbody>
//               {projects.length > 0 ? projects.map((project) => (
//                 <tr key={project.id} className="border-t hover:bg-gray-50">
//                   <td className="p-2">{project.name}</td>
//                   <td className="p-2">{project.ownerName || '-'}</td>
//                   <td className="p-2">{project.consultantName || '-'}</td>
//                   <td className="p-2">{project.contractorName || '-'}</td>
//                   <td className="p-2">{project.timeElapsed || 0} يوم</td>
//                   <td className="p-2">{project.completion || 0}%</td>
//                   <td className="p-2">{project.expectedDays || 0} يوم</td>
                  
//                   {/* ✅ الحالة بعد الحساب */}
//                   <td className="p-2">{getProjectStatus(project)}</td>

//                   <td className="p-2 flex gap-2">
//                     <Button
//                       variant="ghost"
//                       size="sm"
//                       className="text-indigo-600 hover:text-indigo-800"
//                       onClick={() => handleViewProject(project)}
//                     >
//                       <i className="fa fa-eye ml-1" /> عرض
//                     </Button>

//                     <AlertDialog>
//                       <AlertDialogTrigger asChild>
//                         <Button
//                           variant="ghost"
//                           size="sm"
//                           className="text-red-600 hover:text-red-800"
//                         >
//                           <i className="fa fa-trash ml-1" /> حذف
//                         </Button>
//                       </AlertDialogTrigger>
//                       <AlertDialogContent className="rtl:text-right">
//                         <AlertDialogHeader>
//                           <AlertDialogTitle>حذف المشروع</AlertDialogTitle>
//                           <AlertDialogDescription>
//                             هل أنت متأكد من حذف هذا المشروع؟ سيتم حذف جميع البيانات المرتبطة به ولا يمكن استعادتها.
//                           </AlertDialogDescription>
//                         </AlertDialogHeader>
//                         <AlertDialogFooter className="flex-row-reverse">
//                           <AlertDialogAction
//                             onClick={() => handleDeleteProject(project.id)}
//                             className="bg-red-600 hover:bg-red-700"
//                           >
//                             حذف
//                           </AlertDialogAction>
//                           <AlertDialogCancel>إلغاء</AlertDialogCancel>
//                         </AlertDialogFooter>
//                       </AlertDialogContent>
//                     </AlertDialog>
//                   </td>
//                 </tr>
//               )) : (
//                 <tr>
//                   <td colSpan={9} className="py-8 text-center text-gray-400">
//                     لا توجد مشاريع مرتبطة بك كاستشاري عام
//                   </td>
//                 </tr>
//               )}
//             </tbody>
//           </table>
//         </Card>
//       </div>

//       {/* مودال عرض تفاصيل المشروع */}
//       {selectedProject && (
//         <Modal
//           isOpen={showProjectDetails}
//           onClose={handleCloseProjectDetails}
//           title={`تفاصيل المشروع: ${selectedProject.name}`}
//           size="xl"
//         >
//           <ProjectDetails
//             project={selectedProject}
//             currentUser={user}
//             onClose={handleCloseProjectDetails}
//           />
//         </Modal>
//       )}
//     </div>
//   );
// };

// export default GeneralConsultantDashboard;


