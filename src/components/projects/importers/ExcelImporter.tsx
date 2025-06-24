import React, { useState, useCallback } from 'react';
import * as XLSX from 'xlsx';
import { useToast } from '@/components/ui/use-toast';
import { ProjectItem } from '@/lib/types';
import { processExcelData } from '@/utils/fileImport';
import { FileSpreadsheet, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';

interface ExcelImporterProps {
  projectId: string;
  onImportComplete: (items: ProjectItem[]) => void;
  onImporting: (isImporting: boolean) => void;
  onFeedback: (feedback: string) => void;
}

const ExcelImporter: React.FC<ExcelImporterProps> = ({ 
  projectId, 
  onImportComplete, 
  onImporting, 
  onFeedback 
}) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  // Use callback to prevent unnecessary re-renders
  const updateProgress = useCallback((value: number, message: string) => {
    setProgress(value);
    onFeedback(message);
  }, [onFeedback]);

  const handleExcelImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    
    try {
      // Reset state and set initial loading state
      setIsLoading(true);
      setError(null);
      updateProgress(10, 'جاري تحميل ملف الإكسل...');
      onImporting(true);
      
      // This ensures the UI updates before proceeding
      await new Promise(resolve => setTimeout(resolve, 50));
      
      // Read the file as an array buffer
      const arrayBuffer = await readFileAsArrayBuffer(file, updateProgress);
      
      updateProgress(60, 'جاري تحليل بيانات الإكسل...');
      // Allow UI to update
      await new Promise(resolve => setTimeout(resolve, 50));
      
      // Parse the Excel file - add error handling for large files
      let workbook;
      try {
        workbook = XLSX.read(new Uint8Array(arrayBuffer), { 
          type: 'array', 
          cellDates: true,
          cellNF: false, 
          cellText: false 
        });
      } catch (xlsxError) {
        console.error("XLSX parsing error:", xlsxError);
        throw new Error("فشل في تحليل ملف الإكسل. قد يكون الملف كبيرًا جدًا أو تالفًا");
      }
      
      if (!workbook || !workbook.SheetNames || workbook.SheetNames.length === 0) {
        throw new Error("الملف لا يحتوي على أوراق عمل");
      }
      
      updateProgress(70, 'جاري استخراج البيانات من الملف...');
      await new Promise(resolve => setTimeout(resolve, 50));
      
      // Get the first sheet
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      
      // Convert to JSON with optimized options
      const options = { 
        header: 1, 
        raw: false,
        dateNF: 'yyyy-mm-dd',
        defval: '',
        blankrows: false
      };
      
      const rows = XLSX.utils.sheet_to_json(worksheet, options) as any[];
      
      if (!rows || rows.length <= 1) {
        throw new Error("لم يتم العثور على بيانات في الملف");
      }
      
      updateProgress(80, 'جاري معالجة البيانات...');
      
      // Process data in smaller batches to prevent UI freezing
      const processedItems = await processBatchedData(rows, projectId, updateProgress);
      
      // Safety check for empty results
      if (!processedItems || processedItems.length === 0) {
        throw new Error("لم يتم العثور على بيانات صالحة للاستيراد في الملف");
      }
      
      updateProgress(100, `تم استيراد ${processedItems.length} بند بنجاح`);
      
      // Allow UI to update before completing
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Import smaller batches at a time to prevent overloading
      const batchSize = 50;
      // if (processedItems.length > batchSize) {
      //   // Import in chunks to avoid freezing the UI
      //   for (let i = 0; i < processedItems.length; i += batchSize) {
      //     const batch = processedItems.slice(i, i + batchSize);
      //     // Only call onImportComplete for the first batch
      //     if (i === 0) {
      //       onImportComplete(batch);
      //     } else {
      //       // For subsequent batches, use a direct save method
      //       // You'd need to implement a method to save items directly without triggering completion updates
      //       await saveItemsBatch(batch);
      //     }
      //     await new Promise(resolve => setTimeout(resolve, 50));
      //   }
        
      //   toast({
      //     title: "تم الاستيراد",
      //     description: `تم استيراد ${processedItems.length} بند من ملف الإكسل بنجاح`,
      //   });
      // } else {
        // For smaller sets, import all at once
        onImportComplete(processedItems);
        
        toast({
          title: "تم الاستيراد",
          description: `تم استيراد ${processedItems.length} بند من ملف الإكسل بنجاح`,
        });
      // }
    } catch (error) {
      console.error('Error importing Excel:', error);
      const errorMessage = error instanceof Error ? error.message : 'خطأ غير معروف';
      setError(errorMessage);
      onFeedback(`حدث خطأ أثناء استيراد الملف: ${errorMessage}`);
      
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء استيراد ملف الإكسل",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
      onImporting(false);
      setProgress(0);
      
      // Reset input value
      e.target.value = '';
    }
  };

  // Function to save items without triggering update calculations
  // You would need to implement this based on your storage mechanism
  const saveItemsBatch = async (items: ProjectItem[]): Promise<void> => {
    // This is a placeholder - implement according to your storage pattern
    try {
      // Get existing items
      const existingItems = JSON.parse(localStorage.getItem('ppm_items') || "[]");
      // Filter out items with same projectId (if needed)
      const filteredItems = existingItems.filter((i: any) => i.projectId !== projectId);
      // Add new items
      const updatedItems = [...filteredItems, ...items];
      // Save directly to localStorage without triggering calculations
      localStorage.setItem('ppm_items', JSON.stringify(updatedItems));
    } catch (error) {
      console.error("Error saving items batch:", error);
    }
    return new Promise(resolve => setTimeout(resolve, 10));
  };

  // Promise-based file reader
  const readFileAsArrayBuffer = (file: File, progressCallback: (value: number, message: string) => void): Promise<ArrayBuffer> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentLoaded = Math.round((event.loaded / event.total) * 50);
          progressCallback(Math.min(50, percentLoaded), `جاري تحميل الملف... ${percentLoaded}%`);
        }
      };
      
      reader.onload = () => {
        if (reader.result instanceof ArrayBuffer) {
          resolve(reader.result);
        } else {
          reject(new Error("فشل في قراءة الملف"));
        }
      };
      
      reader.onerror = () => {
        reject(reader.error || new Error("فشل في قراءة الملف"));
      };
      
      reader.readAsArrayBuffer(file);
    });
  };

  // Process data in batches to prevent UI freezing
  const processBatchedData = async (
    rows: any[], 
    projectId: string, 
    progressCallback: (value: number, message: string) => void
  ): Promise<ProjectItem[]> => {
    const batchSize = 25; // karim
    const dataRows = rows.slice(1); // Remove header row once
    const totalRows = dataRows.length;
    let processedItems: ProjectItem[] = [];
    
    console.log(`Processing ${totalRows} total rows in batches of ${batchSize}`);
    
    // Process in smaller batches with yield to UI thread
    for (let i = 0; i < totalRows; i += batchSize) {
      const endIndex = Math.min(i + batchSize, totalRows);
      const batch = dataRows.slice(i, endIndex);
      
      console.log(`Processing batch: rows ${i + 1} to ${endIndex} (${batch.length} items)`);
      
      // Allow UI to update between batches
      await new Promise(resolve => setTimeout(resolve, 10));
      
      try {
        const batchItems = processExcelData(batch, projectId);
        if (batchItems && Array.isArray(batchItems)) {
          processedItems = [...processedItems, ...batchItems];
          console.log(`Batch processed successfully: ${batchItems.length} items added`);
        } else {
          console.warn(`Batch returned invalid data:`, batchItems);
        }
        
        // Update progress (more accurate calculation)
        const processedCount = Math.min(endIndex, totalRows);
        const percentComplete = Math.round(80 + ((processedCount / totalRows) * 20));
        progressCallback(
          Math.min(99, percentComplete), 
          `تمت معالجة ${processedCount} من ${totalRows} صف (${Math.min(99, percentComplete)}%)`
        );
        
      } catch (error) {
        console.error(`Error processing batch ${i}-${endIndex}:`, error);
        // You might want to decide whether to continue or stop here
        // For now, continuing but logging the error
      }
    }
    
    console.log(`Total processed items: ${processedItems.length} out of ${totalRows} rows`);
    return processedItems;
  };

  return (
    <div className="flex flex-col gap-2">
      <label className={`cursor-pointer ${isLoading ? 'opacity-50 pointer-events-none' : ''} 
        bg-emerald-50 hover:bg-emerald-100 transition rounded px-3 py-2 border border-emerald-200 
        flex items-center gap-2`}
      >
        {isLoading ? (
          <Loader2 className="w-5 h-5 text-emerald-700 animate-spin" />
        ) : (
          <FileSpreadsheet className="w-5 h-5 text-emerald-700" />
        )}
        <span>{isLoading ? 'جاري المعالجة...' : 'ملف إكسل'}</span>
        <input 
          type="file" 
          accept=".xlsx,.xls"
          onChange={handleExcelImport}
          className="hidden"
          disabled={isLoading}
        />
      </label>
      
      {isLoading && progress > 0 && (
        <div className="w-full mt-2">
          <Progress value={progress} className="h-2" />
          <p className="text-xs text-gray-500 mt-1 text-center">
            {progress}% مكتمل
          </p>
        </div>
      )}
      
      {error && (
        <Alert variant="destructive" className="mt-2 py-2">
          <AlertDescription className="text-xs">
            {error}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default ExcelImporter;