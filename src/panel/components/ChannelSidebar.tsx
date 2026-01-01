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
    <div className="w-52 bg-gray-850 border-r border-gray-700 p-4 flex-col space-y-2">
      <div className="text-gray-200 font-bold mb-2">{chatName}</div>

      {currentChatChannels.map((c) => {
        const fullKey = `${currentChatKey}${c}`;
        const muted = mutedChannels.has(fullKey);

        return (
          <div
            key={c}
            className={`cursor-pointer flex justify-between items-center p-1 rounded transition
              ${
                currentChannel === c
                  ? "text-purple-400 font-semibold bg-gray-700"
                  : "text-gray-300 hover:bg-gray-700"
              }`}
          >
            <span onClick={() => loadChannel(c)}>{formatChannelName(c)}</span>

            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleMuteChannel(fullKey);
              }}
              className={`text-lg p-0.5 rounded ${
                muted
                  ? "text-gray-500 hover:text-gray-300"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              {muted ? "🔇" : "🔔"}
            </button>
          </div>
        );
      })}

      <button
        onClick={handleCreateChannelClick}
        className="w-full text-left flex items-center p-1 rounded mt-2 transition text-green-400 hover:bg-gray-700 font-medium"
      >
        ➕ Crear Canal
      </button>
    </div>
  );
};

export default ChannelSidebar;
