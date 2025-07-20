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
  User2,
  Crown,
  UserCheck,
  Check,
  X,
  Mail,
  Phone,
  Clock,
  Trash2,
  CheckCircle,
  Shield,
} from "lucide-react";

interface ConsultantsTabProps {
  users: User[];
  onAddUser: (
    name: string,
    // role: "consultant" | "mainConsultant" | "generalConsultant"
    role: "consultant" | "mainConsultant"
  ) => void;
  onApproveUser: (userId: string) => void;
  onDeleteUser: (userId: string) => void;
}

const ConsultantsTab: React.FC<ConsultantsTabProps> = ({
  users,
  onAddUser,
  onApproveUser,
  onDeleteUser,
}) => {
  const [newUserName, setNewUserName] = useState("");
  // const [newUserRole, setNewUserRole] = useState<
  //   "consultant" | "mainConsultant" | "generalConsultant"
  // >("consultant");
   const [newUserRole, setNewUserRole] = useState<"consultant" | "mainConsultant">(
    "consultant"
  );

  const handleAddUser = () => {
    if (newUserName.trim()) {
      onAddUser(newUserName, newUserRole);
      setNewUserName("");
    }
  };

  // const filteredUsers = users.filter((user) =>
  //   ["consultant", "mainConsultant", "generalConsultant"].includes(user.role)
  // );
    const filteredUsers = users.filter((user) =>
    ["consultant", "mainConsultant"].includes(user.role)
  );

  const getConsultantTypeConfig = (role: string) => {
    if (role === "mainConsultant") {
      return {
        text: "مشرف عام",
        icon: Crown,
        bgColor: "bg-purple-100",
        textColor: "text-purple-800",
        borderColor: "border-purple-200",
      };
    // } else if (role === "generalConsultant") {
    //   return {
    //     text: "استشاري عام",
    //     icon: Shield,
    //     bgColor: "bg-indigo-100",
    //     textColor: "text-indigo-800",
    //     borderColor: "border-indigo-200",
    //   };
    } else {
      return {
        text: "استشاري",
        icon: UserCheck,
        bgColor: "bg-blue-100",
        textColor: "text-blue-800",
        borderColor: "border-blue-200",
      };
    }
  };

  const approvedUsers = filteredUsers.filter((user) => user.approved);
  const pendingUsers = filteredUsers.filter((user) => !user.approved);
  const mainConsultants = filteredUsers.filter((user) => user.isMainConsultant);
  const regularConsultants = filteredUsers.filter(
    (user) => !user.isMainConsultant
  );

  const isProtectedUser = (user: User) => {
    return (
      user.name === MAIN_CONSULTANT_NAME && user.email === MAIN_CONSULTANT_EMAIL
    );
  };

  return (
    <div className="space-y-6">
      {/* Enhanced Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
            <User2 className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-800">
              إدارة الاستشاريين
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              المشرفين والاستشاريين - {filteredUsers.length} مستخدم
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white rounded-lg p-3 border border-gray-200 text-center">
            <div className="text-lg font-bold text-purple-600">
              {mainConsultants.length}
            </div>
            <div className="text-xs text-gray-600">مشرف عام</div>
          </div>
          <div className="bg-white rounded-lg p-3 border border-gray-200 text-center">
            <div className="text-lg font-bold text-blue-600">
              {regularConsultants.length}
            </div>
            <div className="text-xs text-gray-600">استشاري</div>
          </div>
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

      {/* Add Consultant Card */}
      <Card className="p-4 sm:p-6 shadow-sm border-0 bg-white">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
            <UserPlus className="w-4 h-4 text-green-600" />
          </div>
          <h4 className="text-lg font-semibold text-gray-800">
            إضافة استشاري جديد
          </h4>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="lg:col-span-2">
            <Input
              className="w-full"
              placeholder="اسم الاستشاري الجديد"
              value={newUserName}
              onChange={(e) => setNewUserName(e.target.value)}
            />
          </div>

          <div>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              value={newUserRole}
              onChange={(e) => setNewUserRole(e.target.value as any)}
            >
              <option value="consultant">استشاري</option>
              <option value="mainConsultant">مشرف عام</option>
              {/* <option value="generalConsultant">استشاري عام</option> */}
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
                    النوع
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
                    // const typeConfig = getConsultantTypeConfig(user.isMainConsultant || false);
                    const typeConfig = getConsultantTypeConfig(user.role);

                    const TypeIcon = typeConfig.icon;
                    const protected_user = isProtectedUser(user);

                    return (
                      <TableRow
                        key={user.id}
                        className="border-b hover:bg-gray-50 transition-colors"
                      >
                        <TableCell className="font-medium text-gray-900 py-4">
                          <div className="flex items-center gap-2">
                            {protected_user && (
                              <Shield className="h-4 w-4 text-purple-600" />
                            )}
                            {user.name}
                          </div>
                        </TableCell>
                        <TableCell className="text-gray-600">
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4" />
                            {user.email || "-"}
                          </div>
                        </TableCell>
                        <TableCell className="text-gray-600">
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4" />
                            {user.phone || "-"}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div
                            className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${typeConfig.bgColor} ${typeConfig.textColor} ${typeConfig.borderColor} border`}
                          >
                            <TypeIcon className="h-4 w-4" />
                            {typeConfig.text}
                          </div>
                        </TableCell>
                        <TableCell>
                          {user.approved ? (
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 border border-green-200">
                              <CheckCircle className="h-4 w-4" />
                              مفعل
                            </div>
                          ) : (
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
                              <Clock className="h-4 w-4" />
                              معلق
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
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
                            {!protected_user && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-600 hover:text-red-800 hover:bg-red-50"
                                onClick={() => onDeleteUser(user.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                            {protected_user && (
                              <div className="text-xs text-gray-400 px-2">
                                محمي
                              </div>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="py-12 text-center">
                      <div className="flex flex-col items-center gap-3 text-gray-400">
                        <User2 className="h-12 w-12" />
                        <p className="text-lg">لا يوجد استشاريون</p>
                        <p className="text-sm">ابدأ بإضافة استشاري جديد</p>
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
            // const typeConfig = getConsultantTypeConfig(user.isMainConsultant || false);
            const typeConfig = getConsultantTypeConfig(user.role);

            const TypeIcon = typeConfig.icon;
            const protected_user = isProtectedUser(user);

            return (
              <Card key={user.id} className="p-4 shadow-sm border-0 bg-white">
                <div className="space-y-3">
                  {/* User Name and Type */}
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        {protected_user && (
                          <Shield className="h-4 w-4 text-purple-600" />
                        )}
                        <h4 className="font-semibold text-gray-900 text-lg">
                          {user.name}
                        </h4>
                      </div>
                      <div
                        className={`inline-flex items-center gap-2 px-2 py-1 rounded-full text-xs font-medium mt-1 ${typeConfig.bgColor} ${typeConfig.textColor} ${typeConfig.borderColor} border`}
                      >
                        <TypeIcon className="h-3 w-3" />
                        {typeConfig.text}
                      </div>
                      {protected_user && (
                        <div className="text-xs text-purple-600 mt-1 flex items-center gap-1">
                          <Shield className="h-3 w-3" />
                          مستخدم محمي
                        </div>
                      )}
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
                    {!protected_user && (
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
                    )}
                    {protected_user && !user.approved && (
                      <div className="flex-1 text-center text-xs text-gray-400 py-2">
                        مستخدم محمي - لا يمكن الحذف
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            );
          })
        ) : (
          <Card className="p-8 text-center bg-white">
            <div className="flex flex-col items-center gap-3 text-gray-400">
              <User2 className="h-16 w-16" />
              <p className="text-lg">لا يوجد استشاريون</p>
              <p className="text-sm">ابدأ بإضافة استشاري جديد</p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ConsultantsTab;
