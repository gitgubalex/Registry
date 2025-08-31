
import React, { useState } from 'react';
import type { DocenteRegistrado } from '../types.ts';
import Card from './ui/Card.tsx';
import Input from './ui/Input.tsx';
import Button from './ui/Button.tsx';

interface Props {
  onVerify: (nombreCompleto: string) => DocenteRegistrado | null;
  onNewTeacher: (initialName: string) => void;
}

const TeacherLookupStep: React.FC<Props> = ({ onVerify, onNewTeacher }) => {
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Por favor, ingrese su nombre completo.');
      return;
    }
    setError('');
    setLoading(true);

    // Simulate network delay
    setTimeout(() => {
      const foundTeacher = onVerify(name);
      if (!foundTeacher) {
        setError('Docente no encontrado. Por favor, verifique su nombre o regístrese como nuevo docente.');
      }
      setLoading(false);
    }, 500);
  };

  return (
    <Card
      title="Verificación de Docente"
      description="Ingrese su nombre completo para verificar si ya está en nuestro sistema."
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <Input
          id="nombreCompleto"
          label="Nombre Completo"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ej: Ana María García Pérez"
          required
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button type="submit" isLoading={loading} className="flex-1">
            {loading ? 'Verificando...' : 'Verificar'}
          </Button>
          <Button type="button" variant="secondary" onClick={() => onNewTeacher(name)} className="flex-1">
            Soy Nuevo Docente
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default TeacherLookupStep;