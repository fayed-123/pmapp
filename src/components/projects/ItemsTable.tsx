// import React from 'react';
// import { Card } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import { ProjectItem } from '@/lib/types';
// import { Pencil, Trash2, AlertTriangle, Calendar, Clock, Percent, Weight, Target, Hash, FileText, Shield, CheckCircle } from "lucide-react";

// interface ItemsTableProps {
//   items: ProjectItem[];
//   canEdit: boolean;
//   canReview: boolean;
//   onEdit: (item: ProjectItem) => void;
//   onDelete: (itemId: string) => void;
// }

// const ItemsTable: React.FC<ItemsTableProps> = ({ items, canEdit, canReview, onEdit, onDelete }) => {
//   const formatDate = (dateString: string | undefined) => {
//     if (!dateString) return 'غير محدد';
//     const date = new Date(dateString);
//     return date.toLocaleDateString('ar-SA');
//   };

//   const getRiskConfig = (riskLevel: string | undefined) => {
//     switch (riskLevel) {
//       case 'high':
//         return {
//           text: 'عالي',
//           icon: AlertTriangle,
//           bgColor: 'bg-red-100',
//           textColor: 'text-red-800',
//           borderColor: 'border-red-200'
//         };
//       case 'medium':
//         return {
//           text: 'متوسط',
//           icon: Shield,
//           bgColor: 'bg-yellow-100',
//           textColor: 'text-yellow-800',
//           borderColor: 'border-yellow-200'
//         };
//       case 'low':
//         return {
//           text: 'منخفض',
//           icon: CheckCircle,
//           bgColor: 'bg-green-100',
//           textColor: 'text-green-800',
//           borderColor: 'border-green-200'
//         };
//       default:
//         return {
//           text: 'غير محدد',
//           icon: Shield,
//           bgColor: 'bg-gray-100',
//           textColor: 'text-gray-500',
//           borderColor: 'border-gray-200'
//         };
//     }
//   };

//   const getProgressColor = (progress: number) => {
//     if (progress >= 90) return 'text-green-600 bg-green-50';
//     if (progress >= 70) return 'text-blue-600 bg-blue-50';
//     if (progress >= 50) return 'text-yellow-600 bg-yellow-50';
//     if (progress >= 25) return 'text-orange-600 bg-orange-50';
//     return 'text-red-600 bg-red-50';
//   };

//   return (
//     <div className="space-y-4">
//       {/* Desktop Table View */}
//       <div className="hidden xl:block">
//         <Card className="overflow-hidden shadow-sm border-0 bg-white">
//           <div className="overflow-x-auto">
//             <table className="w-full">
//               <thead>
//                 <tr className="bg-gray-50 border-b">
//                   <th className="p-4 text-right font-semibold text-gray-700">رقم البند</th>
//                   <th className="p-4 text-right font-semibold text-gray-700">البند</th>
//                   {/* <th className="p-4 text-right font-semibold text-gray-700">قيمة البند</th> */}
//                   <th className="p-4 text-right font-semibold text-gray-700">نسبة الإنجاز</th>
//                   <th className="p-4 text-right font-semibold text-gray-700">تاريخ البدء</th>
//                   <th className="p-4 text-right font-semibold text-gray-700">تاريخ الانتهاء</th>
//                   <th className="p-4 text-right font-semibold text-gray-700">زمن التنفيذ</th>
//                   <th className="p-4 text-right font-semibold text-gray-700">الوزن النسبي</th>
//                   <th className="p-4 text-right font-semibold text-gray-700">نسبة الإنجاز الموزونة</th>
//                   <th className="p-4 text-right font-semibold text-gray-700">مستوى الخطر</th>
//                   {(canEdit || canReview) && <th className="p-4 text-center font-semibold text-gray-700">التحكم</th>}
//                 </tr>
//               </thead>
//               <tbody>
//                 {items.length > 0 ? (
//                   items.map((item, index) => {
//                     const riskConfig = getRiskConfig(item.riskLevel);
//                     const RiskIcon = riskConfig.icon;
//                     const progress = item.progress || 0;

//                     return (
//                       <tr key={item.id} className="border-b hover:bg-gray-50 transition-colors">
//                         <td className="p-4 font-medium text-gray-900">{item.itemNumber || index + 1}</td>
//                         <td className="p-4 text-gray-800 max-w-xs">
//                           <div className="truncate" title={item.name}>{item.name}</div>
//                         </td>
//                         <td className="p-4">
//                           <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-sm font-medium ${getProgressColor(progress)}`}>
//                             {progress}%
//                           </span>
//                         </td>
//                         <td className="p-4 text-gray-600">{formatDate(item.startDate)}</td>
//                         <td className="p-4 text-gray-600">{formatDate(item.endDate)}</td>
//                         <td className="p-4 text-gray-600">{item.executionTime || 0} يوم</td>
//                         <td className="p-4 text-gray-600">{item.weight ? item.weight.toFixed(4) : '-'}</td>
//                         <td className="p-4 text-gray-600">{item.weightedProgress ? item.weightedProgress.toFixed(2) : '0.00'}%</td>
//                         <td className="p-4">
//                           <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${riskConfig.bgColor} ${riskConfig.textColor} ${riskConfig.borderColor} border`}>
//                             <RiskIcon className="h-4 w-4" />
//                             {riskConfig.text}
//                           </div>
//                         </td>
//                         {(canEdit || canReview) && (
//                           <td className="p-4">
//                             <div className="flex items-center justify-center gap-2">
//                               {(canEdit || canReview) && (
//                                 <Button
//                                   variant="ghost"
//                                   size="sm"
//                                   onClick={() => onEdit(item)}
//                                   className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
//                                 >
//                                   <Pencil className="h-4 w-4" />
//                                 </Button>
//                               )}
//                               {canEdit && (
//                                 <Button
//                                   variant="ghost"
//                                   size="sm"
//                                   onClick={() => onDelete(item.id)}
//                                   className="text-red-600 hover:text-red-800 hover:bg-red-50"
//                                 >
//                                   <Trash2 className="h-4 w-4" />
//                                 </Button>
//                               )}
//                             </div>
//                           </td>
//                         )}
//                       </tr>
//                     );
//                   })
//                 ) : (
//                   <tr>
//                     <td colSpan={(canEdit || canReview) ? 10 : 9} className="py-12 text-center">
//                       <div className="flex flex-col items-center gap-3 text-gray-400">
//                         <FileText className="h-12 w-12" />
//                         <p className="text-lg">لا توجد بنود</p>
//                         <p className="text-sm">ابدأ بإضافة بند جديد للمشروع</p>
//                       </div>
//                     </td>
//                   </tr>
//                 )}
//               </tbody>
//             </table>
//           </div>
//         </Card>
//       </div>

//       {/* Mobile/Tablet Card View */}
//       <div className="xl:hidden space-y-4">
//         {items.length > 0 ? (
//           items.map((item, index) => {
//             const riskConfig = getRiskConfig(item.riskLevel);
//             const RiskIcon = riskConfig.icon;
//             const progress = item.progress || 0;

//             return (
//               <Card key={item.id} className="p-4 shadow-sm border-0 bg-white">
//                 <div className="space-y-4">
//                   {/* Header with Item Number and Name */}
//                   <div className="flex items-start justify-between">
//                     <div className="flex-1">
//                       <div className="flex items-center gap-2 mb-1">
//                         <div className="w-6 h-6 bg-indigo-100 rounded-md flex items-center justify-center">
//                           <Hash className="w-3 h-3 text-indigo-600" />
//                         </div>
//                         <span className="text-sm font-medium text-gray-600">
//                           البند رقم {item.itemNumber || index + 1}
//                         </span>
//                       </div>
//                       <h4 className="font-semibold text-gray-900 text-lg leading-tight">
//                         {item.name}
//                       </h4>
//                     </div>

//                     {/* Risk Level */}
//                     <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ml-2 ${riskConfig.bgColor} ${riskConfig.textColor} ${riskConfig.borderColor} border`}>
//                       <RiskIcon className="h-3 w-3" />
//                       {riskConfig.text}
//                     </div>
//                   </div>

//                   {/* Progress Bar */}
//                   <div className="space-y-2">
//                     <div className="flex justify-between items-center">
//                       <span className="text-sm font-medium text-gray-700">نسبة الإنجاز</span>
//                       <span className={`inline-flex items-center px-2 py-1 rounded-full text-sm font-medium ${getProgressColor(progress)}`}>
//                         {progress}%
//                       </span>
//                     </div>
//                     <div className="w-full bg-gray-200 rounded-full h-2">
//                       <div
//                         className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
//                         style={{ width: `${progress}%` }}
//                       ></div>
//                     </div>
//                   </div>

//                   {/* Details Grid */}
//                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
//                     <div className="flex items-center gap-2">
//                       <Calendar className="h-4 w-4 text-blue-600" />
//                       <span className="text-gray-600">البدء: {formatDate(item.startDate)}</span>
//                     </div>
//                     <div className="flex items-center gap-2">
//                       <Calendar className="h-4 w-4 text-purple-600" />
//                       <span className="text-gray-600">الانتهاء: {formatDate(item.endDate)}</span>
//                     </div>
//                     <div className="flex items-center gap-2">
//                       <Clock className="h-4 w-4 text-green-600" />
//                       <span className="text-gray-600">المدة: {item.executionTime || 0} يوم</span>
//                     </div>
//                     <div className="flex items-center gap-2">
//                       <Weight className="h-4 w-4 text-yellow-600" />
//                       <span className="text-gray-600">الوزن: {item.weight ? item.weight.toFixed(4) : '-'}</span>
//                     </div>
//                   </div>

//                   {/* Weighted Progress */}
//                   <div className="flex items-center gap-2 text-sm bg-gray-50 p-3 rounded-lg">
//                     <Target className="h-4 w-4 text-indigo-600" />
//                     <span className="text-gray-600">
//                       نسبة الإنجاز الموزونة:
//                       <span className="font-medium text-gray-800 ml-1">
//                         {item.weightedProgress ? item.weightedProgress.toFixed(2) : '0.00'}%
//                       </span>
//                     </span>
//                   </div>

//                   {/* Actions */}
//                   {(canEdit || canReview) && (
//                     <div className="flex gap-2 pt-2 border-t">
//                       {(canEdit || canReview) && (
//                         <Button
//                           variant="outline"
//                           size="sm"
//                           onClick={() => onEdit(item)}
//                           className="flex-1 text-blue-600 border-blue-200 hover:bg-blue-50"
//                         >
//                           <Pencil className="h-4 w-4 ml-1" />
//                           تعديل
//                         </Button>
//                       )}
//                       {canEdit && (
//                         <Button
//                           variant="outline"
//                           size="sm"
//                           onClick={() => onDelete(item.id)}
//                           className="text-red-600 border-red-200 hover:bg-red-50"
//                         >
//                           <Trash2 className="h-4 w-4" />
//                         </Button>
//                       )}
//                     </div>
//                   )}
//                 </div>
//               </Card>
//             );
//           })
//         ) : (
//           <Card className="p-8 text-center bg-white">
//             <div className="flex flex-col items-center gap-3 text-gray-400">
//               <FileText className="h-16 w-16" />
//               <p className="text-lg">لا توجد بنود</p>
//               <p className="text-sm">ابدأ بإضافة بند جديد للمشروع</p>
//             </div>
//           </Card>
//         )}
//       </div>
//     </div>
//   );
// };

// export default ItemsTable;
import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ProjectItem } from "@/lib/types";
import {
  Pencil,
  Trash2,
  AlertTriangle,
  Calendar,
  Clock,
  Percent,
  Weight,
  Target,
  Hash,
  FileText,
  Shield,
  CheckCircle,
} from "lucide-react";

interface ItemsTableProps {
  items: ProjectItem[];
  canEdit: boolean;
  canReview: boolean;
  onEdit: (item: ProjectItem) => void;
  onDelete: (itemId: string) => void;
}

const ItemsTable: React.FC<ItemsTableProps> = ({
  items,
  canEdit,
  canReview,
  onEdit,
  onDelete,
}) => {
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "غير محدد";
    const date = new Date(dateString);
    return date.toLocaleDateString("ar-SA");
  };

  const getRiskConfig = (riskLevel: string | undefined) => {
    switch (riskLevel) {
      case "high":
        return {
          text: "عالي",
          icon: AlertTriangle,
          bgColor: "bg-red-100",
          textColor: "text-red-800",
          borderColor: "border-red-200",
        };
      case "medium":
        return {
          text: "متوسط",
          icon: Shield,
          bgColor: "bg-yellow-100",
          textColor: "text-yellow-800",
          borderColor: "border-yellow-200",
        };
      case "low":
        return {
          text: "منخفض",
          icon: CheckCircle,
          bgColor: "bg-green-100",
          textColor: "text-green-800",
          borderColor: "border-green-200",
        };
      default:
        return {
          text: "غير محدد",
          icon: Shield,
          bgColor: "bg-gray-100",
          textColor: "text-gray-500",
          borderColor: "border-gray-200",
        };
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 90) return "text-green-600 bg-green-50";
    if (progress >= 70) return "text-blue-600 bg-blue-50";
    if (progress >= 50) return "text-yellow-600 bg-yellow-50";
    if (progress >= 25) return "text-orange-600 bg-orange-50";
    return "text-red-600 bg-red-50";
  };

  return (
    <div className="space-y-4">
      {/* Desktop Table View */}
      <div className="hidden xl:block">
        <Card className="overflow-hidden shadow-sm border-0 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="p-4 text-right font-semibold text-gray-700">
                    رقم البند
                  </th>
                  <th className="p-4 text-right font-semibold text-gray-700">
                    البند
                  </th>
                  <th className="p-4 text-right font-semibold text-gray-700">
                    قيمة البند
                  </th>
                  <th className="p-4 text-right font-semibold text-gray-700">
                    نسبة الإنجاز
                  </th>
                  <th className="p-4 text-right font-semibold text-gray-700">
                    تاريخ البدء
                  </th>
                  <th className="p-4 text-right font-semibold text-gray-700">
                    تاريخ الانتهاء
                  </th>
                  <th className="p-4 text-right font-semibold text-gray-700">
                    زمن التنفيذ
                  </th>
                  <th className="p-4 text-right font-semibold text-gray-700">
                    الوزن النسبي
                  </th>
                  <th className="p-4 text-right font-semibold text-gray-700">
                    نسبة الإنجاز الموزونة
                  </th>
                  <th className="p-4 text-right font-semibold text-gray-700">
                    نسبة توريد البند
                  </th>
                  <th className="p-4 text-right font-semibold text-gray-700">
                    نسبة الإنجاز الموزونة للتوريد
                  </th>
                  <th className="p-4 text-right font-semibold text-gray-700">
                    مستوى الخطر
                  </th>
                  {(canEdit || canReview) && (
                    <th className="p-4 text-center font-semibold text-gray-700">
                      التحكم
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {items.length > 0 ? (
                  items.map((item, index) => {
                    const riskConfig = getRiskConfig(item.riskLevel);
                    const RiskIcon = riskConfig.icon;
                    const progress = item.progress || 0;

                    return (
                      <tr
                        key={item.id}
                        className="border-b hover:bg-gray-50 transition-colors"
                      >
                        <td className="p-4 font-medium text-gray-900">
                          {item.itemNumber || index + 1}
                        </td>
                        <td className="p-4 text-gray-800 max-w-xs text-center">
                          <div className="truncate" title={item.name}>
                            {item.name}
                          </div>
                        </td>
                        <td className="p-4 text-gray-700">
                          {item.value
                            ? item.value.toLocaleString("ar-EG") + " ج.م"
                            : "-"}
                        </td>
                        <td className="p-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-sm font-medium ${getProgressColor(
                              progress
                            )}`}
                          >
                            {progress}%
                          </span>
                        </td>
                        <td className="p-4 text-gray-600">
                          {formatDate(item.startDate)}
                        </td>
                        <td className="p-4 text-gray-600">
                          {formatDate(item.endDate)}
                        </td>
                        <td className="p-4 text-gray-600">
                          {item.executionTime || 0} يوم
                        </td>
                        <td className="p-4 text-gray-600">
                          {item.weight ? item.weight.toFixed(4) : "-"}
                        </td>
                        <td className="p-4 text-gray-600">
                          {item.weightedProgress
                            ? item.weightedProgress.toFixed(2)
                            : "0.00"}
                          %
                        </td>
                        <td className="p-4 text-gray-600">
                          {item.supplyProgress !== undefined
                            ? item.supplyProgress.toFixed(2) + "%"
                            : "-"}
                        </td>
                        <td className="p-4 text-gray-600">
                          {item.supplyProgress !== undefined &&
                          item.weight !== undefined
                            ? (item.supplyProgress * item.weight).toFixed(2) +
                              "%"
                            : "0.00%"}
                        </td>

                        <td className="p-4">
                          <div
                            className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${riskConfig.bgColor} ${riskConfig.textColor} ${riskConfig.borderColor} border`}
                          >
                            <RiskIcon className="h-4 w-4" />
                            {riskConfig.text}
                          </div>
                        </td>
                        {(canEdit || canReview) && (
                          <td className="p-4">
                            <div className="flex items-center justify-center gap-2">
                              {(canEdit || canReview) && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => onEdit(item)}
                                  className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                              )}
                              {canEdit && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => onDelete(item.id)}
                                  className="text-red-600 hover:text-red-800 hover:bg-red-50"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td
                      colSpan={canEdit || canReview ? 11 : 10}
                      className="py-12 text-center"
                    >
                      <div className="flex flex-col items-center gap-3 text-gray-400">
                        <FileText className="h-12 w-12" />
                        <p className="text-lg">لا توجد بنود</p>
                        <p className="text-sm">ابدأ بإضافة بند جديد للمشروع</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ItemsTable;
