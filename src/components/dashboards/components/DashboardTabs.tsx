
import React from 'react';
import { Button } from '@/components/ui/button';
import { Tab } from '../types/dashboardTypes';

interface DashboardTabsProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

const DashboardTabs: React.FC<DashboardTabsProps> = ({ activeTab, onTabChange }) => {
  return (
    <div className="flex flex-wrap gap-6 mb-6">
      <Button 
        variant={activeTab === Tab.Projects ? "default" : "outline"} 
        onClick={() => onTabChange(Tab.Projects)}
        className={`${activeTab === Tab.Projects ? 'bg-indigo-600' : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'}`}
      >
        <i className="fa fa-layer-group ml-2" /> جميع المشاريع
      </Button>
      <Button 
        variant={activeTab === Tab.Stats ? "default" : "outline"} 
        onClick={() => onTabChange(Tab.Stats)}
        className={`${activeTab === Tab.Stats ? 'bg-indigo-600' : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'}`}
      >
        <i className="fa fa-chart-bar ml-2" /> إحصائيات عامة
      </Button>
    </div>
  );
};

export default DashboardTabs;
