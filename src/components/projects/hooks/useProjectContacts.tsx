
import { useState, useEffect } from 'react';
import { Contact } from '@/lib/types';
import { loadContacts, saveContacts } from '@/lib/db';
import { useToast } from '@/components/ui/use-toast';

export const useProjectContacts = (projectId: string) => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const { toast } = useToast();
  
  useEffect(() => {
    setContacts(loadContacts().filter(c => c.projectId === projectId));
  }, [projectId]);

  const addContact = (newContact: Partial<Contact>) => {
    const contact: Contact = {
      id: Date.now().toString(),
      projectId: projectId,
      name: newContact.name || '',
      phone: newContact.phone || '',
      role: newContact.role || '',
    };
    
    const updatedContacts = [...contacts, contact];
    setContacts(updatedContacts);
    saveContacts([...loadContacts().filter(c => c.projectId !== projectId), ...updatedContacts]);
    
    toast({
      title: "تمت الإضافة",
      description: "تم إضافة جهة الاتصال بنجاح",
    });
    
    return contact;
  };

  const deleteContact = (contactId: string) => {
    const updatedContacts = contacts.filter(contact => contact.id !== contactId);
    setContacts(updatedContacts);
    saveContacts([...loadContacts().filter(c => c.projectId !== projectId), ...updatedContacts]);
    
    toast({
      title: "تم الحذف",
      description: "تم حذف جهة الاتصال بنجاح",
    });
  };

  return {
    contacts,
    addContact,
    deleteContact
  };
};
