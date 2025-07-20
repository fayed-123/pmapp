
import React from 'react';
import { Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { InfoIcon } from 'lucide-react';

interface ImportHelpProps {
  isImporting: boolean;
  feedback: string;
}

const ImportHelp: React.FC<ImportHelpProps> = ({ isImporting, feedback }) => {
  return (
    <>
      {isImporting && (
        <Alert className="bg-amber-50 border-amber-200">
          <Loader2 className="h-4 w-4 animate-spin text-amber-600" />
          <AlertDescription className="text-amber-600 font-medium">
            {feedback || 'جاري معالجة الملف...'}
          </AlertDescription>
        </Alert>
      )}
      
      {!isImporting && feedback && !feedback.includes('خطأ') && (
        <Alert className="bg-green-50 border-green-200">
          <AlertDescription className="text-green-600 font-medium">
            {feedback}
          </AlertDescription>
        </Alert>
      )}
      
      <div className="text-gray-600 text-sm mt-2 bg-gray-50 p-3 rounded shadow-sm">
        <div className="flex items-start gap-2 mb-3">
          <InfoIcon className="h-5 w-5 text-blue-500 mt-0.5" />
          <div>
            <h5 className="font-medium text-blue-800">كيفية استيراد البيانات بشكل صحيح</h5>
            <p className="text-gray-600 text-xs">تأكد من اتباع الخطوات أدناه لضمان استيراد البيانات بشكل صحيح</p>
          </div>
        </div>
        
        <p className="font-medium mb-1">
          <strong>كيفية استيراد البيانات من ملف إكسل:</strong>
        </p>
        <p className="mb-2">
          يجب أن يحتوي ملف الإكسل على الأعمدة التالية بالترتيب:
        </p>
        <ol className="list-decimal list-inside mr-4 mt-1 space-y-1">
          <li>العمود الأول: رقم البند</li>
          <li>العمود الثاني: اسم البند</li>
          <li>العمود الثالث: نسبة الإنجاز (0-100)</li>
          <li>العمود الرابع: تاريخ البدء (بتنسيق التاريخ المعروف)</li>
          <li>العمود الخامس: تاريخ الانتهاء (بتنسيق التاريخ المعروف)</li>
          <li>العمود السادس (اختياري): زمن التنفيذ (سيتم حسابه تلقائيًا من التواريخ إن لم يتم تحديده)</li>
        </ol>
        
        <div className="mt-3 p-2 bg-yellow-50 text-yellow-800 rounded">
          <p className="text-xs font-medium mb-1">ملاحظات مهمة:</p>
          <ul className="list-disc list-inside mr-4 mt-1 text-xs">
            <li>تأكد من تنسيق التواريخ في الإكسل بشكل صحيح (تنسيق تاريخ وليس نص)</li>
            <li>تأكد من إزالة أي صفوف فارغة في ملف الإكسل</li>
            <li>إذا لم يتم توفير التواريخ، سيتم استخدام التاريخ الحالي كتاريخ بداية</li>
            <li>سيتم احتساب وزن البند تلقائياً بناءً على زمن التنفيذ</li>
            <li>إذا كان الملف كبيراً، قد تستغرق المعالجة وقتاً أطول</li>
          </ul>
        </div>
        
        <div className="mt-3 p-2 bg-blue-50 text-blue-800 rounded">
          <p className="text-xs font-medium mb-1">نصائح لتجنب المشاكل:</p>
          <ul className="list-disc list-inside mr-4 mt-1 text-xs">
            <li>قم بتبسيط ملف الإكسل قبل الاستيراد (تأكد من وجود العناوين فقط في الصف الأول)</li>
            <li>تجنب الخلايا المدمجة أو التنسيقات المعقدة</li>
            <li>تأكد من أن كل عمود يحتوي على البيانات المناسبة للنوع المتوقع</li>
            <li>استخدم ملفات أصغر إذا كنت تواجه مشاكل في الاستيراد (أقل من 1000 صف)</li>
          </ul>
        </div>
      </div>
    </>
  );
};

export default ImportHelp;
