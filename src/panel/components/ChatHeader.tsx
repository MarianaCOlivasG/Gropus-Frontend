import React from "react";

interface ChatHeaderProps {
  title: string;
  description: string | null;
  subtitle?: string;
  pinnedMessage: { text: string } | null;
  onUnpin: () => void;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ title, description, subtitle, pinnedMessage, onUnpin }) => {
  return (
    <div className="bg-gray-900/50 p-4 border-b border-gray-700 backdrop-blur-sm z-10 shadow-sm flex flex-col">
      <div className="flex items-baseline space-x-2">
        <h2 className="text-lg font-bold text-white">{title}</h2>
        {subtitle && <span className="text-xs text-gray-500 font-normal">{subtitle}</span>}
      </div>
      {description && <p className="text-gray-400 text-xs mt-0.5 truncate">{description}</p>}

      {pinnedMessage && (
        <div className="bg-gray-700/30 border-l-4 border-yellow-500 p-2 mt-2 flex justify-between items-center rounded-r text-sm">
          <div className="flex items-center space-x-2 overflow-hidden text-gray-300">
            <span>📌</span>
            <span className="truncate">{pinnedMessage.text}</span>
          </div>
          <button onClick={onUnpin} className="text-gray-500 hover:text-white px-2">✕</button>
        </div>
      )}
    </div>
  );
};

export default ChatHeader;