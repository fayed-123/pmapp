import React, { useState, useEffect } from 'react';
import { Project, User } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from '@/components/ui/sonner';
import { supabase } from '@/lib/supabase';
import { Save, X, Users, UserCheck } from 'lucide-react';
import { notifyUserAssignedToProject } from "@/services/WorkflowNotifications";


interface ConsultantProjectEditDialogProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
  currentUser: User;
  onProjectUpdated: () => void;
  subconsultants: User[];
}

const ConsultantProjectEditDialog: React.FC<ConsultantProjectEditDialogProps> = ({
  isOpen,
  onClose,
  project,
  currentUser,
  onProjectUpdated,
  subconsultants
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [contractors, setContractors] = useState<any[]>([]);
  
  // Only fields consultant can edit
  const [selectedContractorId, setSelectedContractorId] = useState(project.contractor_id || '');
  const [selectedElectricalConsultant, setSelectedElectricalConsultant] = useState(project.electricalconsultantid || '');
  const [selectedArchitectConsultant, setSelectedArchitectConsultant] = useState(project.architectconsultantid || '');
  const [selectedMechanicalConsultant, setSelectedMechanicalConsultant] = useState(project.mechanicalconsultantid || '');

  // Check if consultant can edit (only for pending projects)
  const canEdit = project.status === 'pending' && currentUser.role === 'consultant';

  useEffect(() => {
    if (isOpen) {
      loadContractors();
      // Reset form values when dialog opens
      setSelectedContractorId(project.contractor_id || '');
      setSelectedElectricalConsultant(project.electricalconsultantid || '');
      setSelectedArchitectConsultant(project.architectconsultantid || '');
      setSelectedMechanicalConsultant(project.mechanicalconsultantid || '');
    }
  }, [isOpen, project]);

  const loadContractors = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, name, role')
        .eq('role', 'contractor')
        .eq('approved', true)
        .order('name');

      if (error) throw error;
      setContractors(data || []);
    } catch (error) {
      console.error('Error loading contractors:', error);
      toast.error('فشل في تحميل المقاولين');
    }
  };

  const handleSave = async () => {
    if (!canEdit) {
      toast.error('لا يمكن تعديل المشاريع المنشورة');
      return;
    }
  
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('projects')
        .update({
          contractor_id: selectedContractorId || null,
          electricalconsultantid: selectedElectricalConsultant || null,
          architectconsultantid: selectedArchitectConsultant || null,
          mechanicalconsultantid: selectedMechanicalConsultant || null,
        })
        .eq('id', project.id);
  
      if (error) {
        console.error('Update error:', error);
        throw error;
      }
  
      // ✅ NEW: Notify newly assigned users
      const assignments = [
        { 
          id: selectedContractorId, 
          type: 'contractor', 
          oldId: project.contractor_id 
        },
        { 
          id: selectedElectricalConsultant, 
          type: 'electricalconsultant', 
          oldId: project.electricalconsultantid 
        },
        { 
          id: selectedArchitectConsultant, 
          type: 'architectconsultant', 
          oldId: project.architectconsultantid 
        },
        { 
          id: selectedMechanicalConsultant, 
          type: 'mechanicalconsultant', 
          oldId: project.mechanicalconsultantid 
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
  
      toast.success('تم حفظ التعديلات بنجاح');
      onProjectUpdated();
      onClose();
    } catch (error) {
      console.error('Error saving project assignments:', error);
      toast.error('حدث خطأ أثناء حفظ التعديلات');
    } finally {
      setIsLoading(false);
    }
  };

  const getUsersByType = (type: string) => {
    return subconsultants.filter(user => user.type === type);
  };

  if (!isOpen) return null;

  if (!canEdit) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <h2 className="text-xl font-bold mb-4">تعديل تعيينات المشروع</h2>
          <div className="text-center py-8">
            <div className="text-gray-400 mb-4 text-4xl">🔒</div>
            <p className="text-gray-600 mb-2">لا يمكن تعديل المشاريع المنشورة</p>
            <p className="text-sm text-gray-500">يمكنك فقط تعديل تعيينات المشاريع التي في حالة الانتظار</p>
          </div>
          <div className="flex justify-end">
            <Button variant="outline" onClick={onClose}>إغلاق</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="m-0 fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <UserCheck className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">تعيينات المشروع</h2>
                <p className="text-sm text-gray-600">تعيين المقاول الرئيسي والاستشاريين الفرعيين</p>
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


            {/* Subconsultants Assignment */}
            <Card className="p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-blue-600" />
                تعيين الاستشاريين الفرعيين
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Electrical Consultant */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    استشاري كهرباء
                  </label>
                  <select 
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={selectedElectricalConsultant} 
                    onChange={(e) => setSelectedElectricalConsultant(e.target.value)}
                  >
                    <option value="">اختر استشاري كهرباء</option>
                    {getUsersByType('كهربائي').map(consultant => (
                      <option key={consultant.id} value={consultant.id}>
                        {consultant.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Architecture Consultant */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    استشاري معماري
                  </label>
                  <select 
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={selectedArchitectConsultant} 
                    onChange={(e) => setSelectedArchitectConsultant(e.target.value)}
                  >
                    <option value="">اختر استشاري معماري</option>
                    {getUsersByType('معماري').map(consultant => (
                      <option key={consultant.id} value={consultant.id}>
                        {consultant.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Mechanical Consultant */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    استشاري ميكانيكا
                  </label>
                  <select 
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={selectedMechanicalConsultant} 
                    onChange={(e) => setSelectedMechanicalConsultant(e.target.value)}
                  >
                    <option value="">اختر استشاري ميكانيكا</option>
                    {getUsersByType('ميكانيكي').map(consultant => (
                      <option key={consultant.id} value={consultant.id}>
                        {consultant.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {subconsultants.length === 0 && (
                <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    ⚠️ لم تقم بإضافة أي استشاري فرعي بعد. يمكنك إضافة استشاريين فرعيين من تبويب "الاستشاريين الفرعيين".
                  </p>
                </div>
              )}
            </Card>

            {/* Current Assignments Summary */}
            <Card className="p-4 bg-blue-50">
              <h4 className="font-medium text-gray-800 mb-3">ملخص التعيينات الحالية</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">المقاول الرئيسي:</span>
                  <span className="font-medium">
                    {selectedContractorId 
                      ? contractors.find(c => c.id === selectedContractorId)?.name || 'غير معروف'
                      : 'غير مُعيّن'
                    }
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">استشاري كهرباء:</span>
                  <span className="font-medium">
                    {selectedElectricalConsultant 
                      ? subconsultants.find(c => c.id === selectedElectricalConsultant)?.name || 'غير معروف'
                      : 'غير مُعيّن'
                    }
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">استشاري معماري:</span>
                  <span className="font-medium">
                    {selectedArchitectConsultant 
                      ? subconsultants.find(c => c.id === selectedArchitectConsultant)?.name || 'غير معروف'
                      : 'غير مُعيّن'
                    }
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">استشاري ميكانيكا:</span>
                  <span className="font-medium">
                    {selectedMechanicalConsultant 
                      ? subconsultants.find(c => c.id === selectedMechanicalConsultant)?.name || 'غير معروف'
                      : 'غير مُعيّن'
                    }
                  </span>
                </div>
              </div>
            </Card>
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
            <Button 
              onClick={handleSave} 
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
            >
              <Save className="h-4 w-4 mr-1" />
              {isLoading ? 'جاري الحفظ...' : 'حفظ التعيينات'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConsultantProjectEditDialog;