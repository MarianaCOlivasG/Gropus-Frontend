import React, { useState, useRef, useEffect } from "react";
import { useChatStore } from "../../store/useChatStore";
import type { Message } from "../../store/types";

interface MessageBubbleProps {
  msg: Message;
  index: number;
  isGroup: boolean;
  groupKey: string; 
  channelId: string; 
  openUserProfile: (userKey: string) => void;
  deleteMessage: (index: number, messageId?: string) => void;
  pinMessage: (index: number | null, channelId: string) => void; 
  onImageLoad?: () => void;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({
  msg,
  index,
  isGroup,
  groupKey: _groupKey,
  channelId,
  openUserProfile,
  deleteMessage,
  pinMessage,
}) => {
  
  const store = useChatStore() as any;
  const { currentUser, currentMembers, openFilePreview } = store;
  const isCurrentUser = currentUser?.uid === msg.sender;
  
  
  const memberProfile = currentMembers.find((m: any) => m.key === msg.sender);
  const displayRole = memberProfile?.role || msg.role;

  const myProfile = currentMembers.find((m: any) => m.key === currentUser?.uid);
  const iAmAdmin = myProfile?.role === 'admin' || myProfile?.role === 'owner';
  const showMenu = isCurrentUser || (isGroup && iAmAdmin);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMenuOpen]);

  const roleBadge = (displayRole === 'admin' || displayRole === 'owner' || displayRole === 'moderator') ? (
    <span className={`text-[9px] px-1.5 py-0.5 rounded font-black uppercase tracking-tighter border ${
        displayRole === "owner" ? "bg-yellow-500/20 text-yellow-500 border-yellow-500/50" :
        displayRole === "admin" ? "bg-red-500/20 text-red-500 border-red-500/50" :
        "bg-blue-500/20 text-blue-400 border-blue-500/50"
      }`}
    >
      {displayRole === 'owner' ? 'Dueño' : displayRole}
    </span>
  ) : null;

  const alignment = isCurrentUser ? "flex-row-reverse space-x-reverse text-right" : "flex-row";
  const avatarSource = memberProfile?.avatar || msg.avatar || 'bg-gray-700';
  const isAvatarImage = avatarSource.startsWith('http') || avatarSource.startsWith('data:');

  const renderContent = () => {
    // IMÁGENES
    if (msg.attachmentType === "image" && msg.attachmentUrl) {
      return (
        <div className="mt-1">
          <img
            src={msg.attachmentUrl || ""}
            alt="Imagen adjunta"
            className="rounded-lg max-w-full md:max-w-[250px] max-h-[300px] object-cover border border-white/10 cursor-pointer hover:opacity-90 transition-opacity"
            onClick={() => openFilePreview(msg.attachmentUrl || "", "image", msg.fileName)}
          />
        </div>
      );
    }

    // PDF
    if (msg.attachmentType === "pdf" && msg.attachmentUrl) {
      return (
        <div className="flex items-center gap-3 bg-black/20 p-2 rounded-lg border border-white/10 min-w-[200px] max-w-full">
          <div className="bg-red-500/20 p-2 rounded text-red-400 flex-shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /></svg>
          </div>
          <div className="flex flex-col text-left overflow-hidden">
            <span className="text-xs text-gray-300 font-semibold truncate" title={msg.fileName}>{msg.fileName || "Documento PDF"}</span>
            <button 
              onClick={() => openFilePreview(msg.attachmentUrl || "", "pdf", msg.fileName)}
              className="text-[10px] text-blue-400 hover:underline truncate text-left"
            >
              Ver documento
            </button>
          </div>
        </div>
      );
    }

    // OTROS ARCHIVOS
    if (msg.attachmentType === "file" && msg.attachmentUrl) {
        return (
          <div className="flex items-center gap-3 bg-black/20 p-2 rounded-lg border border-white/10 min-w-[200px] max-w-full">
            <div className="bg-blue-500/20 p-2 rounded text-blue-400 flex-shrink-0">
               <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path><polyline points="13 2 13 9 20 9"></polyline></svg>
            </div>
            <div className="flex flex-col text-left overflow-hidden">
              <span className="text-xs text-gray-300 font-semibold truncate" title={msg.fileName}>{msg.fileName || "Archivo Adjunto"}</span>
              <a href={msg.attachmentUrl || ""} target="_blank" rel="noreferrer" className="text-[10px] text-blue-400 hover:underline">Descargar</a>
            </div>
          </div>
        );
    }

    const urlRegex = /^(http|https):\/\/[^ "]+$/;
    if (typeof msg.text === "string" && urlRegex.test(msg.text)) {
        return (
            <a href={msg.text} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline break-words">
                {msg.text}
            </a>
        );
    }

    return <span className="break-words leading-relaxed">{msg.text}</span>;
  };

  return (
    <div id={`msg-${index}`} className={`group flex items-start space-x-3 max-w-full relative ${alignment} mb-4 px-2`}>
      <div className="flex-shrink-0 cursor-pointer" onClick={() => openUserProfile(msg.sender)}>
        <div className={`w-10 h-10 rounded-full overflow-hidden flex items-center justify-center ${!isAvatarImage ? avatarSource : ''}`}>
          {isAvatarImage ? <img src={avatarSource} className="w-full h-full object-cover bg-gray-700" alt="" /> : <span className="text-white font-bold">{msg.name?.charAt(0)}</span>}
        </div>
      </div>

      <div className={`flex flex-col max-w-[75%] md:max-w-[70%] ${isCurrentUser ? "items-end" : "items-start"}`}>
        <div className={`text-xs text-gray-400 mb-1 flex items-center gap-2 ${isCurrentUser ? "flex-row-reverse" : "flex-row"}`}>
          <span className="font-bold text-gray-300">{msg.name}</span>
          {isGroup && roleBadge}
          <span className="opacity-70">• {msg.time}</span>
        </div>
      
        <div className={`p-2.5 rounded-2xl shadow-sm text-sm w-fit max-w-full break-words whitespace-pre-wrap ${
          isCurrentUser 
            ? "bg-purple-600 text-white rounded-tr-none" 
            : "bg-[#2b2d31] text-gray-100 rounded-tl-none border border-white/5"
        }`}>
          {renderContent()}
        </div>
      </div>

      {showMenu && (
        <div className="relative self-center">
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-gray-500 hover:text-white p-1.5 rounded-full hover:bg-white/5 opacity-0 group-hover:opacity-100 transition">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"></circle><circle cx="19" cy="12" r="1"></circle><circle cx="5" cy="12" r="1"></circle></svg>
          </button>
          
          {isMenuOpen && (
            <div ref={menuRef} className={`absolute bottom-full mb-2 bg-[#1e1f22] border border-white/10 rounded-xl shadow-2xl z-[100] w-32 overflow-hidden animate-in fade-in zoom-in duration-150 ${isCurrentUser ? 'right-0' : 'left-0'}`}>
                <button onClick={() => { pinMessage(index, channelId); setIsMenuOpen(false); }} className="w-full text-left px-3 py-2 text-gray-300 hover:bg-purple-600 hover:text-white text-xs flex items-center gap-2">
                  <span>📌</span> Fijar
                </button> 
              <button onClick={() => { deleteMessage(index, msg.id); setIsMenuOpen(false); }} className="w-full text-left px-3 py-2 text-red-400 hover:bg-red-500/10 text-xs flex items-center gap-2">
                <span>🗑️</span> Eliminar
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MessageBubble;