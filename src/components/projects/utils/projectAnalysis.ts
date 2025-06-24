
import { ProjectItem } from '@/lib/types';

export interface AnalysisItem extends ProjectItem {
  expectedProgress: number;
  progressDiff: number;
  risk: string;
  riskColor: string;
}

export function getAnalysisData(items: ProjectItem[]): AnalysisItem[] {
  return items.map(item => {
    let risk = "منخفض";
    let riskColor = "text-green-600";
    let progressDiff = 0;
    
    if (item.startDate && item.endDate) {
      // Get current date
      const now = new Date();
      const startDate = new Date(item.startDate);
      const endDate = new Date(item.endDate);
      
      // Calculate elapsed time as percentage of total item duration
      const totalItemDuration = endDate.getTime() - startDate.getTime();
      const elapsedTime = now.getTime() - startDate.getTime();
      const elapsedPercentage = totalItemDuration > 0 ? (elapsedTime / totalItemDuration) * 100 : 0;
      
      // Calculate the difference between expected progress and actual progress
      progressDiff = Math.round(elapsedPercentage - item.progress);
      
      // If current date is past the item end date and progress is not 100%, high risk
      if (now > endDate && item.progress < 100) {
        risk = "عالي";
        riskColor = "text-red-600";
      } 
      // If elapsed time percentage is significantly higher than progress percentage, item is behind schedule
      else if (progressDiff > 30) {
        risk = "عالي";  // More than 30% behind schedule relative to time
        riskColor = "text-red-600";
      } 
      else if (progressDiff > 20) {
        risk = "متوسط";  // Between 20% and 30% behind schedule relative to time
        riskColor = "text-yellow-600";
      }
    }
    
    return {
      ...item,
      expectedProgress: Math.round(item.progress + progressDiff),
      progressDiff,
      risk,
      riskColor
    };
  }).filter(item => item.progressDiff > 0); // Only show delayed items
}

export function getProjectStatus(completion: number, timeElapsed: number, expectedDays: number) {
  if (completion > 0 && timeElapsed > 0 && expectedDays > 0) {
    // Calculate time elapsed percentage
    const timeElapsedPercentage = (timeElapsed / expectedDays) * 100;
    
    // Compare completion percentage to time elapsed percentage
    if (completion > timeElapsedPercentage) {
      return {
        status: "متقدم على الزمن",
        color: "text-green-700",
        icon: "TrendingUp"
      };
    } else {
      return {
        status: "متأخر",
        color: "text-red-700",
        icon: "TrendingDown"
      };
    }
  }
  return {
    status: "العمل مطابق للزمن",
    color: "text-blue-700",
    icon: null
  };
}

export function handleExcelExport(items: ProjectItem[], projectName: string) {
  try {
    const XLSX = require('xlsx');
    const wb = XLSX.utils.book_new();
    
    const itemsData = [
      ['رقم البند', 'اسم البند', 'نسبة الإنجاز', 'زمن التنفيذ (أيام)', 'الوزن النسبي', 'نسبة الإنجاز الموزونة'],
      ...items.map(item => [
        item.itemNumber, 
        item.name, 
        item.progress, 
        item.executionTime, 
        item.weight ? item.weight.toFixed(4) : 0,
        item.weightedProgress ? item.weightedProgress.toFixed(2) : 0
      ])
    ];
    
    const ws = XLSX.utils.aoa_to_sheet(itemsData);
    
    XLSX.utils.book_append_sheet(wb, ws, 'البنود');
    
    const date = new Date().toISOString().split('T')[0];
    const filename = `${projectName.replace(/[^\w\s]/gi, '')}_${date}.xlsx`;
    
    XLSX.writeFile(wb, filename);
    
    return { success: true, message: "تم تصدير البنود إلى ملف اكسل بنجاح" };
  } catch (error) {
    console.error('Error exporting Excel:', error);
    return { success: false, message: "حدث خطأ أثناء تصدير البيانات" };
  }
}
