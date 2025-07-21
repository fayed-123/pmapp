// export default ProjectHeader;
import React, { useState, useEffect } from "react";
import { Project, User, Subcontractor } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

import {
  Edit,
  Calendar,
  Users,
  Building2,
  Wrench,
  UserCheck,
  CalendarDays,
  DollarSign,
  PercentCircle,
} from "lucide-react";
import { getUserNameById, saveProject } from "@/lib/db";
import { supabase } from "@/lib/supabase";
import { toast } from "@/components/ui/sonner";

interface ProjectHeaderProps {
  project: Project;
  canEdit: boolean;
  canReview: boolean;
  onEditProject: () => void;
  subcontractors?: Subcontractor[];
  subconsultants?: User[];
  selectedSubcontractorId: string;
  setSelectedSubcontractorId: (id: string) => void;
  currentUser: User;
  role: string;
  refreshProject?: () => Promise<void>;
}

const ProjectHeader: React.FC<ProjectHeaderProps> = ({
  project,
  canEdit,
  canReview,
  onEditProject,
  subcontractors = [],
  subconsultants = [],
  selectedSubcontractorId,
  setSelectedSubcontractorId,
  currentUser,
  refreshProject
}) => {
  console.log("🔍 ProjectHeader received subconsultants:", subconsultants);
  console.log("🔍 Length:", subconsultants.length);
  const [userNames, setUserNames] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(true);

  const [owners, setOwners] = useState<User[]>([]);
  const [contractors, setContractors] = useState<User[]>([]);
  const [projectComment, setProjectComment] = useState('');


  // استشاريين فرعيين حسب النوع نملأهم من prop subconsultants
  const [subElectricalConsultants, setSubElectricalConsultants] = useState<
    User[]
  >([]);
  const [subArchitectConsultants, setSubArchitectConsultants] = useState<
    User[]
  >([]);
  const [subMechanicalConsultants, setSubMechanicalConsultants] = useState<
    User[]
  >([]);

  // اختيارات المستخدم
  const [selectedOwnerId, setSelectedOwnerId] = useState(project.ownerId || "");
  const [selectedContractorId, setSelectedContractorId] = useState(
    project.contractorId || ""
  );
  const [selectedElectricalConsultant, setSelectedElectricalConsultant] =
    useState((project as any).electricalConsultantId || "");
  const [selectedArchitectConsultant, setSelectedArchitectConsultant] =
    useState((project as any).architectConsultantId || "");
  const [selectedMechanicalConsultant, setSelectedMechanicalConsultant] =
    useState((project as any).mechanicalConsultantId || "");

  // اختيارات المستخدم للمقاولين الفرعيين (الكهرباء، المعماري، الميكانيكي)
  const [selectedElectricalContractor, setSelectedElectricalContractor] =
    useState((project as any).electricalContractorId || "");
  const [selectedArchitectContractor, setSelectedArchitectContractor] =
    useState((project as any).architectContractorId || "");
  const [selectedMechanicalContractor, setSelectedMechanicalContractor] =
    useState((project as any).mechanicalContractorId || "");

  // تحميل أصحاب العقار والمقاولين (لو مش جايين من الأب)
  useEffect(() => {
    const loadOwnersAndContractors = async () => {
      const { data: users } = await supabase
        .from("users")
        .select("*")
        .eq("approved", true);
      if (users) {
        setOwners(users.filter((u) => u.role === "owner"));
        setContractors(users.filter((u) => u.role === "contractor"));
      }
    };
    loadOwnersAndContractors();
  }, []);

  // تصنيف الاستشاريين الفرعيين حسب النوع من prop
  useEffect(() => {
    console.log("🔍 Processing subconsultants:", subconsultants);
    if (subconsultants.length > 0) {
      const electrical = subconsultants.filter((u) => u.type === "كهربائي");
      const architect = subconsultants.filter((u) => u.type === "معماري");
      const mechanical = subconsultants.filter((u) => u.type === "ميكانيكي");

      console.log("⚡ Electrical:", electrical);
      console.log("🏗️ Architect:", architect);
      console.log("🔧 Mechanical:", mechanical);

      setSubElectricalConsultants(electrical);
      setSubArchitectConsultants(architect);
      setSubMechanicalConsultants(mechanical);
    } else {
      setSubElectricalConsultants([]);
      setSubArchitectConsultants([]);
      setSubMechanicalConsultants([]);
    }
  }, [subconsultants]);
  useEffect(() => {
    const loadUserNames = async () => {
      setIsLoading(true);
      try {
        const names: { [key: string]: string } = {};

        if (project.consultantId)
          names.consultant = await getUserNameById(project.consultantId);
        if (project.ownerId)
          names.owner = await getUserNameById(project.ownerId);
        if (project.contractorId)
          names.contractor = await getUserNameById(project.contractorId);

        if ((project as any).subcontractor_id)
          names.subcontractor =
            subcontractors.find(
              (s) => s.id === (project as any).subcontractor_id
            )?.name || "غير معروف";

        if ((project as any).electricalConsultantId)
          names.electricalConsultant = await getUserNameById(
            (project as any).electricalConsultantId
          );
        if ((project as any).architectConsultantId)
          names.architectConsultant = await getUserNameById(
            (project as any).architectConsultantId
          );
        if ((project as any).mechanicalConsultantId)
          names.mechanicalConsultant = await getUserNameById(
            (project as any).mechanicalConsultantId
          );
        if (selectedElectricalContractor)
          names.electricalContractor = await getUserNameById(
            selectedElectricalContractor
          );
        if (selectedArchitectContractor)
          names.architectContractor = await getUserNameById(
            selectedArchitectContractor
          );
        if (selectedMechanicalContractor)
          names.mechanicalContractor = await getUserNameById(
            selectedMechanicalContractor
          );

        setUserNames(names);
      } catch (error) {
        console.error("Error loading user names:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadUserNames();

    setSelectedOwnerId(project.ownerId || "");
    setSelectedContractorId(project.contractorId || "");
    setSelectedSubcontractorId((project as any).subcontractor_id || "");

    setSelectedElectricalConsultant(
      (project as any).electricalConsultantId || ""
    );
    setSelectedArchitectConsultant(
      (project as any).architectConsultantId || ""
    );
    setSelectedMechanicalConsultant(
      (project as any).mechanicalConsultantId || ""
    );
    // إضافة تهيئة المقاولين الفرعيين
    setSelectedElectricalContractor(
      (project as any).electricalContractorId || ""
    );
    setSelectedArchitectContractor(
      (project as any).architectContractorId || ""
    );
    setSelectedMechanicalContractor(
      (project as any).mechanicalContractorId || ""
    );
  }, [project.id, subcontractors.length]);

  const updateUserName = async (key: string, userId: string) => {
    const name = await getUserNameById(userId);
    setUserNames((prev) => ({
      ...prev,
      [key]: name || "غير معروف",
    }));
  };
  const handleOwnerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedOwnerId(e.target.value);
  };

  const handleContractorChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedContractorId(e.target.value);
  };

  const handleSubcontractorChange = async (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const newSubcontractorId = e.target.value;
    setSelectedSubcontractorId(newSubcontractorId);

    const { error } = await supabase
      .from("projects")
      .update({ subcontractor_id: newSubcontractorId || null })
      .eq("id", project.id);

    if (error) {
      console.error("فشل في تحديث المقاول الفرعي:", error.message);
    } else {
      console.log("تم تحديث المقاول الفرعي بنجاح");
    }
  };

  const handleSaveAssignments = async () => {
    const updatedProject = {
      ...project,
      ownerId: selectedOwnerId,
      contractorId: selectedContractorId,
      electricalConsultantId: selectedElectricalConsultant,
      architectConsultantId: selectedArchitectConsultant,
      mechanicalConsultantId: selectedMechanicalConsultant,

      electricalContractorId: selectedElectricalContractor,
      architectContractorId: selectedArchitectContractor,
      mechanicalContractorId: selectedMechanicalContractor,
    };

    const success = await saveProject(updatedProject);

    if (success) {
      const names = {
        owner: await getUserNameById(selectedOwnerId),
        contractor: await getUserNameById(selectedContractorId),
        electricalConsultant: await getUserNameById(
          selectedElectricalConsultant
        ),
        architectConsultant: await getUserNameById(selectedArchitectConsultant),
        mechanicalConsultant: await getUserNameById(
          selectedMechanicalConsultant
        ),

        electricalContractor: await getUserNameById(
          selectedElectricalContractor
        ),
        architectContractor: await getUserNameById(selectedArchitectContractor),
        mechanicalContractor: await getUserNameById(
          selectedMechanicalContractor
        ),
      };
      setUserNames((prev) => ({ ...prev, ...names }));
    } else {
      console.error("فشل في الحفظ.");
    }
  };

  const isSubcontractor = currentUser.role === "subcontractor";

  const projectDetails = isSubcontractor
    ? [] // أو ممكن تحط حاجات محدودة جداً هنا
    : [
      {
        icon: CalendarDays,
        label: "تاريخ البداية",
        value: project.start || "غير محدد",
        color: "text-blue-600",
        bgColor: "bg-blue-100",
      },
      {
        icon: Calendar,
        label: "تاريخ النهاية المتوقعة",
        value: project.end || "غير محدد",
        color: "text-purple-600",
        bgColor: "bg-purple-100",
      },
      {
        icon: DollarSign,
        label: "قيمة المشروع التعاقدية",
        value: project.contractValue
          ? `${project.contractValue.toLocaleString("ar-EG")} ج.م`
          : "غير محدد",
        color: "text-emerald-600",
        bgColor: "bg-emerald-100",
      },
      {
        icon: PercentCircle,
        label: "نسبة الدفعة المقدمة",
        value:
          project.advancePaymentPercentage !== undefined
            ? `${project.advancePaymentPercentage}%`
            : "غير محدد",
        color: "text-cyan-600",
        bgColor: "bg-cyan-100",
      },
      {
        icon: PercentCircle,
        label: "نسبة ضمان الأعمال",
        value:
          project.workGuaranteePercentage !== undefined
            ? `${project.workGuaranteePercentage}%`
            : "غير محدد",
        color: "text-pink-600",
        bgColor: "bg-pink-100",
      },
      {
        icon: PercentCircle,
        label: "نسبة الدفع عند توريد المواد",
        value:
          project.materialDeliveryPaymentPercentage !== undefined
            ? `${project.materialDeliveryPaymentPercentage}%`
            : "غير محدد",
        color: "text-orange-600",
        bgColor: "bg-orange-100",
      },
      {
        icon: PercentCircle,
        label: "نسبة الدفع للأعمال المنجزة",
        value:
          project.completedWorkPaymentPercentage !== undefined
            ? `${project.completedWorkPaymentPercentage}%`
            : "غير محدد",
        color: "text-lime-600",
        bgColor: "bg-lime-100",
      },
      {
        icon: Building2,
        label: "المالك",
        value: isLoading
          ? "جاري التحميل..."
          : userNames.owner || (project.ownerId ? "غير معروف" : "غير مُعيّن"),
        color: "text-yellow-600",
        bgColor: "bg-yellow-100",
      },
      {
        icon: Wrench,
        label: "المقاول",
        value: isLoading
          ? "جاري التحميل..."
          : userNames.contractor ||
          (project.contractorId ? "غير معروف" : "غير مُعيّن"),
        color: "text-green-600",
        bgColor: "bg-green-100",
      },
      currentUser.role === "contractor"
        ? {
          icon: UserCheck,
          label: "مقاول كهرباء",
          value: isLoading
            ? "جاري التحميل..."
            : userNames.electricalContractor || "غير مُعيّن",
          color: "text-indigo-600",
          bgColor: "bg-indigo-100",
        }
        : {
          icon: UserCheck,
          label: "استشاري كهرباء",
          value: isLoading
            ? "جاري التحميل..."
            : userNames.electricalConsultant || "غير مُعيّن",
          color: "text-indigo-600",
          bgColor: "bg-indigo-100",
        },
      currentUser.role === "contractor"
        ? {
          icon: UserCheck,
          label: "مقاول معماري",
          value: isLoading
            ? "جاري التحميل..."
            : userNames.architectContractor || "غير مُعيّن",
          color: "text-indigo-600",
          bgColor: "bg-indigo-100",
        }
        : {
          icon: UserCheck,
          label: "استشاري معماري",
          value: isLoading
            ? "جاري التحميل..."
            : userNames.architectConsultant || "غير مُعيّن",
          color: "text-indigo-600",
          bgColor: "bg-indigo-100",
        },
      currentUser.role === "contractor"
        ? {
          icon: UserCheck,
          label: "مقاول ميكانيكا",
          value: isLoading
            ? "جاري التحميل..."
            : userNames.mechanicalContractor || "غير مُعيّن",
          color: "text-indigo-600",
          bgColor: "bg-indigo-100",
        }
        : {
          icon: UserCheck,
          label: "استشاري ميكانيكا",
          value: isLoading
            ? "جاري التحميل..."
            : userNames.mechanicalConsultant || "غير مُعيّن",
          color: "text-indigo-600",
          bgColor: "bg-indigo-100",
        },
    ];

    const handleApproveAll = async () => {
      try {
        // Determine next status based on current user role
        let nextStatus = '';
        let notificationTitle = '';
        let notificationMessage = '';
        
        switch (currentUser.role) {
          case 'contractor':
            nextStatus = 'contractor_approved';
            notificationTitle = 'موافقة المقاول على البنود';
            notificationMessage = `تمت موافقة المقاول ${currentUser.name} على جميع بنود المشروع: ${project.name}`;
            break;
          case 'subconsultant':
            nextStatus = 'subconsultant_approved';
            notificationTitle = 'موافقة الاستشاري الفرعي على البنود';
            notificationMessage = `تمت موافقة الاستشاري الفرعي ${currentUser.name} على جميع بنود المشروع: ${project.name}`;
            break;
          case 'consultant':
            nextStatus = 'consultant_approved';
            notificationTitle = 'موافقة الاستشاري على البنود';
            notificationMessage = `تمت موافقة الاستشاري ${currentUser.name} على جميع بنود المشروع: ${project.name}`;
            break;
          case 'mainConsultant':
            nextStatus = 'published';
            notificationTitle = 'نشر المشروع';
            notificationMessage = `تم نشر المشروع ${project.name} من قبل المشرف العام`;
            break;
          default:
            console.error('غير مصرح لهذا المستخدم بالموافقة');
            return;
        }
    
        // Update all items status
        const { error: itemsError } = await supabase
          .from('project_items')
          .update({
            status: nextStatus,
            comments: projectComment || null,
            reviewed_by: currentUser.id,
            reviewed_at: new Date().toISOString()
          })
          .eq('project_id', project.id);
    
        if (itemsError) throw itemsError;
    
        // If all items are published, update project status
        if (nextStatus === 'published') {
          const { error: projectError } = await supabase
            .from('projects')
            .update({ status: 'published' })
            .eq('id', project.id);
    
          if (projectError) throw projectError;
        }
    
        // Determine who to notify next
        let nextUserId = '';
        if (nextStatus === 'contractor_approved') {
          // Notify subconsultants based on project assignments
          const subconsultantIds = [
            project.electricalConsultantId,
            project.architectConsultantId, 
            project.mechanicalConsultantId
          ].filter(Boolean);
          
          // For now, notify the first available subconsultant
          // In a real implementation, you might want to notify all relevant subconsultants
          if (subconsultantIds.length > 0) {
            nextUserId = subconsultantIds[0];
          }
        } else if (nextStatus === 'subconsultant_approved') {
          nextUserId = project.consultantId || '';
        } else if (nextStatus === 'consultant_approved') {
          // Find main consultant (you might need to query for this)
          const { data: mainConsultant } = await supabase
            .from('users')
            .select('id')
            .eq('role', 'mainConsultant')
            .eq('approved', true)
            .single();
          
          if (mainConsultant) {
            nextUserId = mainConsultant.id;
          }
        } else if (nextStatus === 'published') {
          // Notify project owner
          nextUserId = project.ownerId || '';
        }
    
        // Send notification to next person in workflow
        if (nextUserId) {
          const { error: notificationError } = await supabase
            .from('notifications')
            .insert({
              title: notificationTitle,
              message: notificationMessage,
              type: 'project_update',
              from_user_id: currentUser.id,
              from_user_name: currentUser.name,
              from_user_role: currentUser.role,
              to_user_id: nextUserId,
              project_id: project.id,
              project_name: project.name,
              data: { comment: projectComment }
            });
    
          if (notificationError) {
            console.error('Error sending notification:', notificationError);
          }
        }
    
        // Show success message
        toast.success("تمت الموافقة على جميع البنود بنجاح");
    
        // Clear comment and refresh data
        setProjectComment('');
        
        // Refresh project data if available
        if (typeof refreshProject === 'function') {
          await refreshProject();
        }
    
      } catch (error) {
        console.error('Error approving all items:', error);
        toast.error("حدث خطأ أثناء الموافقة على البنود");
      }
    };

  const handleRejectAll = async () => {
    if (!projectComment.trim()) {
      toast.error("يجب ادخال التعليق");
      return;
    }

    try {
      // Get current user's role to determine which status to set
      const currentRole = currentUser.role;
      let newStatus = 'pending';

      // Move one step back in the workflow
      if (currentRole === 'consultant') {
        newStatus = 'subconsultant_approved'; // Back to subconsultant
      } else if (currentRole === 'subconsultant') {
        newStatus = 'contractor_approved'; // Back to contractor
      } else if (currentRole === 'contractor') {
        newStatus = 'pending'; // Back to subcontractor
      }

      // Update all items with modification_requested status and comment
      const { error } = await supabase
        .from('project_items')
        .update({
          status: 'modification_requested',
          comments: projectComment,
          reviewed_by: currentUser.id,
          reviewed_at: new Date().toISOString()
        })
        .eq('project_id', project.id);

      if (error) throw error;

      // Send notification to previous step in workflow
      // Refresh items
      // Show success toast

      setProjectComment('');
    } catch (error) {
      console.error('Error requesting modifications:', error);
      // Show error toast
    }
  };


  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
              <Building2 className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-800 leading-tight">
                {project.name}
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                تفاصيل المشروع ومعلوماته الأساسية
              </p>
            </div>
          </div>
        </div>

        {(canEdit || canReview) &&
          currentUser.role !== "contractor" &&
          currentUser.role !== "subcontractor" && (
            <Button
              variant="outline"
              size="sm"
              onClick={onEditProject}
              className="bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100 hover:border-indigo-300 flex items-center gap-2 self-start"
            >
              <Edit className="h-4 w-4" />
              <span className="hidden sm:inline">تعديل بيانات المشروع</span>
              <span className="sm:hidden">تعديل</span>
            </Button>
          )}
      </div>

      <Card className="p-4 sm:p-6 shadow-sm border-0 bg-white">
        {canEdit && (
          <>
            {/* دروبداون الاستشاريين الفرعيين يظهر فقط إذا الدور استشاري */}
            {currentUser.role === "consultant" && (
              <div className="grid md:grid-cols-3 gap-4 mb-6">
                {/* استشاري كهرباء فرعي */}
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    استشاري كهرباء
                  </label>
                  <select
                    className="w-full p-2 border rounded"
                    value={selectedElectricalConsultant}
                    onChange={(e) =>
                      setSelectedElectricalConsultant(e.target.value)
                    }
                    disabled={!canEdit}
                  >
                    <option value="">-- اختر --</option>
                    {subElectricalConsultants.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* استشاري معماري فرعي */}
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    استشاري معماري
                  </label>
                  <select
                    className="w-full p-2 border rounded"
                    value={selectedArchitectConsultant}
                    onChange={(e) =>
                      setSelectedArchitectConsultant(e.target.value)
                    }
                    disabled={!canEdit}
                  >
                    <option value="">-- اختر --</option>
                    {subArchitectConsultants.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* استشاري ميكانيكا فرعي */}
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    استشاري ميكانيكا
                  </label>
                  <select
                    className="w-full p-2 border rounded"
                    value={selectedMechanicalConsultant}
                    onChange={(e) =>
                      setSelectedMechanicalConsultant(e.target.value)
                    }
                    disabled={!canEdit}
                  >
                    <option value="">-- اختر --</option>
                    {subMechanicalConsultants.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* دروبداون المقاولين الفرعيين يظهر فقط إذا الدور مقاول */}
            {currentUser.role === "contractor" && (
              <div className="grid md:grid-cols-3 gap-4 mb-6">
                {/* مقاول كهرباء فرعي */}
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    مقاول كهرباء
                  </label>
                  <select
                    className="w-full p-2 border rounded"
                    value={selectedElectricalContractor}
                    onChange={async (e) => {
                      const id = e.target.value;
                      setSelectedElectricalContractor(id);
                      await updateUserName("electricalContractor", id);
                    }}
                    disabled={!canEdit}
                  >
                    <option value="">-- اختر --</option>
                    {subcontractors
                      .filter((s) => s.type === "كهربائي")
                      .map((sub) => (
                        <option key={sub.id} value={sub.id}>
                          {sub.name}
                        </option>
                      ))}
                  </select>
                </div>

                {/* مقاول معماري فرعي */}
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    مقاول معماري
                  </label>
                  <select
                    className="w-full p-2 border rounded"
                    value={selectedArchitectContractor}
                    onChange={async (e) => {
                      const id = e.target.value;
                      setSelectedArchitectContractor(id);
                      await updateUserName("architectContractor", id);
                    }}
                    disabled={!canEdit}
                  >
                    <option value="">-- اختر --</option>
                    {subcontractors
                      .filter((s) => s.type === "معماري")
                      .map((sub) => (
                        <option key={sub.id} value={sub.id}>
                          {sub.name}
                        </option>
                      ))}
                  </select>
                </div>

                {/* مقاول ميكانيكي فرعي */}
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    مقاول ميكانيكا
                  </label>
                  <select
                    className="w-full p-2 border rounded"
                    value={selectedMechanicalContractor}
                    onChange={async (e) => {
                      const id = e.target.value;
                      setSelectedMechanicalContractor(id);
                      await updateUserName("mechanicalContractor", id);
                    }}
                    disabled={!canEdit}
                  >
                    <option value="">-- اختر --</option>
                    {subcontractors
                      .filter((s) => s.type === "ميكانيكي")
                      .map((sub) => (
                        <option key={sub.id} value={sub.id}>
                          {sub.name}
                        </option>
                      ))}
                  </select>
                </div>
              </div>
            )}

            {currentUser.role !== "subcontractor" && (
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                {/* المالك */}
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    المالك
                  </label>
                  <select
                    className="w-full p-2 border rounded"
                    value={selectedOwnerId}
                    onChange={handleOwnerChange}
                    disabled={!canEdit}
                  >
                    <option value="">-- اختر --</option>
                    {owners.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* المقاول */}
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    المقاول
                  </label>
                  <select
                    className="w-full p-2 border rounded"
                    value={selectedContractorId}
                    onChange={handleContractorChange}
                    disabled={!canEdit}
                  >
                    <option value="">-- اختر --</option>
                    {contractors.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
            {currentUser.role !== "subcontractor" && (
              <div className="text-center mb-6">
                <Button
                  className="bg-indigo-600 text-white hover:bg-indigo-700"
                  onClick={handleSaveAssignments}
                  disabled={!canEdit}
                >
                  حفظ التعديلات
                </Button>
              </div>
            )}
          </>
        )}

        {currentUser.role !== "subcontractor" && (
          <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <div className="w-6 h-6 bg-gray-100 rounded-md flex items-center justify-center">
              <Users className="w-3 h-3 text-gray-600" />
            </div>
            معلومات المشروع
          </h4>
        )}

        <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projectDetails.map((detail, index) => {
            const Icon = detail.icon;
            return (
              <div
                key={index}
                className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <div
                  className={`w-10 h-10 ${detail.bgColor} rounded-lg flex items-center justify-center flex-shrink-0`}
                >
                  <Icon className={`w-5 h-5 ${detail.color}`} />
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-medium text-gray-600 mb-1">
                    {detail.label}
                  </div>
                  <div className="text-sm text-gray-800 font-medium truncate">
                    {detail.value}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </Card>
      {/* Approval Actions */}
      {canReview && (
        <Card className="p-4 sm:p-6 shadow-sm border-0 bg-white mt-4">
          <h4 className="text-lg font-semibold text-gray-800 mb-4">إجراءات المراجعة</h4>

          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                تعليق على جميع البنود
              </label>
              <textarea
                className="w-full p-3 border rounded-lg resize-none"
                rows={3}
                placeholder="اكتب تعليقك هنا..."
                value={projectComment}
                onChange={(e) => setProjectComment(e.target.value)}
              />
            </div>

            <div className="flex gap-3">
              <Button
                className="bg-green-600 text-white hover:bg-green-700"
                onClick={handleApproveAll}
              >
                موافقة على جميع البنود
              </Button>
              <Button
                variant="outline"
                className="border-red-500 text-red-600 hover:bg-red-50"
                onClick={handleRejectAll}
              >
                طلب تعديل جميع البنود
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default ProjectHeader;
