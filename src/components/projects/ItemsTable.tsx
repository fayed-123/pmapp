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
import { useAuth } from "@/context/AuthContext";

interface ItemsTableProps {
  items: ProjectItem[];
  canEdit: boolean;
  canReview: boolean;
  onEdit: (item: ProjectItem) => void;
  onDelete: (itemId: string) => void;
  onApproveItem?: (itemId: string) => void;
  onRejectItem?: (itemId: string) => void;
}

const ItemsTable: React.FC<ItemsTableProps> = ({
  items,
  canEdit,
  canReview,
  onEdit,
  onDelete,
  onApproveItem,
  onRejectItem
}) => {
  const { user: currentUser } = useAuth();
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

  const getStatusConfig = (status: string | undefined) => {
    switch (status) {
      case "pending":
        return {
          text: "في الانتظار",
          bgColor: "bg-gray-100",
          textColor: "text-gray-700",
        };
      case "contractor_approved":
        return {
          text: "موافقة المقاول",
          bgColor: "bg-blue-100",
          textColor: "text-blue-700",
        };
      case "subconsultant_approved":
        return {
          text: "موافقة الاستشاري الفرعي",
          bgColor: "bg-purple-100",
          textColor: "text-purple-700",
        };
      case "consultant_approved":
        return {
          text: "موافقة الاستشاري",
          bgColor: "bg-green-100",
          textColor: "text-green-700",
        };
      case "published":
        return {
          text: "منشور",
          bgColor: "bg-emerald-100",
          textColor: "text-emerald-700",
        };
      case "rejected":
        return {
          text: "مرفوض",
          bgColor: "bg-red-100",
          textColor: "text-red-700",
        };
      case "modification_requested":
        return {
          text: "مطلوب تعديل",
          bgColor: "bg-orange-100",
          textColor: "text-orange-700",
        };
      default:
        return {
          text: "غير محدد",
          bgColor: "bg-gray-100",
          textColor: "text-gray-500",
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
                  <th className="p-4 text-right font-semibold text-gray-700">
                    حالة البند
                  </th>
                  <th className="p-4 text-right font-semibold text-gray-700">
                    التعليقات
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
                        <td className="p-4">
                          <div
                            className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusConfig(item.status).bgColor
                              } ${getStatusConfig(item.status).textColor}`}
                          >
                            {getStatusConfig(item.status).text}
                          </div>
                        </td>
                        <td className="p-4 text-gray-600">
                          <div className="max-w-xs truncate" title={item.comments || ""}>
                            {item.comments || "-"}
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
                        {canReview && (
                          (currentUser.role === 'contractor' && item.status === 'pending') ||
                          (currentUser.role === 'consultant' && item.status === 'subconsultant_approved') ||
                          (currentUser.role === 'mainConsultant' && item.status === 'consultant_approved') ||
                          (currentUser.role === 'subconsultant' && item.status === 'contractor_approved' && (() => {
                            const typeMap = { "electrical": "كهربائي", "architect": "معماري", "mechanical": "ميكانيكي" };
                            return typeMap[item.subcontractorType] === currentUser.type;
                          })())
                        ) && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onApproveItem?.(item.id)}
                                className="text-green-600 hover:text-green-800 hover:bg-green-50"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>

                            </>
                          )}
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td
                      colSpan={canEdit || canReview ? 15 : 14}
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
