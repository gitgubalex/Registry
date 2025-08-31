import React, { useEffect } from 'react';

interface Props {
  onReset: () => void;
}

const ThankYouStep: React.FC<Props> = ({ onReset }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onReset();
    }, 5000); // 5 seconds

    return () => clearTimeout(timer);
  }, [onReset]);

  return (
    <div className="text-center bg-white rounded-lg shadow-lg p-8 sm:p-12">
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
            <svg className="h-10 w-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">¡Proceso Completado!</h2>
        <p className="mt-4 text-slate-600 max-w-2xl mx-auto">
            Gracias por su compromiso con la excelencia académica. Su actualización profesional contribuye directamente al éxito de los estudiantes del <strong>INSTITUTO TECNOLÓGICO DE DURANGO</strong>.
        </p>
    </div>
  );
};

export default ThankYouStep;