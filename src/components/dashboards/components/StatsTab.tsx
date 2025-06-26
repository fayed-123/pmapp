import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { loadProjects, loadUsers } from '@/lib/db';
import { Project, User } from '@/lib/types';
import { Bar, BarChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const StatsTab: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStatsData();
  }, []);

  const loadStatsData = async () => {
    setIsLoading(true);
    try {
      const [allProjects, allUsers] = await Promise.all([
        loadProjects(),
        loadUsers()
      ]);
      setProjects(allProjects);
      setUsers(allUsers);
    } catch (error) {
      console.error('Error loading stats data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate project status distribution
  const getProjectStatusData = () => {
    const statusCount = projects.reduce((acc, project) => {
      if (project.completion >= 100) {
        acc.completed = (acc.completed || 0) + 1;
      } else if (project.completion > 0 && project.timeElapsed > 0 && project.expectedDays > 0) {
        const timePercentage = (project.timeElapsed / project.expectedDays) * 100;
        if (project.completion > timePercentage) {
          acc.ahead = (acc.ahead || 0) + 1;
        } else if (project.completion < timePercentage) {
          acc.behind = (acc.behind || 0) + 1;
        } else {
          acc.onTime = (acc.onTime || 0) + 1;
        }
      } else {
        acc.notStarted = (acc.notStarted || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    return [
      { name: 'مكتمل', value: statusCount.completed || 0, color: '#10b981' },
      { name: 'متقدم', value: statusCount.ahead || 0, color: '#6366f1' },
      { name: 'مطابق للوقت', value: statusCount.onTime || 0, color: '#f59e0b' },
      { name: 'متأخر', value: statusCount.behind || 0, color: '#ef4444' },
      { name: 'لم يبدأ', value: statusCount.notStarted || 0, color: '#6b7280' }
    ].filter(item => item.value > 0);
  };

  // Calculate user distribution
  const getUserDistribution = () => {
    const userCount = users.reduce((acc, user) => {
      if (user.approved) {
        acc[user.role] = (acc[user.role] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    return [
      { name: 'مشرف عام', value: userCount.mainConsultant || 0 },
      { name: 'استشاري', value: userCount.consultant || 0 },
      { name: 'مالك', value: userCount.owner || 0 },
      { name: 'مقاول', value: userCount.contractor || 0 }
    ].filter(item => item.value > 0);
  };

  // Get top performing projects
  const getTopProjects = () => {
    return projects
      .filter(p => p.completion > 0)
      .sort((a, b) => (b.completion || 0) - (a.completion || 0))
      .slice(0, 5)
      .map(p => ({
        name: p.name.length > 20 ? p.name.substring(0, 20) + '...' : p.name,
        completion: p.completion || 0,
        timeElapsed: p.timeElapsed || 0,
        performance: parseFloat(p.performance?.toString() || "0")
      }));
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">جاري تحميل الإحصائيات...</div>
      </div>
    );
  }

  const projectStatusData = getProjectStatusData();
  const userDistributionData = getUserDistribution();
  const topProjectsData = getTopProjects();
  const pendingUsers = users.filter(u => !u.approved).length;

  return (
    <div>
      <h3 className="font-bold mb-4 flex items-center gap-2">
        <i className="fa fa-chart-bar" /> إحصائيات عامة المشاريع
      </h3>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-indigo-600">{projects.length}</div>
          <div className="text-sm text-gray-600">إجمالي المشاريع</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-green-600">{users.filter(u => u.approved).length}</div>
          <div className="text-sm text-gray-600">المستخدمين المفعلين</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-yellow-600">{pendingUsers}</div>
          <div className="text-sm text-gray-600">طلبات الموافقة</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">
            {projects.length > 0 ? Math.round(projects.reduce((sum, p) => sum + (p.completion || 0), 0) / projects.length) : 0}%
          </div>
          <div className="text-sm text-gray-600">متوسط نسبة الإنجاز</div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Project Status Distribution */}
        <Card className="p-4">
          <h4 className="font-bold mb-3">توزيع حالة المشاريع</h4>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={projectStatusData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}`}
              >
                {projectStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        {/* User Distribution */}
        <Card className="p-4">
          <h4 className="font-bold mb-3">توزيع المستخدمين</h4>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={userDistributionData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#6366f1" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Top Projects Performance */}
      {topProjectsData.length > 0 && (
        <Card className="p-4">
          <h4 className="font-bold mb-3">أداء أفضل المشاريع</h4>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topProjectsData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="completion" name="نسبة الانجاز %" fill="#6366f1" />
              <Bar dataKey="timeElapsed" name="الوقت المنقضي (أيام)" fill="#facc15" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      )}
    </div>
  );
};

export default StatsTab;