import React from "react";

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
}

interface SidebarProps {
  friendsList: Friend[];
  loadChat: (chatKey: string) => void;
  currentChatKey: string;
}

const Sidebar: React.FC<SidebarProps> = ({
  friendsList,
  loadChat,
  currentChatKey,
}) => {
  const groups: Group[] = [
    { key: "grupo1", display: "G1" },
    { key: "grupo2", display: "G2" },
  ];

  return (
    <div className="w-28 bg-gray-800 flex flex-col py-4">
      <input
        id="searchInput"
        type="text"
        placeholder="Buscar..."
        className="mx-2 mb-4 p-1 rounded bg-gray-700 text-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
      />

      <div className="text-gray-400 px-2 text-xs mb-2">Amigos</div>
      <div className="flex flex-col items-center space-y-4 mb-4 overflow-y-auto">
        {friendsList.map((f) => {
          const isActive = currentChatKey === f.chat;
          const statusColor =
            f.status === "active" ? "bg-green-500" : "bg-gray-500";

          return (
            <div
              key={f.chat}
              onClick={() => loadChat(f.chat)}
              className={`w-12 h-12 cursor-pointer relative p-0.5 rounded-full ${
                isActive ? "ring-2 ring-purple-500" : ""
              }`}
            >
              <img
                src={f.avatar}
                className="w-full h-full rounded-full"
                alt={f.name}
              />
              <span
                className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-gray-800 ${statusColor}`}
              ></span>
            </div>
          );
        })}
      </div>

      <div className="text-gray-400 px-2 text-xs mb-2 mt-auto">Grupos</div>
      <div className="flex flex-col items-center space-y-4">
        {groups.map((g) => {
          const isActive = currentChatKey === g.key;
          return (
            <div
              key={g.key}
              onClick={() => loadChat(g.key)}
              className={`w-12 h-12 rounded-full cursor-pointer bg-indigo-500 flex items-center justify-center font-bold text-xl ${
                isActive ? "ring-2 ring-purple-500" : ""
              }`}
            >
              {g.display}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Sidebar;
