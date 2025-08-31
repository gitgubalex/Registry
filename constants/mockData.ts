
import { Curso, Departamento, Docente, CurpData } from '../types';

export const CURSOS: Curso[] = [
  {
    NombreCurso: "Introducción a React con TypeScript",
    FechaVisible: "2024-08-01",
    Periodo: "Verano 2024",
    Horas: 40,
    Lugar: "En línea",
    Horario: "Lunes y Miércoles 16:00-18:00"
  },
  {
    NombreCurso: "Estrategias Pedagógicas en el Aula Digital",
    FechaVisible: "2024-08-05",
    Periodo: "Verano 2024",
    Horas: 30,
    Lugar: "Sala de conferencias B",
    Horario: "Martes y Jueves 10:00-12:00"
  },
  {
    NombreCurso: "Manejo Avanzado de Hojas de Cálculo",
    FechaVisible: "2024-08-12",
    Periodo: "Verano 2024",
    Horas: 25,
    Lugar: "Laboratorio de Cómputo 3",
    Horario: "Viernes 09:00-14:00"
  },
  {
    NombreCurso: "Liderazgo y Gestión Educativa",
    FechaVisible: "2024-09-02",
    Periodo: "Otoño 2024",
    Horas: 50,
    Lugar: "En línea",
    Horario: "Sábados 09:00-13:00"
  }
];

export const DEPARTAMENTOS: Departamento[] = [
  { NombreDepartamento: "Ciencias Básicas" },
  { NombreDepartamento: "Ciencias Económico-Administrativas" },
  { NombreDepartamento: "Sistemas y Computación" },
  { NombreDepartamento: "Ingeniería Industrial" },
  { NombreDepartamento: "Eléctrica y Electrónica" }
];

export const DOCENTES: Docente[] = [
  { NombreCompleto: "Ana María García Pérez", email: "ana.garcia@docentes.edu" },
  { NombreCompleto: "Juan Carlos Rodríguez López", email: "juan.rodriguez@docentes.edu" },
  { NombreCompleto: "Laura Sofía Martínez Hernández", email: "laura.martinez@docentes.edu" },
  { NombreCompleto: "Miguel Ángel González Cruz", email: "miguel.gonzalez@docentes.edu" }
];

export const CURPS: CurpData[] = [
  { NombreCompleto: "Ana María García Pérez", curp: "GAPM850315HDFRZA01" },
  { NombreCompleto: "Juan Carlos Rodríguez López", curp: "ROLJ821105HGRPDA02" },
  { NombreCompleto: "Laura Sofía Martínez Hernández", curp: "MAHL900720MDFRZA03" },
  { NombreCompleto: "Miguel Ángel González Cruz", curp: "GOCM780125HGRPDA04" }
];
