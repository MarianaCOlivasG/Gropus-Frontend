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
  const user: User = (users as Record<string, User>)[userKey] || {
    key: userKey,
    name: "Usuario Desconocido", // Fallback en caso de no encontrarlo
    avatar: "https://i.pravatar.cc/40?img=0",
    status: "offline",
  };

  const statusText = user.status === "active" ? "En línea" : "Desconectado";
  // Puedemos obtener los siguientes datos desde el objeto 'user' si los agregamos a `data.ts`
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
          className="absolute top-2 right-2 text-gray-400 hover:text-white font-bold text-xl"
        >
          &times; {/* Usamos el símbolo 'x' */}
        </button>

        {/* Banner o Header del perfil */}
        <div className="h-16 bg-indigo-600 rounded-t-lg mb-10 -m-6"></div>

        {/* Contenido del Perfil */}
        <div className="flex flex-col items-center -mt-16">
          {/* Avatar grande */}
          <div className="relative w-24 h-24 border-4 border-gray-800 rounded-full mb-3">
            <img
              src={user.avatar}
              className="w-full h-full rounded-full"
              alt={user.name}
            />
            {/* Indicador de estado */}
            <span
              className={`absolute bottom-0 right-0 w-5 h-5 rounded-full border-4 border-gray-800 ${
                user.status === "active" ? "bg-green-500" : "bg-gray-500"
              }`}
            ></span>
          </div>

          {/* Nombre */}
          <h2 className="text-xl font-bold text-white">{user.name}</h2>
          <p className="text-sm text-gray-400 mb-4">#{user.key}</p>

          {/* Estado/Información */}
          <div className="w-full bg-gray-700 p-3 rounded-lg text-sm">
            <h3 className="text-gray-300 font-semibold mb-2">MIEMBRO DESDE</h3>
            <p className="text-gray-400">Hace mucho tiempo...</p>

            <h3 className="text-gray-300 font-semibold mt-4 mb-2">
              ESTADO: {statusText}
            </h3>
            <p className="text-gray-400 mb-4 truncate">{description}</p>
          </div>

          {/* Botón de acción */}
          <button className="mt-4 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded transition">
            Enviar Mensaje
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserProfileModal;
