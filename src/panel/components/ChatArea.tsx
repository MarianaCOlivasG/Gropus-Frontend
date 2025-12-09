import React, { useState, useRef, useEffect } from "react";
import { channelChats, channelDescriptions, users, roles, currentUserKey } from "../data";

interface Message {
  sender: string;
  name: string;
  text: string;
  time: string;
}

interface MessageBubbleProps {
  msg: Message;
  index: number;
  isGroup: boolean;
  groupKey: string;
  openUserProfile: (userKey: string) => void;
  deleteMessage: () => void;
  pinMessage: (index: number | null) => void;
}

interface ChatAreaProps {
  currentChatKey: string | null;
  chatDisplayName: string | null;
  currentChannel: string | null;
  isGroup: boolean;
  messages: Message[];
  loadChannel: (channel: string) => void;
  sendMessage: (msg: string) => void;
  deleteMessage: (index: number) => void;
  openUserProfile: (userKey: string) => void;
  pinnedMessage: Message | null;
  pinMessage: (index: number | null) => void;
  mutedChannels: Set<string>;
  toggleMuteChannel: (channelKey: string) => void;
  createNewChannel: (channelName: string) => void;
  updateChannel: (channelKey: string, newName: string) => void;
  deleteChannel: (channelKey: string) => void;
  currentChannels: string[];
}

// Verifica si un usuario puede gestionar mensajes
function canManageMessage(groupKey: string, messageSenderKey: string): boolean {
  if (!groupKey || !groupKey.startsWith("grupo")) return false;
  const myRole = (roles[groupKey] || {})[currentUserKey];
  const isMyMessage = messageSenderKey === currentUserKey;
  if (myRole === "admin" || myRole === "moderator") return true;
  return isMyMessage;
}

// MessageBubble Component
const MessageBubble: React.FC<MessageBubbleProps> = ({
  msg,
  index,
  isGroup,
  groupKey,
  openUserProfile,
  deleteMessage,
  pinMessage,
}) => {
  const user = users[msg.sender] || {
    key: msg.sender,
    avatar: "https://i.pravatar.cc/40?img=4",
    name: msg.name,
  };

  const isCurrentUser = msg.sender === currentUserKey;
  const role = (roles[groupKey] || {})[msg.sender];
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const showAdminMenu = isGroup && canManageMessage(groupKey, msg.sender);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const alignment = isCurrentUser ? "flex-row-reverse space-x-reverse text-right" : "flex-row";

  const roleBadge = role ? (
    <span
      className={`ml-2 text-xs px-2 py-0.5 rounded-full ${
        role === "admin" ? "bg-yellow-500 text-gray-900" : "bg-blue-600"
      }`}
    >
      {role}
    </span>
  ) : null;

  const isImage = msg.text.startsWith("<img src=");

  return (
    <div className={`flex items-start space-x-3 max-w-full relative ${alignment}`}>
      <img
        src={user.avatar}
        className="w-10 h-10 rounded-full cursor-pointer"
        alt={user.name}
        onClick={() => openUserProfile(user.key)}
      />
      <div className={isCurrentUser ? "flex flex-col max-w-xs items-end" : "flex flex-col max-w-xs"}>
        <div className="text-xs text-gray-400 mb-1">
          {msg.name} • {msg.time} {isGroup && roleBadge}
        </div>
        <div className="text-gray-100 p-2 rounded-lg bg-gray-700 break-words">
          {isImage ? <div dangerouslySetInnerHTML={{ __html: msg.text }} /> : msg.text}
        </div>
      </div>

      {showAdminMenu && (
        <div ref={menuRef} className="relative self-center">
          <button
            onClick={() => setIsMenuOpen((p) => !p)}
            className="text-gray-400 hover:text-gray-200 p-1 rounded-full hover:bg-gray-700"
          >
            ⋯
          </button>
          {isMenuOpen && (
            <div className="absolute bg-gray-700 border border-gray-600 rounded-lg shadow-xl z-10 w-32">
              <button
                onClick={() => {
                  pinMessage(index);
                  setIsMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 text-yellow-400 hover:bg-gray-600"
              >
                📌 Fijar
              </button>
              <button
                onClick={() => {
                  deleteMessage();
                  setIsMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 text-red-400 hover:bg-gray-600"
              >
                🗑️ Eliminar
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ChatArea principal
const ChatArea: React.FC<ChatAreaProps> = ({
  currentChatKey,
  chatDisplayName,
  currentChannel,
  isGroup,
  messages,
  loadChannel,
  sendMessage,
  deleteMessage,
  openUserProfile,
  pinnedMessage,
  pinMessage,
  mutedChannels,
  toggleMuteChannel,
  createNewChannel,
  updateChannel,
  deleteChannel,
}) => {
  const [messageInput, setMessageInput] = useState("");
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const chatBoxRef = useRef<HTMLDivElement | null>(null);
  const emojiPickerRef = useRef<HTMLDivElement | null>(null);

  // ❗ YA NO RETORNAMOS AQUÍ
  const noChatSelected = !currentChatKey;

  const currentChatChannels = isGroup ? Object.keys(channelChats[currentChatKey!] || {}) : [];
  const currentDescription: string | null =
    isGroup && currentChannel && typeof channelDescriptions[currentChannel] === "string"
      ? channelDescriptions[currentChannel]
      : null;

  const formatChannelName = (name: string) => (name.startsWith("#") ? name : `#${name}`);

  // Scroll automático
  useEffect(() => {
    if (chatBoxRef.current) chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
  }, [messages, currentChannel]);

  // Cerrar emoji picker al hacer click afuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isEmojiPickerOpen &&
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(event.target as Node) &&
        (event.target as HTMLElement).id !== "emojiBtn"
      ) {
        setIsEmojiPickerOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isEmojiPickerOpen]);

  const emojis = ["😄", "😍", "👍", "🔥", "🎉", "🚀", "💬", "💔", "🤔", "💯"];
  const handleEmojiClick = (emoji: string) => {
    setMessageInput((prev) => prev + emoji);
    setIsEmojiPickerOpen(false);
  };

  const handleAttachClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const imgHTML = `<img src="${reader.result}" class="max-w-xs rounded-lg mt-1">`;
      sendMessage(imgHTML);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (messageInput.trim() === "") return;
    sendMessage(messageInput);
    setMessageInput("");
  };

  const chatName = chatDisplayName || currentChatKey || "Chat sin nombre";

  const handleCreateChannelClick = () => {
    const channelName = prompt("Nombre del nuevo canal:");
    if (channelName && channelName.trim() !== "") {
      createNewChannel(channelName.trim());
    }
  };

  // RETURN ÚNICO
  return (
    <div className="flex-1 flex">
      {noChatSelected ? (
        <div className="flex-1 flex items-center justify-center text-gray-400">
          Selecciona un chat para comenzar
        </div>
      ) : (
        <>
          {/* CANALES DEL GRUPO */}
          <div className={`w-52 bg-gray-850 border-r border-gray-700 p-4 flex-col space-y-2 ${isGroup ? "flex" : "hidden"}`}>
            <div className="text-gray-200 font-bold mb-2">{chatName}</div>

            {currentChatChannels.map((c) => {
              const fullKey = `${currentChatKey}${c}`;
              const isMuted = mutedChannels.has(fullKey);

              return (
                <div
                  key={c}
                  className={`cursor-pointer flex justify-between items-center p-1 rounded transition ${
                    currentChannel === c ? "text-purple-400 font-semibold bg-gray-700" : "text-gray-300 hover:bg-gray-700"
                  }`}
                >
                  <span onClick={() => loadChannel(c)}>{formatChannelName(c)}</span>

                  <div className="flex items-center space-x-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleMuteChannel(fullKey);
                      }}
                      className={`text-lg ${isMuted ? "text-gray-500 hover:text-gray-300" : "text-gray-400 hover:text-white"}`}
                    >
                      {isMuted ? "🔇" : "🔔"}
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const newName = prompt("Nuevo nombre del canal", c);
                        if (newName && newName.trim() !== "") updateChannel(c, newName.trim());
                      }}
                      className="text-blue-400 hover:text-white px-1 rounded"
                    >
                      ✏️
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteChannel(c);
                      }}
                      className="text-red-400 hover:text-white px-1 rounded"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              );
            })}

            <button
              onClick={handleCreateChannelClick}
              className="w-full text-left flex items-center p-1 rounded mt-2 text-green-400 hover:bg-gray-700"
            >
              ➕ Crear Canal
            </button>
          </div>

          {/* CHAT CENTRAL */}
          <div className="flex-1 flex flex-col">
            <div className="bg-gray-800 p-4 border-b border-gray-700 text-lg font-semibold">
              {isGroup && currentChannel ? `${chatName} ${formatChannelName(currentChannel)}` : chatName}
              {currentDescription && <p className="text-gray-400 text-sm mt-1">{currentDescription}</p>}
            </div>

            {isGroup && pinnedMessage && (
              <div className="bg-gray-700/50 border-l-4 border-yellow-500 p-3 rounded-lg mx-4 my-2 flex justify-between">
                <div className="flex items-center space-x-2 w-full overflow-hidden">
                  <span className="text-yellow-500 font-bold">📌 FIJADO:</span>
                  <span className="text-gray-200 truncate">{pinnedMessage.text}</span>
                </div>
                <button onClick={() => pinMessage(null)} className="text-gray-400 hover:text-white ml-2 text-xl">
                  ✕
                </button>
              </div>
            )}

            <div ref={chatBoxRef} className="flex-1 overflow-y-auto p-4 space-y-4 flex flex-col">
              {messages.length === 0 ? (
                <p className="text-gray-500">No hay mensajes aún</p>
              ) : (
                messages.map((msg, index) => (
                  <MessageBubble
                    key={index}
                    msg={msg}
                    index={index}
                    isGroup={isGroup}
                    groupKey={currentChatKey!}
                    openUserProfile={openUserProfile}
                    deleteMessage={() => deleteMessage(index)}
                    pinMessage={pinMessage}
                  />
                ))
              )}
            </div>

            {/* INPUT */}
            <div className="p-4 border-t border-gray-700 bg-gray-800 relative">
              {isEmojiPickerOpen && (
                <div
                  ref={emojiPickerRef}
                  className="absolute bottom-full left-4 mb-2 p-3 bg-gray-700 rounded-lg shadow-xl flex flex-wrap w-64"
                >
                  {emojis.map((emoji) => (
                    <span
                      key={emoji}
                      className="text-2xl cursor-pointer hover:bg-gray-600 rounded p-1"
                      onClick={() => handleEmojiClick(emoji)}
                    >
                      {emoji}
                    </span>
                  ))}
                </div>
              )}

              <form onSubmit={handleSubmit} className="flex items-center space-x-2">
                <button
                  type="button"
                  id="emojiBtn"
                  onClick={() => setIsEmojiPickerOpen((p) => !p)}
                  className="bg-gray-700 hover:bg-gray-600 p-2 rounded-lg text-xl"
                >
                  😊
                </button>

                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                <button type="button" onClick={handleAttachClick} className="bg-gray-700 hover:bg-gray-600 p-2 rounded-lg text-xl">
                  📎
                </button>

                <input
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  placeholder="Escribe un mensaje..."
                  className="flex-1 bg-gray-700 text-gray-200 p-2 rounded-lg focus:ring-2 focus:ring-purple-500"
                />

                <button className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg">Enviar</button>
              </form>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ChatArea;
