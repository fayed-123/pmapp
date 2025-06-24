
import React from 'react';
import { ProjectItem } from '@/lib/types';
import { Button } from '@/components/ui/button';
import ItemsTable from '../ItemsTable';
import { AlertTriangle } from 'lucide-react';

interface ItemsSectionProps {
  items: ProjectItem[];
  canEdit: boolean;
  canReview: boolean;
  timeElapsed: number;
  expectedDays: number;
  onAddItem: () => void;
  onImportItems: () => void;
  onExportToExcel: () => void;
  onShowAnalysis: () => void;
  onEditItem: (item: ProjectItem) => void;
  onDeleteItem: (itemId: string) => void;
}

const ItemsSection: React.FC<ItemsSectionProps> = ({ 
  items, 
  canEdit, 
  canReview, 
  timeElapsed,
  expectedDays,
  onAddItem, 
  onImportItems,
  onExportToExcel,
  onShowAnalysis,
  onEditItem,
  onDeleteItem
}) => {
  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-2">
        <h4 className="font-bold text-lg flex items-center gap-2">
          <i className="fa fa-stream" /> بنود المقايسة
        </h4>
        
        {(canReview || items.some(item => item.progress < (timeElapsed / expectedDays) * 100)) && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onShowAnalysis}
            className="bg-yellow-100 text-yellow-800"
          >
            <AlertTriangle className="h-4 w-4 mr-1" /> تحليل البنود المتأخرة
          </Button>
        )}
      </div>
      
      {(canEdit || canReview) && (
        <div className="flex flex-wrap items-center gap-3 mb-3">
          {canEdit && (
            <>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onImportItems}
                className="bg-gray-100 text-indigo-700"
              >
                <i className="fa fa-file-import ml-1" /> استيراد من ملف
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onAddItem}
                className="bg-green-100 text-green-800"
              >
                <i className="fa fa-plus ml-1" /> إضافة بند
              </Button>
            </>
          )}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onExportToExcel}
            className="bg-blue-100 text-blue-800"
          >
            <i className="fa fa-file-export ml-1" /> تصدير إلى إكسل
          </Button>
        </div>
      )}
      
      <ItemsTable 
        items={items}
        canEdit={canEdit}
        canReview={canReview}
        onEdit={onEditItem}
        onDelete={onDeleteItem}
      />
    </div>
  );
};

export default ItemsSection;
