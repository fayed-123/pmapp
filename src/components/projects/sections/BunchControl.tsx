import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Project, ProjectItem } from '@/lib/types';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/components/ui/sonner';
import {
  getBunchSummaries,
  sendBunchToNextStage,
  returnBunchToPreviousStage,
  BunchSummary
} from '@/services/BunchWorkflowService';
import {
  ChevronDown,
  ChevronRight,
  Send,
  ArrowLeft,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Zap,
  Wrench,
  Building,
  Settings,
  X,
  Eye,
  MessageCircle,
  Pencil,
  Trash2,
  Calendar,
  DollarSign,
  PercentCircle,
  Save,
  Edit
} from 'lucide-react';

interface BunchControlProps {
  project: Project;
  onRefresh: () => Promise<void>;
  onEditItem?: (item: ProjectItem) => void;
  onDeleteItem?: (itemId: string) => void;
  canEdit?: boolean;
}

const BunchControl: React.FC<BunchControlProps> = ({ 
  project, 
  onRefresh, 
  onEditItem,
  onDeleteItem,
  canEdit = false 
}) => {
  const { user: currentUser } = useAuth();
  const [bunches, setBunches] = useState<BunchSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedBunches, setExpandedBunches] = useState<Set<string>>(new Set());
  const [actionLoading, setActionLoading] = useState<Set<string>>(new Set());
  
  // Comment dialog state
  const [showCommentDialog, setShowCommentDialog] = useState<string | null>(null);
  const [comment, setComment] = useState('');

  // Item editing state
  const [editingItem, setEditingItem] = useState<ProjectItem | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<ProjectItem>>({});

  useEffect(() => {
    loadBunches();
  }, [project.id, currentUser]);

  const loadBunches = async () => {
    if (!currentUser) return;
    
    setIsLoading(true);
    try {
      const summaries = await getBunchSummaries(project.id, currentUser);
      setBunches(summaries);
      console.log("📦 Loaded bunches:", summaries);
    } catch (error) {
      console.error('Error loading bunches:', error);
      toast.error('فشل في تحميل بنود المشروع');
    } finally {
      setIsLoading(false);
    }
  };

  const getBunchIcon = (bunchType: string) => {
    switch (bunchType) {
      case 'electrical':
        return <Zap className="w-5 h-5 text-yellow-600" />;
      case 'mechanical':
        return <Settings className="w-5 h-5 text-blue-600" />;
      case 'architect':
        return <Building className="w-5 h-5 text-green-600" />;
      default:
        return <Wrench className="w-5 h-5 text-gray-600" />;
    }
  };

  const getBunchDisplayName = (bunchType: string) => {
    const names = {
      'electrical': 'أعمال كهربائية',
      'mechanical': 'أعمال ميكانيكية',
      'architect': 'أعمال معمارية',
      'general': 'أعمال عامة'
    };
    return names[bunchType] || bunchType;
  };

  const toggleBunchExpansion = (bunchType: string) => {
    const newExpanded = new Set(expandedBunches);
    if (newExpanded.has(bunchType)) {
      newExpanded.delete(bunchType);
    } else {
      newExpanded.add(bunchType);
    }
    setExpandedBunches(newExpanded);
  };

  const handleSendToNextStage = async (bunchType: string) => {
    if (!currentUser) return;

    setActionLoading(prev => new Set(prev).add(bunchType));
    
    try {
      const result = await sendBunchToNextStage(bunchType, project.id, project, currentUser);
      
      if (result.success) {
        toast.success(result.message);
        await loadBunches();
        await onRefresh();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error('Error sending bunch:', error);
      toast.error('حدث خطأ أثناء إرسال البنود');
    } finally {
      setActionLoading(prev => {
        const newSet = new Set(prev);
        newSet.delete(bunchType);
        return newSet;
      });
    }
  };

  const handleReturnForModification = async (bunchType: string) => {
    if (!comment.trim()) {
      toast.error('يجب إدخال سبب طلب التعديل');
      return;
    }

    if (!currentUser) return;

    setActionLoading(prev => new Set(prev).add(bunchType));
    
    try {
      const result = await returnBunchToPreviousStage(bunchType, project.id, project, currentUser, comment);
      
      if (result.success) {
        toast.success(result.message);
        setComment('');
        setShowCommentDialog(null);
        await loadBunches();
        await onRefresh();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error('Error returning bunch:', error);
      toast.error('حدث خطأ أثناء إرجاع البنود');
    } finally {
      setActionLoading(prev => {
        const newSet = new Set(prev);
        newSet.delete(bunchType);
        return newSet;
      });
    }
  };

  const openReturnDialog = (bunchType: string) => {
    setShowCommentDialog(bunchType);
    setComment('');
  };

  const closeReturnDialog = () => {
    setShowCommentDialog(null);
    setComment('');
  };

  // Item editing functions
  const startEditingItem = (item: ProjectItem) => {
    setEditingItem(item);
    setEditFormData({
      name: item.name,
      progress: item.progress || 0,
      startDate: item.startDate,
      endDate: item.endDate,
      executionTime: item.executionTime || 0,
      value: item.value || 0,
      supplyprogress: item.supplyprogress || 0,
      comments: item.comments || ''
    });
  };

  const cancelEditing = () => {
    setEditingItem(null);
    setEditFormData({});
  };

  const saveItemChanges = async () => {
    if (!editingItem || !onEditItem) return;

    const updatedItem = {
      ...editingItem,
      ...editFormData
    };

    try {
      onEditItem(updatedItem);
      setEditingItem(null);
      setEditFormData({});
      toast.success('تم تحديث البند بنجاح');
      await loadBunches(); // Refresh to show updated data
    } catch (error) {
      console.error('Error updating item:', error);
      toast.error('حدث خطأ أثناء تحديث البند');
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!onDeleteItem) return;

    if (window.confirm('هل أنت متأكد من حذف هذا البند؟')) {
      try {
        await onDeleteItem(itemId);
        toast.success('تم حذف البند بنجاح');
        await loadBunches(); // Refresh to show updated data
      } catch (error) {
        console.error('Error deleting item:', error);
        toast.error('حدث خطأ أثناء حذف البند');
      }
    }
  };

  const getProgressPercentage = (bunch: BunchSummary) => {
    if (bunch.total_items === 0) return 0;
    return Math.round((bunch.approved_items / bunch.total_items) * 100);
  };

  const getStatusColor = (bunch: BunchSummary) => {
    const progress = getProgressPercentage(bunch);
    if (progress === 100) return 'text-green-600';
    if (progress >= 70) return 'text-blue-600';
    if (progress >= 30) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getItemStatusConfig = (status: string | undefined) => {
    switch (status) {
      case 'draft':
        return { text: 'مسودة', color: 'bg-gray-100 text-gray-800' };
      case 'pending_contractor_review':
        return { text: 'مع المقاول', color: 'bg-yellow-100 text-yellow-800' };
      case 'pending_subconsultant_review':
        return { text: 'مع الاستشاري الفرعي', color: 'bg-blue-100 text-blue-800' };
      case 'pending_consultant_review':
        return { text: 'مع الاستشاري المشرف', color: 'bg-purple-100 text-purple-800' };
      case 'published':
        return { text: 'منشور', color: 'bg-green-100 text-green-800' };
      case 'modification_requested':
        return { text: 'مطلوب تعديل', color: 'bg-orange-100 text-orange-800' };
      default:
        return { text: 'غير محدد', color: 'bg-gray-100 text-gray-600' };
    }
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "غير محدد";
    return new Date(dateString).toLocaleDateString("ar-SA");
  };

  // Enhanced workflow status indicator
  const getWorkflowStatusIndicator = (bunch: BunchSummary) => {
    const statusCounts = {
      draft: 0,
      pending_contractor_review: 0,
      pending_subconsultant_review: 0,
      pending_consultant_review: 0,
      published: 0,
      modification_requested: 0
    };

    // Count items by status
    bunch.items.forEach(item => {
      if (statusCounts.hasOwnProperty(item.status)) {
        statusCounts[item.status]++;
      }
    });

    const getDominantStatus = () => {
      const entries = Object.entries(statusCounts).filter(([_, count]) => count > 0);
      if (entries.length === 0) return 'draft';
      
      // If all items have the same status, return that status
      if (entries.length === 1) return entries[0][0];
      
      // If mixed statuses, find the most common one
      return entries.reduce((a, b) => a[1] > b[1] ? a : b)[0];
    };

    const dominantStatus = getDominantStatus();
    const hasMultipleStatuses = Object.values(statusCounts).filter(count => count > 0).length > 1;

    const getStatusConfig = (status: string) => {
      switch (status) {
        case 'draft':
          return { 
            text: 'مع المقاول الفرعي', 
            icon: '👷‍♂️', 
            color: 'text-gray-600 bg-gray-100',
            description: 'قيد الإنشاء'
          };
        case 'pending_contractor_review':
          return { 
            text: 'مع المقاول الرئيسي', 
            icon: '🏗️', 
            color: 'text-orange-700 bg-orange-100',
            description: 'في انتظار مراجعة المقاول'
          };
        case 'pending_subconsultant_review':
          return { 
            text: 'مع الاستشاري الفرعي', 
            icon: '🔍', 
            color: 'text-blue-700 bg-blue-100',
            description: 'في انتظار مراجعة الاستشاري الفرعي'
          };
        case 'pending_consultant_review':
          return { 
            text: 'مع الاستشاري المشرف', 
            icon: '📋', 
            color: 'text-purple-700 bg-purple-100',
            description: 'في انتظار مراجعة الاستشاري المشرف'
          };
        case 'published':
          return { 
            text: 'منشور ✅', 
            icon: '✅', 
            color: 'text-green-700 bg-green-100',
            description: 'تم النشر النهائي'
          };
        case 'modification_requested':
          return { 
            text: 'مطلوب تعديل', 
            icon: '⚠️', 
            color: 'text-red-700 bg-red-100',
            description: 'مُرجع للتعديل'
          };
        default:
          return { 
            text: 'غير محدد', 
            icon: '❓', 
            color: 'text-gray-600 bg-gray-100',
            description: 'حالة غير معروفة'
          };
      }
    };

    const config = getStatusConfig(dominantStatus);

    return (
      <>
        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
          <span>{config.icon}</span>
          <span>{config.text}</span>
          {hasMultipleStatuses && (
            <span className="bg-white bg-opacity-50 px-1 rounded text-xs">
              مختلط
            </span>
          )}
        </span>
        
        {/* Show breakdown if mixed statuses */}
        {hasMultipleStatuses && (
          <div className="text-xs text-gray-500 mt-1">
            {Object.entries(statusCounts)
              .filter(([_, count]) => count > 0)
              .map(([status, count]) => (
                <span key={status} className="mr-2">
                  {getStatusConfig(status).text}: {count}
                </span>
              ))
            }
          </div>
        )}
      </>
    );
  };

  // Enhanced workflow progress steps
  const getWorkflowProgressSteps = (bunch: BunchSummary) => {
    const steps = [
      { key: 'subcontractor', label: 'مقاول فرعي', icon: '👷‍♂️' },
      { key: 'contractor', label: 'مقاول رئيسي', icon: '🏗️' },
      { key: 'subconsultant', label: 'استشاري فرعي', icon: '🔍' },
      { key: 'consultant', label: 'استشاري مشرف', icon: '📋' },
      { key: 'published', label: 'منشور', icon: '✅' }
    ];

    // Determine current step based on item statuses
    const getCurrentStep = () => {
      const statuses = bunch.items.map(item => item.status);
      
      if (statuses.every(s => s === 'published')) return 'published';
      if (statuses.some(s => s === 'pending_consultant_review')) return 'consultant';
      if (statuses.some(s => s === 'pending_subconsultant_review')) return 'subconsultant';
      if (statuses.some(s => s === 'pending_contractor_review')) return 'contractor';
      if (statuses.some(s => s === 'modification_requested')) {
        // For modification requested, show the step where it was returned from
        const assignedRoles = bunch.items.map(item => item.assigned_to_role);
        if (assignedRoles.some(r => r === 'contractor')) return 'contractor';
        if (assignedRoles.some(r => r === 'subcontractor')) return 'subcontractor';
      }
      return 'subcontractor';
    };

    const currentStep = getCurrentStep();
    const currentStepIndex = steps.findIndex(step => step.key === currentStep);

    return steps.map((step, index) => {
      let stepStatus = 'pending'; // pending, active, completed
      
      if (index < currentStepIndex) stepStatus = 'completed';
      else if (index === currentStepIndex) stepStatus = 'active';
      
      const stepConfig = {
        pending: 'text-gray-400 bg-gray-100',
        active: 'text-blue-700 bg-blue-100 ring-2 ring-blue-300',
        completed: 'text-green-700 bg-green-100'
      };

      return (
        <div
          key={step.key}
          className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-all ${stepConfig[stepStatus]}`}
          title={step.label}
        >
          <span className="text-lg">{step.icon}</span>
          <span className="text-xs font-medium hidden sm:block">{step.label}</span>
        </div>
      );
    });
  };

  const canUserEditItem = (item: ProjectItem): boolean => {
    if (!canEdit || !currentUser) return false;
    
    // Check if user is assigned to this item or has permission to edit
    return (
      item.assigned_to_user_id === currentUser.id ||
      item.subcontractorid === currentUser.id ||
      (currentUser.role === 'mainConsultant') ||
      (currentUser.role === 'consultant' && project.consultant_id === currentUser.id)
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-32 bg-gray-200 rounded-lg mb-4"></div>
          <div className="h-24 bg-gray-200 rounded-lg mb-4"></div>
          <div className="h-24 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    );
  }

  if (bunches.length === 0) {
    return (
      <Card className="p-8 text-center">
        <Wrench className="w-12 h-12 mx-auto mb-4 text-gray-400" />
        <h3 className="text-lg font-semibold text-gray-600 mb-2">لا توجد بنود في المشروع</h3>
        <p className="text-sm text-gray-500">ابدأ بإضافة بنود للمشروع لإدارة سير العمل</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800">إدارة مراحل العمل</h3>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span>{bunches.length} مجموعة عمل</span>
          <Button
            variant="outline"
            size="sm"
            onClick={loadBunches}
            className="ml-2"
          >
            🔄 تحديث
          </Button>
        </div>
      </div>

      {bunches.map((bunch) => {
        const isExpanded = expandedBunches.has(bunch.bunch_type);
        const isLoading = actionLoading.has(bunch.bunch_type);
        const progress = getProgressPercentage(bunch);

        // Check if bunch has comments
        const bunchComments = bunch.items.find(item => item.comments)?.comments;

        return (
          <Card key={bunch.bunch_type} className="overflow-hidden">
            {/* Bunch Header */}
            <div className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleBunchExpansion(bunch.bunch_type)}
                    className="p-1"
                  >
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </Button>
                  
                  {getBunchIcon(bunch.bunch_type)}
                  
                  <div>
                    <h4 className="font-semibold text-gray-800">
                      {getBunchDisplayName(bunch.bunch_type)}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {bunch.total_items} بند
                    </p>
                    {/* Enhanced Status Display */}
                    <div className="flex items-center gap-2 mt-1">
                      {getWorkflowStatusIndicator(bunch)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {/* Progress Circle */}
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${getStatusColor(bunch)}`}>
                      {progress}%
                    </div>
                    <div className="text-xs text-gray-500">مكتمل</div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    {bunch.can_send_to_next_stage && (
                      <Button
                        onClick={() => handleSendToNextStage(bunch.bunch_type)}
                        disabled={isLoading}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                        size="sm"
                      >
                        <Send className="w-4 h-4 mr-1" />
                        إرسال للمرحلة التالية
                      </Button>
                    )}

                    {bunch.can_request_modification && (
                      <Button
                        variant="outline"
                        onClick={() => openReturnDialog(bunch.bunch_type)}
                        disabled={isLoading}
                        className="border-orange-300 text-orange-600 hover:bg-orange-50"
                        size="sm"
                      >
                        <ArrowLeft className="w-4 h-4 mr-1" />
                        طلب تعديل
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              {/* Bunch Comments Section */}
              {bunchComments && (
                <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <MessageCircle className="w-4 h-4 text-orange-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-orange-800">تعليق المراجع:</p>
                      <p className="text-sm text-orange-700 mt-1">{bunchComments}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Progress and Status Bar */}
              <div className="mt-4">
                {/* Progress Bar */}
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>التقدم</span>
                  <span>{bunch.approved_items} من {bunch.total_items}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${
                      progress === 100 ? 'bg-green-500' : 
                      progress >= 70 ? 'bg-blue-500' : 
                      progress >= 30 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>

                {/* Workflow Progress Indicator */}
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-gray-700">مسار العمل:</span>
                    <div className="flex items-center gap-2">
                      {getWorkflowProgressSteps(bunch)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Status Summary */}
              <div className="flex gap-4 mt-3 text-sm">
                <div className="flex items-center gap-1 text-green-600">
                  <CheckCircle className="w-4 h-4" />
                  <span>{bunch.approved_items} موافق</span>
                </div>
                <div className="flex items-center gap-1 text-red-600">
                  <XCircle className="w-4 h-4" />
                  <span>{bunch.rejected_items} مرفوض</span>
                </div>
                <div className="flex items-center gap-1 text-yellow-600">
                  <Clock className="w-4 h-4" />
                  <span>{bunch.pending_items} في الانتظار</span>
                </div>
              </div>
            </div>

            {/* Expanded Items List with Detailed Information */}
            {isExpanded && (
              <div className="border-t bg-gray-50">
                <div className="p-4">
                  <h5 className="font-medium text-gray-800 mb-3">تفاصيل البنود ({bunch.items.length})</h5>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {bunch.items.map((item) => {
                      const itemStatusConfig = getItemStatusConfig(item.status);
                      const isEditing = editingItem?.id === item.id;
                      const canEditThisItem = canUserEditItem(item);
                      
                      return (
                        <Card key={item.id} className="p-4 bg-white border hover:shadow-sm transition-shadow">
                          {isEditing ? (
                            /* Editing Mode */
                            <div className="space-y-3">
                              <div className="flex items-center justify-between mb-3">
                                <h6 className="font-medium text-gray-800">تعديل البند #{item.itemNumber}</h6>
                                <div className="flex gap-2">
                                  <Button size="sm" onClick={saveItemChanges} className="bg-green-600 text-white">
                                    <Save className="w-3 h-3 mr-1" />
                                    حفظ
                                  </Button>
                                  <Button size="sm" variant="outline" onClick={cancelEditing}>
                                    <X className="w-3 h-3" />
                                  </Button>
                                </div>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div>
                                  <label className="text-xs font-medium text-gray-600">اسم البند</label>
                                  <Input
                                    value={editFormData.name || ''}
                                    onChange={(e) => setEditFormData({...editFormData, name: e.target.value})}
                                    className="text-sm"
                                  />
                                </div>
                                <div>
                                  <label className="text-xs font-medium text-gray-600">نسبة الإنجاز (%)</label>
                                  <Input
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={editFormData.progress || 0}
                                    onChange={(e) => setEditFormData({...editFormData, progress: Number(e.target.value)})}
                                    className="text-sm"
                                  />
                                </div>
                                <div>
                                  <label className="text-xs font-medium text-gray-600">تاريخ البداية</label>
                                  <Input
                                    type="date"
                                    value={editFormData.startDate || ''}
                                    onChange={(e) => setEditFormData({...editFormData, startDate: e.target.value})}
                                    className="text-sm"
                                  />
                                </div>
                                <div>
                                  <label className="text-xs font-medium text-gray-600">تاريخ النهاية</label>
                                  <Input
                                    type="date"
                                    value={editFormData.endDate || ''}
                                    onChange={(e) => setEditFormData({...editFormData, endDate: e.target.value})}
                                    className="text-sm"
                                  />
                                </div>
                                <div>
                                  <label className="text-xs font-medium text-gray-600">مدة التنفيذ (يوم)</label>
                                  <Input
                                    type="number"
                                    min="1"
                                    value={editFormData.executionTime || 0}
                                    onChange={(e) => setEditFormData({...editFormData, executionTime: Number(e.target.value)})}
                                    className="text-sm"
                                  />
                                </div>
                                <div>
                                  <label className="text-xs font-medium text-gray-600">القيمة</label>
                                  <Input
                                    type="number"
                                    min="0"
                                    value={editFormData.value || 0}
                                    onChange={(e) => setEditFormData({...editFormData, value: Number(e.target.value)})}
                                    className="text-sm"
                                  />
                                </div>
                              </div>

                              <div>
                                <label className="text-xs font-medium text-gray-600">تعليقات</label>
                                <textarea
                                  className="w-full p-2 border border-gray-300 rounded text-sm resize-none"
                                  rows={2}
                                  value={editFormData.comments || ''}
                                  onChange={(e) => setEditFormData({...editFormData, comments: e.target.value})}
                                  placeholder="أضف تعليقاتك هنا..."
                                />
                              </div>
                            </div>
                          ) : (
                            /* Display Mode */
                            <div>
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <span className="font-semibold text-gray-800">#{item.itemNumber || '---'}</span>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${itemStatusConfig.color}`}>
                                      {itemStatusConfig.text}
                                    </span>
                                  </div>
                                  <h6 className="font-medium text-gray-900 mb-2">{item.name}</h6>
                                  
                                  {/* Item Details Grid */}
                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                                    <div className="flex items-center gap-1">
                                      <PercentCircle className="w-3 h-3 text-blue-500" />
                                      <span className="text-gray-600">الإنجاز:</span>
                                      <span className="font-medium">{item.progress || 0}%</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <Calendar className="w-3 h-3 text-green-500" />
                                      <span className="text-gray-600">المدة:</span>
                                      <span className="font-medium">{item.executionTime || 0} يوم</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <DollarSign className="w-3 h-3 text-yellow-500" />
                                      <span className="text-gray-600">القيمة:</span>
                                      <span className="font-medium">{item.value || 0}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <Calendar className="w-3 h-3 text-purple-500" />
                                      <span className="text-gray-600">التوريد:</span>
                                      <span className="font-medium">{item.supplyprogress || 0}%</span>
                                    </div>
                                  </div>

                                  {/* Dates */}
                                  <div className="mt-2 text-xs text-gray-500">
                                    <span>من {formatDate(item.startDate)} إلى {formatDate(item.endDate)}</span>
                                  </div>

                                  {/* Comments */}
                                  {item.comments && (
                                    <div className="mt-3 p-2 bg-orange-50 border border-orange-200 rounded text-xs">
                                      <div className="flex items-start gap-2">
                                        <MessageCircle className="h-3 w-3 mt-0.5 text-orange-500 flex-shrink-0" />
                                        <div>
                                          <p className="font-medium text-orange-800">تعليق:</p>
                                          <p className="text-orange-700">{item.comments}</p>
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </div>

                                {/* Action Buttons */}
                                {canEditThisItem && (
                                  <div className="flex flex-col gap-2 ml-3">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => startEditingItem(item)}
                                      className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                                    >
                                      <Pencil className="w-3 h-3" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleDeleteItem(item.id)}
                                      className="text-red-600 hover:text-red-800 hover:bg-red-50"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </Button>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </Card>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </Card>
        );
      })}

      {/* Return for Modification Dialog */}
      {showCommentDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">
                طلب تعديل - {getBunchDisplayName(showCommentDialog)}
              </h3>
              <Button variant="ghost" size="sm" onClick={closeReturnDialog}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  سبب طلب التعديل *
                </label>
                <textarea
                  className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  rows={3}
                  placeholder="اشرح ما يجب تعديله في هذه المجموعة من البنود..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />
                <p className="text-xs text-gray-500 mt-1">
                  سيتم إرجاع جميع البنود في هذه المجموعة للمرحلة السابقة
                </p>
              </div>

              <div className="flex gap-3 justify-end">
                <Button
                  variant="outline"
                  onClick={closeReturnDialog}
                  disabled={actionLoading.has(showCommentDialog)}
                >
                  إلغاء
                </Button>
                <Button
                  onClick={() => handleReturnForModification(showCommentDialog)}
                  disabled={actionLoading.has(showCommentDialog) || !comment.trim()}
                  className="bg-orange-600 hover:bg-orange-700 text-white"
                >
                  {actionLoading.has(showCommentDialog) ? (
                    "جاري المعالجة..."
                  ) : (
                    <>
                      <ArrowLeft className="h-4 w-4 mr-1" />
                      طلب تعديل
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Help Text */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start gap-2">
          <AlertTriangle className="w-5 h-5 text-blue-600 mt-0.5" />
          <div className="text-sm">
            <p className="text-blue-800 font-medium mb-1">دليل إدارة مراحل العمل:</p>
            <ul className="text-blue-700 space-y-1 text-xs">
              <li>• كل مجموعة بنود تتقدم في المراحل بشكل مستقل</li>
              <li>• انقر على السهم لتوسيع المجموعة وعرض تفاصيل البنود</li>
              <li>• يمكن تعديل وحذف البنود مباشرة من هنا إذا كانت لديك الصلاحية</li>
              <li>• التعليقات المضافة عند طلب التعديل تظهر لجميع البنود في المجموعة</li>
              <li>• يجب اتخاذ قرار بشأن جميع البنود قبل الإرسال للمرحلة التالية</li>
              <li>• البنود المنشورة لا يمكن تعديلها</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BunchControl;