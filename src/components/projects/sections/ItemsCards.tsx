import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ProjectItem } from "@/lib/types";
import { useAuth } from '@/context/AuthContext';

import {
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle,
  Shield,
  Pencil,
  Trash2,
  Eye,
} from "lucide-react";

interface ItemsCardsProps {
  items: ProjectItem[];
  canEdit: boolean;
  canReview: boolean;
  onEdit: (item: ProjectItem) => void;
  onDelete: (itemId: string) => void;
  onApproveItem?: (itemId: string) => void;
  onRejectItem?: (itemId: string) => void;
}

const ItemsCards: React.FC<ItemsCardsProps> = ({
  items,
  canEdit,
  canReview,
  onEdit,
  onDelete,
  onApproveItem,
  onRejectItem,
}) => {
  const { user: currentUser } = useAuth();

  const [selectedFilter, setSelectedFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  const getStatusConfig = (status: string | undefined) => {
    switch (status) {
      case "pending":
        return { text: "في الانتظار", color: "bg-yellow-100 text-yellow-800" };
      case "contractor_approved":
        return { text: "موافقة المقاول", color: "bg-blue-100 text-blue-800" };
      case "subconsultant_approved":
        return { text: "موافقة الاستشاري الفرعي", color: "bg-purple-100 text-purple-800" };
      case "consultant_approved":
        return { text: "موافقة الاستشاري", color: "bg-green-100 text-green-800" };
      case "published":
        return { text: "منشور", color: "bg-emerald-100 text-emerald-800" };
      case "modification_requested":
        return { text: "مطلوب تعديل", color: "bg-orange-100 text-orange-800" };
      default:
        return { text: "غير محدد", color: "bg-gray-100 text-gray-600" };
    }
  };

  const getRiskIcon = (riskLevel: string | undefined) => {
    switch (riskLevel) {
      case "high":
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case "medium":
        return <Shield className="h-4 w-4 text-yellow-600" />;
      case "low":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      default:
        return <Shield className="h-4 w-4 text-gray-400" />;
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 90) return "text-green-600";
    if (progress >= 70) return "text-blue-600";
    if (progress >= 50) return "text-yellow-600";
    if (progress >= 25) return "text-orange-600";
    return "text-red-600";
  };

  const filteredItems = items.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.itemNumber?.toLowerCase().includes(searchTerm.toLowerCase());

    if (selectedFilter === "all") return matchesSearch;
    if (selectedFilter === "pending") return matchesSearch && item.status === "pending";
    if (selectedFilter === "completed") return matchesSearch && (item.progress || 0) >= 100;
    if (selectedFilter === "delayed") return matchesSearch && item.riskLevel === "high";

    return matchesSearch;
  });

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "غير محدد";
    return new Date(dateString).toLocaleDateString("ar-SA");
  };

  return (
    <div className="space-y-4">
      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex flex-wrap gap-2">
          <Button
            variant={selectedFilter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedFilter("all")}
            className="text-sm"
          >
            الكل ({items.length})
          </Button>
          <Button
            variant={selectedFilter === "pending" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedFilter("pending")}
            className="text-sm"
          >
            في الانتظار ({items.filter(i => i.status === "pending").length})
          </Button>
          <Button
            variant={selectedFilter === "completed" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedFilter("completed")}
            className="text-sm"
          >
            مكتمل ({items.filter(i => (i.progress || 0) >= 100).length})
          </Button>
          <Button
            variant={selectedFilter === "delayed" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedFilter("delayed")}
            className="text-sm"
          >
            متأخر ({items.filter(i => i.riskLevel === "high").length})
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="🔍 بحث في البنود..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-3 py-2 border rounded-lg text-sm w-64"
          />
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredItems.map((item) => {
          const statusConfig = getStatusConfig(item.status);
          const progress = item.progress || 0;

          return (
            <Card key={item.id} className="p-4 hover:shadow-lg transition-shadow">
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-gray-800">
                      #{item.itemNumber || "---"}
                    </span>
                    {getRiskIcon(item.riskLevel)}
                  </div>
                  <h4 className="font-medium text-gray-900 line-clamp-2 text-sm">
                    {item.name}
                  </h4>
                </div>
                <div className={`text-2xl font-bold ${getProgressColor(progress)}`}>
                  {progress}%
                </div>
              </div>

              {/* Status */}
              <div className="mb-3">
                <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${statusConfig.color}`}>
                  {statusConfig.text}
                </span>
              </div>

              {/* Timeline */}
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                <Calendar className="h-4 w-4" />
                <span>{formatDate(item.startDate)} - {formatDate(item.endDate)}</span>
              </div>

              {/* Execution Time */}
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                <Clock className="h-4 w-4" />
                <span>{item.executionTime || 0} يوم</span>
              </div>

              {/* Comments */}
              {item.comments && (
                <div className="mb-3 p-2 bg-gray-50 rounded text-xs text-gray-700">
                  {item.comments}
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-2 pt-2 border-t">
                {(canEdit || canReview) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(item)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                )}

                {canEdit && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(item.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
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
                        className="text-green-600 hover:text-green-800"
                      >
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onRejectItem?.(item.id)}
                        className="text-orange-600 hover:text-orange-800"
                      >
                        <AlertTriangle className="h-4 w-4" />
                      </Button>
                    </>
                  )}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredItems.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-2">
            <Eye className="h-12 w-12 mx-auto" />
          </div>
          <p className="text-gray-500">لا توجد بنود</p>
          <p className="text-sm text-gray-400">جرب تغيير المرشح أو البحث</p>
        </div>
      )}
    </div>
  );
};

export default ItemsCards;