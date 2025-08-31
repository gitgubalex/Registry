import React, { useState, useCallback, useEffect } from 'react';
import { RegistrationStep, DocenteRegistrado, Inscripcion, Docente, Curso, Departamento, CurpData, RegistrationFormData } from './types';
import Header from './components/Header';
import TeacherLookupStep from './components/TeacherLookupStep';
import NewTeacherStep from './components/NewTeacherStep';
import RegistrationFormStep from './components/RegistrationFormStep';
import ConfirmationStep from './components/ConfirmationStep';
import CancelCourseStep from './components/CancelCourseStep';
import ThankYouStep from './components/ThankYouStep';

declare var XLSX: any;

const DB_URL = 'https://raw.githubusercontent.com/gitgubalex/Registry/main/Registro%20de%20Cursos%20ITD.xlsx';
const COURSE_CAPACITY = 30;

const normalizeName = (name: string): string => {
    if (!name || typeof name !== 'string') return '';
    return name
      .toLowerCase()
      .trim()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Eliminar acentos
      .split(/\s+/)
      .sort()
      .join(' ');
};

const App: React.FC = () => {
  const [step, setStep] = useState<RegistrationStep>(RegistrationStep.VERIFY);
  const [currentUser, setCurrentUser] = useState<DocenteRegistrado | null>(null);
  const [lastInscription, setLastInscription] = useState<Inscripcion | null>(null);
  
  const [courses, setCourses] = useState<Curso[]>([]);
  const [departments, setDepartments] = useState<Departamento[]>([]);
  const [docentesDB, setDocentesDB] = useState<DocenteRegistrado[]>([]);
  const [inscriptions, setInscriptions] = useState<Inscripcion[]>([]);

  const [isLoadingData, setIsLoadingData] = useState<boolean>(true);
  const [dataLoadError, setDataLoadError] = useState<string | null>(null);

  const processExcelData = useCallback((data: ArrayBuffer) => {
    try {
      const workbook = XLSX.read(data, { type: 'array' });

      const requiredSheets = ['Cursos', 'Departamentos', 'Docentes'];
      for (const sheetName of requiredSheets) {
        if (!workbook.SheetNames.includes(sheetName)) {
          throw new Error(`El archivo de Excel no contiene la hoja requerida: "${sheetName}"`);
        }
      }

      const normalizeKeys = (obj: any): any => {
        const newObj: any = {};
        for (const key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                const normalizedKey = key.trim().toLowerCase().replace(/\s+/g, '');
                newObj[normalizedKey] = obj[key];
            }
        }
        return newObj;
      };
      
      const findValue = (row: any, keys: string[]): any => {
        for (const key of keys) {
            if (row[key] !== undefined && row[key] !== null) {
                return row[key];
            }
        }
        return undefined;
      };

      const cursosRaw: any[] = XLSX.utils.sheet_to_json(workbook.Sheets['Cursos']).map(normalizeKeys);
      const departamentosRaw: any[] = XLSX.utils.sheet_to_json(workbook.Sheets['Departamentos']).map(normalizeKeys);
      const docentesRaw: any[] = XLSX.utils.sheet_to_json(workbook.Sheets['Docentes']).map(normalizeKeys);
      
      let curpsData: CurpData[] = [];
      const curpSheetName = workbook.SheetNames.find((name: string) => name.toLowerCase() === 'curp');

      if (curpSheetName) {
        const curpsRaw: any[] = XLSX.utils.sheet_to_json(workbook.Sheets[curpSheetName]).map(normalizeKeys);
        curpsData = curpsRaw
          .map(row => ({
              NombreCompleto: findValue(row, ['nombre', 'nombrecompleto']),
              curp: findValue(row, ['curp'])
          }))
          .filter(c => c.NombreCompleto && c.curp);
        
        if (!curpsData.length) {
            console.warn(`La hoja '${curpSheetName}' fue encontrada pero está vacía o no contiene las columnas requeridas (ej: 'NombreCompleto', 'curp').`);
        }
      } else {
        console.warn("No se encontró una hoja de CURP. La información de CURP no será cargada.");
      }

      const cursosData: Curso[] = cursosRaw
        .map(row => ({
            NombreCurso: findValue(row, ['nombrecurso', 'nombrcurso', 'nombredelcurso', 'curso']),
            FechaVisible: findValue(row, ['fechavisible', 'fechavisiible', 'fechainicio', 'fecha']),
            Periodo: findValue(row, ['periodo']),
            Horas: findValue(row, ['horas']),
            Lugar: findValue(row, ['lugar', 'ubicacion']),
            Horario: findValue(row, ['horario'])
        }))
        .filter(c => c.NombreCurso && c.FechaVisible);

      const departamentosData: Departamento[] = departamentosRaw
        .map(row => ({ NombreDepartamento: findValue(row, ['nombredepartamento', 'nombre', 'departamento', 'departamentos']) }))
        .filter(d => d.NombreDepartamento);

      const docentesData: Docente[] = docentesRaw
        .map(row => ({
            NombreCompleto: findValue(row, ['nombrecompleto', 'nombre']),
            email: findValue(row, ['email', 'correo', 'correoelectronico'])
        }))
        .filter(d => d.NombreCompleto && d.email);
      
      if (!cursosData.length) {
        throw new Error("La hoja 'Cursos' está vacía o no contiene las columnas requeridas (ej: 'NombreCurso', 'FechaVisible').");
      }
      if (!departamentosData.length) {
        throw new Error("La hoja 'Departamentos' está vacía o no contiene la columna requerida (ej: 'NombreDepartamento').");
      }
      if (!docentesData.length) {
        throw new Error("La hoja 'Docentes' está vacía o no contiene las columnas requeridas (ej: 'NombreCompleto', 'email').");
      }

      const combinedDocentes = docentesData.map(docente => {
        const normalizedDocenteName = normalizeName(docente.NombreCompleto);
        const curpEntry = curpsData.find(c => 
            normalizeName(c.NombreCompleto) === normalizedDocenteName
        );
        return { ...docente, curp: curpEntry?.curp };
      });
      
      setCourses(cursosData);
      setDepartments(departamentosData);
      setDocentesDB(combinedDocentes);
      setInscriptions([]);
      setStep(RegistrationStep.VERIFY);
    } catch (error) {
       const message = error instanceof Error ? error.message : "Ocurrió un error desconocido al procesar el archivo.";
       console.error("Error parsing Excel file:", message);
       throw new Error(message);
    }
  }, []);

  const handleDataLoadFromDB = useCallback(async () => {
    const response = await fetch(DB_URL);
    if (!response.ok) {
        throw new Error(`No se pudo cargar la base de datos. Estado: ${response.status}`);
    }
    const arrayBuffer = await response.arrayBuffer();
    processExcelData(arrayBuffer);
  }, [processExcelData]);
  
  useEffect(() => {
    const loadData = async () => {
      try {
        await handleDataLoadFromDB();
      } catch (error) {
        const message = error instanceof Error ? error.message : "Ocurrió un error desconocido al cargar los datos.";
        console.error("Failed to load initial data:", message);
        setDataLoadError(message);
      } finally {
        setIsLoadingData(false);
      }
    };
    loadData();
  }, [handleDataLoadFromDB]);

  const handleTeacherReset = useCallback(() => {
    setCurrentUser(null);
    setLastInscription(null);
    setStep(RegistrationStep.VERIFY);
  }, []);

  const handleVerifyTeacher = useCallback((nombreCompleto: string): DocenteRegistrado | null => {
    const normalizedInputName = normalizeName(nombreCompleto);
    const found = docentesDB.find(d => normalizeName(d.NombreCompleto) === normalizedInputName);
    if (found) {
      setCurrentUser(found);
      setStep(RegistrationStep.REGISTER_FORM);
      return found;
    }
    return null;
  }, [docentesDB]);
  
  const handleGoToNewTeacher = useCallback((initialName: string) => {
    setCurrentUser({ NombreCompleto: initialName, email: '' });
    setStep(RegistrationStep.NEW_TEACHER);
  }, []);

  const handleRegisterNewTeacher = useCallback((newTeacherData: { NombreCompleto: string; email: string; curp: string; }) => {
    const { NombreCompleto, email, curp } = newTeacherData;

    const isValidCurp = curp.trim().length === 18 && /^[A-Z0-9]+$/i.test(curp.trim());

    const newDocente: DocenteRegistrado = {
      NombreCompleto,
      email,
      curp: isValidCurp ? curp.trim().toUpperCase() : 'PENDIENTE'
    };
    
    setDocentesDB(prev => [...prev, newDocente]);
    setCurrentUser(newDocente);
    setStep(RegistrationStep.REGISTER_FORM);
  }, []);

  const handleFinalSubmit = useCallback((formData: RegistrationFormData) => {
    if (!currentUser) return;

    const normalizedCurrentUser = normalizeName(currentUser.NombreCompleto);
    const userInscriptions = inscriptions.filter(i => normalizeName(i.NombreCompleto) === normalizedCurrentUser);
    if (userInscriptions.length >= 2) {
        console.error("El docente ya alcanzó el límite de 2 cursos.");
        return;
    }

    const courseEnrollmentCount = inscriptions.filter(i => i.CursoSeleccionado === formData.cursoSeleccionado).length;
    if (courseEnrollmentCount >= COURSE_CAPACITY) {
        console.error("Este curso ya está lleno.");
        return;
    }

    const selectedCourse = courses.find(c => c.NombreCurso === formData.cursoSeleccionado);
    if (userInscriptions.length === 1) {
        const firstCourseName = userInscriptions[0].CursoSeleccionado;
        const firstCourseDetails = courses.find(c => c.NombreCurso === firstCourseName);
        if (firstCourseDetails && selectedCourse && firstCourseDetails.FechaVisible === selectedCourse.FechaVisible) {
            console.error("El segundo curso debe tener una fecha diferente al primero.");
            return;
        }
    }
    
    const newInscription: Inscripcion = {
      Timestamp: new Date().toISOString(),
      NombreCompleto: formData.NombreCompleto,
      Curp: currentUser.curp || 'NO ENCONTRADO',
      Email: formData.email,
      Genero: formData.genero,
      CursoSeleccionado: formData.cursoSeleccionado,
      DepartamentoSeleccionado: formData.departamentoSeleccionado,
      FechaVisible: selectedCourse?.FechaVisible || new Date().toLocaleDateString(),
      Lugar: selectedCourse?.Lugar || 'No especificado',
    };
    
    setInscriptions(prev => [...prev, newInscription]);
    setLastInscription(newInscription);
    setStep(RegistrationStep.CONFIRMATION);
  }, [currentUser, courses, inscriptions]);

  const handleGoToCancel = useCallback(() => {
    setStep(RegistrationStep.CANCEL_COURSE);
  }, []);

  const handleFinish = useCallback(() => {
    setStep(RegistrationStep.THANK_YOU);
  }, []);

  const handleConfirmCancel = useCallback((courseNameToCancel: string) => {
    if (!currentUser) return;
    const normalizedCurrentUser = normalizeName(currentUser.NombreCompleto);
    
    setInscriptions(prev => 
      prev.filter(insc => 
        !(normalizeName(insc.NombreCompleto) === normalizedCurrentUser && insc.CursoSeleccionado === courseNameToCancel)
      )
    );
    setLastInscription(null); 
    setStep(RegistrationStep.REGISTER_FORM);
  }, [currentUser]);

  const renderStep = () => {
    switch (step) {
      case RegistrationStep.VERIFY:
        return <TeacherLookupStep onVerify={handleVerifyTeacher} onNewTeacher={handleGoToNewTeacher} />;
      case RegistrationStep.NEW_TEACHER:
        return <NewTeacherStep onSubmit={handleRegisterNewTeacher} initialName={currentUser?.NombreCompleto || ''} />;
      case RegistrationStep.REGISTER_FORM:
        if (!currentUser) {
          setStep(RegistrationStep.VERIFY);
          return null;
        }

        const normalizedUsername = normalizeName(currentUser.NombreCompleto);
        const userInscriptions = inscriptions.filter(i => normalizeName(i.NombreCompleto) === normalizedUsername);
        const firstCourseDepartment = userInscriptions.length === 1 ? userInscriptions[0].DepartamentoSeleccionado : undefined;

        if (userInscriptions.length >= 2) {
          return (
             <ConfirmationStep
                inscription={lastInscription}
                onReset={handleTeacherReset}
                onRegisterAnother={() => {}}
                userRegistrationsCount={userInscriptions.length}
                onCancelCourse={handleGoToCancel}
                onFinish={handleFinish}
             />
          );
        }

        const courseEnrollmentCounts = inscriptions.reduce((acc, ins) => {
            acc[ins.CursoSeleccionado] = (acc[ins.CursoSeleccionado] || 0) + 1;
            return acc;
        }, {} as { [key: string]: number });
        
        const availableCourses = courses.filter(course => {
            if ((courseEnrollmentCounts[course.NombreCurso] || 0) >= COURSE_CAPACITY) return false;
            if (userInscriptions.some(i => i.CursoSeleccionado === course.NombreCurso)) return false;
            if (userInscriptions.length === 1) {
                const firstCourseDetails = courses.find(c => c.NombreCurso === userInscriptions[0].CursoSeleccionado);
                if (firstCourseDetails && firstCourseDetails.FechaVisible === course.FechaVisible) {
                    return false;
                }
            }
            return true;
        });

        return (
          <RegistrationFormStep
            user={currentUser}
            courses={availableCourses}
            departments={departments}
            onSubmit={handleFinalSubmit}
            courseEnrollmentCounts={courseEnrollmentCounts}
            courseCapacity={COURSE_CAPACITY}
            firstCourseDepartment={firstCourseDepartment}
          />
        );
      case RegistrationStep.CONFIRMATION:
        const count = inscriptions.filter(i => normalizeName(i.NombreCompleto) === normalizeName(currentUser?.NombreCompleto || '')).length;
        return (
            <ConfirmationStep 
                inscription={lastInscription} 
                onReset={handleTeacherReset}
                onRegisterAnother={() => setStep(RegistrationStep.REGISTER_FORM)}
                userRegistrationsCount={count}
                onCancelCourse={handleGoToCancel}
                onFinish={handleFinish}
            />
        );
      case RegistrationStep.CANCEL_COURSE:
        if (!currentUser) {
          setStep(RegistrationStep.VERIFY);
          return null;
        }
        const userCoursesToCancel = inscriptions.filter(i => normalizeName(i.NombreCompleto) === normalizeName(currentUser.NombreCompleto));
        return (
            <CancelCourseStep
                userInscriptions={userCoursesToCancel}
                onConfirmCancel={handleConfirmCancel}
                onBack={() => setStep(RegistrationStep.CONFIRMATION)}
            />
        );
      
      case RegistrationStep.THANK_YOU:
        return <ThankYouStep onReset={handleTeacherReset} />;
      default:
        return <TeacherLookupStep onVerify={handleVerifyTeacher} onNewTeacher={handleGoToNewTeacher} />;
    }
  };

  const renderContent = () => {
    if (isLoadingData) {
      return (
        <div className="flex flex-col items-center justify-center text-center p-12 bg-white rounded-lg shadow-lg">
          <svg className="animate-spin h-10 w-10 text-blue-600 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <h2 className="text-xl font-semibold text-slate-800">Cargando Datos</h2>
          <p className="text-slate-500 mt-1">Por favor espere, estamos preparando el sistema de inscripción.</p>
        </div>
      );
    }
    if (dataLoadError) {
      return (
        <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg shadow-md">
            <div className="flex">
                <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-red-400" xmlns="http://www.w.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                </div>
                <div className="ml-4">
                    <h3 className="text-lg font-bold text-red-800">Error al Cargar la Base de Datos</h3>
                    <div className="mt-2 text-sm text-red-700">
                        <p>{dataLoadError}</p>
                        <p className="mt-2">Por favor, revise su conexión a internet e intente recargar la página. Si el problema persiste, contacte al soporte técnico.</p>
                    </div>
                </div>
            </div>
        </div>
      );
    }
    return renderStep();
  }

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-800 flex flex-col">
      <Header />
      <main className="flex-grow w-full max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="transition-all duration-300">
            {renderContent()}
        </div>
      </main>
      <footer className="text-center p-4 text-slate-500 text-sm">
        <p>&copy; 2025 Registro de Cursos de Actualización. Todos los derechos reservados.</p>
        <p className="text-xs mt-1">Desarrollo Académico, coordinación de actualización docente del ITD.</p>
      </footer>
    </div>
  );
};

export default App;