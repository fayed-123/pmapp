
import React from 'react';
import { ProjectItem } from '@/lib/types';
import FormField from '@/components/FormField';
import Modal from '@/components/Modal';
import { Button } from '@/components/ui/button';

interface AddItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  newItem: Partial<ProjectItem>;
  onItemChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
}

const AddItemModal: React.FC<AddItemModalProps> = ({ 
  isOpen, 
  onClose, 
  newItem, 
  onItemChange, 
  onSubmit
}) => {
  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      title="إضافة بند جديد"
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <FormField
          label="رقم البند"
          name="itemNumber"
          type="text"
          value={newItem.itemNumber}
          onChange={onItemChange}
          required
        />
        
        <FormField
          label="اسم البند"
          name="name"
          type="text"
          value={newItem.name}
          onChange={onItemChange}
          required
        />
        
        <FormField
          label="نسبة الإنجاز (0-100%)"
          name="progress"
          type="number"
          value={newItem.progress}
          onChange={onItemChange}
          required
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label="تاريخ البدء"
            name="startDate"
            type="date"
            value={newItem.startDate}
            onChange={onItemChange}
            required
          />
          
          <FormField
            label="تاريخ الانتهاء"
            name="endDate"
            type="date"
            value={newItem.endDate}
            onChange={onItemChange}
            required
          />
        </div>
        
        <FormField
          label="زمن التنفيذ (أيام)"
          name="executionTime"
          type="number"
          value={newItem.executionTime}
          onChange={onItemChange}
          required
          placeholder="يتم حسابه تلقائيًا من التواريخ"
        />
        
        <div className="flex justify-center">
          <Button type="submit">إضافة</Button>
        </div>
      </form>
    </Modal>
  );
};

export default AddItemModal;
