import React, { useMemo, useState } from "react";
import { useChatStore } from "../../store/useChatStore";
import type { GroupMember } from '../../store/types';
import { UserTagAssigner } from "./UserTagAssigner"; 
import EditProfileModal from "./EditProfileModal"; 

interface UserProfileModalProps {
  isOpen: boolean;
  userKey: string | undefined;
  initialUser?: GroupMember | any | null;
  onClose: () => void;
}

const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  userKey,
  initialUser,
  onClose
}) => {
  const { currentMembers, allFriends, currentUser, getOrCreatePrivateChat  } = useChatStore();
  
  const [isEditOpen, setIsEditOpen] = useState(false);

  const isMe = useMemo(() => {
    return currentUser && (String(currentUser.uid) === String(userKey));
  }, [currentUser, userKey]);

  const user = useMemo(() => {
    if (!userKey) return null;
    const groupMember = currentMembers.find((m) => m.key === userKey);
    const initialData = (initialUser && initialUser.key === userKey) ? initialUser : null;
    const contextData = groupMember || initialData;

    if (isMe) {
       return {
        key: currentUser?.uid,
        name: currentUser?.name || "Yo",
        avatar: currentUser?.avatar || 'bg-gray-700',
        status: 'online',
        role: 'admin',
        tags: [] 
      };
    }
    
    if (contextData) return contextData;
    const friend = allFriends.find((f) => f.key === userKey);
    if (friend) return friend;

    return null;
  }, [userKey, initialUser, currentMembers, allFriends, currentUser, isMe]);

  const handleSendMessage = () => {
    if (!user) return;
    getOrCreatePrivateChat(user);
    onClose();
  };

  if (!isOpen || !userKey || !user) return null;

  return (
    <>
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-[#313338] w-full max-w-md rounded-3xl overflow-hidden shadow-2xl border border-gray-700 animate-in fade-in zoom-in duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="h-24 bg-gradient-to-r from-purple-600 to-blue-600" />
        <div className="px-6 pb-8">
        <div className="relative flex justify-between items-end -mt-12 mb-4">
            
            {(() => {
                const avatar = user.avatar || 'bg-gray-700';
                const isImage = avatar.startsWith('http') || avatar.startsWith('data:');

                return isImage ? (
                    <img 
                        src={avatar} 
                        alt={user.name} 
                        className="w-24 h-24 rounded-2xl border-4 border-[#313338] bg-gray-700 object-cover" 
                    />
                ) : (
                    <div className={`w-24 h-24 rounded-2xl border-4 border-[#313338] flex items-center justify-center text-white text-4xl font-bold ${avatar}`}>
                        {user.name.charAt(0).toUpperCase()}
                    </div>
                );
            })()}

            <button onClick={onClose} className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-xl transition-colors mb-1 text-sm font-medium">Cerrar</button>
        </div>

              <div className="space-y-1">
                 <h2 className="text-2xl font-bold text-white">{user.name}</h2>
              </div>

              <div className="mt-6 space-y-4">
                 <div className="bg-[#2b2d31] p-4 rounded-2xl border border-gray-700/50">
                    <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">Estado</h3>
                    <p className="text-gray-300 text-sm leading-relaxed flex items-center gap-2">
                        <span className="text-green-400 font-medium">● {user.status || 'Desconectado'}</span>
                    </p>
                 </div>

                 {"tags" in user && (
                    <UserTagAssigner member={user as GroupMember} />
                 )}

                 <div className="flex flex-col space-y-2">
                    {isMe ? (
                      <button 
                        onClick={() => setIsEditOpen(true)}
                        className="w-full bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 rounded-xl transition-all shadow-lg"
                      >
                        Editar Perfil
                      </button>
                    ) : (
                      <button onClick={handleSendMessage} className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-purple-900/20">
                        Enviar Mensaje
                      </button>
                    )}
                 </div>
              </div>
          </div>
        </div>
      </div>
  
      <EditProfileModal 
        isOpen={isEditOpen} 
        user={user}
        onClose={() => setIsEditOpen(false)} 
      />
    </>
  );
};

export default UserProfileModal;