import React from 'react';
import { MailCheck } from 'lucide-react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  withText?: boolean;
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ 
  size = 'md', 
  withText = true,
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-10 w-10'
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  return (
    <div className={`flex items-center ${className}`}>
      <MailCheck 
        className={`text-black ${sizeClasses[size]}`}
        style={{ display: 'none' }}
      />
      {withText && (
        <span className={`ml-2 font-bold text-black ${textSizeClasses[size]}`}>
          SMSOne
        </span>
      )}
    </div>
  );
};

export default Logo;