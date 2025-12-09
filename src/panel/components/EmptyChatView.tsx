import React from "react";

interface EmptyChatViewProps {
  onOpenAddFriend: () => void;
  onOpenCreateGroup: () => void;
}

const EmptyChatView: React.FC<EmptyChatViewProps> = ({
  onOpenAddFriend,
  onOpenCreateGroup,
}) => {
  return (
    <div className="flex-1 flex justify-between bg-gray-700 text-gray-100">
      
      {/* CONTENEDOR CENTRAL */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 max-w-lg text-center mx-auto">
        
        {/* Ícono */}
        <div className="text-indigo-400 mb-6">
          <svg
            className="w-16 h-16"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
            ></path>
          </svg>
        </div>

        <h1 className="text-3xl font-extrabold mb-3">
          ¡Hola! Bienvenido a la app de chat.
        </h1>

        <p className="text-gray-400 mb-8 text-lg">
          Parece que es tu primera vez aquí. Selecciona un chat o usa los
          botones de "Primeros Pasos" para empezar a interactuar.
        </p>

        <button className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-lg hover:bg-indigo-500 transition duration-200">
          Explorar Grupos Públicos
        </button>
      </div>

      {/* BARRA LATERAL DERECHA */}
      <div className="hidden lg:block w-72 bg-gray-800 p-6 shadow-2xl overflow-y-auto">
        <h2 className="text-sm font-bold mb-5 text-gray-400 uppercase tracking-wider border-b border-gray-700 pb-2">
          Primeros Pasos
        </h2>

        <div className="space-y-4">

          {/* Añadir Amigos */}
          <div
            className="flex items-center space-x-3 p-3 bg-gray-700 rounded-lg hover:bg-gray-600 cursor-pointer transition"
            onClick={onOpenAddFriend}
          >
            <span className="text-green-400">👥</span>
            <div>
              <p className="font-semibold">Añadir un Amigo</p>
              <p className="text-xs text-gray-400">
                Conéctate directamente con un usuario.
              </p>
            </div>
          </div>

          {/* Crear Nuevo Grupo */}
          <div
            className="flex items-center space-x-3 p-3 bg-gray-700 rounded-lg hover:bg-gray-600 cursor-pointer transition"
            onClick={onOpenCreateGroup}
          >
            <span className="text-yellow-400">➕</span>
            <div>
              <p className="font-semibold">Crear Nuevo Grupo</p>
              <p className="text-xs text-gray-400">
                Inicia una comunidad para tu equipo o amigos.
              </p>
            </div>
          </div>

        </div>

        <div className="mt-8 pt-4 border-t border-gray-700">
          <p className="text-xs text-gray-500">
            Puedes encontrar más opciones en la barra lateral izquierda.
          </p>
        </div>
      </div>
    </div>
  );
};

export default EmptyChatView;