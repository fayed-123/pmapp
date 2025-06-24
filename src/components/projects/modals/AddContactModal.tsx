
import React from 'react';
import { Contact } from '@/lib/types';
import FormField from '@/components/FormField';
import Modal from '@/components/Modal';
import { Button } from '@/components/ui/button';

interface AddContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  newContact: Partial<Contact>;
  onContactChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
}

const AddContactModal: React.FC<AddContactModalProps> = ({ 
  isOpen, 
  onClose, 
  newContact, 
  onContactChange, 
  onSubmit 
}) => {
  const roleOptions = [
    { value: "owner", label: "مالك" },
    { value: "consultant", label: "استشاري" },
    { value: "contractor", label: "مقاول" },
    { value: "other", label: "آخر" },
  ];

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      title="إضافة جهة اتصال"
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <FormField
          label="الاسم"
          name="name"
          type="text"
          value={newContact.name}
          onChange={onContactChange}
          required
        />
        
        <FormField
          label="رقم الهاتف (واتساب)"
          name="phone"
          type="text"
          value={newContact.phone}
          onChange={onContactChange}
          required
        />
        
        <FormField
          label="الدور"
          name="role"
          type="select"
          options={roleOptions}
          value={newContact.role}
          onChange={onContactChange}
          required
        />
        
        <div className="flex justify-center">
          <Button type="submit">إضافة</Button>
        </div>
      </form>
    </Modal>
  );
};

export default AddContactModal;
