import React, { useState } from "react";

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
}

const Sidebar: React.FC<SidebarProps> = ({
  friendsList,
  groupList,
  loadChat,
  currentChatKey,
  onOpenCreateGroup,
}) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredFriends = friendsList.filter((friend) =>
    friend.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-28 bg-gray-800 flex flex-col py-4 h-full">

      {/* 🔍 INPUT DE BÚSQUEDA (FIJO) */}
      <input
        id="searchInput"
        type="text"
        placeholder="Buscar..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="mx-2 mb-4 p-1 rounded bg-gray-700 text-gray-200 text-sm 
                   focus:outline-none focus:ring-2 focus:ring-purple-500 
                   text-center placeholder-gray-500"
      />

      {/* 📌 CONTENEDOR PRINCIPAL CON SCROLL (AMIGOS + GRUPOS) */}
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600">

        {/* 🧑‍🤝‍🧑 AMIGOS */}
        <div className="text-gray-400 px-2 text-xs mb-2 font-semibold text-center">
          AMIGOS
        </div>

        <div className="flex flex-col items-center space-y-4 mb-4">
          {filteredFriends.length === 0 ? (
            <div className="text-gray-500 text-xs text-center px-1">
              Sin resultados
            </div>
          ) : (
            filteredFriends.map((f) => {
              const isActive = currentChatKey === f.chat;
              const statusColor =
                f.status === "active" ? "bg-green-500" : "bg-gray-500";

              return (
                <div
                  key={f.chat}
                  onClick={() => loadChat(f.chat)}
                  title={f.name}
                  className={`w-12 h-12 cursor-pointer relative p-0.5 rounded-full
                             transition-all duration-200 
                             ${isActive ? "ring-2 ring-purple-500 scale-105"
                                        : "hover:bg-gray-700 hover:scale-105"}`}
                >
                  <img
                    src={f.avatar}
                    className="w-full h-full rounded-full object-cover"
                    alt={f.name}
                  />
                  <span
                    className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 
                                border-gray-800 ${statusColor}`}
                  ></span>
                </div>
              );
            })
          )}
        </div>

        {/* 🏷️ SECCIÓN GRUPOS */}
        <div className="border-t border-gray-700 pt-2 mt-2 w-full">
          <div className="text-gray-400 px-2 text-xs mb-2 font-semibold text-center">
            GRUPOS
          </div>

          <div className="flex flex-col items-center space-y-3 pb-3">
            {groupList.map((g) => {
              const isActive = currentChatKey === g.key;
              const isImage =
                g.avatar.startsWith("data:") || g.avatar.startsWith("http");

              const bgColorClass = isImage ? "bg-gray-700" : g.avatar;

              return (
                <div
                  key={g.key}
                  onClick={() => loadChat(g.key)}
                  title={g.display}
                  className={`w-12 h-12 rounded-full cursor-pointer overflow-hidden
                             flex items-center justify-center font-bold text-xl text-white
                             transition-all duration-200
                             ${bgColorClass}
                             ${isActive ? "ring-2 ring-purple-500 scale-105"
                                        : "hover:ring-2 hover:ring-gray-500"}`}
                >
                  {isImage ? (
                    <img
                      src={g.avatar}
                      alt="Logo"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    g.display.substring(0, 2).toUpperCase()
                  )}
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* ➕ BOTÓN CREAR GRUPO (FIJO ABAJO) */}
      <div className="w-full flex justify-center mt-3 pt-3 border-t border-gray-700 flex-shrink-0">
        <button
          onClick={onOpenCreateGroup}
          title="Crear Nuevo Grupo"
          className="w-12 h-12 bg-gray-600 hover:bg-green-600 rounded-full 
                     flex items-center justify-center text-white text-3xl 
                     transition-all duration-200 hover:scale-105"
        >
          ➕
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
