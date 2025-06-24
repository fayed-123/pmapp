
/**
 * Utilities for importing Word documents
 */
import { ProjectItem } from '@/lib/types';
import { parseExcelDate, calculateExecutionTime } from './dateUtils';

/**
 * معالجة نص مستند Word وتحويله إلى مصفوفة من عناصر المشروع
 */
export const processWordData = (text: string, projectId: string): ProjectItem[] => {
  try {
    console.log("Processing Word document text");
    
    // تقسيم النص إلى أسطر ومعالجة كل سطر
    const lines = text.split('\n')
      .filter(line => line.trim().length > 0);
    
    console.log(`Found ${lines.length} lines of text`);
    
    return lines.map((line, index) => {
      try {
        // محاولة تحليل السطر إلى رقم البند، الاسم، نسبة الإنجاز، تاريخ البدء، تاريخ الانتهاء
        const parts = line.split(/[-–—]/).map(part => part.trim());
        
        console.log(`Line ${index} parts:`, parts);
        
        let itemNumber = parts[0]?.match(/^\d+$/) ? parts[0] : (index + 1).toString();
        let name = parts[0]?.match(/^\d+$/) ? (parts[1] || '') : (parts[0] || '');
        let progress = 0;
        
        // معالجة نسبة الإنجاز
        if (parts[0]?.match(/^\d+$/) && parts[2]) {
          const progressText = parts[2].replace(/%/g, '').trim();
          progress = !isNaN(parseFloat(progressText)) ? parseFloat(progressText) : 0;
        } else if (parts[1]) {
          const progressText = parts[1].replace(/%/g, '').trim();
          if (!isNaN(parseFloat(progressText)) && progressText.match(/^\d+$/)) {
            progress = parseFloat(progressText);
          }
        }
        
        progress = Math.min(100, Math.max(0, progress));
        
        // التواريخ الافتراضية
        const today = new Date();
        let startDate = today.toISOString().split('T')[0];
        let endDate = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        let executionTime = 7;
        
        // محاولة تحليل التواريخ إذا تم توفيرها
        const datePartIndex = parts[0]?.match(/^\d+$/) ? 3 : 2;
        if (parts.length > datePartIndex) {
          const possibleDates = parts.slice(datePartIndex);
          
          // البحث عن التواريخ في الأجزاء المتبقية
          for (let i = 0; i < possibleDates.length - 1; i++) {
            const date1 = parseExcelDate(possibleDates[i]);
            const date2 = parseExcelDate(possibleDates[i + 1]);
            
            if (date1 && date2) {
              startDate = date1;
              endDate = date2;
              
              // حساب وقت التنفيذ
              executionTime = calculateExecutionTime(startDate, endDate);
              break;
            }
          }
        }
        
        return {
          id: Date.now().toString() + index,
          projectId,
          itemNumber,
          name,
          progress,
          startDate,
          endDate,
          executionTime,
          weight: 0, // سيتم حسابها في loadItems
          weightedProgress: 0 // سيتم حسابها في loadItems
        };
      } catch (error) {
        console.error(`Error processing Word document line ${index}:`, error);
        return null;
      }
    }).filter((item): item is ProjectItem => item !== null);
  } catch (error) {
    console.error("Error processing Word document:", error);
    return [];
  }
};
