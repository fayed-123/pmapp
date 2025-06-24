
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { User } from '@/lib/types';
import { MAIN_CONSULTANT_NAME, MAIN_CONSULTANT_EMAIL } from '@/constants/auth';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';

interface ConsultantsTabProps {
  users: User[];
  onAddUser: (name: string, role: "consultant", isMainConsultant?: boolean) => void;
  onApproveUser: (userId: string) => void;
  onDeleteUser: (userId: string) => void;
}

const ConsultantsTab: React.FC<ConsultantsTabProps> = ({ users, onAddUser, onApproveUser, onDeleteUser }) => {
  const [newUserName, setNewUserName] = useState('');
  const [newUserRole, setNewUserRole] = useState<'consultant' | 'mainConsultant'>('consultant');

  const handleAddUser = () => {
    if (newUserName.trim()) {
      const isMainConsultant = newUserRole === 'mainConsultant';
      onAddUser(newUserName, 'consultant', isMainConsultant);
      setNewUserName('');
    }
  };

  const filteredUsers = users.filter(user => 
    user.role === 'consultant' || user.role === 'mainConsultant'
  );

  return (
    <div>
      <h3 className="font-bold mb-2 flex items-center gap-2">
        <i className="fa fa-user-tie" /> إدارة الاستشاريين
      </h3>
      
      <Card className="p-4 mb-4">
        <h4 className="font-bold mb-3">إضافة استشاري جديد</h4>
        <div className="flex gap-2 flex-wrap">
          <Input 
            className="flex-1 min-w-[200px]" 
            placeholder="اسم الاستشاري" 
            value={newUserName}
            onChange={(e) => setNewUserName(e.target.value)}
          />
          <select 
            className="px-2 py-1 border rounded min-w-[150px]"
            value={newUserRole}
            onChange={(e) => setNewUserRole(e.target.value as any)}
          >
            <option value="consultant">استشاري</option>
            <option value="mainConsultant">مشرف عام</option>
          </select>
          <Button 
            onClick={handleAddUser}
            className="bg-green-600 hover:bg-green-700"
          >
            إضافة
          </Button>
        </div>
      </Card>
      
      <Card className="overflow-x-auto mb-4">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-100">
              <TableHead className="text-right">الاسم</TableHead>
              <TableHead className="text-right">البريد</TableHead>
              <TableHead className="text-right">الهاتف</TableHead>
              <TableHead className="text-right">النوع</TableHead>
              <TableHead className="text-right">الحالة</TableHead>
              <TableHead className="text-right">الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.length > 0 ? (
              filteredUsers.map(user => (
                <TableRow key={user.id} className="border-t">
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.phone}</TableCell>
                  <TableCell>
                    {user.isMainConsultant ? "مشرف عام" : "استشاري"}
                  </TableCell>
                  <TableCell>
                    {user.approved ? (
                      <span className="text-green-600 font-bold">✓ مفعل</span>
                    ) : (
                      <span className="text-yellow-700">في انتظار الموافقة</span>
                    )}
                  </TableCell>
                  <TableCell className="flex gap-2">
                    {!user.approved && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="bg-green-200 text-green-800 font-bold"
                        onClick={() => onApproveUser(user.id)}
                      >
                        موافقة
                      </Button>
                    )}
                    {(user.name !== MAIN_CONSULTANT_NAME && user.email !== MAIN_CONSULTANT_EMAIL) && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="bg-red-200 text-red-800 font-bold"
                        onClick={() => onDeleteUser(user.id)}
                      >
                        حذف
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="py-8 text-center text-gray-400">
                  لا يوجد استشاريون
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

export default ConsultantsTab;
