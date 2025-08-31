
import React from 'react';

interface CardProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

const Card: React.FC<CardProps> = ({ title, description, children }) => {
  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="p-6 sm:p-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-900">{title}</h2>
          <p className="mt-1 text-slate-600">{description}</p>
        </div>
        {children}
      </div>
    </div>
  );
};

export default Card;
