import React from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import ConsultantDashboard from '@/components/dashboards/ConsultantDashboard';
import OwnerDashboard from '@/components/dashboards/OwnerDashboard';
import ContractorDashboard from '@/components/dashboards/ContractorDashboard';
import MainConsultantDashboard from '@/components/dashboards/MainConsultantDashboard';
import { Badge } from '@/components/ui/badge';
import { LogOut, User, Crown, UserCheck, Building2, Wrench } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();

  if (!user) {
    return null;
  }

  const getRoleConfig = () => {
    switch (user.role) {
      case 'mainConsultant':
        return {
          text: 'مشرف عام',
          icon: Crown,
          badgeClasses: 'bg-purple-100 text-purple-800 border-purple-200',
          iconClasses: 'text-purple-600'
        };
      case 'consultant':
        return {
          text: 'استشاري',
          icon: UserCheck,
          badgeClasses: 'bg-blue-100 text-blue-800 border-blue-200',
          iconClasses: 'text-blue-600'
        };
      case 'owner':
        return {
          text: 'مالك',
          icon: Building2,
          badgeClasses: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          iconClasses: 'text-yellow-600'
        };
      case 'contractor':
        return {
          text: 'مقاول',
          icon: Wrench,
          badgeClasses: 'bg-green-100 text-green-800 border-green-200',
          iconClasses: 'text-green-600'
        };
      default:
        return {
          text: 'مستخدم',
          icon: User,
          badgeClasses: 'bg-gray-100 text-gray-800 border-gray-200',
          iconClasses: 'text-gray-600'
        };
    }
  };

  const renderRoleBadge = () => {
    const config = getRoleConfig();
    const RoleIcon = config.icon;
    
    return (
      <Badge variant="outline" className={`flex items-center gap-1.5 px-3 py-1.5 font-medium ${config.badgeClasses}`}>
        <RoleIcon className={`w-4 h-4 ${config.iconClasses}`} />
        <span>{config.text}</span>
      </Badge>
    );
  };

  const renderDashboard = () => {
    switch (user.role) {
      case 'mainConsultant':
        return <MainConsultantDashboard />;
      case 'consultant':
        return <ConsultantDashboard />;
      case 'owner':
        return <OwnerDashboard />;
      case 'contractor':
        return <ContractorDashboard />;
      default:
        return (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
            <div className="text-gray-400 mb-4">
              <User className="w-12 h-12 mx-auto mb-3" />
              <p className="text-lg font-medium">لوحة التحكم غير متوفرة</p>
              <p className="text-sm">هذا الدور غير مدعوم حالياً</p>
            </div>
          </div>
        );
    }
  };

  const getGreetingTime = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'صباح الخير';
    if (hour < 17) return 'مساء الخير';
    return 'مساء الخير';
  };

  return (
    <div className="space-y-6">
      {/* Enhanced Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* User Info Section */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            {/* Avatar and Greeting */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
                <User className="w-6 h-6 text-white" />
              </div>
              <div className="min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                  <span className="text-gray-600 text-sm">{getGreetingTime()}،</span>
                  <span className="font-semibold text-gray-800 text-lg truncate">{user.name}</span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">أهلاً وسهلاً بك في النظام</p>
              </div>
            </div>
            
            {/* Role Badge */}
            <div className="ml-0 sm:ml-3">
              {renderRoleBadge()}
            </div>
          </div>

          {/* Logout Button */}
          <Button 
            onClick={logout} 
            variant="outline"
            size="sm"
            className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 hover:border-red-300 transition-all duration-200 flex items-center gap-2 self-start sm:self-center"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">خروج</span>
            <span className="sm:hidden">خروج</span>
          </Button>
        </div>
      </div>

      {/* Dashboard Content */}
      <div>
        {renderDashboard()}
      </div>
    </div>
  );
};

export default Dashboard;