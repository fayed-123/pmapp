import React, { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  loadProjects,
  getUserNameById,
  deleteProjectWithAllData,
  loadSubcontractorsForCurrentUser,
} from "@/lib/db";
import { addSubcontractorUser, deleteSubcontractor } from "@/lib/db/users";
import { Project, Subcontractor } from "@/lib/types";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import Modal from "@/components/Modal";
import ProjectDetails from "../projects/ProjectDetails";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  TrendingUp,
  TrendingDown,
  UserPlus,
  Trash2,
  FolderOpen,
  BarChart3,
  Settings,
  Users,
  Eye,
  User2,
  Briefcase,
} from "lucide-react";
// import { deleteSubcontractor } from "@/lib/db/projects";
import { supabase } from "@/lib/supabase";

// Tab enum
enum Tab {
  Projects = "projects",
  Subcontractors = "subcontractors",
  Stats = "stats",
}

const statusText = (status: string) => {
  switch (status) {
    case "active":
      return <span className="text-green-700 font-bold">نشط</span>;
    case "pending":
      return <span className="text-yellow-700">بانتظار الموافقة</span>;
    case "closed":
      return <span className="text-gray-600">مغلق</span>;
    default:
      return status || "-";
  }
};

const getProjectStatus = (project: Project) => {
  if (
    project.completion > 0 &&
    project.timeElapsed > 0 &&
    project.expectedDays > 0
  ) {
    const timePercentage = (project.timeElapsed / project.expectedDays) * 100;
    if (project.completion > timePercentage) {
      return (
        <span className="text-green-700 font-bold flex items-center gap-1">
          <TrendingUp className="h-4 w-4" /> متقدم
        </span>
      );
    } else if (project.completion < timePercentage) {
      return (
        <span className="text-red-700 flex items-center gap-1">
          <TrendingDown className="h-4 w-4" /> متأخر
        </span>
      );
    }
    return <span className="text-blue-700">مطابق للزمن</span>;
  }
  return "-";
};

const ContractorDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>(Tab.Projects);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [userNames, setUserNames] = useState<{ [key: string]: string }>({});
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showProjectDetails, setShowProjectDetails] = useState(false);

  const [newSubcontractorName, setNewSubcontractorName] = useState("");
  const [subcontractorType, setSubcontractorType] = useState("معماري");
  const [subcontractors, setSubcontractors] = useState<Subcontractor[]>([]);

  const { user } = useAuth();
  const { toast } = useToast();

  // Define tabs with consistent styling
  const tabs = [
    {
      id: Tab.Projects,
      label: "مشاريعي",
      icon: FolderOpen,
      color: "indigo",
      bgColor: "bg-indigo-600",
      lightBg: "bg-indigo-100",
      textColor: "text-indigo-700",
      hoverBg: "hover:bg-indigo-200",
    },
    {
      id: Tab.Subcontractors,
      label: "المقاولون الفرعيون",
      icon: Users,
      color: "green",
      bgColor: "bg-green-600",
      lightBg: "bg-green-100",
      textColor: "text-green-700",
      hoverBg: "hover:bg-green-200",
    },
    {
      id: Tab.Stats,
      label: "إحصائيات عامة",
      icon: BarChart3,
      color: "yellow",
      bgColor: "bg-yellow-600",
      lightBg: "bg-yellow-100",
      textColor: "text-yellow-700",
      hoverBg: "hover:bg-yellow-200",
    },
  ];

  // تحميل المشاريع + المقاولين الفرعين عند تحميل الصفحة أو تغير المستخدم
  useEffect(() => {
    let isCancelled = false;
    supabase.auth.getUser().then(({ data }) => {
      console.log(
        "Logged in user ID (from supabase.auth.getUser):",
        data.user?.id
      );
    });

    const loadDataSafely = async () => {
      if (!user?.id || isCancelled) return;

      setIsLoading(true);
      try {
        // تحميل المشاريع
        let relevantProjects: Project[] = [];

        if (user.role === "subcontractor") {
          const allProjects = await loadProjects();
          // المشروع يُعرض لو كان المقاول الفرعي مشارك فيه
          relevantProjects = allProjects.filter(
            (p) =>
              p.subcontractorId === user.id ||
              p.electricalcontractorid === user.id ||
              p.architectcontractorid === user.id ||
              p.mechanicalcontractorid === user.id
          );
        } else {
          const allProjects = await loadProjects();
          relevantProjects = allProjects.filter(
            (p) => p.contractor_id === user.id
          );
        }

        setProjects(relevantProjects);

        // تحميل أسماء المالكين والاستشاريين
        const userIds = [
          ...new Set(
            [
              ...relevantProjects.map((p) => p.owner_id),
              ...relevantProjects.map((p) => p.consultant_id),
            ].filter(Boolean)
          ),
        ];

        const names: { [key: string]: string } = {};
        for (const userId of userIds) {
          if (isCancelled) return;
          const userName = await getUserNameById(userId);
          names[userId] = userName;
        }
        if (isCancelled) return;
        setUserNames(names);

        // تحميل المقاولين الفرعين
        const subs = await loadSubcontractorsForCurrentUser(user.id);
        if (isCancelled) return;
        setSubcontractors(subs);
      } catch (error) {
        if (!isCancelled) {
          console.error("Error loading data:", error);
          toast({
            title: "خطأ",
            description: "حدث خطأ أثناء تحميل البيانات",
            variant: "destructive",
          });
        }
      } finally {
        if (!isCancelled) setIsLoading(false);
      }
    };

    loadDataSafely();

    return () => {
      isCancelled = true;
    };
  }, [user]);

  // إعادة تحميل المشاريع والمقاولين الفرعين (لو حبيت تستخدمها)
  const loadProjectData = async () => {
    let isCancelled = false;
    if (!user?.id) return;

    try {
      const allProjects = await loadProjects();
      if (isCancelled) return;

      const relevantProjects =
        user.role === "subcontractor"
          ? allProjects.filter(
              (p) =>
                p.subcontractorId === user.id ||
                p.electricalcontractorid === user.id ||
                p.architectcontractorid === user.id ||
                p.mechanicalcontractorid === user.id
            )
          : allProjects.filter((p) => p.contractor_id === user.id);

      setProjects(relevantProjects);

      const userIds = [
        ...new Set(
          [
            ...relevantProjects.map((p) => p.owner_id),
            ...relevantProjects.map((p) => p.consultant_id),
          ].filter(Boolean)
        ),
      ];

      const names: { [key: string]: string } = {};
      for (const userId of userIds) {
        if (isCancelled) return;
        const userName = await getUserNameById(userId);
        names[userId] = userName;
      }

      setUserNames(names);

      const subs = await loadSubcontractorsForCurrentUser(user.id);
      setSubcontractors(subs);
    } catch (error) {
      console.error("Error loading data:", error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تحميل البيانات",
        variant: "destructive",
      });
    }
  };

  const handleViewProject = (project: Project) => {
    console.log(project);
    setSelectedProject(project);
    setShowProjectDetails(true);
  };

  const handleCloseProjectDetails = async () => {
    setShowProjectDetails(false);
    setSelectedProject(null);
    await loadProjectData();
  };

  const handleDeleteProject = async (projectId: string) => {
    try {
      await deleteProjectWithAllData(projectId);
      await loadProjectData();

      toast({
        title: "تم حذف المشروع",
        description: "تم حذف المشروع وجميع بياناته بنجاح",
      });
    } catch (error) {
      console.error("Error deleting project:", error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء حذف المشروع",
        variant: "destructive",
      });
    }
  };

  const handleAddSubcontractor = async () => {
    if (!newSubcontractorName.trim() || !user?.id) return;

    try {
      await addSubcontractorUser({
        name: newSubcontractorName,
        type: subcontractorType,
        contractorId: user.id,
      });

      toast({
        title: "تمت الإضافة",
        description: `تمت إضافة المقاول الفرعي (${newSubcontractorName}) بنجاح`,
      });

      setNewSubcontractorName("");
      setSubcontractorType("معماري");

      await loadProjectData();
    } catch (error: any) {
      console.error("Error adding subcontractor:", error?.message || error);

      toast({
        title: "خطأ",
        description: error?.message || "حدث خطأ أثناء إضافة المقاول الفرعي",
        variant: "destructive",
      });
    }
  };

  // حذف مقاول فرعي
  const handleDeleteSubcontractor = async (id: string) => {
    try {
      // استدعي دالة حذف من db
      await deleteSubcontractor(id);
      toast({
        title: "تم الحذف",
        description: "تم حذف المقاول الفرعي بنجاح",
      });

      if (user?.id) {
        const subs = await loadSubcontractorsForCurrentUser(user.id);
        setSubcontractors(subs);
      }
    } catch (error) {
      console.error("Error deleting subcontractor:", error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء حذف المقاول الفرعي",
        variant: "destructive",
      });
    }
  };

  const renderProjectsTab = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
          <Briefcase className="w-5 h-5 text-indigo-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-800">مشاريعي</h3>
          <p className="text-sm text-gray-600">
            {projects.length > 0
              ? `لديك ${projects.length} مشروع`
              : "لم يتم تعيينك في أي مشروع بعد"}
          </p>
        </div>
      </div>

      {projects.length > 0 ? (
        <Card style={{ padding: 0 }} className="shadow-sm border-0 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="p-4 text-center font-semibold text-gray-700">
                    اسم المشروع
                  </th>
                  <th className="p-4 text-center font-semibold text-gray-700">
                    المالك
                  </th>
                  <th className="p-4 text-center font-semibold text-gray-700">
                    الاستشاري
                  </th>
                  <th className="p-4 text-center font-semibold text-gray-700">
                    الوقت المنقضي
                  </th>
                  <th className="p-4 text-center font-semibold text-gray-700">
                    نسبة الانجاز
                  </th>
                  <th className="p-4 text-center font-semibold text-gray-700">
                    الأيام المتوقعة
                  </th>
                  <th className="p-4 text-center font-semibold text-gray-700">
                    الحالة
                  </th>
                  <th className="p-4 text-center font-semibold text-gray-700">
                    الإجراءات
                  </th>
                </tr>
              </thead>
              <tbody>
                {projects.map((project, index) => (
                  <tr
                    key={project.id || `project-${index}`}
                    className="border-b hover:bg-gray-50 transition-colors"
                  >
                    <td className="p-4 text-center">
                      <div className="flex flex-row items-center justify-center gap-3">
                        <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                          <Briefcase className="w-4 h-4 text-indigo-600" />
                        </div>
                        <span className="font-medium text-gray-800">
                          {project.name}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-center text-gray-600">
                      {userNames[project.owner_id] || "-"}
                    </td>
                    <td className="p-4 text-center text-gray-600">
                      {userNames[project.consultant_id] || "-"}
                    </td>
                    <td className="p-4 text-center text-gray-600">
                      {project.timeElapsed || 0} يوم
                    </td>
                    <td className="p-4 text-center">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-sm font-medium ${
                          (project.completion || 0) >= 90
                            ? "bg-green-100 text-green-800"
                            : (project.completion || 0) >= 70
                            ? "bg-blue-100 text-blue-800"
                            : (project.completion || 0) >= 50
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {project.completion || 0}%
                      </span>
                    </td>
                    <td className="p-4 text-center text-gray-600">
                      {project.expectedDays || 0} يوم
                    </td>
                    <td className="p-4 text-center">
                      {getProjectStatus(project)}
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex justify-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewProject(project)}
                          className="text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          عرض
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Briefcase className="w-8 h-8 text-gray-400" />
          </div>
          <h4 className="text-lg font-medium text-gray-800 mb-2">
            لا توجد مشاريع
          </h4>
          <p className="text-gray-600">
            سيتم عرض المشاريع عند تعيينك كمقاول رئيسي
          </p>
        </div>
      )}
    </div>
  );

  const renderSubcontractorsTab = () => (
    <div className="space-y-6">
      {/* Add Subcontractor Section */}
      <Card className="p-6 shadow-sm border-0 bg-gradient-to-r from-green-50 to-emerald-50">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
            <UserPlus className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800">
              إضافة مقاول فرعي جديد
            </h3>
            <p className="text-sm text-gray-600">
              أضف مقاول فرعي للمساعدة في تنفيذ المشاريع
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              اسم المقاول الفرعي
            </label>
            <Input
              placeholder="اسم المقاول الفرعي"
              value={newSubcontractorName}
              onChange={(e) => setNewSubcontractorName(e.target.value)}
              className="focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              نوع التخصص
            </label>
            <select
              value={subcontractorType}
              onChange={(e) => setSubcontractorType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="معماري">أعمال معمارية</option>
              <option value="ميكانيكي">أعمال ميكانيكية</option>
              <option value="كهربائي">أعمال كهربائية</option>
            </select>
          </div>

          <div className="flex items-end">
            <Button
              onClick={handleAddSubcontractor}
              disabled={!newSubcontractorName.trim()}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-300 flex items-center justify-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              إضافة مقاول
            </Button>
          </div>
        </div>
      </Card>

      {/* Subcontractors List */}
      <Card className="p-6 shadow-sm border-0 bg-white">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
            <Users className="w-5 h-5 text-gray-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800">
              المقاولون الفرعيون
            </h3>
            <p className="text-sm text-gray-600">
              {subcontractors.length > 0
                ? `لديك ${subcontractors.length} مقاول فرعي`
                : "لم تقم بإضافة أي مقاول فرعي بعد"}
            </p>
          </div>
        </div>

        {subcontractors.length > 0 ? (
          <div className="overflow-x-auto text-center">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="p-4 text-right font-semibold text-gray-700 pr-10">
                    الاسم
                  </th>
                  <th className="p-4 text-right font-semibold text-gray-700">
                    نوع التخصص
                  </th>
                  <th className="p-4 text-right font-semibold text-gray-700">
                    تاريخ الإضافة
                  </th>
                  <th className="p-4 text-center font-semibold text-gray-700">
                    الإجراءات
                  </th>
                </tr>
              </thead>
              <tbody>
                {subcontractors.map((sub, index) => (
            
                  <tr
                    key={sub.id}
                    className="border-b hover:bg-gray-50 transition-colors"
                  >
                    <td className="p-4 text-center">
                      <div
                        className="flex items-center justify-center gap-3"
                        style={{ lineHeight: 1 }}
                      >
                        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                          <User2 className="w-5 h-5 text-green-600" />
                        </div>
                        <span className="font-medium text-gray-800 leading-none flex items-center">
                          {sub.name}
                        </span>
                      </div>
                    </td>

                    <td className="p-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                          sub.type === "معماري"
                            ? "bg-blue-100 text-blue-800"
                            : sub.type === "ميكانيكي"
                            ? "bg-orange-100 text-orange-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {sub.type}
                      </span>
                    </td>
                    <td className="p-4 text-gray-600">
                      {sub.created_at
                        ? new Date(sub.created_at).toLocaleDateString()
                        : "-"}
                    </td>
                    <td className="p-4">
                      <div className="flex justify-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-800 hover:bg-red-50"
                          onClick={() => handleDeleteSubcontractor(sub.id)}
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          حذف
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-gray-400" />
            </div>
            <h4 className="text-lg font-medium text-gray-800 mb-2">
              لا يوجد مقاولون فرعيون
            </h4>
            <p className="text-gray-600 mb-4">
              ابدأ بإضافة مقاول فرعي للمساعدة في تنفيذ المشاريع
            </p>
            <Button
              onClick={() => setNewSubcontractorName("")}
              variant="outline"
              className="border-green-200 text-green-600 hover:bg-green-50"
            >
              <UserPlus className="w-4 h-4 mr-1" />
              إضافة أول مقاول فرعي
            </Button>
          </div>
        )}
      </Card>
    </div>
  );

  const renderStatsTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 shadow-sm border-0 bg-gradient-to-r from-indigo-50 to-blue-50">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
              <Briefcase className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-indigo-600">
                {projects.length}
              </div>
              <div className="text-sm text-gray-600">إجمالي المشاريع</div>
            </div>
          </div>
        </Card>

        <Card className="p-6 shadow-sm border-0 bg-gradient-to-r from-green-50 to-emerald-50">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {subcontractors.length}
              </div>
              <div className="text-sm text-gray-600">المقاولون الفرعيون</div>
            </div>
          </div>
        </Card>

        <Card className="p-6 shadow-sm border-0 bg-gradient-to-r from-yellow-50 to-orange-50">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-yellow-600">
                {projects.length > 0
                  ? Math.round(
                      projects.reduce(
                        (sum, p) => sum + (p.completion || 0),
                        0
                      ) / projects.length
                    )
                  : 0}
                %
              </div>
              <div className="text-sm text-gray-600">متوسط الإنجاز</div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case Tab.Projects:
        return renderProjectsTab();
      case Tab.Subcontractors:
        return renderSubcontractorsTab();
      case Tab.Stats:
        return renderStatsTab();
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Enhanced Header - Same as other dashboards */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
            <Settings className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">
              لوحة تحكم المقاول
            </h2>
            <p className="text-gray-600 text-sm mt-1">
              إدارة المشاريع والمقاولين الفرعيين
            </p>
          </div>
        </div>
      </div>

      {/* Enhanced Navigation Tabs - Same as other dashboards */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6">
        {/* Desktop Navigation */}
        <div className="hidden lg:flex gap-3">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <Button
                key={tab.id}
                variant={isActive ? "default" : "outline"}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                  isActive
                    ? `${tab.bgColor} text-white shadow-lg hover:shadow-xl`
                    : `${tab.lightBg} ${tab.textColor} ${tab.hoverBg} border-0`
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="whitespace-nowrap">{tab.label}</span>
              </Button>
            );
          })}
        </div>

        {/* Mobile/Tablet Navigation */}
        <div className="lg:hidden">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <Button
                  key={tab.id}
                  variant={isActive ? "default" : "outline"}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 p-4 rounded-xl font-medium transition-all duration-200 text-right justify-start ${
                    isActive
                      ? `${tab.bgColor} text-white shadow-lg`
                      : `${tab.lightBg} ${tab.textColor} ${tab.hoverBg} border-0`
                  }`}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <span className="text-sm sm:text-base">{tab.label}</span>
                </Button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content Area - Same as other dashboards */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 sm:p-6 lg:p-8">{renderContent()}</div>
      </div>

      {/* Project Details Modal */}
      {selectedProject && user && (
        <Modal
          isOpen={showProjectDetails}
          onClose={handleCloseProjectDetails}
          title={`تفاصيل المشروع: ${selectedProject.name}`}
          size="xl"
        >
          <ProjectDetails
            project={selectedProject}
            currentUser={user}
            onClose={handleCloseProjectDetails}
            subcontractors={subcontractors}
          />
        </Modal>
      )}
    </div>
  );
};

export default ContractorDashboard;
