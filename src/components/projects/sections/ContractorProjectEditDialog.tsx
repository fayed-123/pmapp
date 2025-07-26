import React, { useState, useEffect } from 'react';
import { Project, User, Subcontractor } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from '@/components/ui/sonner';
import { supabase } from '@/lib/supabase';
import { Save, X, Users, UserCheck } from 'lucide-react';
import { notifyUserAssignedToProject } from "@/services/WorkflowNotifications";


interface ContractorProjectEditDialogProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
  currentUser: User;
  onProjectUpdated: () => void;
  subcontractors: Subcontractor[];
}

const ContractorProjectEditDialog: React.FC<ContractorProjectEditDialogProps> = ({
  isOpen,
  onClose,
  project,
  currentUser,
  onProjectUpdated,
  subcontractors
}) => {
  const [isLoading, setIsLoading] = useState(false);
  
  // Only fields contractor can edit - assign their subcontractors
  const [selectedElectricalContractor, setSelectedElectricalContractor] = useState(project.electricalcontractorid || '');
  const [selectedArchitectContractor, setSelectedArchitectContractor] = useState(project.architectcontractorid || '');
  const [selectedMechanicalContractor, setSelectedMechanicalContractor] = useState(project.mechanicalcontractorid || '');

  // Check if contractor can edit (only for pending projects and if they're the main contractor)
  const canEdit = project.status === 'pending' && 
    currentUser.role === 'contractor' && 
    project.contractor_id === currentUser.id;

  useEffect(() => {
    if (isOpen) {
      // Reset form values when dialog opens
      setSelectedElectricalContractor(project.electricalcontractorid || '');
      setSelectedArchitectContractor(project.architectcontractorid || '');
      setSelectedMechanicalContractor(project.mechanicalcontractorid || '');
    }
  }, [isOpen, project]);

  const handleSave = async () => {
    if (!canEdit) {
      toast.error('لا يمكن تعديل المشاريع المنشورة أو غير المخصصة لك');
      return;
    }
  
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('projects')
        .update({
          electricalcontractorid: selectedElectricalContractor || null,
          architectcontractorid: selectedArchitectContractor || null,
          mechanicalcontractorid: selectedMechanicalContractor || null,
        })
        .eq('id', project.id);
  
      if (error) {
        console.error('Update error:', error);
        throw error;
      }
  
      // ✅ NEW: Notify newly assigned subcontractors
      const assignments = [
        { 
          id: selectedElectricalContractor, 
          type: 'electricalcontractor', 
          oldId: project.electricalcontractorid 
        },
        { 
          id: selectedArchitectContractor, 
          type: 'architectcontractor', 
          oldId: project.architectcontractorid 
        },
        { 
          id: selectedMechanicalContractor, 
          type: 'mechanicalcontractor', 
          oldId: project.mechanicalcontractorid 
        }
      ];
  
      // Send notifications for new assignments
      for (const assignment of assignments) {
        if (assignment.id && assignment.id !== assignment.oldId) {
          await notifyUserAssignedToProject(
            assignment.id,
            project,
            currentUser,
            assignment.type
          );
        }
      }
  
      toast.success('تم حفظ تعيينات المقاولين الفرعيين بنجاح');
      onProjectUpdated();
      onClose();
    } catch (error) {
      console.error('Error saving subcontractor assignments:', error);
      toast.error('حدث خطأ أثناء حفظ التعيينات');
    } finally {
      setIsLoading(false);
    }
  };

  const getSubcontractorsByType = (type: string) => {
    return subcontractors.filter(sub => sub.type === type);
  };

  if (!isOpen) return null;

  if (!canEdit) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <h2 className="text-xl font-bold mb-4">تعيين المقاولين الفرعيين</h2>
          <div className="text-center py-8">
            <div className="text-gray-400 mb-4 text-4xl">🔒</div>
            <p className="text-gray-600 mb-2">لا يمكن تعديل تعيينات المشروع</p>
            <p className="text-sm text-gray-500">
              {project.status !== 'pending' 
                ? 'لا يمكن تعديل المشاريع المنشورة'
                : 'يمكن فقط للمقاول المعيّن في المشروع تعديل التعيينات'
              }
            </p>
          </div>
          <div className="flex justify-end">
            <Button variant="outline" onClick={onClose}>إغلاق</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <UserCheck className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">تعيين المقاولين الفرعيين</h2>
                <p className="text-sm text-gray-600">تعيين المقاولين الفرعيين من فريقك للعمل في هذا المشروع</p>
              </div>
            </div>
            <Button variant="outline" onClick={onClose} className="p-2">
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-6">
            {/* Project Info (Read-only) */}
            <Card className="p-4 bg-gray-50">
              <h3 className="font-semibold text-gray-800 mb-2">معلومات المشروع</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">اسم المشروع:</span>
                  <span className="font-medium mr-2">{project.name}</span>
                </div>
                <div>
                  <span className="text-gray-600">حالة المشروع:</span>
                  <span className={`mr-2 px-2 py-1 rounded-full text-xs ${
                    project.status === 'published' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-orange-100 text-orange-800'
                  }`}>
                    {project.status === 'published' ? 'منشور' : 'في الانتظار'}
                  </span>
                </div>
              </div>
            </Card>

            {/* Subcontractors Assignment */}
            <Card className="p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-green-600" />
                تعيين المقاولين الفرعيين
              </h3>
              
              {subcontractors.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Electrical Contractor */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      مقاول كهرباء
                    </label>
                    <select 
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      value={selectedElectricalContractor} 
                      onChange={(e) => setSelectedElectricalContractor(e.target.value)}
                    >
                      <option value="">اختر مقاول كهرباء</option>
                      {getSubcontractorsByType('كهربائي').map(contractor => (
                        <option key={contractor.id} value={contractor.id}>
                          {contractor.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Architecture Contractor */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      مقاول معماري
                    </label>
                    <select 
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      value={selectedArchitectContractor} 
                      onChange={(e) => setSelectedArchitectContractor(e.target.value)}
                    >
                      <option value="">اختر مقاول معماري</option>
                      {getSubcontractorsByType('معماري').map(contractor => (
                        <option key={contractor.id} value={contractor.id}>
                          {contractor.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Mechanical Contractor */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      مقاول ميكانيكا
                    </label>
                    <select 
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      value={selectedMechanicalContractor} 
                      onChange={(e) => setSelectedMechanicalContractor(e.target.value)}
                    >
                      <option value="">اختر مقاول ميكانيكا</option>
                      {getSubcontractorsByType('ميكانيكي').map(contractor => (
                        <option key={contractor.id} value={contractor.id}>
                          {contractor.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="text-yellow-600 mb-4">⚠️</div>
                  <h4 className="font-medium text-yellow-800 mb-2">لا يوجد مقاولون فرعيون</h4>
                  <p className="text-sm text-yellow-700 mb-4">
                    يجب إضافة مقاولين فرعيين في لوحة التحكم أولاً قبل تعيينهم في المشروع
                  </p>
                  <p className="text-xs text-yellow-600">
                    انتقل إلى لوحة التحكم → المقاولون الفرعيون → إضافة مقاول فرعي
                  </p>
                </div>
              )}
            </Card>

            {/* Current Assignments Summary */}
            {subcontractors.length > 0 && (
              <Card className="p-4 bg-green-50">
                <h4 className="font-medium text-gray-800 mb-3">ملخص التعيينات الحالية</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">مقاول كهرباء:</span>
                    <span className="font-medium">
                      {selectedElectricalContractor 
                        ? subcontractors.find(c => c.id === selectedElectricalContractor)?.name || 'غير معروف'
                        : 'غير مُعيّن'
                      }
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">مقاول معماري:</span>
                    <span className="font-medium">
                      {selectedArchitectContractor 
                        ? subcontractors.find(c => c.id === selectedArchitectContractor)?.name || 'غير معروف'
                        : 'غير مُعيّن'
                      }
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">مقاول ميكانيكا:</span>
                    <span className="font-medium">
                      {selectedMechanicalContractor 
                        ? subcontractors.find(c => c.id === selectedMechanicalContractor)?.name || 'غير معروف'
                        : 'غير مُعيّن'
                      }
                    </span>
                  </div>
                </div>
              </Card>
            )}

            {/* Available Subcontractors Info */}
            {subcontractors.length > 0 && (
              <Card className="p-4 bg-blue-50">
                <h4 className="font-medium text-gray-800 mb-3">المقاولون الفرعيون المتاحون</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-blue-700">كهربائي:</span>
                    <span className="text-gray-600 mr-2">
                      {getSubcontractorsByType('كهربائي').length} مقاول
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-blue-700">معماري:</span>
                    <span className="text-gray-600 mr-2">
                      {getSubcontractorsByType('معماري').length} مقاول
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-blue-700">ميكانيكي:</span>
                    <span className="text-gray-600 mr-2">
                      {getSubcontractorsByType('ميكانيكي').length} مقاول
                    </span>
                  </div>
                </div>
              </Card>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t mt-6">
            <Button 
              variant="outline" 
              onClick={onClose} 
              disabled={isLoading}
              className="px-4 py-2"
            >
              <X className="h-4 w-4 mr-1" />
              إلغاء
            </Button>
            {subcontractors.length > 0 && (
              <Button 
                onClick={handleSave} 
                disabled={isLoading}
                className="px-4 py-2 bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
              >
                <Save className="h-4 w-4 mr-1" />
                {isLoading ? 'جاري الحفظ...' : 'حفظ التعيينات'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContractorProjectEditDialog;