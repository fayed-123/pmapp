import React from 'react';
import Auth from './Auth';
import Dashboard from '@/components/dashboard/Dashboard';
import { useAuth } from '@/context/AuthContext';

const Index: React.FC = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-t-2 border-b-2 border-indigo-500 mb-4"></div>
          <p className="text-gray-600 text-sm">جارٍ التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-sm sm:max-w-md md:max-w-4xl lg:max-w-6xl xl:max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 lg:py-10">
        
        {/* Main Content Area */}
        <div className="overflow-hidden">
          <div className="p-4 sm:p-6 md:p-8 lg:p-12">
            {user ? <Dashboard /> : <Auth />}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 sm:mt-10 lg:mt-12">
          <p className="text-gray-500 text-xs sm:text-sm">
            © 2025 نظام إدارة المشاريع. جميع الحقوق محفوظة.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;