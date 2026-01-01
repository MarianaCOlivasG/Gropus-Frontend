import React, { useState, useRef, useEffect } from "react";
import { fireStyledAlert } from "../../utils/alerts"; 


interface NewGroupData {
  groupName: string;
  groupDescription: string;
  groupImage: string | null;    
  groupImageFile?: File | null; 
}

interface CreateGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateGroup: (data: NewGroupData) => Promise<void>; 
  mode?: 'create' | 'edit';
  initialData?: any;
}

const CreateGroupModal: React.FC<CreateGroupModalProps> = ({
  isOpen,
  onClose,
  onCreateGroup,
  mode = 'create',
  initialData
}) => {
  // Estados del formulario
  const [groupName, setGroupName] = useState("");
  const [groupDescription, setGroupDescription] = useState("");
  const [groupImage, setGroupImage] = useState<string | null>(null); 
  const [imageFile, setImageFile] = useState<File | null>(null);     
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && mode === 'edit' && initialData) {
      setGroupName(initialData.display || "");
      setGroupDescription(initialData.description || "");
      const isUrl = initialData.avatar?.startsWith('http') || initialData.avatar?.startsWith('data:');
      setGroupImage(isUrl ? initialData.avatar : null);
    } else if (isOpen && mode === 'create') {
      setGroupName("");
      setGroupDescription("");
      setGroupImage(null);
      setImageFile(null);
    }
  }, [isOpen, mode, initialData]);

  if (!isOpen) return null;

  // --- VALIDACIONES VISUALES ---
  const hasName = groupName.trim().length > 0;
  const hasDesc = groupDescription.trim().length > 0;
  const isFormValid = hasName && hasDesc;

  // Manejo de selección de imagen
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        fireStyledAlert({ icon: 'warning', title: 'Imagen muy pesada', text: 'Máximo 5MB.' });
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setGroupImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return; 
    
    setIsLoading(true);
    try {
      await onCreateGroup({ 
        groupName: groupName.trim(),
        groupDescription: groupDescription.trim(),
        groupImage, 
        groupImageFile: imageFile 
      });
    } catch (error: any) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in" onClick={onClose}>
      <div className="bg-[#313338] p-6 rounded-lg w-[440px] relative shadow-2xl border border-[#1e1f22] transform transition-all scale-100" onClick={(e) => e.stopPropagation()}>
        
        {/* Título dinámico */}
        <h2 className="text-2xl font-bold mb-2 text-center text-gray-100">
            {mode === 'edit' ? 'Ajustes del servidor' : 'Personaliza tu servidor'}
        </h2>
        <p className="text-center text-gray-400 text-sm mb-6">
            {mode === 'edit' ? 'Actualiza la identidad de tu espacio.' : 'Dale una identidad a tu nuevo espacio.'}
        </p>

        <form onSubmit={handleSubmit}>
          
          {/* --- UPLOAD DE IMAGEN --- */}
          <div className="flex justify-center mb-6">
            <div className="relative group">
                <div
                className={`w-24 h-24 rounded-full flex items-center justify-center cursor-pointer overflow-hidden transition-all duration-300 border-dashed border-2 ${groupImage ? 'border-purple-500' : 'border-gray-500 hover:border-gray-300 bg-[#2b2d31] hover:bg-[#404249]'}`}
                onClick={() => fileInputRef.current?.click()}
                title="Cambiar icono"
                >
                {groupImage ? (
                    <img src={groupImage} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                    <div className="flex flex-col items-center text-gray-400 group-hover:text-gray-200 transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mb-1"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>
                      <span className="text-[10px] font-bold uppercase">Subir</span>
                    </div>
                )}
                </div>
                {groupImage && mode === 'edit' && (
                   <div className="absolute bottom-0 right-0 bg-gray-900 p-1.5 rounded-full border border-gray-700 pointer-events-none">
                     <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-300"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.72v-.51a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                   </div>
                )}
            </div>
            <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" className="hidden" />
          </div>

          <div className="mb-4">
            <label className="block text-xs font-bold text-gray-300 uppercase mb-1.5 tracking-wide">
              Nombre del Servidor <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="Ej: La Taberna de los Juegos"
              className="w-full p-2.5 rounded bg-[#1e1f22] text-gray-100 border-none focus:ring-2 focus:ring-purple-500 transition-all font-medium placeholder-gray-500"
            />
          </div>

          <div className="mb-6">
            <label className="block text-xs font-bold text-gray-300 uppercase mb-1.5 tracking-wide">
              Descripción corta <span className="text-red-500">*</span>
            </label>
            <textarea
              value={groupDescription}
              onChange={(e) => setGroupDescription(e.target.value)}
              placeholder="¿De qué trata este lugar?"
              rows={2}
              className="w-full p-2.5 rounded bg-[#1e1f22] text-gray-100 border-none focus:ring-2 focus:ring-purple-500 resize-none transition-all placeholder-gray-500"
            />
          </div>

          <div className="flex flex-col bg-[#2b2d31] -mx-6 -mb-6 p-4 border-t border-[#1f2023] rounded-b-lg">
            
            
            {!isFormValid && (
                <div className="flex items-center gap-2 mb-3 px-1 animate-pulse">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="8" x2="12" y2="12"></line>
                        <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                    <span className="text-xs text-red-400 font-medium">
                        {!hasName ? "El servidor necesita un nombre" : "Añade una breve descripción"}
                    </span>
                </div>
            )}

            <div className="flex justify-between items-center">
                <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-300 hover:underline transition-colors" disabled={isLoading}>
                    Atrás
                </button>
                
                {/* Botón Dinámico (Bloqueado/Activo) */}
                <button
                    type="submit"
                    disabled={!isFormValid || isLoading}
                    className={`
                        px-6 py-2 rounded text-white font-medium transition-all duration-200 flex items-center justify-center min-w-[100px]
                        ${!isFormValid || isLoading 
                            ? 'bg-purple-900/50 cursor-not-allowed text-gray-400 opacity-50' // Estilo bloqueado
                            : 'bg-purple-600 hover:bg-purple-500 shadow-lg active:scale-95' // Estilo activo
                        }
                    `}
                >
                    {isLoading 
                        ? (
                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        ) 
                        : (mode === 'edit' ? 'Guardar Cambios' : 'Crear Servidor')
                    }
                </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateGroupModal;