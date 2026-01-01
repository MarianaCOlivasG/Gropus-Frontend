import React, { useState, useRef, useEffect } from "react";
import { useChatStore } from "../../store/useChatStore";
import type { Message } from "../../store/types";

interface MessageBubbleProps {
  msg: Message;
  index: number;
  isGroup: boolean;
  groupKey: string;
  openUserProfile: (userKey: string) => void;
  deleteMessage: (index: number, messageId?: string) => void;
  pinMessage: (index: number | null) => void;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({
  msg,
  index,
  isGroup,
  openUserProfile,
  deleteMessage,
  pinMessage,
}) => {
  const { currentUser, currentMembers } = useChatStore();

  const avatarSource = msg.avatar || 'bg-gray-700';
  const isAvatarImage = avatarSource.startsWith('http') || avatarSource.startsWith('data:');
  
  const isCurrentUser = currentUser?.uid === msg.sender;

  //Rol
  const memberProfile = currentMembers.find(m => m.key === msg.sender);
  const displayRole = memberProfile?.role || msg.role;

  //Permisos
  const myProfile = currentMembers.find(m => m.key === currentUser?.uid);
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
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const alignment = isCurrentUser ? "flex-row-reverse space-x-reverse text-right" : "flex-row";

  const roleBadge = (displayRole === 'admin' || displayRole === 'owner' || displayRole === 'moderator') ? (
    <span className={`ml-2 text-[10px] px-1.5 py-0.5 rounded uppercase font-bold tracking-wide ${
        displayRole === "owner" ? "bg-yellow-500/20 text-yellow-500 border border-yellow-500/50" :
        displayRole === "admin" ? "bg-red-500/20 text-red-500 border border-red-500/50" :
        "bg-blue-500/20 text-blue-400 border border-blue-500/50"
      }`}
    >
      {displayRole === 'owner' ? 'Dueño' : displayRole}
    </span>
  ) : null;

  const isImageMsg = msg.text.startsWith("<img src=");

  return (
    <div className={`group flex items-start space-x-3 max-w-full relative ${alignment} mb-4`}>
      
      <div 
        className="flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
        onClick={() => openUserProfile(msg.sender)}
      >
        <div className={`w-10 h-10 rounded-full overflow-hidden flex items-center justify-center ${!isAvatarImage ? avatarSource : ''}`}>
          {isAvatarImage ? (
            <img
              src={avatarSource}
              className="w-full h-full object-cover bg-gray-700"
              alt={msg.name}
            />
          ) : (
            <span className="text-white font-bold text-sm select-none">
               {msg.name ? msg.name.charAt(0).toUpperCase() : '?'}
            </span>
          )}
        </div>
      </div>

      <div className={isCurrentUser ? "flex flex-col max-w-xs items-end" : "flex flex-col max-w-xs"}>
        
        <div className={`text-xs text-gray-400 mb-1 flex items-center gap-1 ${isCurrentUser ? "flex-row-reverse" : "flex-row"}`}>
          <span className="font-bold text-gray-300 hover:underline cursor-pointer" onClick={() => openUserProfile(msg.sender)}>
              {msg.name}
          </span>
          <span className="text-[10px] opacity-70">• {msg.time}</span>
          {isGroup && !isCurrentUser && roleBadge}
        </div>
      
        <div className={`text-gray-100 p-2.5 rounded-2xl break-words shadow-sm text-sm relative group-hover:shadow-md transition-shadow ${
            isCurrentUser 
                ? "bg-purple-600 rounded-tr-none text-white" 
                : "bg-[#2b2d31] rounded-tl-none border border-gray-700/50"
        }`}>
          {isImageMsg ? <div dangerouslySetInnerHTML={{ __html: msg.text }} /> : msg.text}
        </div>
      </div>

      {showMenu && (
        <div ref={menuRef} className={`relative self-center px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 ${isCurrentUser ? 'mr-auto' : 'ml-auto'}`}>
          <button
            onClick={() => setIsMenuOpen((p) => !p)}
            className="text-gray-500 hover:text-white p-1.5 rounded-full hover:bg-gray-700/50 transition"
          >
             <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"></circle><circle cx="19" cy="12" r="1"></circle><circle cx="5" cy="12" r="1"></circle></svg>
          </button>
          
          {isMenuOpen && (
            <div className={`absolute top-0 mt-8 bg-[#1e1f22] border border-gray-700 rounded shadow-xl z-50 w-32 overflow-hidden ${isCurrentUser ? 'right-0' : 'left-0'}`}>
              
              {iAmAdmin && (
                  <button
                    onClick={() => {
                      pinMessage(index);
                      setIsMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-gray-300 hover:bg-purple-600 hover:text-white text-xs flex items-center gap-2 transition-colors"
                  >
                    <span>📌</span> Fijar
                  </button>
              )}

              <button
                onClick={() => {
                  deleteMessage(index, msg.id);
                  setIsMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 text-red-400 hover:bg-red-500/10 text-xs flex items-center gap-2 transition-colors"
              >
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