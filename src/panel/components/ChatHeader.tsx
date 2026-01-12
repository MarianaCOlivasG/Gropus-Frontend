import React from "react";

interface ChatHeaderProps {
  title: string;
  description: string | null;
  subtitle?: string;
  
  isGroup?: boolean;
  avatar?: string | null;
  tag?: string; 

  pinnedMessage: { text: string; index: number } | null;
  onUnpin: () => void;
  onJump: () => void;
  isMuted?: boolean;
  onToggleMute?: () => void;
  onToggleGallery: () => void;
  isGalleryActive: boolean;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ 
  title, subtitle, pinnedMessage, onUnpin, onJump, 
  isMuted, onToggleMute, onToggleGallery, isGalleryActive,
  isGroup, avatar, tag 
}) => {

  const isImageUrl = avatar?.startsWith('http') || avatar?.startsWith('data:');

  return (
    <header className="flex flex-col w-full z-20 shadow-sm select-none">
      <div className="bg-[#1e1f22]/50 backdrop-blur-md h-12 px-4 flex items-center justify-between border-b border-white/5">
        
        {/* LADO IZQUIERDO */}
        <div className="flex items-center min-w-0">
          
          {isGroup ? (
            // CANAL DE GRUPO
            <div className="flex items-baseline gap-1.5 min-w-0 overflow-hidden">
              <span className="text-white text-2xl font-bold tracking-tight">#</span>
              <h2 className="text-white text-lg font-bold truncate">
                {title.startsWith('#') ? title.substring(1) : title}
              </h2>
              {subtitle && (
                <span className="text-gray-400 text-sm font-medium ml-1 truncate opacity-80">
                  en {subtitle}
                </span>
              )}
            </div>
          ) : (
            // DISEÑO 2: CHAT PRIVADO (Con foto y badge)
            <div className="flex items-center gap-3">
               <div className="relative flex-shrink-0">
                  {isImageUrl ? (
                    <img src={avatar!} className="w-9 h-9 rounded-full object-cover border border-white/10" alt="" />
                  ) : (
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold bg-purple-600">
                      {title.charAt(0).toUpperCase()}
                    </div>
                  )}
                  {/* Punto de estado verde */}
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-[#23a559] border-2 border-[#1e1f22] rounded-full"></div>
               </div>
               
               <div className="flex flex-col justify-center min-w-0">
                  <div className="flex items-center gap-2">
                    <h2 className="text-white text-base font-bold truncate leading-tight">
                        {title}
                    </h2>
                    {/* Badge MODERADOR */}
                    {(tag || title.toLowerCase().includes('inary')) && (
                        <span className="bg-[#23a559] text-[9px] text-white font-black px-1.5 py-0.5 rounded-[4px] uppercase tracking-wider leading-none">
                        MODERADOR
                        </span>
                    )}
                  </div>
                  <span className="text-gray-400 text-xs font-medium truncate opacity-70">
                    {subtitle || "En línea"}
                  </span>
               </div>
            </div>
          )}
        </div>

        {/* LADO DERECHO */}
        <div className="flex items-center gap-2">
          <button 
            onClick={onToggleGallery}
            className={`p-2 rounded-lg transition-all ${isGalleryActive ? 'text-purple-400 bg-purple-500/10' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
            title="Galería multimedia"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
          </button>

          <button 
            onClick={onToggleMute}
            className={`p-2 rounded-lg transition-all ${isMuted ? 'text-red-400 bg-red-500/10' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
            title={isMuted ? "Quitar silencio" : "Silenciar canal"}
          >
            {isMuted ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13.73 21a2 2 0 0 1-3.46 0"/><path d="M18.63 13A17.89 17.89 0 0 1 18 8"/><path d="M6.26 6.26A5.86 5.86 0 0 0 6 8c0 7-3 9-3 9h14"/><path d="M18 8a6 6 0 0 0-9.33-5"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13.73 21a2 2 0 0 1-3.46 0"/><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/></svg>
            )}
          </button>
        </div>
      </div>

      {/* MENSAJE FIJADO */}
      {pinnedMessage && (
        <div className="px-4 py-2 bg-[#1e1f22]/30">
          <div className="bg-gradient-to-r from-purple-600/20 via-[#2b2d31]/80 to-transparent backdrop-blur-lg border border-white/10 p-2 rounded-xl flex items-center justify-between shadow-2xl ring-1 ring-purple-500/20 animate-in fade-in zoom-in duration-500">
            <div className="flex items-center gap-3 min-w-0 ml-2">
              <div className="relative flex-shrink-0">
                <span className="text-xl">📌</span>
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-purple-500 rounded-full animate-ping" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[10px] text-purple-400 font-black uppercase tracking-widest leading-none mb-1">Fijado</span>
                <p className="text-xs text-white font-medium truncate">{pinnedMessage.text}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 pr-2">
              <button onClick={onJump} className="bg-[#9146ff] hover:bg-[#772ce8] text-white text-[10px] px-4 py-1.5 rounded-lg font-black transition-all active:scale-95 uppercase">VER</button>
              <button onClick={onUnpin} className="text-gray-400 hover:text-white w-6 h-6 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors"><span className="text-lg">×</span></button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default ChatHeader;