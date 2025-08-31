
import React, { useState, useEffect } from 'react';
import Card from './ui/Card';
import Input from './ui/Input';
import Button from './ui/Button';

interface Props {
  initialName: string;
  onSubmit: (newTeacher: { NombreCompleto: string; email: string; curp: string; }) => void;
}

const NewTeacherStep: React.FC<Props> = ({ initialName, onSubmit }) => {
  const [NombreCompleto, setNombreCompleto] = useState(initialName);
  const [email, setEmail] = useState('');
  const [curp, setCurp] = useState('');
  const [curpError, setCurpError] = useState('');

  useEffect(() => {
    setNombreCompleto(initialName);
  }, [initialName]);

  const handleCurpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase();
    setCurp(value);
    if (value && (value.length !== 18 || !/^[A-Z0-9]+$/.test(value))) {
      setCurpError('La CURP debe tener 18 caracteres alfanuméricos.');
    } else {
      setCurpError('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Final check on submit
    if (curp && (curp.length !== 18 || !/^[A-Z0-9]+$/.test(curp))) {
      setCurpError('La CURP debe tener 18 caracteres alfanuméricos.');
      return;
    }

    if (NombreCompleto.trim() && email.trim()) {
      onSubmit({ NombreCompleto, email, curp });
    }
  };

  return (
    <Card
      title="Registro de Nuevo Docente"
      description="Complete sus datos para crear su perfil en la plataforma."
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <Input
          id="newNombreCompleto"
          label="Nombre Completo"
          value={NombreCompleto}
          onChange={(e) => setNombreCompleto(e.target.value)}
          placeholder="Ej: Laura Sofía Martínez Hernández"
          required
        />
        <Input
          id="newEmail"
          label="Correo Electrónico"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="ejemplo@docentes.edu"
          required
        />
        <div>
          <Input
            id="newCurp"
            label="CURP (Opcional)"
            value={curp}
            onChange={handleCurpChange}
            placeholder="Ingrese su CURP de 18 caracteres"
            maxLength={18}
            aria-describedby="curp-error"
          />
          {curpError && <p id="curp-error" className="mt-1 text-sm text-red-600">{curpError}</p>}
        </div>
        <Button type="submit" className="w-full">
          Registrarse y Continuar
        </Button>
      </form>
    </Card>
  );
};

export default NewTeacherStep;
