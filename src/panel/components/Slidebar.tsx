import React from "react";

// Tipo para cada amigo
interface Friend {
  name: string;
  avatar: string;
  status: "active" | "offline";
  chat: string;
}

// Props del componente
interface SlidebarProps {
  onSelectChat: (chatKey: string) => void;
}

// Lista fija de amigos
const friends: Friend[] = [
  {
    name: "Beatriz",
    avatar: "https://i.pravatar.cc/40?img=1",
    status: "active",
    chat: "Beatriz",
  },
  {
    name: "America",
    avatar: "https://i.pravatar.cc/40?img=2",
    status: "offline",
    chat: "America",
  },
  {
    name: "Ford",
    avatar: "https://i.pravatar.cc/40?img=3",
    status: "active",
    chat: "Ford",
  },
];

// Componente principal
const Slidebar: React.FC<SlidebarProps> = ({ onSelectChat }) => {
  return (
    <div className="w-24 bg-[#2b2d31] flex flex-col py-4 items-center space-y-4 border-r border-[#1f2124]">

      {/* AMIGOS */}
      <div className="text-gray-400 text-xs mb-2">Amigos</div>

      {friends.map((friend) => (
        <div
          key={friend.chat}
          onClick={() => onSelectChat(friend.chat)}
          className="relative cursor-pointer"
        >
          <img
            src={friend.avatar}
            className="w-10 h-10 rounded-full"
            alt={friend.name}
          />

          {/* Indicador de estado */}
          <span
            className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[#2b2d31] ${
              friend.status === "active" ? "bg-green-500" : "bg-gray-500"
            }`}
          ></span>
        </div>
      ))}

      {/* GRUPOS */}
      <div className="text-gray-400 text-xs mt-6 mb-2">Grupos</div>

      <div
        onClick={() => onSelectChat("grupo1")}
        className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center font-bold cursor-pointer hover:bg-purple-700"
      >
        G1
      </div>

      <div
        onClick={() => onSelectChat("grupo2")}
        className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center font-bold cursor-pointer hover:bg-purple-700"
      >
        G2
      </div>
    </div>
  );
};

export default Slidebar;
