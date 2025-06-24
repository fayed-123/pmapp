
import React from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import ConsultantDashboard from '@/components/dashboards/ConsultantDashboard';
import OwnerDashboard from '@/components/dashboards/OwnerDashboard';
import ContractorDashboard from '@/components/dashboards/ContractorDashboard';
import MainConsultantDashboard from '@/components/dashboards/MainConsultantDashboard';
import { Badge } from '@/components/ui/badge';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();

  if (!user) {
    return null;
  }

  const renderRoleBadge = () => {
    const roleText = 
      user.role === 'mainConsultant' ? 'مشرف عام' :
      user.role === 'consultant' ? 'استشاري' : 
      user.role === 'owner' ? 'مالك' : 'مقاول';
    
    const badgeColor = 
      user.role === 'mainConsultant' ? 'bg-purple-200 text-purple-800' :
      user.role === 'consultant' ? 'bg-blue-200 text-blue-800' : 
      user.role === 'owner' ? 'bg-yellow-200 text-yellow-800' : 
      'bg-green-200 text-green-800';
    
    return (
      <Badge variant="outline" className={`mr-2 ${badgeColor}`}>
        {roleText}
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
        return <div>لوحة التحكم غير متوفرة لهذا الدور.</div>;
    }
  };

  return (
    <div>
      <div className="flex flex-row justify-between items-center mb-6">
        <div className="flex items-center">
          <strong className="ml-1">مرحباً، </strong>
          <span>{user.name}</span>
          {renderRoleBadge()}
        </div>
        <Button 
          onClick={logout} 
          variant="outline"
          className="text-red-500 hover:text-red-800 hover:bg-red-50 border-red-200"
        >
          <i className="fa fa-sign-out-alt ml-1"></i> خروج
        </Button>
      </div>
      
      {renderDashboard()}
    </div>
  );
};

export default Dashboard;
