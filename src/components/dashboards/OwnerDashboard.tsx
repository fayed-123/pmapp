import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { loadProjects } from '@/lib/db';
import { Project } from '@/lib/types';
import { useAuth } from '@/context/AuthContext';
import { ChartContainer } from '@/components/ui/chart';
import { Bar, BarChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useToast } from '@/components/ui/use-toast';

enum Tab {
  Projects = 'myprojects',
  Stats = 'stats'
}

const statusText = (status: string) => {
  switch (status) {
    case 'active':
      return <span className="text-green-700 font-bold">نشط</span>;
    case 'pending':
      return <span className="text-yellow-700">بانتظار الموافقة</span>;
    case 'closed':
      return <span className="text-gray-600">مغلق</span>;
    default:
      return status || '-';
  }
};

const OwnerDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>(Tab.Projects);
  const [projects, setProjects] = useState<Project[]>([]);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user && user.id) {
      const ownerProjects = loadProjects().filter(p => p.ownerId === user.id);
      setProjects(ownerProjects);
    }
  }, [user]);

  const renderContent = () => {
    switch (activeTab) {
      case Tab.Projects:
        return (
          <div>
            <h3 className="mb-2 font-bold text-lg text-gray-700 flex items-center gap-2">
              <i className="fa fa-layer-group" /> مشاريعي ({projects.length})
            </h3>
            <Card className="overflow-x-auto mb-4">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="p-2 text-right">اسم المشروع</th>
                    <th className="p-2 text-right">الزمن المنقضي</th>
                    <th className="p-2 text-right">نسبة الانجاز الكلية</th>
                    <th className="p-2 text-right">الأيام المتوقعة للإنجاز</th>
                    <th className="p-2 text-right">الحالة</th>
                    <th className="p-2 text-right">عرض التفاصيل</th>
                  </tr>
                </thead>
                <tbody>
                  {projects.length > 0 ? (
                    projects.map(project => (
                      <tr key={project.id} className="border-t hover:bg-gray-50">
                        <td className="p-2">{project.name}</td>
                        <td className="p-2">{project.timeElapsed || 0}%</td>
                        <td className="p-2">{project.completion || 0}%</td>
                        <td className="p-2">{project.expectedDays || 0} يوم</td>
                        <td className="p-2">{statusText(project.status)}</td>
                        <td className="p-2">
                          <Button variant="ghost" size="sm" className="text-indigo-600 hover:text-indigo-800">
                            <i className="fa fa-eye" />
                          </Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-gray-400">
                        لا توجد مشاريع
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </Card>
          </div>
        );
        
      case Tab.Stats:
        return (
          <div>
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <i className="fa fa-chart-bar" /> مؤشرات الأداء لمشاريعي
            </h3>
            <Card className="p-4">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart 
                  data={projects.map(p => ({
                    name: p.name,
                    performance: parseFloat(p.performance?.toString() || "0")
                  }))}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="performance" name="مؤشر الأداء" fill="#6366f1" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </div>
        );
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-2 text-indigo-700 flex items-center gap-2">
        <i className="fa fa-eye" /> لوحة تحكم المالك
      </h2>
      <hr className="mb-4" />
      <div className="flex flex-wrap gap-6 mb-6">
        <Button 
          variant={activeTab === Tab.Projects ? "default" : "outline"} 
          onClick={() => setActiveTab(Tab.Projects)}
          className={`${activeTab === Tab.Projects ? 'bg-indigo-600' : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'}`}
        >
          <i className="fa fa-layer-group ml-2" /> مشاريعي
        </Button>
        <Button 
          variant={activeTab === Tab.Stats ? "default" : "outline"} 
          onClick={() => setActiveTab(Tab.Stats)}
          className={`${activeTab === Tab.Stats ? 'bg-indigo-600' : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'}`}
        >
          <i className="fa fa-chart-bar ml-2" /> مؤشرات الأداء
        </Button>
      </div>
      
      {renderContent()}
    </div>
  );
};

export default OwnerDashboard;
