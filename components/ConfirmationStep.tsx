
import React from 'react';
import type { Inscripcion } from '../types.ts';
import Card from './ui/Card.tsx';
import Button from './ui/Button.tsx';

interface Props {
  inscription: Inscripcion | null;
  onReset: () => void;
  onRegisterAnother: () => void;
  userRegistrationsCount: number;
  onCancelCourse: () => void;
  onFinish: () => void;
}

const ConfirmationStep: React.FC<Props> = ({ inscription, onReset, onRegisterAnother, userRegistrationsCount, onCancelCourse, onFinish }) => {
  if (!inscription && userRegistrationsCount < 2) {
    return (
      <Card title="Error" description="No se encontraron datos de la inscripción.">
        <Button onClick={onReset} className="w-full">
          Volver al Inicio
        </Button>
      </Card>
    );
  }

  const renderContent = () => {
    if (userRegistrationsCount >= 2 && !inscription) {
      // This case handles when user re-enters registration form after 2 courses
      return (
        <div className="text-center">
            <h2 className="text-2xl font-bold text-slate-800">Límite Alcanzado</h2>
            <p className="text-slate-600 mt-2 mb-6">Ya se ha inscrito al número máximo de cursos permitidos.</p>
        </div>
      );
    }
    
    return (
        <>
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                <svg className="h-10 w-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
            </div>
            <h2 className="text-2xl font-bold text-slate-800">¡Inscripción Exitosa!</h2>
            <p className="text-slate-600 mt-2 mb-6">Su registro ha sido completado. Vea los detalles a continuación.</p>
            
            {inscription && (
              <div className="bg-white rounded-lg shadow border border-slate-200 text-left p-6 space-y-4 max-w-lg mx-auto">
                  <h3 className="text-lg font-semibold border-b pb-2 text-slate-700">Detalles de la Inscripción</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
                      <div className="font-semibold text-slate-500">Nombre:</div>
                      <div className="text-slate-800">{inscription.NombreCompleto}</div>
                      
                      <div className="font-semibold text-slate-500">Curso:</div>
                      <div className="text-slate-800">{inscription.CursoSeleccionado}</div>
                      
                      <div className="font-semibold text-slate-500">Fecha de Inicio:</div>
                      <div className="text-slate-800">{inscription.FechaVisible}</div>

                      <div className="font-semibold text-slate-500">Lugar:</div>
                      <div className="text-slate-800">{inscription.Lugar}</div>
                      
                      <div className="font-semibold text-slate-500">Departamento:</div>
                      <div className="text-slate-800">{inscription.DepartamentoSeleccionado}</div>

                      <div className="font-semibold text-slate-500">Email:</div>
                      <div className="text-slate-800">{inscription.Email}</div>
                      
                      <div className="font-semibold text-slate-500">CURP:</div>
                      <div className="text-slate-800 font-mono">{inscription.Curp}</div>
                  </div>
              </div>
            )}
        </>
    );
  }

  return (
    <div className="text-center">
        {renderContent()}
        
        {userRegistrationsCount < 2 ? (
            <div className="mt-8 space-y-4">
                <p className="text-slate-600 font-semibold">Ha completado {userRegistrationsCount} de 2 inscripciones posibles.</p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button onClick={onRegisterAnother} className="flex-1">
                        Inscribir a Otro Curso
                    </Button>
                    <Button onClick={onFinish} variant="secondary" className="flex-1">
                        Finalizar
                    </Button>
                </div>
            </div>
        ) : (
            <div className="mt-8">
                <p className="bg-blue-100 text-blue-800 text-sm font-semibold px-4 py-3 rounded-lg max-w-md mx-auto">
                    Ha alcanzado el límite de 2 inscripciones.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center mt-6">
                    <Button onClick={onCancelCourse} variant="secondary" className="flex-1">
                        Cancelar un Curso
                    </Button>
                    <Button onClick={onFinish} className="flex-1">
                        Terminar
                    </Button>
                </div>
            </div>
        )}
    </div>
  );
};

export default ConfirmationStep;