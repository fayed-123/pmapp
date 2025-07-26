import React, { useState, useEffect } from "react";
import { Project, User, Subcontractor } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ProjectItem } from "@/lib/types";
import ProjectEditDialog from "./ProjectEditDialog";
import BunchControl from "./BunchControl"; // Add this import

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
  ClipboardList,
  TrendingUp,
  CheckCircle,
  Clock,
  AlertTriangle,
} from "lucide-react";
import { getUserById, getUserNameById } from "@/lib/db";
import { supabase } from "@/lib/supabase";
import { toast } from "@/components/ui/sonner";
import ContractorProjectEditDialog from "./ContractorProjectEditDialog";
import ConsultantProjectEditDialog from "./ConsultantProjectEdit";

// Helper function to check if user has items they can review
const hasItemsForReview = (items: ProjectItem[], currentUser: User): ProjectItem[] => {
  if (!items || items.length === 0) return [];

  const userRole = currentUser.role;
  const userType = currentUser.type;

  return items.filter(item => {
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
  });
};

// Helper function to get project status summary
const getProjectStatusSummary = (items: ProjectItem[]) => {
  const statusCounts = {
    pending: 0,
    contractor_approved: 0,
    subconsultant_approved: 0,
    consultant_approved: 0,
    published: 0,
    modification_requested: 0,
    total: items.length
  };

  items.forEach(item => {
    if (statusCounts.hasOwnProperty(item.status)) {
      statusCounts[item.status]++;
    }
  });

  return statusCounts;
};

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
  items: ProjectItem[];
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
  refreshProject,
  items
}) => {

  const [userNames, setUserNames] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  useEffect(() => {
    const loadUserNames = async () => {
      setIsLoading(true);
      try {

        const names: { [key: string]: string } = {};

        // Load main team names using database field names
        if (project.consultant_id) {
          names.consultant = await getUserNameById(project.consultant_id);
        }

        if (project.owner_id) {
          names.owner = await getUserNameById(project.owner_id);
        }

        if (project.contractor_id) {
          names.contractor = await getUserNameById(project.contractor_id);
        }

        // Load subconsultants names
        if (project.electricalconsultantid) {
          names.electricalConsultant = await getUserNameById(project.electricalconsultantid);
        }
        if (project.architectconsultantid) {
          names.architectConsultant = await getUserNameById(project.architectconsultantid);
        }
        if (project.mechanicalconsultantid) {
          names.mechanicalConsultant = await getUserNameById(project.mechanicalconsultantid);
        }

        // Load subcontractors names
        if (project.electricalcontractorid) {
          names.electricalContractor = await getUserNameById(project.electricalcontractorid);
        }
        if (project.architectcontractorid) {
          names.architectContractor = await getUserNameById(project.architectcontractorid);
        }
        if (project.mechanicalcontractorid) {
          names.mechanicalContractor = await getUserNameById(project.mechanicalcontractorid);
        }

        setUserNames(names);
      } catch (error) {
        console.error("❌ Error loading user names:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUserNames();
  }, [project.id]);

  // Get items that current user can review
  const reviewableItems = hasItemsForReview(items, currentUser);
  const statusSummary = getProjectStatusSummary(items);

  return (
    <div className="space-y-6">
      {/* Project Title & Edit Button */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
              <Building2 className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 leading-tight">
                {project.name}
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                {project.description || "لا يوجد وصف للمشروع"}
              </p>
              <div className="flex items-center gap-4 mt-2">
                <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${project.status === 'published'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-orange-100 text-orange-800'
                  }`}>
                  {project.status === 'published' ? '✅ منشور' : '⏳ قيد المراجعة'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {(canEdit || canReview) &&
          currentUser.role !== "subcontractor" && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditDialogOpen(true)}
              className="bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100 hover:border-indigo-300 flex items-center gap-2 self-start"
            >
              <Edit className="h-4 w-4" />
              <span className="hidden sm:inline">
                {currentUser.role === 'consultant'
                  ? 'تعيين المقاول والاستشاريين'
                  : currentUser.role === 'contractor'
                    ? 'تعيين المقاولين الفرعيين'
                    : 'تعديل المشروع'
                }
              </span>
              <span className="sm:hidden">تعديل</span>
            </Button>
          )}
      </div>

      {/* Project Status Summary - NEW SECTION */}
      {items.length > 0 && (
        <Card className="p-4 sm:p-6 shadow-sm border-0 bg-white">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-blue-600" />
            ملخص حالة البنود
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="text-center p-3 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">{statusSummary.pending}</div>
              <div className="text-xs text-yellow-700">في الانتظار</div>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{statusSummary.contractor_approved}</div>
              <div className="text-xs text-blue-700">موافقة المقاول</div>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{statusSummary.subconsultant_approved}</div>
              <div className="text-xs text-purple-700">موافقة الاستشاري الفرعي</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{statusSummary.consultant_approved}</div>
              <div className="text-xs text-green-700">موافقة الاستشاري</div>
            </div>
            <div className="text-center p-3 bg-emerald-50 rounded-lg">
              <div className="text-2xl font-bold text-emerald-600">{statusSummary.published}</div>
              <div className="text-xs text-emerald-700">منشور</div>
            </div>
            <div className="text-center p-3 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">{statusSummary.modification_requested}</div>
              <div className="text-xs text-orange-700">مطلوب تعديل</div>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">تقدم الموافقات</span>
              <span className="text-sm font-medium text-gray-800">
                {statusSummary.published} من {statusSummary.total} منشور
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-emerald-600 h-2 rounded-full" 
                style={{ 
                  width: `${statusSummary.total > 0 ? (statusSummary.published / statusSummary.total) * 100 : 0}%` 
                }}
              ></div>
            </div>
          </div>
        </Card>
      )}

      {/* Bunch-Based Workflow Control - Replace individual approval section */}
      <BunchControl 
        project={project}
        onRefresh={refreshProject || (() => Promise.resolve())}
      />

      {/* Project Information Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
        {/* Timeline & Financial Info */}
        <Card className="p-4 sm:p-6 shadow-sm border-0 bg-white">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-green-600" />
            الجدول الزمني والمالي
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">تاريخ البداية:</span>
              <span className="font-medium">{project.start_date || "غير محدد"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">تاريخ النهاية المتوقعة:</span>
              <span className="font-medium">{project.end_date || "غير محدد"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">المدة المتوقعة:</span>
              <span className="font-medium">{project.expectedDays || 30} يوم</span>
            </div>
            <div className="flex justify-between border-t pt-3">
              <span className="text-gray-600">قيمة المشروع:</span>
              <span className="font-medium text-green-600">
                {project.contractValue
                  ? `${project.contractValue.toLocaleString("ar-EG")} ج.م`
                  : "غير محدد"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">الدفعة المقدمة:</span>
              <span className="font-medium">
                {project.advancePaymentPercentage !== undefined
                  ? `${project.advancePaymentPercentage}%`
                  : "غير محدد"}
              </span>
            </div>
          </div>
        </Card>

        {/* Complete Project Team - Grid Layout */}
        <Card className="p-4 sm:p-6 shadow-sm border-0 bg-white">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            فريق المشروع الكامل
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Owner */}
            <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg border border-blue-200">
              <span className="text-gray-700 font-medium flex items-center gap-2">
                <Building2 className="w-4 h-4 text-blue-600" />
                المالك
              </span>
              <span className="font-semibold text-blue-800 text-sm">
                {isLoading ? "..." : userNames.owner || "غير مُعيّن"}
              </span>
            </div>

            {/* Main Consultant */}
            <div className="flex justify-between items-center p-3 bg-indigo-50 rounded-lg border border-indigo-200">
              <span className="text-gray-700 font-medium flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-indigo-600" />
                الاستشاري المشرف
              </span>
              <span className="font-semibold text-indigo-800 text-sm">
                {isLoading ? "..." : userNames.consultant || "غير مُعيّن"}
              </span>
            </div>

            {/* Main Contractor */}
            <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg border border-green-200">
              <span className="text-gray-700 font-medium flex items-center gap-2">
                <Wrench className="w-4 h-4 text-green-600" />
                المقاول الرئيسي
              </span>
              <span className="font-semibold text-green-800 text-sm">
                {isLoading ? "..." : userNames.contractor || "غير مُعيّن"}
              </span>
            </div>

            {/* Electrical Consultant */}
            {userNames.electricalConsultant && (
              <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <span className="text-gray-700 font-medium flex items-center gap-2">
                  ⚡
                  <span className="text-sm">استشاري كهرباء</span>
                </span>
                <span className="font-semibold text-yellow-800 text-sm">
                  {userNames.electricalConsultant}
                </span>
              </div>
            )}

            {/* Architecture Consultant */}
            {userNames.architectConsultant && (
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg border border-blue-200">
                <span className="text-gray-700 font-medium flex items-center gap-2">
                  🏗️
                  <span className="text-sm">استشاري معماري</span>
                </span>
                <span className="font-semibold text-blue-800 text-sm">
                  {userNames.architectConsultant}
                </span>
              </div>
            )}

            {/* Mechanical Consultant */}
            {userNames.mechanicalConsultant && (
              <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg border border-orange-200">
                <span className="text-gray-700 font-medium flex items-center gap-2">
                  ⚙️
                  <span className="text-sm">استشاري ميكانيكا</span>
                </span>
                <span className="font-semibold text-orange-800 text-sm">
                  {userNames.mechanicalConsultant}
                </span>
              </div>
            )}

            {/* Electrical Contractor */}
            {userNames.electricalContractor && (
              <div className="flex justify-between items-center p-3 bg-yellow-100 rounded-lg border border-yellow-300">
                <span className="text-gray-700 font-medium flex items-center gap-2">
                  ⚡
                  <span className="text-sm">مقاول كهرباء</span>
                </span>
                <span className="font-semibold text-yellow-900 text-sm">
                  {userNames.electricalContractor}
                </span>
              </div>
            )}

            {/* Architecture Contractor */}
            {userNames.architectContractor && (
              <div className="flex justify-between items-center p-3 bg-blue-100 rounded-lg border border-blue-300">
                <span className="text-gray-700 font-medium flex items-center gap-2">
                  🏗️
                  <span className="text-sm">مقاول معماري</span>
                </span>
                <span className="font-semibold text-blue-900 text-sm">
                  {userNames.architectContractor}
                </span>
              </div>
            )}

            {/* Mechanical Contractor */}
            {userNames.mechanicalContractor && (
              <div className="flex justify-between items-center p-3 bg-orange-100 rounded-lg border border-orange-300">
                <span className="text-gray-700 font-medium flex items-center gap-2">
                  ⚙️
                  <span className="text-sm">مقاول ميكانيكا</span>
                </span>
                <span className="font-semibold text-orange-900 text-sm">
                  {userNames.mechanicalContractor}
                </span>
              </div>
            )}
          </div>

          {/* Team Summary Bar */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">إجمالي أعضاء الفريق:</span>
              <span className="font-semibold text-gray-800">
                {[
                  userNames.owner,
                  userNames.consultant,
                  userNames.contractor,
                  userNames.electricalConsultant,
                  userNames.architectConsultant,
                  userNames.mechanicalConsultant,
                  userNames.electricalContractor,
                  userNames.architectContractor,
                  userNames.mechanicalContractor
                ].filter(Boolean).length} عضو
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* Project Edit Dialog - Different based on user role */}
      {currentUser.role === 'consultant' ? (
        <ConsultantProjectEditDialog
          isOpen={isEditDialogOpen}
          onClose={() => setIsEditDialogOpen(false)}
          project={project}
          currentUser={currentUser}
          onProjectUpdated={() => {
            if (typeof refreshProject === 'function') {
              refreshProject();
            }
          }}
          subconsultants={subconsultants}
        />
      ) : currentUser.role === 'contractor' ? (
        <ContractorProjectEditDialog
          isOpen={isEditDialogOpen}
          onClose={() => setIsEditDialogOpen(false)}
          project={project}
          currentUser={currentUser}
          onProjectUpdated={() => {
            if (typeof refreshProject === 'function') {
              refreshProject();
            }
          }}
          subcontractors={subcontractors}
        />
      ) : (
        <ProjectEditDialog
          isOpen={isEditDialogOpen}
          onClose={() => setIsEditDialogOpen(false)}
          project={project}
          currentUser={currentUser}
          onProjectUpdated={() => {
            if (typeof refreshProject === 'function') {
              refreshProject();
            }
          }}
          onProjectDeleted={() => {
            window.location.href = '/projects';
          }}
        />
      )}
    </div>
  );
};

export default ProjectHeader;