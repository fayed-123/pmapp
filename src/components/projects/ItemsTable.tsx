

import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ProjectItem } from '@/lib/types';
import { Pencil, Trash2, AlertTriangle } from "lucide-react";

interface ItemsTableProps {
  items: ProjectItem[];
  canEdit: boolean;
  canReview: boolean;
  onEdit: (item: ProjectItem) => void;
  onDelete: (itemId: string) => void;
}

const ItemsTable: React.FC<ItemsTableProps> = ({ items, canEdit, canReview, onEdit, onDelete }) => {
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <Card className="overflow-x-auto mb-4">
      <table className="w-full">
        <thead>
          <tr className="bg-gray-50">
            <th className="p-2 text-right">رقم البند</th>
            <th className="p-2 text-right">البند</th>
            <th className="p-2 text-right">نسبة الإنجاز</th>
            <th className="p-2 text-right">تاريخ البدء</th>
            <th className="p-2 text-right">تاريخ الانتهاء</th>
            <th className="p-2 text-right">زمن التنفيذ (أيام)</th>
            <th className="p-2 text-right">الوزن النسبي</th>
            <th className="p-2 text-right">نسبة الإنجاز الموزونة</th>
            <th className="p-2 text-right">مستوى الخطر</th>
            {(canEdit || canReview) && <th className="p-2 text-right">التحكم</th>}
          </tr>
        </thead>
        <tbody>
          {items.length > 0 ? (
            items.map((item, index) => (
              <tr key={item.id} className="border-t">
                <td className="p-2">{item.itemNumber || index + 1}</td>
                <td className="p-2">{item.name}</td>
                <td className="p-2">{item.progress || 0}</td>
                <td className="p-2">{formatDate(item.startDate)}</td>
                <td className="p-2">{formatDate(item.endDate)}</td>
                <td className="p-2">{item.executionTime || 0}</td>
                <td className="p-2">{item.weight ? item.weight.toFixed(4) : '-'}</td>
                <td className="p-2">{item.weightedProgress ? item.weightedProgress.toFixed(2) : '0.00'}</td>
                <td className="p-2">
                  {item.riskLevel === 'high' && <span className="text-red-600 font-bold flex items-center gap-1"><AlertTriangle className="h-4 w-4" /> عالي</span>}
                  {item.riskLevel === 'medium' && <span className="text-yellow-600 font-bold">متوسط</span>}
                  {item.riskLevel === 'low' && <span className="text-green-600 font-bold">منخفض</span>}
                  {!item.riskLevel && <span className="text-gray-400">-</span>}
                </td>
                {(canEdit || canReview) && (
                  <td className="p-2 flex gap-2 justify-end">
                    {(canEdit || canReview) && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => onEdit(item)}
                        className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 flex gap-1"
                      >
                        <Pencil className="h-4 w-4" />
                        تعديل
                      </Button>
                    )}
                    {canEdit && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => onDelete(item.id)}
                        className="text-red-600 hover:text-red-800 hover:bg-red-50 flex gap-1"
                      >
                        <Trash2 className="h-4 w-4" />
                        حذف
                      </Button>
                    )}
                  </td>
                )}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={(canEdit || canReview) ? 10 : 9} className="text-gray-400 text-center p-4">
                لا توجد بنود
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </Card>
  );
};

export default ItemsTable;

