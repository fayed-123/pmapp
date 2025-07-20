import { useState, useEffect } from 'react';
import { Contact } from '@/lib/types';
import { loadContacts, saveContact, deleteContact } from '@/lib/db';
import { useToast } from '@/components/ui/use-toast';

export const useProjectContacts = (projectId: string) => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  // Load contacts on mount and when projectId changes
  useEffect(() => {
    const loadProjectContacts = async () => {
      setIsLoading(true);
      try {
        const allContacts = await loadContacts();
        setContacts(allContacts.filter(c => c.projectId === projectId));
      } catch (error) {
        console.error('Error loading contacts:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadProjectContacts();
  }, [projectId]);

  const addContact = async (newContact: Partial<Contact>) => {
    const contact: Contact = {
      id: Date.now().toString(),
      projectId: projectId,
      name: newContact.name || '',
      phone: newContact.phone || '',
      role: newContact.role || '',
    };
    
    try {
      const success = await saveContact(contact);
      if (success) {
        setContacts(prev => [...prev, contact]);
        
        toast({
          title: "تمت الإضافة",
          description: "تم إضافة جهة الاتصال بنجاح",
        });
        
        return contact;
      }
    } catch (error) {
      console.error('Error adding contact:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء إضافة جهة الاتصال",
        variant: "destructive"
      });
    }
  };

  const deleteContactHandler = async (contactId: string) => {
    try {
      const success = await deleteContact(contactId);
      if (success) {
        setContacts(prev => prev.filter(contact => contact.id !== contactId));
        
        toast({
          title: "تم الحذف",
          description: "تم حذف جهة الاتصال بنجاح",
        });
      }
    } catch (error) {
      console.error('Error deleting contact:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء حذف جهة الاتصال",
        variant: "destructive"
      });
    }
  };

  return {
    contacts,
    isLoading,
    addContact,
    deleteContact: deleteContactHandler
  };
};