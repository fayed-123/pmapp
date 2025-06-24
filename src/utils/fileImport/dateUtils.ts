
/**
 * Utilities for handling dates in file imports
 */

/**
 * وظيفة مساعدة لتحويل قيمة من الإكسل إلى تاريخ
 */
import * as XLSX from 'xlsx';

export const parseExcelDate = (value: any): string | null => {
  try {
    // التحقق من نوع البيانات
    console.log("Parsing date value:", value, "type:", typeof value);
    
    // إذا كان التاريخ بالفعل كائن تاريخ
    if (value instanceof Date) {
      if (!isNaN(value.getTime())) {
        return value.toISOString().split('T')[0];
      }
      return null;
    }
    
    // إذا كان رقمًا (تاريخ إكسل التسلسلي)
    if (typeof value === 'number') {
      try {
        const date = XLSX.SSF.parse_date_code(value);
        if (date && date.y && date.m && date.d) {
          return `${date.y}-${String(date.m).padStart(2, '0')}-${String(date.d).padStart(2, '0')}`;
        }
      } catch (e) {
        console.error("Error parsing Excel date number:", e);
      }
    }
    
    // إذا كان نصًا، حاول تحليله كتاريخ
    if (typeof value === 'string') {
      try {
        // محاولة إنشاء كائن تاريخ من النص
        const date = new Date(value);
        if (!isNaN(date.getTime())) {
          return date.toISOString().split('T')[0];
        }
        
        // محاولة فصل التاريخ بالمحددات الشائعة
        const dateMatches = value.match(/(\d{1,4})[\/\-\.](\d{1,2})[\/\-\.](\d{1,4})/);
        if (dateMatches) {
          let year = parseInt(dateMatches[1]);
          const month = parseInt(dateMatches[2]);
          let day = parseInt(dateMatches[3]);
          
          // التعامل مع تنسيقات التاريخ المختلفة (dd/mm/yyyy or yyyy/mm/dd)
          if (year < 32 && day > 1000) {
            [year, day] = [day, year]; // تبديل اليوم والسنة
          }
          
          // التحقق من صحة القيم
          if (year >= 2000 && year <= 2100 && month >= 1 && month <= 12 && day >= 1 && day <= 31) {
            return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          }
        }
      } catch (e) {
        console.error("Error parsing date string:", e, value);
      }
    }
    
    return null;
  } catch (error) {
    console.error("Error in parseExcelDate:", error, value);
    return null;
  }
};

/**
 * وظيفة لحساب وقت التنفيذ بين تاريخين
 */
export const calculateExecutionTime = (startDate: string | null, endDate: string | null): number => {
  try {
    if (!startDate || !endDate) return 7; // قيمة افتراضية
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      console.warn("Invalid date in calculateExecutionTime:", startDate, endDate);
      return 7;
    }
    
    if (end < start) {
      console.warn("End date is before start date:", startDate, endDate);
      return 7;
    }
    
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(1, diffDays); // على الأقل يوم واحد
  } catch (error) {
    console.error("Error calculating execution time:", error);
    return 7; // قيمة افتراضية في حالة الخطأ
  }
};
