
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
    <div>
      <div className="flex flex-row justify-center mb-6">
        <Button
          type="button"
          variant="ghost"
          className={`px-6 py-2 font-semibold focus:outline-none border-b-2 rounded-none ${
            activeTab === 'login' 
            ? 'border-indigo-600 text-indigo-700'
            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
          onClick={() => handleTabChange('login')}
        >
          تسجيل الدخول
        </Button>
        <Button
          type="button"
          variant="ghost"
          className={`px-6 py-2 font-semibold focus:outline-none border-b-2 rounded-none ${
            activeTab === 'register' 
            ? 'border-green-600 text-green-700'
            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
          onClick={() => handleTabChange('register')}
        >
          تسجيل جديد
        </Button>
      </div>
      
      {activeTab === 'login' ? (
        <LoginForm onSwitchToRegister={() => handleTabChange('register')} />
      ) : (
        <RegisterForm onSwitchToLogin={() => handleTabChange('login')} />
      )}
    </div>
  );
};

export default Auth;
