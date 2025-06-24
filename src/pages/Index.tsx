
import React from 'react';
import Auth from './Auth';
import Dashboard from '@/components/dashboard/Dashboard';
import { useAuth } from '@/context/AuthContext';

const Index: React.FC = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-5 bg-white rounded-lg border border-gray-200 shadow-sm my-8">
      {/* Header */}
      <div className="flex flex-col items-center mb-8 border-b pb-5">
        <h1 className="text-3xl font-bold text-indigo-700 mb-2">نظام إدارة ومراقبة تقدم المشاريع</h1>
        <p className="text-gray-700">منصة إلكترونية تفاعلية تتيح لك مراقبة المشاريع وتحليل التقدم ودعم استيراد بياناتك مباشرة من الملفات.</p>
      </div>
      
      {user ? <Dashboard /> : <Auth />}
    </div>
  );
};

export default Index;
