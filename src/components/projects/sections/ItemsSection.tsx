import React, { useState } from 'react';
import { Project, ProjectItem } from '@/lib/types';
import { Button } from '@/components/ui/button';
import ItemsTable from '../ItemsTable';
import { AlertTriangle, Info } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import ItemsCards from './ItemsCards';

interface ItemsSectionProps {
  items: ProjectItem[];
  canEdit: boolean;
  canReview: boolean;
  timeElapsed: number;
  expectedDays: number;
  project: Project;
  onAddItem: () => void;
  onImportItems: () => void;
  onExportToExcel: () => void;
  onShowAnalysis: () => void;
  onEditItem: (item: ProjectItem) => void;
  onDeleteItem: (itemId: string) => void;
  onSubmitItems: () => void;
  onApproveItem?: (itemId: string) => void;
  onRejectItem?: (itemId: string) => void;
  refreshItems?: () => Promise<void>;
}

const ItemsSection: React.FC<ItemsSectionProps> = ({
  items,
  canEdit,
  canReview,
  timeElapsed,
  expectedDays,
  project,
  onAddItem,
  onImportItems,
  onExportToExcel,
  onShowAnalysis,
  onEditItem,
  onDeleteItem,
  onSubmitItems,
  onApproveItem,
  onRejectItem,
  refreshItems,
}) => {
  const { user } = useAuth();
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  console.log("🎴 ItemsSection received items:", items.length, items);
  console.log("🎴 ItemsSection permissions:", { canEdit, canReview });

  // Check if user can edit items (based on workflow assignment)
  const userCanEditItems = () => {
    if (!user) return false;
    console.log("🔍 Checking edit permissions for user:", user.role, user.id);

    // Subcontractors can edit items if they're assigned to the project
    if (user.role === 'subcontractor') {
      const canEditResult = (
        project.electricalcontractorid === user.id ||
        project.architectcontractorid === user.id ||
        project.mechanicalcontractorid === user.id
      );
      console.log("🔧 Subcontractor edit check:", { canEditResult, userAssignments: {
        electrical: project.electricalcontractorid,
        architect: project.architectcontractorid, 
        mechanical: project.mechanicalcontractorid
      }});
      return canEditResult;
    }
    
    // Other roles can edit based on workflow assignment
    return items.some(item => item.assigned_to_user_id === user.id);
  };

  const canUserEdit = userCanEditItems();

  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-2">
        <h4 className="font-bold text-lg flex items-center gap-2">
          <i className="fa fa-stream" /> بنود المقايسة
        </h4>

        <div className="flex items-center gap-2">
          {/* Show analysis button for late items or users who can review */}
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

      {/* Workflow Status Info */}
      {items.length > 0 && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-2">
            <Info className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="text-sm">
              <p className="text-blue-800 font-medium">
                نظام سير العمل الجديد: يتم التحكم في المراحل على مستوى مجموعات البنود
              </p>
              <p className="text-blue-700 mt-1">
                • يمكن مراجعة البنود بشكل فردي للتتبع والتعليقات
                • الانتقال للمرحلة التالية يتم على مستوى كامل مجموعة البنود من نفس النوع
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Action buttons row */}
      <div className="flex flex-wrap items-center gap-3 mb-3">
        {/* Show buttons based on user role and workflow state */}
        {canUserEdit && (
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

        {!canUserEdit && items.length > 0 && (
          <div className="flex items-center gap-2 bg-yellow-50 text-yellow-800 px-3 py-2 rounded-lg border border-yellow-200">
            <AlertTriangle className="h-4 w-4" />
            <span className="text-sm font-medium">
              عرض فقط - لا يمكن تعديل البنود في هذه المرحلة
            </span>
          </div>
        )}
      </div>

      {/* Items display based on view mode - Show for visibility only */}
      {viewMode === 'cards' ? (
        <ItemsCards
          items={items}
          canEdit={canUserEdit} // Updated to use workflow-based edit permissions
          canReview={false} // Individual review disabled - handled by bunch control
          onEdit={onEditItem}
          onDelete={onDeleteItem}
          onApproveItem={onApproveItem}
          onRejectItem={onRejectItem}
          refreshItems={refreshItems}
        />
      ) : (
        <ItemsTable
          items={items}
          canEdit={canUserEdit} // Updated to use workflow-based edit permissions
          canReview={false} // Individual review disabled - handled by bunch control
          onEdit={onEditItem}
          onDelete={onDeleteItem}
          onApproveItem={onApproveItem}
          onRejectItem={onRejectItem}
          refreshItems={refreshItems}
        />
      )}
    </div>
  );
};

export default ItemsSection;