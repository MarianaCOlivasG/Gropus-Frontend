import React, { useState, useEffect, useRef } from "react";
import { useChatStore } from "../../store/useChatStore"; 
import { fireStyledAlert } from "../../utils/alerts";

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any; 
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({ isOpen, onClose, user }) => {
  const { updateUserProfile } = useChatStore(); 

  // ESTADOS
  const [name, setName] = useState(user?.name || "");
  const [bio, setBio] = useState(""); 
  const [isUpdating, setIsUpdating] = useState(false);

  // ESTADOS PARA IMAGEN
  const [previewImage, setPreviewImage] = useState<string | null>(null); 
  const [imageFile, setImageFile] = useState<File | null>(null); 
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Banners decorativos 
  const bannerOptions = [
    { id: 1, style: "bg-gradient-to-r from-purple-600 to-blue-600", label: "Galaxia" },
    { id: 2, style: "bg-gradient-to-tr from-fuchsia-500 via-purple-600 to-indigo-700", label: "Neo-Purple" },
    { id: 3, style: "bg-[#7289da] bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]", label: "Fibra" },
    { id: 4, style: "bg-indigo-900 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-purple-500 to-transparent", label: "Eclipse" },
    { id: 5, style: "bg-purple-900 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]", label: "Cubos" },
    { id: 6, style: "bg-gradient-to-r from-pink-500 to-purple-500", label: "Atardecer" },
    { id: 7, style: "bg-[#1e1f22] border-b-4 border-purple-500 bg-[url('https://www.transparenttextures.com/patterns/circuit-board.png')]", label: "Tech" },
    { id: 8, style: "bg-gradient-to-b from-purple-400 to-purple-900 opacity-90", label: "Sólido" },
  ];
  const [selectedBanner, setSelectedBanner] = useState(bannerOptions[0].style);

  useEffect(() => {
    if (isOpen) {
      setName(user?.name || "");
      const currentAvatar = user?.avatar || "";
      const isUrl = currentAvatar.startsWith("http") || currentAvatar.startsWith("data:");
      setPreviewImage(isUrl ? currentAvatar : null);
      setImageFile(null);
      setIsUpdating(false);
    }
  }, [isOpen, user]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        fireStyledAlert({ title: 'Imagen muy pesada', text: 'Máximo 5MB', icon: 'warning' });
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreviewImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleUpdate = async () => {
    if (!name.trim()) return;
    
    setIsUpdating(true);
    try {
        await updateUserProfile({
            name: name,
            bio: bio,
            imageFile: imageFile 
            
        });

        fireStyledAlert({ title: 'Perfil Actualizado', icon: 'success' });
        onClose();
    } catch (error) {
        console.error(error);
        fireStyledAlert({ title: 'Error', text: 'No se pudo actualizar el perfil', icon: 'error' });
    } finally {
        setIsUpdating(false);
    }
  };

  if (!isOpen) return null;

  const displayName = name || user?.name || "U";
  const defaultAvatarClass = user?.avatar && !user.avatar.startsWith('http') ? user.avatar : 'bg-gray-700';

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/85 backdrop-blur-sm p-4" onClick={onClose}>
      <div 
        className="bg-[#1e1f22] w-full max-w-[580px] rounded-[32px] overflow-hidden shadow-[0_0_80px_rgba(0,0,0,0.6)] border border-white/5 animate-in fade-in zoom-in duration-300" 
        onClick={(e) => e.stopPropagation()}
      >
        {/* BANNER */}
        <div className={`h-40 w-full relative transition-all duration-500 ${selectedBanner} group`}>
            <button onClick={onClose} className="absolute top-5 right-5 bg-[#111214]/60 hover:bg-red-500/80 text-white w-9 h-9 rounded-full flex items-center justify-center transition-all z-10">✕</button>
        </div>

        <div className="px-10 pb-10">
            <div className="flex items-end gap-6 -mt-20 mb-8">
                
                <div 
                    className="relative group cursor-pointer shrink-0"
                    onClick={() => fileInputRef.current?.click()} 
                >
                    <div className="relative w-36 h-36 rounded-full overflow-hidden border-[10px] border-[#1e1f22] bg-[#313338] shadow-2xl transition-transform group-hover:scale-105 flex items-center justify-center">
                        
                        {previewImage ? (
                            <img 
                                src={previewImage} 
                                className="w-full h-full object-cover transition-all group-hover:brightness-[0.4]"
                                alt="Preview"
                            />
                        ) : (
                            <div className={`w-full h-full flex items-center justify-center text-white text-5xl font-bold transition-all group-hover:brightness-[0.4] ${defaultAvatarClass}`}>
                                {displayName.charAt(0).toUpperCase()}
                            </div>
                        )}

                        {/* Overlay */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 bg-black/10">
                            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="drop-shadow-lg">
                                <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/>
                                <circle cx="12" cy="13" r="3"/>
                            </svg>
                            <span className="text-white text-[10px] font-black uppercase tracking-tighter mt-1 drop-shadow-md">Cambiar Foto</span>
                        </div>
                    </div>
                    
                    {/* Input oculto */}
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleImageChange} 
                        accept="image/*" 
                        className="hidden" 
                    />

                    <div className="absolute bottom-2 right-2 w-8 h-8 bg-green-500 border-[6px] border-[#1e1f22] rounded-full shadow-lg z-10"></div>
                </div>

                <div className="pb-4">
                    <h1 className="text-white text-3xl font-black tracking-tight drop-shadow-xl transition-all">
                        {name || user?.name || "Usuario"} 
                    </h1>
                    <div className="flex items-center gap-2 mt-1">
                        <span className="bg-purple-500/20 text-purple-400 text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-wider">Perfil</span>
                        <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest opacity-60">Personalización</p>
                    </div>
                </div>
            </div>

            {/* FORMULARIOS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <div>
                        <label className="text-purple-400 text-[10px] font-black uppercase tracking-[0.2em] mb-3 block">Identidad</label>
                        <input 
                            type="text" 
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-[#2b2d31] text-white p-4 rounded-2xl border border-white/5 focus:border-purple-500 focus:bg-[#1e1f22] outline-none transition-all shadow-inner"
                            placeholder="Tu nombre..."
                            maxLength={32}
                        />
                    </div>
                    <div>
                        <label className="text-purple-400 text-[10px] font-black uppercase tracking-[0.2em] mb-3 block">Tu Historia</label>
                        <textarea 
                            rows={4}
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            placeholder="Cuéntanos un poco sobre ti..."
                            className="w-full bg-[#2b2d31] text-white p-4 rounded-2xl border border-white/5 focus:border-purple-500 focus:bg-[#1e1f22] outline-none transition-all resize-none shadow-inner"
                        />
                    </div>
                </div>
                <div className="bg-[#2b2d31]/30 p-6 rounded-[32px] border border-white/5">
                    <label className="text-purple-400 text-[10px] font-black uppercase tracking-[0.2em] mb-4 block text-center">Colección Visual</label>
                    <div className="grid grid-cols-4 gap-3">
                        {bannerOptions.map((opt) => (
                            <button 
                                key={opt.id}
                                onClick={() => setSelectedBanner(opt.style)}
                                className={`w-full aspect-square rounded-xl ${opt.style} border-2 transition-all hover:scale-110 active:scale-95 ${selectedBanner === opt.style ? 'border-white shadow-[0_0_20px_rgba(168,85,247,0.3)]' : 'border-transparent opacity-50 hover:opacity-100'}`}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>

        <footer className="p-6 bg-[#111214] flex justify-end gap-5 items-center px-10 border-t border-white/[0.03]">
            <button onClick={onClose} disabled={isUpdating} className="text-gray-500 text-xs font-bold hover:text-white transition-opacity uppercase tracking-widest disabled:opacity-20">Descartar</button>
            <button 
                onClick={handleUpdate}
                disabled={isUpdating}
                className={`relative bg-purple-600 hover:bg-purple-500 text-white px-10 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-3
                    ${isUpdating ? 'opacity-80 cursor-wait' : 'hover:shadow-[0_0_20px_rgba(147,51,234,0.3)]'}
                `}
            >
                {isUpdating ? (
                    <>
                        <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Actualizando...</span>
                    </>
                ) : (
                    "Actualizar Perfil"
                )}
            </button>
        </footer>
      </div>
    </div>
  );
};

export default EditProfileModal;