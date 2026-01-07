import React, { useState } from "react";
import { useChatStore } from "../../store/useChatStore";
import { type GroupMember } from "../../store/types"; 
import { TagManagerModal } from "./TagManagerModal";
import { usePermission } from "../../hooks/usePermission";
import Swal from "sweetalert2"; 

interface MembersBarProps {
  members: GroupMember[];
  groupKey?: string | null; 
  openAddMemberModal: () => void;
  openUserProfile: (member: GroupMember) => void;
}

const MembersBar: React.FC<MembersBarProps> = ({
  members,
  groupKey, 
  openAddMemberModal,
  openUserProfile,
}) => {
  const { currentUser, kickMember } = useChatStore();
  const [isTagManagerOpen, setIsTagManagerOpen] = useState(false);
  //const myProfile = members.find(m => m.key === currentUser?.uid);
  //const iAmAdmin = myProfile?.role === 'admin' || myProfile?.role === 'owner';
  const canKick = usePermission('kick_members');
  const canCreateTag = usePermission('tag_assigner');
  const canAddMembers = usePermission('add_members')
  
  const handleKick = async (memberUid: string, memberName: string) => {
    if (!groupKey) return;

    const result = await Swal.fire({
        title: `¿Expulsar a ${memberName}?`,
        text: "El usuario será eliminado del grupo.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sí, expulsar',
        background: '#1f2937',
        color: '#fff'
    });

    if (result.isConfirmed) {
        await kickMember(groupKey, memberUid);
    }
  };

  return (
    <div className="hidden lg:flex w-60 bg-gray-800 border-l border-gray-700 p-4 flex-col h-full relative">
      
      {/* HEADER DE MIEMBROS */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-gray-400 uppercase text-xs font-bold tracking-wider">
          Miembros — {members.length}
        </h3>
        
        <div className="flex gap-1">
            {/* Botones de Admin */}
            {canCreateTag  && (
                <button 
                onClick={() => setIsTagManagerOpen(true)}
                className="text-gray-400 hover:text-blue-400 transition-colors p-1"
                title="Gestionar Roles y Etiquetas"
                >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.09a2 2 0 0 1 1-1.74v-.47a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.39a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                </button>
            )}
            {canAddMembers  && (
            <button 
              onClick={openAddMemberModal}
              className="text-gray-400 hover:text-green-400 transition-colors text-lg font-bold p-1 leading-none flex items-center"
              title="Añadir miembro al grupo"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            </button>
            )}
        </div>
      </div>

      {/* LISTA DE MIEMBROS */}
      <div className="flex-1 overflow-y-auto space-y-3 scrollbar-thin scrollbar-thumb-gray-600 custom-scrollbar">
        {members.map((member) => {
            const isMe = currentUser?.uid === member.key; 
            const safeName = member.name || ""; 
            const avatar = member.avatar || 'bg-gray-700';
            const isImage = avatar.startsWith('http') || avatar.startsWith('data:');
            const isTargetOwner = member.role === 'owner' || member.role === 'admin';

            return (
              <div
                key={member.key}
                className="relative flex items-center space-x-3 cursor-pointer hover:bg-gray-700 p-1.5 rounded transition duration-200 group"
                onClick={() => openUserProfile(member)}
              >
                <div className="relative flex-shrink-0">
                  {isImage ? (
                    <img
                      src={avatar}
                      alt={safeName}
                      className="w-8 h-8 rounded-full object-cover bg-gray-600"
                    />
                  ) : (
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${avatar}`}>
                       {safeName.substring(0, 1).toUpperCase()}
                    </div>
                  )}

                  <div className={`absolute bottom-0 right-0 w-2.5 h-2.5 border-2 border-gray-800 rounded-full ${member.status === 'online' ? 'bg-green-500' : 'bg-gray-500'}`}></div>
                </div>

                {/* Info del Usuario */}
                <div className="flex flex-col min-w-0 flex-1">
                  <div className="flex justify-between items-center">
                      <span className="text-gray-300 text-sm font-medium truncate group-hover:text-white transition-colors flex items-center">
                        {isMe && <span className="text-green-400 font-bold mr-1 italic text-xs">(Yo)</span>}
                        {safeName}
                      </span>
                  </div>
                  
                  {/* Roles y Tags */}
                  {member.role && member.role !== 'member' && (
                    <span className={`text-[10px] uppercase font-bold tracking-wide ${
                      member.role === 'admin' ? 'text-yellow-500' : 'text-blue-400'
                    }`}>
                      {member.role}
                    </span>
                  )}

                  {member.tags && member.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-0.5">
                          {member.tags.slice(0, 2).map(t => (
                              <span key={t.uid} className="text-[9px] px-1 rounded text-white" style={{ backgroundColor: t.color || '#666' }}>
                                  {t.name}
                              </span>
                          ))}
                          {member.tags.length > 2 && <span className="text-[9px] text-gray-500">+{member.tags.length - 2}</span>}
                      </div>
                  )}
                </div>

                {canKick && !isTargetOwner && !isMe &&  (
                  
                    <button
                        onClick={(e) => {
                            e.stopPropagation(); 
                            handleKick(member.key, member.name);
                        }}
                        className="absolute right-2 opacity-0 group-hover:opacity-100 bg-gray-800 hover:bg-red-500 text-gray-400 hover:text-white p-1.5 rounded transition-all duration-200 shadow-lg"
                        title="Expulsar del grupo"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                            <circle cx="8.5" cy="7" r="4"></circle>
                            <line x1="23" y1="11" x2="17" y2="11"></line>
                        </svg>
                    </button>
                )}

              </div>
            );
        })}
      </div>

      <TagManagerModal 
        isOpen={isTagManagerOpen} 
        onClose={() => setIsTagManagerOpen(false)} 
      />

    </div>
  );
};

export default MembersBar;