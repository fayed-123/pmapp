
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Contact } from '@/lib/types';

interface ContactsTableProps {
  contacts: Contact[];
  canEdit: boolean;
  onDelete: (contactId: string) => void;
}

const ContactsTable: React.FC<ContactsTableProps> = ({ contacts, canEdit, onDelete }) => {
  return (
    <Card className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="bg-gray-50">
            <th className="p-2 text-right">الإسم</th>
            <th className="p-2 text-right">الهاتف</th>
            <th className="p-2 text-right">الدور</th>
            {canEdit && <th className="p-2 text-right">حذف</th>}
          </tr>
        </thead>
        <tbody>
          {contacts.length > 0 ? (
            contacts.map(contact => (
              <tr key={contact.id} className="border-t">
                <td className="p-2">{contact.name}</td>
                <td className="p-2">{contact.phone}</td>
                <td className="p-2">
                  {contact.role === "consultant" ? "استشاري" : 
                   contact.role === "owner" ? "مالك" : 
                   contact.role === "contractor" ? "مقاول" : contact.role}
                </td>
                {canEdit && (
                  <td className="p-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => onDelete(contact.id)}
                      className="text-red-600 hover:text-red-800 hover:bg-red-50"
                    >
                      <i className="fa fa-trash" />
                    </Button>
                  </td>
                )}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={canEdit ? 4 : 3} className="text-gray-400 text-center p-4">
                لا توجد جهات اتصال
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </Card>
  );
};

export default ContactsTable;
