
import React from 'react';
import { Card } from '@/components/ui/card';
import Progress from '@/components/Progress';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface ProjectMetricsProps {
  completion: number;
  timeElapsed: number;
  performance: number;
  expectedDays: number;
}

const ProjectMetrics: React.FC<ProjectMetricsProps> = ({ completion, timeElapsed, performance, expectedDays }) => {
  // Calculate project status based on the new formula
  const getProjectStatus = () => {
    if (completion > 0 && timeElapsed > 0 && expectedDays > 0) {
      // Calculate time elapsed percentage
      const timeElapsedPercentage = (timeElapsed / expectedDays) * 100;
      
      // Compare completion percentage to time elapsed percentage
      if (completion > timeElapsedPercentage) {
        return {
          status: "متقدم على الزمن",
          color: "text-green-700",
          icon: <TrendingUp className="w-5 h-5 text-green-700" />
        };
      } else {
        return {
          status: "متأخر",
          color: "text-red-700",
          icon: <TrendingDown className="w-5 h-5 text-red-700" />
        };
      }
    }
    return {
      status: "جديد",
      color: "text-blue-700",
      icon: null
    };
  };
  
  const statusInfo = getProjectStatus();
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <Card className="p-4 bg-blue-50">
        <h4 className="font-bold text-blue-700 mb-2">نسبة الإنجاز الكلية</h4>
        <div className="text-2xl font-bold text-blue-800">
          {completion || 0}%
        </div>
        <Progress value={completion || 0} className="mt-2" />
      </Card>
      
      <Card className="p-4 bg-amber-50">
        <h4 className="font-bold text-amber-700 mb-2">الوقت المنقضي</h4>
        <div className="text-2xl font-bold text-amber-800">
          {timeElapsed || 0} يوم
        </div>
      </Card>
      
      <Card className="p-4 bg-emerald-50">
        <h4 className="font-bold text-emerald-700 mb-2">الأيام المتوقعة للإنجاز</h4>
        <div className="text-2xl font-bold text-emerald-800">
          {expectedDays || "0"} يوم
        </div>
      </Card>
      
      <Card className="p-4 bg-purple-50">
        <h4 className="font-bold text-purple-700 mb-2">حالة المشروع</h4>
        <div className={`text-2xl font-bold flex items-center gap-2 ${statusInfo.color}`}>
          {statusInfo.icon}
          {statusInfo.status}
        </div>
      </Card>
    </div>
  );
};

export default ProjectMetrics;
