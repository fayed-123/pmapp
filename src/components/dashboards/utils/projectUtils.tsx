
import React from 'react';
import { Project } from '@/lib/types';
import { TrendingUp, TrendingDown } from 'lucide-react';

export const getProjectStatus = (project: Project) => {
  if (project.completion > 0 && project.timeElapsed > 0 && project.expectedDays > 0) {
    const timePercentage = (project.timeElapsed / project.expectedDays) * 100;
    if (project.completion > timePercentage) {
      return <span className="text-green-600 flex items-center gap-1"><TrendingUp className="h-4 w-4" /> متقدم</span>;
    } else if (project.completion < timePercentage) {
      return <span className="text-red-600 flex items-center gap-1"><TrendingDown className="h-4 w-4" /> متأخر</span>;
    }
    return <span className="text-blue-600">مطابق</span>;
  }
  return "-";
};
