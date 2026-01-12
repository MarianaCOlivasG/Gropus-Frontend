import React, { useState } from "react";
import Swal from 'sweetalert2';
import EditProfileModal from "./EditProfileModal"; 

export interface CurrentUser {
  uid: string;
  name: string;
  avatar: string;
}

interface Friend {
  key: string;
  chat: string;
  name: string;
  avatar: string;
  status: "active" | "offline" | string;
}

interface Group {
  key: string;
  display: string;
  avatar: string;
}

interface SidebarProps {
  friendsList: Friend[];
  groupList: Group[];
  loadChat: (chatKey: string) => void;
  currentChatKey: string | null;
  onOpenCreateGroup: () => void;
  loadingGroupChannels: Record<string, boolean>;
  onLogout: () => void;
  currentUser: CurrentUser | null;
}

const Sidebar: React.FC<SidebarProps> = ({
  friendsList,
  groupList,
  loadChat,
  currentChatKey,
  onOpenCreateGroup,
  onLogout,
  currentUser,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const filteredFriends = friendsList.filter((friend) =>
    friend.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleLogoutClick = () => {
    Swal.fire({
        title: '¿Cerrar Sesión?',
        text: "¿Estás seguro de que quieres salir?",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sí, salir',
        cancelButtonText: 'Cancelar',
        background: '#1f2937', 
        color: '#fff'
    }).then((result) => {
        if (result.isConfirmed) {
            onLogout();
        }
    });
  };

  return (
    <div className="w-20 bg-gray-800 flex flex-col py-3 h-full items-center shrink-0 border-r border-gray-900">

      {/* BUSCADOR */}
      <div className="px-2 w-full mb-3">
        <input
            type="text"
            placeholder="Buscar"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-1.5 rounded-md bg-gray-900 text-gray-200 text-xs 
                        focus:outline-none focus:ring-1 focus:ring-purple-500 
                        text-center placeholder-gray-500 transition-all border border-gray-700"
        />
      </div>
      
      <div className="w-8 h-[2px] bg-gray-700 rounded-lg mb-3"></div>

      {/*LISTA CENTRAL*/}
      <div className="flex-1 w-full overflow-y-auto scrollbar-hide flex flex-col items-center gap-3">

        {/* SECCIÓN AMIGOS */}
        {filteredFriends.map((f) => {
            const isActive = currentChatKey === f.chat;
            const statusColor = f.status === "active" ? "bg-green-500" : "bg-gray-500";
            const avatarSafe = f.avatar || "";
            const isImage = avatarSafe.startsWith("data:") || avatarSafe.startsWith("http");
            return (
                <div key={f.chat} className="relative group w-full flex justify-center">
                    <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 bg-white rounded-r-lg transition-all duration-200 ${isActive ? 'h-8' : 'h-2 scale-0 group-hover:scale-100 group-hover:h-4'}`} />
                    <div 
                        onClick={() => loadChat(f.chat)} 
                        title={f.name} 
                        className={`
                            w-12 h-12 cursor-pointer relative 
                            flex items-center justify-center overflow-hidden 
                            transition-all duration-300 ease-out 
                            ${isActive 
                                ? "bg-purple-600 rounded-[16px] -translate-y-1 shadow-lg shadow-purple-900/50" 
                                : "bg-gray-700 rounded-[24px] group-hover:rounded-[16px] group-hover:bg-purple-600 group-hover:-translate-y-1"
                            }
                        `}
                    >
                        {isImage ? (
                            <img 
                                src={f.avatar} 
                                className="w-full h-full object-cover transition-transform group-hover:scale-110" 
                                alt={f.name} 
                            />
                        ) : (
                            <span className={`font-bold text-sm ${isActive ? "text-white" : "text-gray-200 group-hover:text-white"}`}>
                                {f.name.charAt(0).toUpperCase()}
                            </span>
                        )}
                            {/* Indicador de estado */}
                        <span className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-[3px] border-gray-800 ${statusColor}`}></span>
                    </div>
                </div>
            );
        })}

        {groupList.length > 0 && <div className="w-8 h-[2px] bg-gray-700 rounded-lg my-1"></div>}

        {/* SECCIÓN GRUPOS */}
        {groupList.map((g) => {
            const isActive = currentChatKey === g.key;
            const isImage = g.avatar.startsWith("data:") || g.avatar.startsWith("http");
            return (
            <div key={g.key} className="relative group w-full flex justify-center">
                <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 bg-white rounded-r-lg transition-all duration-200 ${isActive ? 'h-10' : 'h-2 scale-0 group-hover:scale-100 group-hover:h-5'}`} />
                <div onClick={() => loadChat(g.key)} title={g.display} className={`w-12 h-12 flex items-center justify-center cursor-pointer overflow-hidden transition-all duration-300 ease-out ${isActive ? "rounded-[16px] bg-purple-600 text-white -translate-y-1 shadow-lg shadow-purple-900/50" : "rounded-[24px] bg-gray-700 text-gray-200 group-hover:rounded-[16px] group-hover:bg-purple-600 group-hover:text-white group-hover:-translate-y-1"}`}>
                    {isImage ? <img src={g.avatar} alt="G" className="w-full h-full object-cover" /> : <span className="font-bold text-sm">{g.display.substring(0, 2).toUpperCase()}</span>}
                </div>
            </div>
            );
        })}
      </div>

      {/* --- ZONA INFERIOR --- */}
      <div className="w-full flex flex-col items-center gap-3 mt-2 pt-2 border-t border-gray-700 pb-2">
        
        {/* BOTÓN CREAR GRUPO */}
        <div className="group relative">
            <button
                onClick={onOpenCreateGroup}
                title="Añadir un servidor"
                className="w-12 h-12 flex items-center justify-center bg-gray-700 text-green-500 hover:bg-green-600 hover:text-white rounded-[24px] hover:rounded-[16px] transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-lg hover:shadow-green-900/50"
            >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition-transform duration-300 group-hover:rotate-90">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
            </button>
        </div>

        <div className="w-8 h-[2px] bg-gray-700 rounded-lg"></div>

        {/* AVATAR DEL USUARIO*/}
        <div 
            className="relative group cursor-pointer" 
            onClick={() => setIsEditProfileOpen(true)} 
        >
             <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-600 ring-2 ring-transparent group-hover:ring-purple-500 transition-all">
                {(() => {
                    const avatar = currentUser?.avatar || 'bg-gray-700';
                    const name = currentUser?.name || "Tú";
                    const isImage = avatar.startsWith('http') || avatar.startsWith('data:');

                    return isImage ? (
                        <img 
                            src={avatar} 
                            alt="Yo" 
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className={`w-full h-full flex items-center justify-center text-white font-bold text-sm ${avatar}`}>
                            {name.charAt(0).toUpperCase()}
                        </div>
                    );
                })()}
             </div>
             {/* Indicador de estado */}
             <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-gray-800 rounded-full"></div>
             
             {/* Tooltip con nombre */}
             <div className="absolute left-14 top-1/2 -translate-y-1/2 bg-black text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-lg font-black uppercase tracking-tighter">
                {currentUser?.name || "Tú"} 
             </div>
        </div>

        {/* BOTÓN CERRAR SESIÓN */}
        <div className="group relative">
            <button
                onClick={handleLogoutClick}
                title="Cerrar Sesión"
                className="w-10 h-10 flex items-center justify-center bg-gray-700/50 text-gray-400 hover:bg-red-500 hover:text-white rounded-[20px] hover:rounded-[12px] transition-all duration-300 ease-out hover:shadow-lg hover:shadow-red-900/50 hover:translate-x-1"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                    <polyline points="16 17 21 12 16 7"></polyline>
                    <line x1="21" y1="12" x2="9" y2="12"></line>
                </svg>
            </button>
        </div>

      </div>

      <EditProfileModal 
        isOpen={isEditProfileOpen} 
        onClose={() => setIsEditProfileOpen(false)} 
        user={currentUser}
      />
    </div>
  );
};

export default Sidebar;