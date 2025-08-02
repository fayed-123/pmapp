import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { User } from "@/lib/types";
import { MAIN_CONSULTANT_NAME, MAIN_CONSULTANT_EMAIL } from "@/constants/auth";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  UserPlus,
  Users,
  Building2,
  Wrench,
  Check,
  X,
  Mail,
  Phone,
  UserCheck,
  Clock,
  Trash2,
  CheckCircle,
} from "lucide-react";

interface UsersTabProps {
  users: User[];
  onAddUser: (
    name: string,
    role: "owner" | "contractor" | "consultant",
    isMainConsultant?: boolean
  ) => Promise<void>;
  onApproveUser: (userId: string) => Promise<void>;
  onDeleteUser: (userId: string) => Promise<void>;
}

const UsersTab: React.FC<UsersTabProps> = ({
  users,
  onAddUser,
  onApproveUser,
  onDeleteUser,
}) => {
  const [newUserName, setNewUserName] = useState("");
  const [newUserRole, setNewUserRole] = useState<"owner" | "contractor">(
    "owner"
  );

  const handleAddUser = () => {
    if (newUserName.trim()) {
      onAddUser(newUserName, newUserRole);
      setNewUserName("");
    }
  };

  const filteredUsers = users.filter(
    (user) => user.role === "owner" || user.role === "contractor"
  );

  const getRoleConfig = (role: string) => {
    switch (role) {
      case "owner":
        return {
          text: "مالك",
          icon: Building2,
          bgColor: "bg-yellow-100",
          textColor: "text-yellow-800",
          borderColor: "border-yellow-200",
        };
      case "contractor":
        return {
          text: "مقاول",
          icon: Wrench,
          bgColor: "bg-green-100",
          textColor: "text-green-800",
          borderColor: "border-green-200",
        };
      default:
        return {
          text: "مستخدم",
          icon: Users,
          bgColor: "bg-gray-100",
          textColor: "text-gray-800",
          borderColor: "border-gray-200",
        };
    }
  };

  const approvedUsers = filteredUsers.filter((user) => user.approved);
  const pendingUsers = filteredUsers.filter((user) => !user.approved);

  return (
    <div className="space-y-6">
      {/* Enhanced Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <Users className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-800">
              إدارة المستخدمين
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              المالكين والمقاولين - {filteredUsers.length} مستخدم
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-lg p-3 border border-gray-200 text-center">
            <div className="text-lg font-bold text-green-600">
              {approvedUsers.length}
            </div>
            <div className="text-xs text-gray-600">مفعل</div>
          </div>
          <div className="bg-white rounded-lg p-3 border border-gray-200 text-center">
            <div className="text-lg font-bold text-yellow-600">
              {pendingUsers.length}
            </div>
            <div className="text-xs text-gray-600">معلق</div>
          </div>
        </div>
      </div>

      {/* Add User Card */}
      <Card className="p-4 sm:p-6 shadow-sm border-0 bg-white">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
            <UserPlus className="w-4 h-4 text-green-600" />
          </div>
          <h4 className="text-lg font-semibold text-gray-800">
            إضافة مستخدم جديد
          </h4>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="lg:col-span-2">
            <Input
              className="w-full"
              placeholder="اسم المستخدم الجديد"
              value={newUserName}
              onChange={(e) => setNewUserName(e.target.value)}
            />
          </div>

          <div>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              value={newUserRole}
              onChange={(e) => setNewUserRole(e.target.value as any)}
            >
              <option value="owner">مالك</option>
              <option value="contractor">مقاول</option>
            </select>
          </div>

          <Button
            onClick={handleAddUser}
            disabled={!newUserName.trim()}
            className="bg-green-600 hover:bg-green-700 disabled:bg-gray-300 flex items-center gap-2"
          >
            <UserPlus className="w-4 h-4" />
            إضافة
          </Button>
        </div>
      </Card>

      {/* Desktop Table View */}
      <div className="hidden lg:block">
        <Card className="overflow-hidden shadow-sm border-0 bg-white">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 border-b">
                  <TableHead className="text-right font-semibold text-gray-700 py-4">
                    الاسم
                  </TableHead>
                  <TableHead className="text-right font-semibold text-gray-700">
                    البريد الإلكتروني
                  </TableHead>
                  <TableHead className="text-right font-semibold text-gray-700">
                    الهاتف
                  </TableHead>
                  <TableHead className="text-right font-semibold text-gray-700">
                    الدور
                  </TableHead>
                  <TableHead className="text-right font-semibold text-gray-700">
                    الحالة
                  </TableHead>
                  <TableHead className="text-center font-semibold text-gray-700">
                    الإجراءات
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => {
                    const roleConfig = getRoleConfig(user.role);
                    const RoleIcon = roleConfig.icon;

                    return (
                      <TableRow
                        key={user.id}
                        className="border-b hover:bg-gray-50 transition-colors"
                      >
                        <TableCell className="font-medium text-gray-900 py-4 text-center">
                          {user.name}
                        </TableCell>

                        <TableCell className="text-gray-600 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <Mail className="h-4 w-4" />
                            {user.email || "-"}
                          </div>
                        </TableCell>

                        <TableCell className="text-gray-600 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <Phone className="h-4 w-4" />
                            {user.phone || "-"}
                          </div>
                        </TableCell>

                        <TableCell className="text-center w-[1%] whitespace-nowrap">
                          <div
                            className={`inline-flex items-center justify-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${roleConfig.bgColor} ${roleConfig.textColor} ${roleConfig.borderColor} border`}
                          >
                            <RoleIcon className="h-4 w-4" />
                            {roleConfig.text}
                          </div>
                        </TableCell>

                        <TableCell className="text-center w-[1%] whitespace-nowrap">
                          {user.approved ? (
                            <div className="inline-flex items-center justify-center gap-2 px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 border border-green-200">
                              <CheckCircle className="h-4 w-4" />
                              مفعل
                            </div>
                          ) : (
                            <div className="inline-flex items-center justify-center gap-2 px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
                              <Clock className="h-4 w-4" />
                              معلق
                            </div>
                          )}
                        </TableCell>

                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-2">
                            {!user.approved && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-green-600 hover:text-green-800 hover:bg-green-50"
                                onClick={() => onApproveUser(user.id)}
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:text-red-800 hover:bg-red-50"
                              onClick={() => onDeleteUser(user.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="py-12 text-center">
                      <div className="flex flex-col items-center gap-3 text-gray-400">
                        <Users className="h-12 w-12" />
                        <p className="text-lg">لا يوجد مستخدمون</p>
                        <p className="text-sm">ابدأ بإضافة مستخدم جديد</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>

      {/* Mobile Card View */}
      <div className="lg:hidden space-y-4">
        {filteredUsers.length > 0 ? (
          filteredUsers.map((user) => {
            const roleConfig = getRoleConfig(user.role);
            const RoleIcon = roleConfig.icon;

            return (
              <Card key={user.id} className="p-4 shadow-sm border-0 bg-white">
                <div className="space-y-3">
                  {/* User Name and Role */}
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold text-gray-900 text-lg">
                        {user.name}
                      </h4>
                      <div
                        className={`inline-flex items-center gap-2 px-2 py-1 rounded-full text-xs font-medium mt-1 ${roleConfig.bgColor} ${roleConfig.textColor} ${roleConfig.borderColor} border`}
                      >
                        <RoleIcon className="h-3 w-3" />
                        {roleConfig.text}
                      </div>
                    </div>

                    {/* Status */}
                    <div>
                      {user.approved ? (
                        <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                          <CheckCircle className="h-3 w-3" />
                          مفعل
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
                          <Clock className="h-3 w-3" />
                          معلق
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      <span>{user.email || "لا يوجد بريد إلكتروني"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      <span>{user.phone || "لا يوجد هاتف"}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2 border-t">
                    {!user.approved && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 text-green-600 border-green-200 hover:bg-green-50"
                        onClick={() => onApproveUser(user.id)}
                      >
                        <Check className="h-4 w-4 ml-1" />
                        موافقة
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      className={`text-red-600 border-red-200 hover:bg-red-50 ${
                        !user.approved ? "" : "flex-1"
                      }`}
                      onClick={() => onDeleteUser(user.id)}
                    >
                      <Trash2 className="h-4 w-4 ml-1" />
                      حذف
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })
        ) : (
          <Card className="p-8 text-center bg-white">
            <div className="flex flex-col items-center gap-3 text-gray-400">
              <Users className="h-16 w-16" />
              <p className="text-lg">لا يوجد مستخدمون</p>
              <p className="text-sm">ابدأ بإضافة مستخدم جديد</p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default UsersTab;
