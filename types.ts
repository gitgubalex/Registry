export interface Curso {
  NombreCurso: string;
  FechaVisible: string;
  Periodo: string;
  Horas: number;
  Lugar: string;
  Horario: string;
}

export interface Departamento {
  NombreDepartamento: string;
}

export interface Docente {
  NombreCompleto: string;
  email: string;
}

export interface CurpData {
  NombreCompleto: string;
  curp: string;
}

export interface DocenteRegistrado extends Docente {
  curp?: string;
}

export interface Inscripcion {
  Timestamp: string;
  NombreCompleto: string;
  Curp: string;
  Email: string;
  Genero: string;
  CursoSeleccionado: string;
  DepartamentoSeleccionado: string;
  FechaVisible: string;
  Lugar: string;
}

export interface RegistrationFormData {
  NombreCompleto: string;
  email: string;
  cursoSeleccionado: string;
  departamentoSeleccionado: string;
  genero: string;
}

export enum RegistrationStep {
  VERIFY,
  NEW_TEACHER,
  REGISTER_FORM,
  CONFIRMATION,
  CANCEL_COURSE,
  THANK_YOU,
}