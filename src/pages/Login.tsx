import React from 'react';
import LoginForm from '../components/auth/LoginForm';
import Logo from '../components/ui/Logo';

const Login: React.FC = () => {
  return (
    <div className="flex min-h-screen bg-gray-50 justify-center items-center">
      <div className="flex flex-col justify-center px-4 py-12 sm:px-6 w-full max-w-xl">
        <div className="bg-white shadow-xl rounded-lg p-10">
          <div className="flex flex-col items-center">
            <Logo size="lg" withText={false} />
            <h2 className="mt-6 text-center text-3xl font-extrabold leading-9 tracking-tight" style={{
              fontFamily: "'Arial', 'Helvetica', sans-serif",
              color: '#000000',
              letterSpacing: '0.05em',
              fontWeight: 600
            }}>SMSOne</h2>
            <p className="mt-2 text-center text-md font-medium text-gray-600">
              SMS配信プラットフォーム
            </p>
          </div>
          
          <div className="mt-10">
            <LoginForm />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;