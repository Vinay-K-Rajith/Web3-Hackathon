import React from 'react';

interface AgritraceLogo {
  className?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const AgritraceLogo: React.FC<AgritraceLogo> = ({ 
  className = '', 
  showText = true, 
  size = 'md' 
}) => {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8', 
    lg: 'h-12 w-12',
    xl: 'h-16 w-16'
  };

  const textSizeClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl', 
    xl: 'text-3xl'
  };

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {/* Logo Icon - SVG removed */}
      
      {/* Logo Text */}
      {showText && (
        <span className={`font-bold bg-gradient-to-r from-green-600 via-green-500 to-teal-500 bg-clip-text text-transparent ${textSizeClasses[size]}`}>
          Agritrace
        </span>
      )}
    </div>
  );
};

export default AgritraceLogo;
