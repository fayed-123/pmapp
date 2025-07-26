import React, { useState, useEffect } from 'react';
import { Project, User } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from '@/components/ui/sonner';
import { supabase } from '@/lib/supabase';
import { saveProject, deleteProject } from '@/lib/db';
import { Trash2, Save, X } from 'lucide-react';
import { notifyUserAssignedToProject } from "@/services/WorkflowNotifications";



interface ProjectEditDialogProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
  currentUser: User;
  onProjectUpdated: () => void;
  onProjectDeleted: () => void;
}

const ProjectEditDialog: React.FC<ProjectEditDialogProps> = ({
  isOpen,
  onClose,
  project,
  currentUser,
  onProjectUpdated,
  onProjectDeleted
}) => {
  const [formData, setFormData] = useState<Project>(project);
  const [isLoading, setIsLoading] = useState(false);
  const [users, setUsers] = useState<any[]>([]);

  // Check if project can be edited/deleted
  const canEditProject = project.status === 'pending' && 
    (currentUser.role === 'mainConsultant' || currentUser.role === 'consultant');
  
  useEffect(() => {
    if (isOpen) {
      setFormData(project);
      loadUsers();
    }
  }, [isOpen, project]);

  const loadUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, name, role, type')
        .eq('approved', true)
        .order('name');

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error loading users:', error);
      toast.error('فشل في تحميل المستخدمين');
    }
  };

  const handleInputChange = (field: keyof Project, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    if (!canEditProject) {
      toast.error('لا يمكن تعديل المشاريع المنشورة');
      return;
    }

    if (!formData.name?.trim()) {
      toast.error('اسم المشروع مطلوب');
      return;
    }

    setIsLoading(true);
    try {
      const success = await saveProject(formData);
      if (success) {
        const assignments = [
          { id: formData.owner_id, type: 'owner', oldId: project.owner_id },
          { id: formData.consultant_id, type: 'consultant', oldId: project.consultant_id },
          { id: formData.contractor_id, type: 'contractor', oldId: project.contractor_id },
          { id: formData.electricalconsultantid, type: 'electricalconsultant', oldId: project.electricalconsultantid },
          { id: formData.architectconsultantid, type: 'architectconsultant', oldId: project.architectconsultantid },
          { id: formData.mechanicalconsultantid, type: 'mechanicalconsultant', oldId: project.mechanicalconsultantid },
          { id: formData.electricalcontractorid, type: 'electricalcontractor', oldId: project.electricalcontractorid },
          { id: formData.architectcontractorid, type: 'architectcontractor', oldId: project.architectcontractorid },
          { id: formData.mechanicalcontractorid, type: 'mechanicalcontractor', oldId: project.mechanicalcontractorid }
        ];

        for (const assignment of assignments) {
          if (assignment.id && assignment.id !== assignment.oldId) {
            await notifyUserAssignedToProject(
              assignment.id,
              formData,
              currentUser,
              assignment.type
            );
          }
        }
    

        toast.success('تم حفظ المشروع بنجاح');
        onProjectUpdated();
        onClose();
      } else {
        toast.error('فشل في حفظ المشروع');
      }
    } catch (error) {
      console.error('Error saving project:', error);
      toast.error('حدث خطأ أثناء حفظ المشروع');
    } finally {
      setIsLoading(false);
    }
  };


  const getUsersByRole = (role: string, type?: string) => {
    let filtered = users.filter(user => user.role === role);
    if (type) {
      filtered = filtered.filter(user => user.type === type);
    }
    return filtered;
  };

  if (!isOpen) return null;

  if (!canEditProject ) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <h2 className="text-xl font-bold mb-4">تعديل المشروع</h2>
          <div className="text-center py-8">
            <div className="text-gray-400 mb-4 text-4xl">🔒</div>
            <p className="text-gray-600 mb-2">لا يمكن تعديل المشاريع المنشورة</p>
            <p className="text-sm text-gray-500">المشروع في حالة منشور ولا يمكن تعديله</p>
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
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">تعديل المشروع</h2>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-6">
            {/* Basic Project Information */}
            <Card className="p-4">
              <h3 className="text-lg font-semibold mb-4">المعلومات الأساسية</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">اسم المشروع *</label>
                  <input
                    type="text"
                    className="w-full p-2 border border-gray-300 rounded-md"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="اسم المشروع"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">الأيام المتوقعة</label>
                  <input
                    type="number"
                    className="w-full p-2 border border-gray-300 rounded-md"
                    value={formData.expectedDays}
                    onChange={(e) => handleInputChange('expectedDays', parseInt(e.target.value) || 30)}
                    min="1"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">وصف المشروع</label>
                  <textarea
                    className="w-full p-2 border border-gray-300 rounded-md"
                    value={formData.description || ''}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="وصف المشروع"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">تاريخ البداية</label>
                  <input
                    type="date"
                    className="w-full p-2 border border-gray-300 rounded-md"
                    value={formData.start_date}
                    onChange={(e) => handleInputChange('start_date', e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">تاريخ النهاية المتوقعة</label>
                  <input
                    type="date"
                    className="w-full p-2 border border-gray-300 rounded-md"
                    value={formData.end_date}
                    onChange={(e) => handleInputChange('end_date', e.target.value)}
                  />
                </div>

              </div>
            </Card>

            {/* Financial Information */}
            <Card className="p-4">
              <h3 className="text-lg font-semibold mb-4">المعلومات المالية</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">قيمة العقد</label>
                  <input
                    type="number"
                    className="w-full p-2 border border-gray-300 rounded-md"
                    value={formData.contractValue}
                    onChange={(e) => handleInputChange('contractValue', parseFloat(e.target.value) || 0)}
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">نسبة الدفعة المقدمة %</label>
                  <input
                    type="number"
                    className="w-full p-2 border border-gray-300 rounded-md"
                    value={formData.advancePaymentPercentage}
                    onChange={(e) => handleInputChange('advancePaymentPercentage', parseFloat(e.target.value) || 0)}
                    min="0"
                    max="100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">نسبة ضمان الأعمال %</label>
                  <input
                    type="number"
                    className="w-full p-2 border border-gray-300 rounded-md"
                    value={formData.workGuaranteePercentage}
                    onChange={(e) => handleInputChange('workGuaranteePercentage', parseFloat(e.target.value) || 0)}
                    min="0"
                    max="100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">نسبة الدفع عند توريد المواد %</label>
                  <input
                    type="number"
                    className="w-full p-2 border border-gray-300 rounded-md"
                    value={formData.materialDeliveryPaymentPercentage}
                    onChange={(e) => handleInputChange('materialDeliveryPaymentPercentage', parseFloat(e.target.value) || 0)}
                    min="0"
                    max="100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">نسبة الدفع للأعمال المنجزة %</label>
                  <input
                    type="number"
                    className="w-full p-2 border border-gray-300 rounded-md"
                    value={formData.completedWorkPaymentPercentage}
                    onChange={(e) => handleInputChange('completedWorkPaymentPercentage', parseFloat(e.target.value) || 0)}
                    min="0"
                    max="100"
                  />
                </div>
              </div>
            </Card>

            {/* Project Team */}
            <Card className="p-4">
              <h3 className="text-lg font-semibold mb-4">فريق المشروع</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">المالك</label>
                  <select 
                    className="w-full p-2 border border-gray-300 rounded-md"
                    value={formData.owner_id || ''} 
                    onChange={(e) => handleInputChange('owner_id', e.target.value)}
                  >
                    <option value="">اختر المالك</option>
                    {getUsersByRole('owner').map(user => (
                      <option key={user.id} value={user.id}>{user.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">الاستشاري المشرف</label>
                  <select 
                    className="w-full p-2 border border-gray-300 rounded-md"
                    value={formData.consultant_id || ''} 
                    onChange={(e) => handleInputChange('consultant_id', e.target.value)}
                  >
                    <option value="">اختر الاستشاري</option>
                    {getUsersByRole('consultant').map(user => (
                      <option key={user.id} value={user.id}>{user.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">المقاول الرئيسي</label>
                  <select 
                    className="w-full p-2 border border-gray-300 rounded-md"
                    value={formData.contractor_id || ''} 
                    onChange={(e) => handleInputChange('contractor_id', e.target.value)}
                  >
                    <option value="">اختر المقاول</option>
                    {getUsersByRole('contractor').map(user => (
                      <option key={user.id} value={user.id}>{user.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </Card>

            {/* Sub Consultants */}
            <Card className="p-4">
              <h3 className="text-lg font-semibold mb-4">الاستشاريين الفرعيين</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">استشاري كهرباء</label>
                  <select 
                    className="w-full p-2 border border-gray-300 rounded-md"
                    value={formData.electricalconsultantid || ''} 
                    onChange={(e) => handleInputChange('electricalconsultantid', e.target.value)}
                  >
                    <option value="">اختر استشاري كهرباء</option>
                    {getUsersByRole('subconsultant', 'كهربائي').map(user => (
                      <option key={user.id} value={user.id}>{user.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">استشاري معماري</label>
                  <select 
                    className="w-full p-2 border border-gray-300 rounded-md"
                    value={formData.architectconsultantid || ''} 
                    onChange={(e) => handleInputChange('architectconsultantid', e.target.value)}
                  >
                    <option value="">اختر استشاري معماري</option>
                    {getUsersByRole('subconsultant', 'معماري').map(user => (
                      <option key={user.id} value={user.id}>{user.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">استشاري ميكانيكا</label>
                  <select 
                    className="w-full p-2 border border-gray-300 rounded-md"
                    value={formData.mechanicalconsultantid || ''} 
                    onChange={(e) => handleInputChange('mechanicalconsultantid', e.target.value)}
                  >
                    <option value="">اختر استشاري ميكانيكا</option>
                    {getUsersByRole('subconsultant', 'ميكانيكي').map(user => (
                      <option key={user.id} value={user.id}>{user.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </Card>

            {/* Sub Contractors */}
            <Card className="p-4">
              <h3 className="text-lg font-semibold mb-4">المقاولين الفرعيين</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">مقاول كهرباء</label>
                  <select 
                    className="w-full p-2 border border-gray-300 rounded-md"
                    value={formData.electricalcontractorid || ''} 
                    onChange={(e) => handleInputChange('electricalcontractorid', e.target.value)}
                  >
                    <option value="">اختر مقاول كهرباء</option>
                    {getUsersByRole('subcontractor', 'كهربائي').map(user => (
                      <option key={user.id} value={user.id}>{user.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">مقاول معماري</label>
                  <select 
                    className="w-full p-2 border border-gray-300 rounded-md"
                    value={formData.architectcontractorid || ''} 
                    onChange={(e) => handleInputChange('architectcontractorid', e.target.value)}
                  >
                    <option value="">اختر مقاول معماري</option>
                    {getUsersByRole('subcontractor', 'معماري').map(user => (
                      <option key={user.id} value={user.id}>{user.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">مقاول ميكانيكا</label>
                  <select 
                    className="w-full p-2 border border-gray-300 rounded-md"
                    value={formData.mechanicalcontractorid || ''} 
                    onChange={(e) => handleInputChange('mechanicalcontractorid', e.target.value)}
                  >
                    <option value="">اختر مقاول ميكانيكا</option>
                    {getUsersByRole('subcontractor', 'ميكانيكي').map(user => (
                      <option key={user.id} value={user.id}>{user.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </Card>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t mt-6">
            <Button 
              variant="outline" 
              onClick={onClose} 
              disabled={isLoading}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              <X className="h-4 w-4 mr-1" />
              إلغاء
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              <Save className="h-4 w-4 mr-1" />
              {isLoading ? 'جاري الحفظ...' : 'حفظ التغييرات'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectEditDialog;