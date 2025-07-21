import React, { useState } from 'react';
import { ProjectItem } from '@/lib/types';
import { Button } from '@/components/ui/button';
import ItemsTable from '../ItemsTable';
import { AlertTriangle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import ItemsCards from './ItemsCards';


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
  onSubmitItems: () => void;
  onApproveItem?: (itemId: string) => void;
  onRejectItem?: (itemId: string) => void;
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
  onDeleteItem,
  onSubmitItems,
  onApproveItem,
  onRejectItem
}) => {
  const { user } = useAuth();
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');


  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-2">
        <h4 className="font-bold text-lg flex items-center gap-2">
          <i className="fa fa-stream" /> بنود المقايسة
        </h4>

        <div className="flex items-center gap-2">
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

          <Button
            variant="outline"
            size="sm"
            onClick={() => setViewMode(viewMode === 'cards' ? 'table' : 'cards')}
            className="bg-gray-100 text-gray-700"
          >
            {viewMode === 'cards' ? '📋 عرض جدول' : '📱 عرض بطاقات'}
          </Button>
        </div>
      </div>

      {(canEdit || canReview) && (
        <div className="flex flex-wrap items-center gap-3 mb-3">
          {/* Show buttons based on user role instead of canEdit */}
          {(user.role === "contractor" || user.role === "subcontractor") && (
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
              <Button
                variant="outline"
                size="sm"
                onClick={onSubmitItems}
                className="bg-blue-100 text-blue-800"
              >
                <i className="fa fa-paper-plane ml-1" /> تقديم البنود للمراجعة
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

      {viewMode === 'cards' ? (
        <ItemsCards
          items={items}
          canEdit={canEdit}
          canReview={canReview}
          onEdit={onEditItem}
          onDelete={onDeleteItem}
          onApproveItem={onApproveItem}
          onRejectItem={onRejectItem}
        />
      ) : (
        <ItemsTable
          items={items}
          canEdit={canEdit}
          canReview={canReview}
          onEdit={onEditItem}
          onDelete={onDeleteItem}
          onApproveItem={onApproveItem}
          onRejectItem={onRejectItem}
        />
      )}
    </div>
  );
};

export default ItemsSection;
