import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { loadProjects, loadUsers } from '@/lib/db';
import { Project, User } from '@/lib/types';
import { Bar, BarChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { BarChart3, FolderOpen, Users, Clock, TrendingUp, Award, UserCheck, AlertCircle, Target } from 'lucide-react';

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
      <div className="flex flex-col justify-center items-center h-64 space-y-4">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
        <div className="text-lg text-gray-600">جاري تحميل الإحصائيات...</div>
      </div>
    );
  }

  const projectStatusData = getProjectStatusData();
  const userDistributionData = getUserDistribution();
  const topProjectsData = getTopProjects();
  const pendingUsers = users.filter(u => !u.approved).length;
  const avgCompletion = projects.length > 0 ? Math.round(projects.reduce((sum, p) => sum + (p.completion || 0), 0) / projects.length) : 0;

  const summaryCards = [
    {
      title: 'إجمالي المشاريع',
      value: projects.length,
      icon: FolderOpen,
      color: 'indigo',
      bgColor: 'bg-indigo-100',
      textColor: 'text-indigo-600',
      iconColor: 'text-indigo-600'
    },
    {
      title: 'المستخدمين المفعلين',
      value: users.filter(u => u.approved).length,
      icon: UserCheck,
      color: 'green',
      bgColor: 'bg-green-100',
      textColor: 'text-green-600',
      iconColor: 'text-green-600'
    },
    {
      title: 'طلبات الموافقة',
      value: pendingUsers,
      icon: AlertCircle,
      color: 'yellow',
      bgColor: 'bg-yellow-100',
      textColor: 'text-yellow-600',
      iconColor: 'text-yellow-600'
    },
    {
      title: 'متوسط نسبة الإنجاز',
      value: `${avgCompletion}%`,
      icon: Target,
      color: 'blue',
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-600',
      iconColor: 'text-blue-600'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Enhanced Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-orange-600" />
          </div>
          <div>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-800">إحصائيات عامة المشاريع</h3>
            <p className="text-sm text-gray-600 mt-1">
              نظرة شاملة على أداء النظام والمشاريع
            </p>
          </div>
        </div>
      </div>

      {/* Enhanced Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {summaryCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <Card key={index} className="p-4 sm:p-6 shadow-sm border-0 bg-white hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <div className={`text-2xl sm:text-3xl font-bold ${card.textColor} mb-1`}>
                    {card.value}
                  </div>
                  <div className="text-sm text-gray-600 leading-tight">
                    {card.title}
                  </div>
                </div>
                <div className={`w-12 h-12 ${card.bgColor} rounded-xl flex items-center justify-center`}>
                  <Icon className={`w-6 h-6 ${card.iconColor}`} />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Project Status Distribution */}
        <Card className="p-4 sm:p-6 shadow-sm border-0 bg-white">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-purple-600" />
            </div>
            <h4 className="text-lg font-semibold text-gray-800">توزيع حالة المشاريع</h4>
          </div>
          
          {projectStatusData.length > 0 ? (
            <>
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
              
              {/* Legend for mobile */}
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
                {projectStatusData.map((entry, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: entry.color }}
                    ></div>
                    <span className="text-gray-700">{entry.name}: {entry.value}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-400">
              <div className="text-center">
                <FolderOpen className="w-12 h-12 mx-auto mb-3" />
                <p>لا توجد مشاريع لعرض الإحصائيات</p>
              </div>
            </div>
          )}
        </Card>

        {/* User Distribution */}
        <Card className="p-4 sm:p-6 shadow-sm border-0 bg-white">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-4 h-4 text-blue-600" />
            </div>
            <h4 className="text-lg font-semibold text-gray-800">توزيع المستخدمين</h4>
          </div>
          
          {userDistributionData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={userDistributionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 12 }}
                  interval={0}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#ffffff', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-400">
              <div className="text-center">
                <Users className="w-12 h-12 mx-auto mb-3" />
                <p>لا توجد مستخدمين لعرض الإحصائيات</p>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Top Projects Performance */}
      {topProjectsData.length > 0 && (
        <Card className="p-4 sm:p-6 shadow-sm border-0 bg-white">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <Award className="w-4 h-4 text-green-600" />
            </div>
            <h4 className="text-lg font-semibold text-gray-800">أداء أفضل المشاريع</h4>
          </div>
          
          <div className="overflow-x-auto">
            <ResponsiveContainer width="100%" height={300} minWidth={500}>
              <BarChart data={topProjectsData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 12 }}
                  interval={0}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#ffffff', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Legend />
                <Bar 
                  dataKey="completion" 
                  name="نسبة الانجاز %" 
                  fill="#6366f1" 
                  radius={[4, 4, 0, 0]} 
                />
                <Bar 
                  dataKey="timeElapsed" 
                  name="الوقت المنقضي (أيام)" 
                  fill="#facc15" 
                  radius={[4, 4, 0, 0]} 
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}

      {/* No Data State */}
      {projects.length === 0 && users.length === 0 && (
        <Card className="p-8 sm:p-12 text-center bg-white">
          <div className="flex flex-col items-center gap-4 text-gray-400">
            <BarChart3 className="h-16 w-16" />
            <h4 className="text-xl font-semibold">لا توجد بيانات</h4>
            <p className="text-sm max-w-md">
              لا توجد مشاريع أو مستخدمين في النظام حالياً. ابدأ بإضافة مشاريع ومستخدمين لرؤية الإحصائيات هنا.
            </p>
          </div>
        </Card>
      )}
    </div>
  );
};

export default StatsTab;