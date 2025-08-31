import React, { useState, useEffect } from 'react';
import type { DocenteRegistrado, Curso, Departamento, RegistrationFormData } from '../types';
import Card from './ui/Card';
import Input from './ui/Input';
import Select from './ui/Select';
import Button from './ui/Button';

interface Props {
  user: DocenteRegistrado;
  courses: Curso[];
  departments: Departamento[];
  onSubmit: (formData: RegistrationFormData) => void;
  courseEnrollmentCounts: { [key: string]: number };
  courseCapacity: number;
  firstCourseDepartment?: string;
}

const RegistrationFormStep: React.FC<Props> = ({ user, courses, departments, onSubmit, courseEnrollmentCounts, courseCapacity, firstCourseDepartment }) => {
  const [curso, setCurso] = useState('');
  const [departamento, setDepartamento] = useState('');
  const [genero, setGenero] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (courses.length > 0) {
      setCurso(courses[0].NombreCurso);
    } else {
      setCurso('');
    }
  }, [courses]);

  useEffect(() => {
    if (firstCourseDepartment) {
      setDepartamento(firstCourseDepartment);
    } else if (departments.length > 0) {
      setDepartamento('');
    }
  }, [firstCourseDepartment, departments]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!curso || !departamento || !genero) {
      setError('Todos los campos son obligatorios.');
      return;
    }
    setError('');
    onSubmit({
      NombreCompleto: user.NombreCompleto,
      email: user.email,
      cursoSeleccionado: curso,
      departamentoSeleccionado: departamento,
      genero: genero,
    });
  };

  return (
    <Card
      title={`Bienvenido(a), ${user.NombreCompleto}`}
      description="Seleccione el curso y complete la información para finalizar su inscripción."
    >
      {courses.length === 0 ? (
        <div className="bg-yellow-100 border-l-4 border-yellow-400 p-4 rounded-lg">
            <p className="text-sm text-yellow-800">
                <strong>Aviso:</strong> No hay más cursos disponibles para usted en este momento. Esto puede deberse a que ya alcanzó el límite de 2 inscripciones, los cursos están llenos o no hay opciones en fechas diferentes a su primera inscripción.
            </p>
        </div>
      ) : (
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input id="nombre" label="Nombre Completo" value={user.NombreCompleto} disabled />
            <Input id="email" label="Correo Electrónico" value={user.email} disabled />
        </div>

        <Select
          id="curso"
          label="Seleccione un Curso"
          value={curso}
          onChange={(e) => setCurso(e.target.value)}
          required
        >
          <option value="" disabled>-- Elija un curso --</option>
          {courses.map((c) => {
            const enrolled = courseEnrollmentCounts[c.NombreCurso] || 0;
            const available = courseCapacity - enrolled;
            return (
              <option key={c.NombreCurso} value={c.NombreCurso}>
                {c.NombreCurso} ({c.Periodo}) - {available} de {courseCapacity} lugares
              </option>
            );
          })}
        </Select>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Select
              id="departamento"
              label="Departamento de Adscripción"
              value={departamento}
              onChange={(e) => setDepartamento(e.target.value)}
              required
              disabled={!!firstCourseDepartment}
            >
              <option value="" disabled>-- Elija un departamento --</option>
              {departments.map((d) => (
                <option key={d.NombreDepartamento} value={d.NombreDepartamento}>{d.NombreDepartamento}</option>
              ))}
            </Select>
            <Select
              id="genero"
              label="Género"
              value={genero}
              onChange={(e) => setGenero(e.target.value)}
              required
            >
              <option value="" disabled>-- Seleccione --</option>
              <option value="Masculino">Masculino</option>
              <option value="Femenino">Femenino</option>
              <option value="Otro">Otro</option>
              <option value="Prefiero no decir">Prefiero no decir</option>
            </Select>
        </div>
        
        {user.curp && user.curp !== 'PENDIENTE' && (
            <div className="bg-slate-100 p-3 rounded-lg">
                <p className="text-sm text-slate-600"><strong>CURP (verificado):</strong> {user.curp}</p>
            </div>
        )}
        {user.curp === 'PENDIENTE' && (
             <div className="bg-blue-100 border-l-4 border-blue-400 p-3 rounded-lg">
                <p className="text-sm text-blue-800"><strong>Aviso:</strong> La CURP está pendiente de validación. Puede continuar con su inscripción.</p>
            </div>
        )}
         {!user.curp && (
            <div className="bg-yellow-100 border-l-4 border-yellow-400 p-3 rounded-lg">
                <p className="text-sm text-yellow-800"><strong>Aviso:</strong> No se encontró una CURP asociada a este nombre en la base de datos.</p>
            </div>
        )}

        {error && <p className="text-sm text-red-600">{error}</p>}
        
        <Button type="submit" className="w-full" disabled={courses.length === 0}>
          Finalizar Inscripción
        </Button>
      </form>
      )}
    </Card>
  );
};

export default RegistrationFormStep;
