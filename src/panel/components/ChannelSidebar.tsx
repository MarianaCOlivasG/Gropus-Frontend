import React from "react";

interface ChannelSidebarProps {
  currentChatKey: string | null;
  currentChatChannels: string[];
  currentChannel: string | null;

  loadChannel: (channel: string) => void;
  mutedChannels: Set<string>;
  toggleMuteChannel: (channelKey: string) => void;

  chatName: string | null;
  createChannelBackend: (channelName: string) => void;
}

const ChannelSidebar: React.FC<ChannelSidebarProps> = ({
  currentChatKey,
  currentChatChannels,
  currentChannel,
  mutedChannels,
  toggleMuteChannel,
  loadChannel,
  chatName,
  createChannelBackend,
}) => {

  const formatChannelName = (name: string) =>
    name.startsWith("#") ? name : `#${name}`;

  const handleCreateChannelClick = () => {
    const name = prompt("Nombre del nuevo canal:");
    if (name && name.trim() !== "") createChannelBackend(name.trim());
  };

  return (
    <div className="w-52 bg-gray-850 border-r border-gray-700 p-4 flex flex-col h-full space-y-2 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
      <div className="text-gray-200 font-bold mb-2 px-1">{chatName}</div>

      {currentChatChannels.map((c) => {
        const fullKey = `${currentChatKey}${c}`;
        const muted = mutedChannels.has(fullKey);
        const isActive = currentChannel === c;
        
        // LÓGICA DE MENSAJES NO LEÍDOS
        const count = isActive ? 0 : 3;
        const hasUnreads = count > 0 && !isActive;

        return (
          <div
            key={c}
            className={`group cursor-pointer flex justify-between items-center p-1.5 rounded transition
              ${
                isActive
                  ? "text-purple-400 font-bold bg-gray-700/50 shadow-sm"
                  : "text-gray-400 hover:bg-gray-700 hover:text-gray-200"
              }`}
          >
            <div className="flex items-center min-w-0 overflow-hidden flex-1" onClick={() => loadChannel(c)}>
              {/* Nombre del canal: Más brillante si hay mensajes */}
              <span className={`truncate text-sm ${hasUnreads ? "text-white font-black" : ""}`}>
                {formatChannelName(c)}
              </span>

              {/* --- BURBUJA DE NO LEÍDOS --- */}
              {hasUnreads && (
                <div className={`ml-2 flex-shrink-0 min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-lg ${
                  muted 
                    ? 'bg-gray-600/50 opacity-70' // Gris si está silenciado
                    : 'bg-red-500 animate-pulse' // Rojo vibrante si es normal
                }`}>
                  {count > 9 ? '+9' : count}
                </div>
              )}
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleMuteChannel(fullKey);
              }}
              className={`ml-1 text-base p-0.5 rounded transition-opacity ${
                isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"
              } ${
                muted
                  ? "text-gray-500 hover:text-red-400"
                  : "text-gray-400 hover:text-yellow-400"
              }`}
              title={muted ? "Activar sonido" : "Silenciar"}
            >
              {muted ? "🔇" : "🔔"}
            </button>
          </div>
        );
      })}

      <button
        onClick={handleCreateChannelClick}
        className="w-full text-left flex items-center p-1.5 rounded mt-2 transition text-green-400 hover:bg-gray-700/50 hover:text-green-300 font-medium text-sm group"
      >
        <span className="mr-2 opacity-70 group-hover:opacity-100">➕</span>
        Crear Canal
      </button>
    </div>
  );
};

export default ChannelSidebar;