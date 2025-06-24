
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { User } from '@/lib/types';
import { MAIN_CONSULTANT_NAME, MAIN_CONSULTANT_EMAIL } from '@/constants/auth';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';

interface UsersTabProps {
  users: User[];
  onAddUser: (name: string, role: "owner" | "contractor" | "consultant", isMainConsultant?: boolean) => void;
  onApproveUser: (userId: string) => void;
  onDeleteUser: (userId: string) => void;
}

const UsersTab: React.FC<UsersTabProps> = ({ users, onAddUser, onApproveUser, onDeleteUser }) => {
  const [newUserName, setNewUserName] = useState('');
  const [newUserRole, setNewUserRole] = useState<'owner' | 'contractor'>('owner');

  const handleAddUser = () => {
    if (newUserName.trim()) {
      onAddUser(newUserName, newUserRole);
      setNewUserName('');
    }
  };

  const filteredUsers = users.filter(user => 
    user.role === 'owner' || user.role === 'contractor'
  );

  return (
    <div>
      <h3 className="font-bold mb-2 flex items-center gap-2">
        <i className="fa fa-user-cog" /> إدارة المستخدمين
      </h3>
      
      <Card className="p-4 mb-4">
        <h4 className="font-bold mb-3">إضافة مستخدم جديد</h4>
        <div className="flex gap-2 flex-wrap">
          <Input 
            className="flex-1 min-w-[200px]" 
            placeholder="اسم المستخدم" 
            value={newUserName}
            onChange={(e) => setNewUserName(e.target.value)}
          />
          <select 
            className="px-2 py-1 border rounded min-w-[150px]"
            value={newUserRole}
            onChange={(e) => setNewUserRole(e.target.value as any)}
          >
            <option value="owner">مالك</option>
            <option value="contractor">مقاول</option>
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
              <TableHead className="text-right">الدور</TableHead>
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
                    {user.role === "owner" ? "مالك" : "مقاول"}
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
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="bg-red-200 text-red-800 font-bold"
                      onClick={() => onDeleteUser(user.id)}
                    >
                      حذف
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="py-8 text-center text-gray-400">
                  لا يوجد مستخدمون
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

export default UsersTab;
