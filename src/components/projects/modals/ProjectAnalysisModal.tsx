
import React from 'react';
import { ProjectItem } from '@/lib/types';
import Modal from '@/components/Modal';
import { AlertTriangle } from "lucide-react";

interface AnalysisItem extends ProjectItem {
  expectedProgress: number;
  progressDiff: number;
  risk: string;
  riskColor: string;
}

interface ProjectAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  analysisData: AnalysisItem[];
}

const ProjectAnalysisModal: React.FC<ProjectAnalysisModalProps> = ({ 
  isOpen, 
  onClose, 
  analysisData 
}) => {
  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      title="تحليل البنود المتأخرة"
      size="xl"
    >
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 text-right">رقم البند</th>
              <th className="p-2 text-right">اسم البند</th>
              <th className="p-2 text-right">نسبة الإنجاز الحالية</th>
              <th className="p-2 text-right">نسبة الإنجاز المتوقعة</th>
              <th className="p-2 text-right">الفرق</th>
              <th className="p-2 text-right">تاريخ البدء</th>
              <th className="p-2 text-right">تاريخ الانتهاء</th>
              <th className="p-2 text-right">نسبة الخطر</th>
            </tr>
          </thead>
          <tbody>
            {analysisData.length > 0 ? (
              analysisData.map(item => (
                <tr key={item.id} className="border-t">
                  <td className="p-2">{item.itemNumber}</td>
                  <td className="p-2">{item.name}</td>
                  <td className="p-2">{item.progress}%</td>
                  <td className="p-2">{item.expectedProgress}%</td>
                  <td className="p-2 text-red-600">+{item.progressDiff}%</td>
                  <td className="p-2">{item.startDate ? new Date(item.startDate).toLocaleDateString('ar-EG') : '-'}</td>
                  <td className="p-2">{item.endDate ? new Date(item.endDate).toLocaleDateString('ar-EG') : '-'}</td>
                  <td className={`p-2 font-bold ${item.riskColor}`}>{item.risk}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} className="p-4 text-center">لا توجد بنود متأخرة</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="mt-4 p-4 bg-gray-50 rounded-md">
        <h5 className="font-bold mb-2 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4" /> ملاحظات التحليل
        </h5>
        <ul className="list-disc pr-5 space-y-1">
          <li>البنود المتأخرة هي التي تقل نسبة إنجازها عن النسبة المتوقعة بناءً على الفترة الزمنية من تاريخ البدء</li>
          <li>نسبة الخطر عالية: تأخر أكثر من 30% عن النسبة المتوقعة أو تجاوز تاريخ الانتهاء</li>
          <li>نسبة الخطر متوسطة: تأخر بين 20% و 30% عن النسبة المتوقعة</li>
          <li>نسبة الخطر منخفضة: تأخر أقل من 20% عن النسبة المتوقعة</li>
        </ul>
      </div>
    </Modal>
  );
};

export default ProjectAnalysisModal;
