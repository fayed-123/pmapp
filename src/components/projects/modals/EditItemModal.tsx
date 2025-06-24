
import React from 'react';
import { ProjectItem } from '@/lib/types';
import FormField from '@/components/FormField';
import Modal from '@/components/Modal';
import { Button } from '@/components/ui/button';

interface EditItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingItem: ProjectItem | null;
  onItemChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
}

const EditItemModal: React.FC<EditItemModalProps> = ({ 
  isOpen, 
  onClose, 
  editingItem, 
  onItemChange, 
  onSubmit 
}) => {
  if (!editingItem) return null;

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      title="تعديل البند"
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <FormField
          label="رقم البند"
          name="itemNumber"
          type="text"
          value={editingItem.itemNumber}
          onChange={onItemChange}
          required
        />
        
        <FormField
          label="اسم البند"
          name="name"
          type="text"
          value={editingItem.name}
          onChange={onItemChange}
          required
        />
        
        <FormField
          label="نسبة الإنجاز (0-100%)"
          name="progress"
          type="number"
          value={editingItem.progress}
          onChange={onItemChange}
          required
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label="تاريخ البدء"
            name="startDate"
            type="date"
            value={editingItem.startDate}
            onChange={onItemChange}
            required
          />
          
          <FormField
            label="تاريخ الانتهاء"
            name="endDate"
            type="date"
            value={editingItem.endDate}
            onChange={onItemChange}
            required
          />
        </div>
        
        <FormField
          label="زمن التنفيذ (أيام)"
          name="executionTime"
          type="number"
          value={editingItem.executionTime}
          onChange={onItemChange}
          required
          placeholder="يتم حسابه تلقائيًا من التواريخ"
        />
        
        <div className="flex justify-center">
          <Button type="submit">حفظ التعديلات</Button>
        </div>
      </form>
    </Modal>
  );
};

export default EditItemModal;
