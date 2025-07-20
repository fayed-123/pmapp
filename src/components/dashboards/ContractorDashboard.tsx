// export default ContractorDashboard;
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  loadProjects,
  getUserNameById,
  deleteProjectWithAllData,
  loadSubcontractorsForCurrentUser,
} from "@/lib/db";
import { addSubcontractorUser } from "@/lib/db/users";
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
import { TrendingUp, TrendingDown, UserPlus, Trash2 } from "lucide-react";
import { deleteSubcontractor } from "@/lib/db/projects";
import { supabase } from "@/lib/supabase";

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
              p.electricalContractorId === user.id ||
              p.architectContractorId === user.id ||
              p.mechanicalContractorId === user.id
          );
        } else {
          const allProjects = await loadProjects();
          relevantProjects = allProjects.filter(
            (p) => p.contractorId === user.id
          );
        }

        setProjects(relevantProjects);

        // تحميل أسماء المالكين والاستشاريين
        const userIds = [
          ...new Set(
            [
              ...relevantProjects.map((p) => p.ownerId),
              ...relevantProjects.map((p) => p.consultantId),
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
                p.electricalContractorId === user.id ||
                p.architectContractorId === user.id ||
                p.mechanicalContractorId === user.id
            )
          : allProjects.filter((p) => p.contractorId === user.id);

      setProjects(relevantProjects);

      const userIds = [
        ...new Set(
          [
            ...relevantProjects.map((p) => p.ownerId),
            ...relevantProjects.map((p) => p.consultantId),
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
      console.log("Adding subcontractor with data:", {
        name: newSubcontractorName,
        type: subcontractorType,
        contractorId: user.id,
      });

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
      console.log("Deleting subcontractor with id:", id);
      // استدعي دالة حذف من db
      await deleteSubcontractor(id);
      toast({
        title: "تم الحذف",
        description: "تم حذف المقاول الفرعي بنجاح",
      });

      if (user?.id) {
        const subs = await loadSubcontractorsForCurrentUser(user.id);
        console.log("المقاولين الفرعيين بعد الحذف:", subs);

        // تحقق هل المقاول اللي حذفته لسه موجود
        const stillExists = subs.some((sub) => sub.id === id);
        console.log(
          `هل المقاول المحذوف موجود بعد التحديث؟ ${stillExists ? "نعم" : "لا"}`
        );

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

  return (
    <div>
      <h2 className="text-2xl font-bold mb-2 text-indigo-700 flex items-center gap-2">
        <i className="fa fa-tools" /> لوحة تحكم المقاول
      </h2>
      <hr className="mb-4" />

      {/* 🔧 إضافة مقاول فرعي */}
      <Card className="p-4 sm:p-6 shadow-sm border-0 bg-white mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
            <UserPlus className="w-4 h-4 text-green-600" />
          </div>
          <h4 className="text-lg font-semibold text-gray-800">
            إضافة مقاول فرعي
          </h4>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="lg:col-span-2">
            <Input
              className="w-full"
              placeholder="اسم المقاول الفرعي"
              value={newSubcontractorName}
              onChange={(e) => setNewSubcontractorName(e.target.value)}
            />
          </div>

          <div>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={subcontractorType}
              onChange={(e) => setSubcontractorType(e.target.value)}
            >
              <option value="معماري">أعمال معمارية</option>
              <option value="ميكانيكي">أعمال ميكانيكية</option>
              <option value="كهربائي">أعمال كهربائية</option>
            </select>
          </div>

          <Button
            onClick={handleAddSubcontractor}
            disabled={!newSubcontractorName.trim()}
            className="bg-green-600 hover:bg-green-700 disabled:bg-gray-300 flex items-center gap-2"
          >
            <UserPlus className="w-4 h-4" />
            إضافة
          </Button>
        </div>
      </Card>

      {/* جدول المقاولين الفرعين */}
      <div>
        <h3 className="mb-2 font-bold text-lg text-gray-700 flex items-center gap-2">
          <i className="fa fa-users" /> المقاولون الفرعيون (
          {subcontractors.length})
        </h3>
        <Card className="overflow-x-auto mb-6">
          <table className="w-full text-right">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2">الاسم</th>
                <th className="p-2">نوع العمل</th>
                <th className="p-2">التحكم</th>
              </tr>
            </thead>
            <tbody>
              {subcontractors.length > 0 ? (
                subcontractors.map((sub) => (
                  <tr
                    key={sub.id}
                    className="border-t hover:bg-gray-50 text-center"
                  >
                    <td className="p-2">{sub.name}</td>
                    <td className="p-2">{sub.type}</td>
                    <td className="p-2 text-center align-middle">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-800"
                        onClick={() => handleDeleteSubcontractor(sub.id)}
                      >
                        <Trash2 className="w-4 h-4 " />
                        حذف
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="py-8 text-center text-gray-400">
                    لا يوجد مقاولون فرعيون
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </Card>
      </div>

      {/* جدول المشاريع */}
      <div>
        <h3 className="mb-2 font-bold text-lg text-gray-700 flex items-center gap-2">
          <i className="fa fa-layer-group" /> مشاريعي ({projects.length})
        </h3>
        <Card className="overflow-x-auto mb-4">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 text-right">اسم المشروع</th>
                <th className="p-2 text-right">المالك</th>
                <th className="p-2 text-right">الاستشاري</th>
                <th className="p-2 text-right">الوقت المنقضي</th>
                <th className="p-2 text-right">نسبة الانجاز الكلية</th>
                <th className="p-2 text-right">الأيام المتوقعة للإنجاز</th>
                <th className="p-2 text-right">الحالة</th>
                <th className="p-2 text-right">التحكم</th>
              </tr>
            </thead>
            <tbody>
              {projects.length > 0 ? (
                projects.map((project, index) => (
                  <tr
                    key={project.id || `project-${index}`}
                    className="border-t hover:bg-gray-50"
                  >
                    <td className="p-2">{project.name}</td>
                    <td className="p-2">{userNames[project.ownerId] || "-"}</td>
                    <td className="p-2">
                      {userNames[project.consultantId] || "-"}
                    </td>
                    <td className="p-2">{project.timeElapsed || 0} يوم</td>
                    <td className="p-2">{project.completion || 0}%</td>
                    <td className="p-2">{project.expectedDays || 0} يوم</td>
                    <td className="p-2">{getProjectStatus(project)}</td>
                    <td className="p-2 flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewProject(project)}
                        className="text-indigo-600 hover:text-indigo-800"
                      >
                        <i className="fa fa-eye ml-1" /> عرض
                      </Button>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-800"
                          >
                            <i className="fa fa-trash ml-1" /> حذف
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="rtl:text-right">
                          <AlertDialogHeader>
                            <AlertDialogTitle>حذف المشروع</AlertDialogTitle>
                            <AlertDialogDescription>
                              هل أنت متأكد من حذف هذا المشروع؟ سيتم حذف جميع
                              البيانات المرتبطة به ولا يمكن استعادتها.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter className="flex-row-reverse">
                            <AlertDialogAction
                              onClick={() => handleDeleteProject(project.id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              حذف
                            </AlertDialogAction>
                            <AlertDialogCancel>إلغاء</AlertDialogCancel>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-gray-400">
                    لا توجد مشاريع
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </Card>
      </div>

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
