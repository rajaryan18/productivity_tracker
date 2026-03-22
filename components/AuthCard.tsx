import React from 'react';

interface AuthCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

const AuthCard: React.FC<AuthCardProps> = ({ title, subtitle, children }) => {
  return (
    <div className="flex items-center justify-center min-h-[80vh] px-4">
      <div className="glass-panel w-full max-w-md animate-fade-in">
        <div className="text-center mb-10">
          <h1 className="gradient-text text-4xl mb-3">{title}</h1>
          {subtitle && <p className="text-secondary text-base">{subtitle}</p>}
        </div>
        {children}
      </div>
    </div>
  );
};

export default AuthCard;
