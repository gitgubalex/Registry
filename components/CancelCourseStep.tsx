
import React, { useState } from 'react';
import type { Inscripcion } from '../types.ts';
import Card from './ui/Card.tsx';
import Button from './ui/Button.tsx';

interface Props {
  userInscriptions: Inscripcion[];
  onConfirmCancel: (courseName: string) => void;
  onBack: () => void;
}

const CancelCourseStep: React.FC<Props> = ({ userInscriptions, onConfirmCancel, onBack }) => {
  const [selectedCourse, setSelectedCourse] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedCourse) {
      onConfirmCancel(selectedCourse);
    }
  };

  return (
    <Card
      title="Cancelar Inscripción a Curso"
      description="Seleccione el curso que desea cancelar. Esta acción no se puede deshacer."
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
            {userInscriptions.map((inscription) => (
                <label key={inscription.CursoSeleccionado} className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
                    <input
                        type="radio"
                        name="cancel-course"
                        value={inscription.CursoSeleccionado}
                        checked={selectedCourse === inscription.CursoSeleccionado}
                        onChange={(e) => setSelectedCourse(e.target.value)}
                        className="h-4 w-4 text-blue-600 border-slate-300 focus:ring-blue-500"
                    />
                    <span className="ml-3 text-slate-800">
                        <span className="font-semibold block">{inscription.CursoSeleccionado}</span>
                        <span className="text-sm text-slate-500 block">Fecha: {inscription.FechaVisible}</span>
                    </span>
                </label>
            ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t">
          <Button type="button" variant="secondary" onClick={onBack} className="flex-1">
            Volver
          </Button>
          <Button type="submit" disabled={!selectedCourse} className="flex-1 bg-red-600 hover:bg-red-700 focus-visible:ring-red-500">
            Confirmar Cancelación
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default CancelCourseStep;