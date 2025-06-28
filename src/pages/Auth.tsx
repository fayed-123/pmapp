import React, { useState } from 'react';
import LoginForm from '@/components/auth/LoginForm';
import RegisterForm from '@/components/auth/RegisterForm';
import { Button } from '@/components/ui/button';

type AuthTab = 'login' | 'register';

const Auth: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AuthTab>('login');

  const handleTabChange = (tab: AuthTab) => {
    setActiveTab(tab);
  };

  return (
    <div className="w-full max-w-sm sm:max-w-md lg:max-w-2xl mx-auto">
      {/* Enhanced Header with gradient background */}
      <div className="text-center mb-8 sm:mb-10 lg:mb-12">
          <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-full mb-4 sm:mb-5 lg:mb-6 shadow-lg">
            <svg className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 mb-3 sm:mb-4 leading-tight px-4">
            نظام إدارة ومراقبة تقدم المشاريع
          </h1>
        </div>

      {/* Enhanced Tab Navigation */}
      <div className="relative mb-6 sm:mb-8 lg:mb-10 px-4 sm:px-0">
        <div className="flex bg-gray-50 rounded-lg sm:rounded-xl p-1 sm:p-1.5 shadow-inner">
          <Button
            type="button"
            variant="ghost"
            className={`flex-1 py-2.5 sm:py-3 lg:py-4 px-3 sm:px-6 lg:px-8 text-sm sm:text-base font-semibold transition-all duration-300 ease-in-out rounded-md sm:rounded-lg ${
              activeTab === 'login' 
              ? 'bg-white text-indigo-700 shadow-md' 
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
            }`}
            onClick={() => handleTabChange('login')}
          >
            تسجيل الدخول
          </Button>
          <Button
            type="button"
            variant="ghost"
            className={`flex-1 py-2.5 sm:py-3 lg:py-4 px-3 sm:px-6 lg:px-8 text-sm sm:text-base font-semibold transition-all duration-300 ease-in-out rounded-md sm:rounded-lg ${
              activeTab === 'register' 
              ? 'bg-white text-green-700 shadow-md' 
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
            }`}
            onClick={() => handleTabChange('register')}
          >
            تسجيل جديد
          </Button>
        </div>
      </div>

      {/* Form Container with enhanced styling */}
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg overflow-hidden mx-4 sm:mx-0">
        <div className="px-6 py-6 sm:px-8 sm:py-8 lg:px-12 lg:py-10">
          {activeTab === 'login' ? (
            <LoginForm onSwitchToRegister={() => handleTabChange('register')} />
          ) : (
            <RegisterForm onSwitchToLogin={() => handleTabChange('login')} />
          )}
        </div>
        
        {/* Decorative bottom border */}
        <div className={`h-1 bg-gradient-to-r ${
          activeTab === 'login' 
          ? 'from-indigo-500 to-indigo-600' 
          : 'from-green-500 to-green-600'
        }`}></div>
      </div>

      {/* Additional footer text */}
      <div className="text-center mt-6 sm:mt-8 px-4 sm:px-0">
        <p className="text-xs sm:text-sm text-gray-500">
          بتسجيل الدخول، أنت توافق على شروط الخدمة وسياسة الخصوصية
        </p>
      </div>
    </div>
  );
};

export default Auth;