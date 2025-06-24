
import React from 'react';
import { Contact } from '@/lib/types';
import { Button } from '@/components/ui/button';
import ContactsTable from '../ContactsTable';

interface ContactsSectionProps {
  contacts: Contact[];
  canEdit: boolean;
  onAddContact: () => void;
  onDeleteContact: (contactId: string) => void;
}

const ContactsSection: React.FC<ContactsSectionProps> = ({ 
  contacts, 
  canEdit, 
  onAddContact, 
  onDeleteContact 
}) => {
  return (
    <div>
      <h4 className="font-bold text-lg mb-2 flex items-center gap-2">
        <i className="fa fa-address-book" /> جهات الاتصال
      </h4>
      
      {canEdit && (
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onAddContact}
          className="bg-green-100 text-green-800 mb-3"
        >
          <i className="fa fa-plus ml-1" /> إضافة جهة اتصال
        </Button>
      )}
      
      <ContactsTable 
        contacts={contacts}
        canEdit={canEdit}
        onDelete={onDeleteContact}
      />
    </div>
  );
};

export default ContactsSection;
