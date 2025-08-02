import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertTriangle,
  CheckCircle,
  Shield,
  Pencil,
  Trash2,
  MessageCircle,
  X,
  Check,
} from "lucide-react";import React, { useState } from "react";
import { ProjectItem } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { useAuth } from '@/context/AuthContext';
import { supabase } from "@/lib/supabase";
import { toast } from "@/components/ui/sonner";
import { notifyUser } from "@/services/NotificationService";
import { getUserById } from "@/lib/db";
import { useProject } from "./context/ProjectContext";

interface ItemsTableProps {
  items: ProjectItem[];
  canEdit: boolean;
  canReview: boolean;
  onEdit: (item: ProjectItem) => void;
  onDelete: (itemId: string) => void;
  onApproveItem?: (itemId: string) => void;
  onRejectItem?: (itemId: string) => void;
  refreshItems?: () => Promise<void>;
}

const ItemsTable: React.FC<ItemsTableProps> = ({
  items,
  canEdit,
  canReview,
  onEdit,
  onDelete,
  onApproveItem,
  onRejectItem,
  refreshItems,
}) => {
  const { user: currentUser } = useAuth();
  const { project } = useProject();
  
  const [showCommentDialog, setShowCommentDialog] = useState<string | null>(null);
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);
  const [comment, setComment] = useState("");
  const [loadingItems, setLoadingItems] = useState<Set<string>>(new Set());

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

  // Helper function to get next stage users for notifications
  const getNextStageUsers = async (item: ProjectItem, nextStatus: string) => {
    const userIds: string[] = [];
    
    switch (nextStatus) {
      case 'contractor_approved':
        // Next: Subconsultants of the item's type
        const typeMap = {
          "electrical": project.electricalconsultantid,
          "architect": project.architectconsultantid,
          "mechanical": project.mechanicalconsultantid
        };
        const subconsultantId = typeMap[item.subcontractortype];
        if (subconsultantId) userIds.push(subconsultantId);
        break;
        
      case 'subconsultant_approved':
        // Next: Main consultant
        if (project.consultant_id) userIds.push(project.consultant_id);
        break;
        
      case 'consultant_approved':
        // Next: Main consultant (if different from consultant)
        if (project.main_consultant_id && project.main_consultant_id !== project.consultant_id) {
          userIds.push(project.main_consultant_id);
        }
        break;
    }
    
    return userIds.filter(Boolean);
  };

  // Helper function to get previous stage users for notifications
  const getPreviousStageUsers = async (item: ProjectItem, currentUserRole: string) => {
    const userIds: string[] = [];
    
    switch (currentUserRole) {
      case 'contractor':
        // Previous: Subcontractor who submitted the item
        if (item.subcontractorid) userIds.push(item.subcontractorid);
        break;
        
      case 'subconsultant':
        // Previous: Main contractor
        if (project.contractor_id) userIds.push(project.contractor_id);
        break;
        
      case 'consultant':
        // Previous: Subconsultant of the item's type
        const typeMap = {
          "electrical": project.electricalconsultantid,
          "architect": project.architectconsultantid,
          "mechanical": project.mechanicalconsultantid
        };
        const subconsultantId = typeMap[item.subcontractortype];
        if (subconsultantId) userIds.push(subconsultantId);
        break;
        
      case 'mainConsultant':
        // Previous: Main consultant
        if (project.consultant_id) userIds.push(project.consultant_id);
        break;
    }
    
    return userIds.filter(Boolean);
  };

  // Helper function to get all project team members
  const getAllTeamMembers = () => {
    return [
      project.owner_id,
      project.consultant_id,
      project.contractor_id,
      project.main_consultant_id,
      project.electricalconsultantid,
      project.architectconsultantid,
      project.mechanicalconsultantid,
      project.electricalcontractorid,
      project.architectcontractorid,
      project.mechanicalcontractorid
    ].filter(Boolean);
  };

  // Check if current user can approve/reject this specific item
  const canUserReviewItem = (item: ProjectItem): boolean => {
    if (!canReview || !currentUser) return false;

    const userRole = currentUser.role;
    const userType = currentUser.type;

    // Contractor can review pending items
    if (userRole === 'contractor' && item.status === 'pending') {
      return true;
    }

    // Subconsultant can review contractor-approved items of their specialty
    if (userRole === 'subconsultant' && item.status === 'contractor_approved') {
      const typeMap = {
        "electrical": "كهربائي",
        "architect": "معماري",
        "mechanical": "ميكانيكي"
      };
      return typeMap[item.subcontractortype] === userType;
    }

    // Consultant can review subconsultant-approved items
    if (userRole === 'consultant' && item.status === 'subconsultant_approved') {
      return true;
    }

    // Main consultant can review consultant-approved items
    if (userRole === 'mainConsultant' && item.status === 'consultant_approved') {
      return true;
    }

    return false;
  };

  const handleItemAction = async (itemId: string, action: 'approve' | 'reject') => {
    if (!currentUser) return;

    setLoadingItems(prev => new Set(prev).add(itemId));

    try {
      const item = items.find(i => i.id === itemId);
      if (!item) throw new Error('Item not found');

      let nextStatus = '';

      if (action === 'reject') {
        nextStatus = 'modification_requested';
      } else {
        // Determine next approval status based on current user role
        switch (currentUser.role) {
          case 'contractor':
            nextStatus = 'contractor_approved';
            break;
          case 'subconsultant':
            nextStatus = 'subconsultant_approved';
            break;
          case 'consultant':
            nextStatus = 'consultant_approved';
            break;
          case 'mainConsultant':
            nextStatus = 'published';
            break;
          default:
            throw new Error('غير مصرح لهذا المستخدم بالموافقة');
        }
      }

      // Update item status in database
      const { error } = await supabase
        .from('project_items')
        .update({
          status: nextStatus,
          comments: comment || null,
          reviewed_by: currentUser.id,
          reviewed_at: new Date().toISOString()
        })
        .eq('id', itemId);

      if (error) throw error;

      // Send notifications based on action
      try {
        if (action === 'reject') {
          // Notify previous stage users about modification request
          const previousStageUserIds = await getPreviousStageUsers(item, currentUser.role);
          
          for (const userId of previousStageUserIds) {
            const user = await getUserById(userId);
            if (user) {
              await notifyUser({
                currentUser: {
                  id: currentUser.id,
                  name: currentUser.name,
                  role: currentUser.role
                },
                to_user_id: userId,
                title: `مطلوب تعديل بند - ${item.name}`,
                message: `تم طلب تعديل البند "${item.name}" من قبل ${currentUser.name} في مشروع "${project.name}". السبب: ${comment}`,
                type: 'project_update',
                data: {
                  item_id: item.id,
                  item_name: item.name,
                  project_id: project.id,
                  project_name: project.name,
                  action: 'modification_requested',
                  comment: comment
                }
              });
            }
          }
        } else {
          // Handle approval notifications
          if (nextStatus === 'published') {
            // Final approval - notify all team members
            const teamMemberIds = getAllTeamMembers();
            
            for (const userId of teamMemberIds) {
              if (userId !== currentUser.id) { // Don't notify the user who published
                const user = await getUserById(userId);
                if (user) {
                  await notifyUser({
                    currentUser: {
                      id: currentUser.id,
                      name: currentUser.name,
                      role: currentUser.role
                    },
                    to_user_id: userId,
                    title: `تم نشر بند - ${item.name}`,
                    message: `تم نشر البند "${item.name}" نهائياً من قبل ${currentUser.name} في مشروع "${project.name}". ${comment ? `التعليق: ${comment}` : ''}`,
                    type: 'project_update',
                    data: {
                      item_id: item.id,
                      item_name: item.name,
                      project_id: project.id,
                      project_name: project.name,
                      action: 'published',
                      comment: comment || null
                    }
                  });
                }
              }
            }
          } else {
            // Regular approval - notify next stage users
            const nextStageUserIds = await getNextStageUsers(item, nextStatus);
            
            for (const userId of nextStageUserIds) {
              const user = await getUserById(userId);
              if (user) {
                await notifyUser({
                  currentUser: {
                    id: currentUser.id,
                    name: currentUser.name,
                    role: currentUser.role
                  },
                  to_user_id: userId,
                  title: `تمت الموافقة على بند - ${item.name}`,
                  message: `تمت الموافقة على البند "${item.name}" من قبل ${currentUser.name} في مشروع "${project.name}". ${comment ? `التعليق: ${comment}` : ''}`,
                  type: 'project_update',
                  data: {
                    item_id: item.id,
                    item_name: item.name,
                    project_id: project.id,
                    project_name: project.name,
                    action: 'approved',
                    comment: comment || null
                  }
                });
              }
            }
          }
        }
      } catch (notificationError) {
        console.error('Error sending notifications:', notificationError);
        // Don't fail the main operation if notifications fail
      }

      // Show success message
      if (action === 'approve') {
        toast.success(`تمت الموافقة على البند بنجاح`);
      } else {
        toast.success(`تم طلب تعديل البند بنجاح`);
      }

      // Reset comment and close dialog
      setComment('');
      setShowCommentDialog(null);
      setActionType(null);

      // Refresh items if function provided
      if (refreshItems) {
        await refreshItems();
      }

    } catch (error) {
      console.error('Error updating item:', error);
      toast.error("حدث خطأ أثناء تحديث البند");
    } finally {
      setLoadingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
    }
  };

  const openCommentDialog = (itemId: string, action: 'approve' | 'reject') => {
    setShowCommentDialog(itemId);
    setActionType(action);
    setComment('');
  };

  const closeCommentDialog = () => {
    setShowCommentDialog(null);
    setActionType(null);
    setComment('');
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "غير محدد";
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-center">رقم البند</TableHead>
              <TableHead>اسم البند</TableHead>
              <TableHead className="text-center">نسبة الإنجاز</TableHead>
              <TableHead className="text-center">الحالة</TableHead>
              <TableHead className="text-center">تاريخ البداية</TableHead>
              <TableHead className="text-center">تاريخ النهاية</TableHead>
              <TableHead className="text-center">مدة التنفيذ</TableHead>
              <TableHead className="text-center">مستوى المخاطر</TableHead>
              {items.some(item => item.comments) && (
                <TableHead className="text-center">التعليقات</TableHead>
              )}
              <TableHead className="text-center">الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => {
              const statusConfig = getStatusConfig(item.status);
              const progress = item.progress || 0;
              const canReviewThisItem = canUserReviewItem(item);
              const isLoading = loadingItems.has(item.id);

              return (
                <TableRow 
                  key={item.id} 
                  className={canReviewThisItem ? 'bg-blue-50 border-blue-200' : ''}
                >
                  <TableCell className="text-center font-medium">
                    <div className="flex items-center justify-center gap-2">
                      #{item.itemNumber || "---"}
                      {canReviewThisItem && (
                        <span className="text-blue-600 text-xs bg-blue-100 px-2 py-1 rounded-full">
                          مراجعة مطلوبة
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="max-w-xs">
                    <div className="truncate" title={item.name}>
                      {item.name}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className={`font-bold ${getProgressColor(progress)}`}>
                      {progress}%
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${statusConfig.color}`}>
                      {statusConfig.text}
                    </span>
                  </TableCell>
                  <TableCell className="text-center text-sm">
                    {formatDate(item.startDate)}
                  </TableCell>
                  <TableCell className="text-center text-sm">
                    {formatDate(item.endDate)}
                  </TableCell>
                  <TableCell className="text-center">
                    {item.executionTime || 0} يوم
                  </TableCell>
                  <TableCell className="text-center">
                    {getRiskIcon(item.riskLevel)}
                  </TableCell>
                  {items.some(item => item.comments) && (
                    <TableCell className="text-center max-w-xs">
                      {item.comments && (
                        <div className="flex items-center justify-center">
                          <div 
                            className="truncate bg-gray-100 px-2 py-1 rounded text-xs cursor-help" 
                            title={item.comments}
                          >
                            <MessageCircle className="h-3 w-3 inline mr-1" />
                            {item.comments}
                          </div>
                        </div>
                      )}
                    </TableCell>
                  )}
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-2">
                      {/* Edit/View Actions */}
                      {(canEdit || canReview) && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEdit(item)}
                          className="text-blue-600 hover:text-blue-800 h-8 w-8 p-0"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      )}

                      {canEdit && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDelete(item.id)}
                          className="text-red-600 hover:text-red-800 h-8 w-8 p-0"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}

                      {/* Review Actions for Individual Items */}
                      {canReviewThisItem && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openCommentDialog(item.id, 'approve')}
                            disabled={isLoading}
                            className="text-green-600 hover:text-green-800 hover:bg-green-50 h-8 w-8 p-0"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openCommentDialog(item.id, 'reject')}
                            disabled={isLoading}
                            className="text-orange-600 hover:text-orange-800 hover:bg-orange-50 h-8 w-8 p-0"
                          >
                            <AlertTriangle className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>

        {items.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <p>لا توجد بنود في المشروع</p>
            <p className="text-sm text-gray-400">ابدأ بإضافة بنود جديدة</p>
          </div>
        )}
      </div>

      {/* Comment Dialog */}
      {showCommentDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">
                {actionType === 'approve' ? 'موافقة على البند' : 'طلب تعديل البند'}
              </h3>
              <Button variant="ghost" size="sm" onClick={closeCommentDialog}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {actionType === 'approve' ? 'تعليق (اختياري)' : 'سبب طلب التعديل'}
                </label>
                <textarea
                  className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder={actionType === 'approve' 
                    ? "اكتب تعليقك هنا (اختياري)..." 
                    : "اشرح ما يجب تعديله في هذا البند..."
                  }
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />
              </div>

              <div className="flex gap-3 justify-end">
                <Button
                  variant="outline"
                  onClick={closeCommentDialog}
                  disabled={loadingItems.has(showCommentDialog)}
                >
                  إلغاء
                </Button>
                <Button
                  onClick={() => handleItemAction(showCommentDialog, actionType!)}
                  disabled={loadingItems.has(showCommentDialog) || (actionType === 'reject' && !comment.trim())}
                  className={actionType === 'approve' 
                    ? "bg-green-600 hover:bg-green-700 text-white" 
                    : "bg-orange-600 hover:bg-orange-700 text-white"
                  }
                >
                  {loadingItems.has(showCommentDialog) ? (
                    "جاري المعالجة..."
                  ) : (
                    actionType === 'approve' ? (
                      <>
                        <Check className="h-4 w-4 mr-1" />
                        موافقة
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="h-4 w-4 mr-1" />
                        طلب تعديل
                      </>
                    )
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ItemsTable;