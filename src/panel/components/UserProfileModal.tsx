import React from "react";
import { users } from "../data";

interface User {
  key: string;
  name: string;
  avatar: string;
  status: "active" | "offline" | string;
}

interface UserProfileModalProps {
  isOpen: boolean;
  userKey?: string;
  onClose: () => void;
}

const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  userKey,
  onClose,
}) => {
  if (!isOpen || !userKey) return null;

  // Tipamos correctamente el acceso al usuario
  const user: User =
    users[userKey as keyof typeof users] || {
      name: "Usuario Desconocido",
      avatar: "https://i.pravatar.cc/40?img=4",
      status: "offline",
      key: userKey,
    };

  const statusText = user.status === "active" ? "En línea" : "Desconectado";
  const description = "Sin descripción";
  const lastLogin = "Hoy --:--";

  return (
    <div
      id="userProfileModal"
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-gray-800 p-6 rounded-lg w-80 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          id="closeProfileModal"
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-400 hover:text-white font-bold"
        >
          X
        </button>

        <div className="flex flex-col items-center space-y-3">
          <img
            id="profileAvatar"
            src={user.avatar}
            className="w-24 h-24 rounded-full"
            alt="Avatar"
          />
          <div className="text-xl font-semibold" id="profileName">
            {user.name}
          </div>
          <div className="text-gray-400 text-sm" id="profileStatus">
            {statusText}
          </div>
          <div className="text-gray-500 text-xs" id="profileDescription">
            {description}
          </div>
          <div className="text-gray-500 text-xs" id="profileLastLogin">
            Último login: {lastLogin}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfileModal;
