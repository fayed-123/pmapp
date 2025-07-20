
import React, { useState } from 'react';
import { ProjectItem } from '@/lib/types';
import ExcelImporter from './importers/ExcelImporter';
import WordImporter from './importers/WordImporter';
import ImportHelp from './importers/ImportHelp';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface FileImporterProps {
  projectId: string;
  onImportComplete: (items: ProjectItem[]) => void;
  onImportingChange?: (isImporting: boolean) => void;
}

const FileImporter: React.FC<FileImporterProps> = ({ 
  projectId, 
  onImportComplete,
  onImportingChange
}) => {
  const [isImporting, setIsImporting] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [progressValue, setProgressValue] = useState(0);

  const handleImportComplete = (items: ProjectItem[]) => {
    try {
      if (Array.isArray(items) && items.length > 0) {
        onImportComplete(items);
        setFeedback(`تم استيراد ${items.length} بند بنجاح`);
        setError(null);
      } else {
        setFeedback('لم يتم استيراد أي بنود');
      }
    } catch (error) {
      console.error("Error in handleImportComplete:", error);
      const errorMessage = error instanceof Error ? error.message : 'خطأ غير معروف';
      setError(`حدث خطأ أثناء معالجة البيانات المستوردة: ${errorMessage}`);
      setFeedback('حدث خطأ في معالجة البيانات');
    } finally {
      setIsImporting(false);
      if (onImportingChange) {
        onImportingChange(false);
      }
      // إعادة تعيين التقدم بعد الانتهاء
      setTimeout(() => setProgressValue(0), 1000);
    }
  };

  const handleImportingChange = (importing: boolean) => {
    setIsImporting(importing);
    if (onImportingChange) {
      onImportingChange(importing);
    }
  };

  const handleFeedback = (message: string) => {
    setFeedback(message);
    // تحديث قيمة التقدم إذا كانت الرسالة تحتوي على نسبة مئوية
    const percentMatch = message.match(/(\d+)%/);
    if (percentMatch && percentMatch[1]) {
      const percent = parseInt(percentMatch[1]);
      if (!isNaN(percent)) {
        setProgressValue(percent);
      }
    }
    
    // إعادة تعيين رسالة الخطأ إذا كانت الرسالة الجديدة ليست عن خطأ
    if (!message.includes('خطأ')) {
      setError(null);
    }
  };

  return (
    <Card className="p-4 space-y-4 bg-white">
      <h4 className="text-md font-medium">استيراد البنود من ملف</h4>
      
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>خطأ</AlertTitle>
          <AlertDescription>
            {error}
          </AlertDescription>
        </Alert>
      )}
      
      <div className="flex flex-wrap gap-4">
        <ExcelImporter 
          projectId={projectId}
          onImportComplete={handleImportComplete}
          onImporting={handleImportingChange}
          onFeedback={handleFeedback}
        />
        
        <WordImporter
          projectId={projectId}
          onImportComplete={handleImportComplete}
          onImporting={handleImportingChange}
          onFeedback={handleFeedback}
        />
      </div>
      
      {isImporting && progressValue > 0 && (
        <div className="w-full mt-2">
          <Progress value={progressValue} className="h-2" />
          <p className="text-xs text-gray-500 mt-1 text-center">
            {progressValue}% مكتمل
          </p>
        </div>
      )}
      
      <ImportHelp 
        isImporting={isImporting}
        feedback={feedback}
      />
    </Card>
  );
};

export default FileImporter;
