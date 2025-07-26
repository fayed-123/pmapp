import React from 'react';
import { Contact } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import ContactsTable from '../ContactsTable';
import { Users, UserPlus, Phone } from 'lucide-react';

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
    <div className="space-y-4">
      {/* Enhanced Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <Users className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h4 className="text-xl font-bold text-gray-800">جهات الاتصال</h4>
            <p className="text-sm text-gray-600 mt-1">
              {contacts.length > 0 ? `${contacts.length} جهة اتصال` : 'لا توجد جهات اتصال'}
            </p>
          </div>
        </div>
        
        {/* Add Contact Button */}
        {canEdit && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onAddContact}
            className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100 hover:border-green-300 flex items-center gap-2 self-start sm:self-center"
          >
            <UserPlus className="w-4 h-4" />
            <span className="hidden sm:inline">إضافة جهة اتصال</span>
            <span className="sm:hidden">إضافة</span>
          </Button>
        )}
      </div>

      {/* Contacts Table/Content */}
      <Card className="shadow-sm border-0 bg-white overflow-hidden">
        {contacts.length > 0 ? (
          <ContactsTable 
            contacts={contacts}
            canEdit={canEdit}
            onDelete={onDeleteContact}
          />
        ) : (
          /* Enhanced Empty State */
          <div className="p-8 sm:p-12 text-center">
            <div className="flex flex-col items-center gap-4 text-gray-400">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                <Phone className="w-8 h-8" />
              </div>
              <div>
                <h5 className="text-lg font-semibold text-gray-600 mb-2">لا توجد جهات اتصال</h5>
                <p className="text-sm text-gray-500 mb-4 max-w-md">
                  لم يتم إضافة أي جهات اتصال لهذا المشروع بعد.
                  {canEdit && ' ابدأ بإضافة جهة اتصال جديدة.'}
                </p>
                
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Quick Stats (if contacts exist) */}
      {contacts.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="p-4 text-center shadow-sm border-0 bg-white">
            <div className="text-2xl font-bold text-blue-600">{contacts.length}</div>
            <div className="text-sm text-gray-600">إجمالي جهات الاتصال</div>
          </Card>
          
          <Card className="p-4 text-center shadow-sm border-0 bg-white">
            <div className="text-2xl font-bold text-green-600">
              {contacts.filter(c => c.phone || c.phone).length}
            </div>
            <div className="text-sm text-gray-600">لديهم أرقام هواتف</div>
          </Card>
          
          <Card className="p-4 text-center shadow-sm border-0 bg-white">
            <div className="text-2xl font-bold text-purple-600">
              {contacts.filter(c => c.projectId).length}
            </div>
            <div className="text-sm text-gray-600">لديهم بريد مشريع</div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ContactsSection;