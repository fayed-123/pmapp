/**
 * Utilities for importing Excel files
 */
import { ProjectItem } from '@/lib/types';
import { parseExcelDate, calculateExecutionTime } from './dateUtils';

/**
 * معالجة بيانات الإكسل وتحويلها إلى مصفوفة من عناصر المشروع
 */
export const processExcelData = (data: any[], projectId: string): ProjectItem[] => {
  console.log("Processing Excel data:", data);
  
  // Guard against invalid data
  if (!data || !Array.isArray(data) || data.length === 0) {
    console.error("Invalid Excel data:", data);
    return [];
  }
  
  // محاولة تحديد ما إذا كان الصف الأول هو عناوين
  let startRow = 0;
  if (data.length > 0) {
    const firstRow = data[0];
    if (Array.isArray(firstRow) && (typeof firstRow[0] === 'string' || typeof firstRow[1] === 'string')) {
      // التحقق من أن الصف يبدو كعناوين
      const possibleHeaderText = [firstRow[0], firstRow[1]].filter(Boolean).join('').toLowerCase();
      if (possibleHeaderText.includes('رقم') || possibleHeaderText.includes('اسم') || 
          possibleHeaderText.includes('item') || possibleHeaderText.includes('name')) {
        console.log("Detected header row, skipping:", firstRow);
        startRow = 1;
      }
    }
  }

  // معالجة الصفوف كبيانات
  return data
    .slice(startRow)
    .filter(row => {
      // فلترة الصفوف غير الصالحة
      if (!row) return false;
      if (!Array.isArray(row)) return false;
      // تحقق من وجود على الأقل رقم بند أو اسم بند
      return row[0] !== undefined || row[1] !== undefined;
    })
    .map((row, index) => {
      try {
        console.log(`Processing row ${index}:`, row);
        
        // تحديد البيانات الأساسية: رقم البند، اسم البند، نسبة الإنجاز
        const itemNumber = row[0]?.toString() || (index + 1).toString();
        const name = row[1]?.toString() || '';
        
        // التحقق من نسبة الإنجاز واستخدام 0 كقيمة افتراضية
        let progress = 0;
        if (row[2] !== undefined) {
          if (typeof row[2] === 'number') {
            progress = Math.min(100, Math.max(0, row[2])); // تأكد من أن القيمة بين 0 و 100
          } else if (typeof row[2] === 'string') {
            // إزالة أي علامات % وتحويل النص إلى رقم
            const progressText = row[2].replace(/%/g, '').trim();
            progress = !isNaN(parseFloat(progressText)) ? Math.min(100, Math.max(0, parseFloat(progressText))) : 0;
          }
        }
        
        // معالجة التواريخ - add extra error handling
        let startDate = null;
        let endDate = null;
        
        try {
          startDate = parseExcelDate(row[3]);
        } catch (e) {
          console.error("Error parsing start date:", e);
          startDate = null;
        }
        
        try {
          endDate = parseExcelDate(row[4]);
        } catch (e) {
          console.error("Error parsing end date:", e);
          endDate = null;
        }
        
        console.log("Parsed dates:", startDate, endDate);
        
        // حساب وقت التنفيذ
        let executionTime = 0;
        
        // استخدام العمود السادس كوقت تنفيذ إذا كان متاحًا
        if (row[5] !== undefined) {
          if (typeof row[5] === 'number') {
            executionTime = Math.max(1, Math.round(row[5]));
          } else if (typeof row[5] === 'string') {
            const timeValue = parseFloat(row[5]);
            if (!isNaN(timeValue)) {
              executionTime = Math.max(1, Math.round(timeValue));
            }
          }
        }
        
        // إذا لم يتم تحديد وقت التنفيذ في العمود السادس، يتم حسابه من التواريخ
        if (executionTime === 0 && startDate && endDate) {
          try {
            executionTime = calculateExecutionTime(startDate, endDate);
            console.log(`Calculated execution time between ${startDate} and ${endDate}: ${executionTime} days`);
          } catch (e) {
            console.error("Error calculating execution time:", e);
            executionTime = 7; // Default in case of calculation error
          }
        }
        
        // إذا لم يتم حساب وقت التنفيذ حتى الآن، استخدم القيمة الافتراضية
        if (executionTime <= 0) {
          executionTime = 7;
          console.log(`Using default execution time: ${executionTime}`);
        }
        
        // تحديد التواريخ الافتراضية إذا لم يتم توفيرها
        const defaultStartDate = new Date().toISOString().split('T')[0];
        const defaultEndDate = new Date(Date.now() + executionTime * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        
        // Generate unique ID with timestamp and index
        const uniqueId = `${Date.now()}-${index}-${Math.floor(Math.random() * 1000)}`;
        
        // إنشاء وإرجاع كائن ProjectItem
        return {
          id: uniqueId,
          projectId,
          itemNumber,
          name,
          progress,
          startDate: startDate || defaultStartDate,
          endDate: endDate || defaultEndDate,
          executionTime,
          weight: 0, // سيتم حسابها في loadItems
          weightedProgress: 0 // سيتم حسابها في loadItems
        };
      } catch (error) {
        console.error(`Error processing row ${index}:`, error, row);
        return null;
      }
    })
    .filter((item): item is ProjectItem => item !== null);
};