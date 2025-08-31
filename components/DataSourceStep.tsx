
import React, { useState, useRef } from 'react';
import Card from './ui/Card.tsx';
import Button from './ui/Button.tsx';

interface Props {
  onLoadFromFile: (file: File) => Promise<void>;
  onLoadFromMock: () => void;
  onLoadFromDB: () => Promise<void>;
}

const DataSourceStep: React.FC<Props> = ({ onLoadFromFile, onLoadFromMock, onLoadFromDB }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isFileLoading, setIsFileLoading] = useState(false);
  const [isDBLoading, setIsDBLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
        setSelectedFile(file);
        setError('');
      } else {
        setError('Por favor, seleccione un archivo de Excel válido (.xlsx).');
        setSelectedFile(null);
      }
    }
  };

  const handleFileSubmit = async () => {
    if (!selectedFile) {
      setError('No se ha seleccionado ningún archivo.');
      return;
    }
    setIsFileLoading(true);
    setError('');
    try {
      await onLoadFromFile(selectedFile);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ocurrió un error inesperado al procesar el archivo.');
    } finally {
      setIsFileLoading(false);
    }
  };

  const handleDBLoad = async () => {
    setIsDBLoading(true);
    setError('');
    try {
      await onLoadFromDB();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ocurrió un error inesperado al cargar la base de datos.');
    } finally {
      setIsDBLoading(false);
    }
  };


  return (
    <Card
      title="Fuente de Datos para Inscripción"
      description="Cargue la base de datos más reciente para comenzar el proceso de inscripción."
    >
      <div className="space-y-6">
        <div className="p-6 border rounded-lg bg-slate-50 text-center">
            <h3 className="text-lg font-semibold text-slate-800 mb-2">Opción Principal</h3>
            <Button 
                onClick={handleDBLoad} 
                isLoading={isDBLoading}
                className="w-full sm:w-auto py-3 px-6 text-base"
            >
                {isDBLoading ? 'Conectando...' : 'Cargar Base de Datos Institucional'}
            </Button>
            <p className="text-xs text-slate-500 mt-2">Carga los datos directamente desde el repositorio oficial.</p>
        </div>
        
        <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-slate-200"></div>
            <span className="flex-shrink mx-4 text-slate-400 text-sm">Otras Opciones</span>
            <div className="flex-grow border-t border-slate-200"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-4 border rounded-lg text-center flex flex-col">
            <h3 className="font-semibold text-slate-800 mb-2">Subir Archivo Local</h3>
            <p className="text-sm text-slate-500 mb-4 flex-grow">
              Seleccione un archivo .xlsx de su equipo.
            </p>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".xlsx, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              className="hidden"
              id="file-upload"
            />
            <Button 
                type="button" 
                variant="secondary" 
                onClick={() => fileInputRef.current?.click()}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              Seleccionar Archivo
            </Button>
            {selectedFile && (
              <p className="text-sm text-slate-600 truncate mt-2">{selectedFile.name}</p>
            )}
            <Button 
              onClick={handleFileSubmit} 
              disabled={!selectedFile || isFileLoading}
              isLoading={isFileLoading}
              className="w-full mt-3"
              variant="secondary"
            >
              {isFileLoading ? 'Procesando...' : 'Cargar Archivo'}
            </Button>
          </div>

          <div className="p-4 border rounded-lg text-center flex flex-col justify-center">
            <h3 className="font-semibold text-slate-800 mb-2">Usar Datos de Demostración</h3>
            <p className="text-sm text-slate-500 mb-4 flex-grow">
              Continuar con datos de ejemplo pre-cargados.
            </p>
            <Button type="button" variant="secondary" onClick={onLoadFromMock}>
              Usar Datos de Ejemplo
            </Button>
          </div>
        </div>
        
        {error && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 mt-6">
                <div className="flex">
                    <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <div className="ml-3">
                        <p className="text-sm text-red-700">{error}</p>
                    </div>
                </div>
            </div>
        )}
      </div>
    </Card>
  );
};

export default DataSourceStep;