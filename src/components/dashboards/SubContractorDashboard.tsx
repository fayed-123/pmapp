import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Card } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import Modal from "@/components/Modal";
import ProjectDetails from "../projects/ProjectDetails";

const getProjectStatus = (project: any) => {
  const { completion, time_elapsed, expected_days } = project;

  if (completion > 0 && time_elapsed > 0 && expected_days > 0) {
    const timePercentage = (time_elapsed / expected_days) * 100;
    if (completion > timePercentage) {
      return (
        <span className="text-green-700 font-bold flex items-center gap-1">
          <TrendingUp className="h-4 w-4" /> متقدم
        </span>
      );
    } else if (completion < timePercentage) {
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

const SubContractorDashboard: React.FC = () => {
  const [projects, setProjects] = useState<any[]>([]);
  const [mainContractorName, setMainContractorName] = useState<string>("-");
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<any | null>(null);
  const [showProjectDetails, setShowProjectDetails] = useState(false);
  const [currentUser, setCurrentUser] = useState<any | null>(null);

  useEffect(() => {
    const fetchSubcontractorProjects = async () => {
      setLoading(true);

      const userStr = sessionStorage.getItem("ppm_current_user");
      if (!userStr) {
        setProjects([]);
        setLoading(false);
        return;
      }

      const user = JSON.parse(userStr);
      setCurrentUser(user); // حفظ بيانات المستخدم

      if (user.contractor_id || user.parentId) {
        const parentId = user.contractor_id || user.parentId;

        const { data: contractorData, error: contractorError } = await supabase
          .from("users")
          .select("name")
          .eq("id", parentId)
          .single();

        if (!contractorError) {
          setMainContractorName(contractorData?.name || "-");
        }
      }

      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .or(
          `electricalcontractorid.eq.${user.id},architectcontractorid.eq.${user.id},mechanicalcontractorid.eq.${user.id}`
        );

      if (!error) {
        setProjects(data);
      } else {
        setProjects([]);
      }

      setLoading(false);
    };

    fetchSubcontractorProjects();
  }, []);

  const handleViewProject = (project: any) => {
    setSelectedProject(project);
    setShowProjectDetails(true);
  };

  const handleCloseProjectDetails = async () => {
    setShowProjectDetails(false);
    setSelectedProject(null);
    await reloadProjects();
  };

  const reloadProjects = async () => {
    setLoading(true);

    const userStr = sessionStorage.getItem("ppm_current_user");
    if (!userStr) {
      setProjects([]);
      setLoading(false);
      return;
    }

    const user = JSON.parse(userStr);
    setCurrentUser(user); // تحديث currentUser عند إعادة التحميل

    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .or(
        `electricalcontractorid.eq.${user.id},architectcontractorid.eq.${user.id},mechanicalcontractorid.eq.${user.id}`
      );

    if (!error) {
      setProjects(data);
    } else {
      setProjects([]);
    }
    setLoading(false);
  };

  if (loading) return <p>جاري تحميل المشاريع...</p>;

  if (projects.length === 0) {
    return (
      <p className="text-gray-500 text-center">
        ⚠️ لا توجد مشاريع مخصصة لك حتى الآن.
      </p>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4 text-indigo-700">
        📋 المشاريع المكلفة لك
      </h2>

      <Card className="overflow-x-auto">
        <table className="w-full text-right">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2">اسم المشروع</th>
              <th className="p-2">تاريخ البداية</th>
              <th className="p-2">تاريخ النهاية</th>
              <th className="p-2">نسبة الإنجاز</th>
              <th className="p-2">الحالة</th>
              <th className="p-2">المقاول الرئيسي</th>
              <th className="p-2">التحكم</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((proj) => (
              <tr key={proj.id} className="border-t hover:bg-gray-50 text-center">
                <td className="p-2">{proj.name}</td>
                <td className="p-2">{proj.start_date}</td>
                <td className="p-2">{proj.end_date}</td>
                <td className="p-2">{proj.completion || 0}%</td>
                <td className="p-2">{getProjectStatus(proj)}</td>
                <td className="p-2">{mainContractorName}</td>

                {/* عمود التحكم */}
                <td className="p-2 flex justify-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleViewProject(proj)}
                    className="text-indigo-600 hover:text-indigo-800"
                  >
                    <i className="fa fa-eye ml-1" /> عرض
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {selectedProject && (
        <Modal
          isOpen={showProjectDetails}
          onClose={handleCloseProjectDetails}
          title={`تفاصيل المشروع: ${selectedProject.name}`}
          size="xl"
        >
          <ProjectDetails
            project={selectedProject}
            currentUser={currentUser}   
            onClose={handleCloseProjectDetails}
            subcontractors={[]}
          />
        </Modal>
      )}
    </div>
  );
};

export default SubContractorDashboard;
