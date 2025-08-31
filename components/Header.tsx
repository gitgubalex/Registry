
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center space-x-4">
            <div className="p-2 bg-blue-600 rounded-lg">
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v11.494m-9-5.747h18" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 19.5l-3.25-3.25m3.25 3.25l3.25-3.25M4.5 9.75l3.25 3.25m-3.25-3.25l3.25-3.25" />
                 </svg>
            </div>
            <div>
                 <h1 className="text-2xl font-bold text-slate-900">Sistema de Inscripción a Cursos</h1>
                 <p className="text-slate-500">Plataforma de Desarrollo Profesional para Docentes</p>
            </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
