
import React, { useState, useRef } from 'react';
import { ProjectItem } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Loader2, FileText } from 'lucide-react';
// Fix the import path to use the new file structure
import { processWordData } from '@/utils/fileImport';
import mammoth from 'mammoth';

interface WordImporterProps {
  projectId: string;
  onImportComplete: (items: ProjectItem[]) => void;
  onImporting: (importing: boolean) => void;
  onFeedback: (message: string) => void;
}

const WordImporter: React.FC<WordImporterProps> = ({ 
  projectId, 
  onImportComplete, 
  onImporting,
  onFeedback
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    setIsLoading(true);
    onImporting(true);
    onFeedback('جاري معالجة الملف...');

    const file = event.target.files && event.target.files[0];

    if (!file) {
      setIsLoading(false);
      onImporting(false);
      onFeedback('الرجاء تحديد ملف.');
      return;
    }

    try {
      const reader = new FileReader();

      reader.onload = async (e: any) => {
        try {
          const arrayBuffer = e.target.result;
          const result = await mammoth.convertToHtml({ arrayBuffer: arrayBuffer as ArrayBuffer });
          const html = result.value;

          // Process the Word data using the utility function
          // Fix: processWordData only takes 2 arguments and returns an array directly, not a Promise
          const items = processWordData(html, projectId);
          onImportComplete(items);
          setIsLoading(false);
          onImporting(false);
          onFeedback(`تم استيراد ${items.length} بند بنجاح.`);
        } catch (error) {
          console.error("Error converting Word to HTML:", error);
          setIsLoading(false);
          onImporting(false);
          onFeedback(`خطأ في تحويل Word إلى HTML: ${error instanceof Error ? error.message : 'خطأ غير معروف'}`);
        }
      };

      reader.onerror = () => {
        setIsLoading(false);
        onImporting(false);
        onFeedback('فشل قراءة الملف.');
      };

      reader.readAsArrayBuffer(file);
    } catch (error) {
      console.error("Error reading file:", error);
      setIsLoading(false);
      onImporting(false);
      onFeedback(`خطأ في قراءة الملف: ${error instanceof Error ? error.message : 'خطأ غير معروف'}`);
    }
  };

  const handleClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div>
      <input
        type="file"
        accept=".docx, .doc"
        onChange={handleFileChange}
        style={{ display: 'none' }}
        ref={fileInputRef}
      />
      <Button
        variant="outline"
        size="sm"
        onClick={handleClick}
        disabled={isLoading}
        className="bg-blue-100 text-blue-800"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            جاري الاستيراد
          </>
        ) : (
          <>
            <FileText className="mr-2 h-4 w-4" />
            استيراد من Word
          </>
        )}
      </Button>
    </div>
  );
};

export default WordImporter;
