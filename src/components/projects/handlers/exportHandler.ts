
import * as XLSX from 'xlsx';
import { ProjectItem } from '@/lib/types';

export const handleExcelExport = (items: ProjectItem[], projectName: string) => {
  try {
    if (!items || items.length === 0) {
      return {
        success: false,
        message: "لا توجد بنود للتصدير"
      };
    }
    
    // تحضير البيانات للتصدير
    const data = items.map((item, index) => ({
      'الرقم': item.itemNumber,
      'الوصف': item.name,
      'نسبة الإنجاز (%)': item.progress,
      'تاريخ البدء': item.startDate,
      'تاريخ الانتهاء': item.endDate,
      'مدة التنفيذ (أيام)': item.executionTime,
      'الوزن النسبي (%)': item.weight.toFixed(2),
      'الإنجاز الموزون (%)': item.weightedProgress.toFixed(2)
    }));
    
    // إنشاء ورقة عمل
    const worksheet = XLSX.utils.json_to_sheet(data);
    
    // تعديل عرض الأعمدة
    const colWidths = [
      { wch: 10 }, // الرقم
      { wch: 30 }, // الوصف
      { wch: 15 }, // نسبة الإنجاز
      { wch: 15 }, // تاريخ البدء
      { wch: 15 }, // تاريخ الانتهاء
      { wch: 15 }, // مدة التنفيذ
      { wch: 15 }, // الوزن النسبي
      { wch: 15 }, // الإنجاز الموزون
    ];
    
    worksheet['!cols'] = colWidths;
    
    // إنشاء الكتاب
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "بنود المشروع");
    
    // تنزيل الملف
    const fileName = `${projectName.replace(/[^\w\s]/gi, '')}_بنود_المشروع.xlsx`;
    XLSX.writeFile(workbook, fileName);
    
    return {
      success: true,
      message: `تم تصدير ${items.length} بند بنجاح`
    };
  } catch (error) {
    console.error("Error exporting to Excel:", error);
    return {
      success: false,
      message: "حدث خطأ أثناء تصدير البيانات"
    };
  }
};
