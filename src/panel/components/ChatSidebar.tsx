import React, { useState } from "react";
import { useChatStore } from "../../store/useChatStore";
import { useChannelActions } from "../../hooks/useChannelActions";
import { fireStyledAlert } from "../../utils/alerts";
import { ChannelSettingsModal } from "./ChannelSettingsModal"; 
import type { ChannelItem, Tag } from "../../store/types";
import { usePermission } from "../../hooks/usePermission"; 

interface ChatSidebarProps {
  chatName: string;
  isGroup: boolean;
  currentChatKey: string;
  currentChannels: string[];
  currentChannel: string | null;
  mutedChannels: Set<string>;
  currentChannelObjects: ChannelItem[] | any[]; 
  
  loadChannel: (c: string) => void;
  toggleMuteChannel: (key: string) => void;
  createNewChannel: (name: string) => void;
  updateChannel: (id: string, name: string) => void;
  deleteChannel: (id: string) => void;
  deleteGroup: (key: string) => void;
  onEditGroup?: () => void;
}

const ChatSidebar: React.FC<ChatSidebarProps> = ({
  chatName, isGroup, currentChannels, currentChannel, 
  mutedChannels, currentChatKey, currentChannelObjects,
  loadChannel, toggleMuteChannel, createNewChannel, updateChannel, deleteChannel, 
  deleteGroup, onEditGroup
  }) => {
  const { currentUser, currentMembers} = useChatStore();
  const { handleCreate, handleDelete } = useChannelActions(createNewChannel, updateChannel, deleteChannel);
  const [channelToEdit, setChannelToEdit] = useState<ChannelItem | null>(null);

  const onTrashClick = async () => {
    const result = await fireStyledAlert({
      title: "¿Eliminar Grupo?",
      text: `Vas a eliminar "${chatName}" y todos sus mensajes.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
    });

    if (result.isConfirmed) {
      deleteGroup(currentChatKey);
    }
  };

  if (!isGroup) return null; 

  const formatChannelName = (name: string) => (name.startsWith("#") ? name : `#${name}`);
  const getFullChannelObj = (key: string) => currentChannelObjects.find((ch) => ch.key === key);
  
  const canCreate = usePermission('create_channel');
  const canEdit = usePermission('edit_channel');
  const canDelete = usePermission('delete_channel');

  const myMemberProfile = currentMembers.find(m => m.key === currentUser?.uid);
  const myRole = myMemberProfile?.role;
  const myTags = myMemberProfile?.tags || [];

  const visibleChannels = currentChannels.filter((c) => {
    const channelObj = getFullChannelObj(c);
    if (!channelObj) return false;

    if (channelObj.name.toLowerCase() === 'general') return true;
    if (myRole === 'owner' || myRole === 'admin') return true;
    if (!channelObj.tags || channelObj.tags.length === 0) return true;

    const hasAccess = channelObj.tags.some((channelTag: Tag) => 
        myTags.some(userTag => userTag.uid === channelTag.uid)
    );

    return hasAccess;
  });

  return (
    <div className="w-60 bg-gray-900 flex flex-col h-full border-r border-gray-700">
      
      {/* CABECERA */}
      <div className="h-12 flex items-center justify-between px-4 shadow-sm border-b border-gray-700 hover:bg-gray-800 transition-colors duration-200 group/header">
        <div className="font-bold text-gray-100 truncate flex-1 mr-2 cursor-default select-none" title={chatName}>
            {chatName}
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover/header:opacity-100 transition-opacity duration-200">
            <button 
                onClick={onEditGroup} 
                className="text-gray-500 hover:text-gray-200 transition-all duration-200 p-1.5 rounded-md hover:bg-gray-700"
                title="Ajustes del Grupo"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.72v-.51a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                </svg>
            </button>
            <button 
                onClick={onTrashClick}
                className="text-gray-500 hover:text-red-500 transition-all duration-200 p-1.5 rounded-md hover:bg-gray-700"
                title="Eliminar grupo permanentemente"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
            </button>
        </div>
      </div>
    
      <div className="flex-1 overflow-y-auto p-2 space-y-0.5 scrollbar-thin scrollbar-thumb-gray-800 scrollbar-track-transparent">
        {visibleChannels.map((c) => {
          const fullKey = `${currentChatKey}${c}`;
          const isMuted = mutedChannels.has(fullKey);
          const channelObj = getFullChannelObj(c); 
          const cId = channelObj?.id;
          const isActive = currentChannel === c;
          const isPrivate = channelObj?.tags && channelObj.tags.length > 0;
          return (
            <div 
              key={c} 
              className={`
                group flex justify-between items-center px-2 py-1.5 rounded-md mx-1 cursor-pointer transition-all duration-200 select-none
                ${isActive 
                  ? 'bg-gray-800 text-purple-400' 
                  : 'text-gray-400 hover:bg-gray-800/50 hover:text-purple-400' 
                }
              `}
              onClick={() => loadChannel(c)}
            >
              <div className="flex items-center flex-1 min-w-0 overflow-hidden">
                <span className={`text-lg mr-1 font-light opacity-50 flex items-center justify-center w-5 ${isActive ? 'text-purple-400' : 'text-gray-500'}`}>
                    {isPrivate ? (
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                    ) : "#"}
                </span>
                <span className="truncate text-sm font-medium transition-colors">
                    {formatChannelName(c).replace('#', '')}
                </span>
              </div>
              
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  
                  {/* Botón Mute */}
                  <button 
                    onClick={(e) => { e.stopPropagation(); toggleMuteChannel(fullKey); }} 
                    className={`p-1 rounded hover:bg-gray-700 transition-colors ${isMuted ? 'text-red-400' : 'text-gray-400 hover:text-yellow-400'}`}
                    title={isMuted ? "activar sonido" : "silenciar"}
                  >
                    {isMuted ? (
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13.73 21a2 2 0 0 1-3.46 0"></path><path d="M18.63 13A17.89 17.89 0 0 1 18 8"></path><path d="M6.26 6.26A5.86 5.86 0 0 0 6 8c0 7-3 9-3 9h14"></path><path d="M18 8a6 6 0 0 0-9.33-5"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
                    )}
                  </button>

                  {cId && (
                    <>
                      {/* Botón Editar Canal */}
                      {canEdit && (
                      <button 
                        onClick={(e) => { 
                            e.stopPropagation(); 
                            if (channelObj) setChannelToEdit(channelObj); 
                        }} 
                        className="p-1 text-gray-400 hover:text-blue-400 hover:bg-gray-700 rounded transition-colors"
                        title="Configurar canal"
                      >
                         <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.09a2 2 0 0 1 1-1.74v-.47a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.39a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path><circle cx="12" cy="12" r="3"></circle>
                         </svg>
                      </button>
                      )}
                      {/* Botón Eliminar Canal */}
                      {canDelete && (
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleDelete(cId, c); }} 
                        className="p-1 text-gray-400 hover:text-red-500 hover:bg-gray-700 rounded transition-colors"
                        title="eliminar"
                      >
                         <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                      </button>
                      )}
                    </>
                  )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="p-3 border-t border-gray-700/50">
      {canCreate && (
        <button 
            onClick={handleCreate} 
            title="Crear un nuevo canal"
            className="w-full flex items-center justify-center gap-2 px-2 py-2 text-gray-400 hover:text-white hover:bg-purple-600/20 hover:border-purple-500/50 border border-dashed border-gray-700 rounded-md transition-all duration-200 text-sm font-medium group"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500 group-hover:text-purple-400 transition-colors">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          <span>Crear Canal</span>
        </button>
        )}
      </div>

      {/* Modal Edición de Canal */}
      {channelToEdit && (
        <ChannelSettingsModal
            isOpen={!!channelToEdit}
            channel={channelToEdit}
            onClose={() => setChannelToEdit(null)}
        />
      )}

    </div>
  );
};

export default ChatSidebar;