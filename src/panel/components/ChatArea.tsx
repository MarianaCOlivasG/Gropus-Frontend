import React, { useState, useRef, useEffect } from "react";
import {
  channelChats,
  channelDescriptions,
  users,
  roles,
  currentUserKey,
} from "../data";

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
  currentChatKey: string;
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
}

// Verifica si un usuario puede gestionar mensajes (admin/mod/mod propio)
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
  const user =
    users[msg.sender] || {
      key: msg.sender,
      avatar: "https://i.pravatar.cc/40?img=4",
      name: msg.name,
    };

  const isCurrentUser = msg.sender === currentUserKey;
  const role = (roles[groupKey] || {})[msg.sender];

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const showAdminMenu = isGroup && canManageMessage(groupKey, msg.sender);

  // Cerrar menú al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const alignment = isCurrentUser
    ? "flex-row-reverse space-x-reverse text-right"
    : "flex-row";

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

  const bubbleContainerClasses = isCurrentUser
    ? "flex flex-col max-w-xs relative items-end"
    : "flex flex-col max-w-xs relative";

  return (
    <div
      className={`flex items-start space-x-3 max-w-full relative ${alignment}`}
    >
      <img
        src={user.avatar}
        className="w-10 h-10 rounded-full cursor-pointer"
        alt={user.name}
        onClick={() => openUserProfile(user.key)}
      />

      <div className={bubbleContainerClasses}>
        <div className="text-xs text-gray-400 mb-1">
          {msg.name} • {msg.time} {isGroup && roleBadge}
        </div>

        <div className="text-gray-100 p-2 rounded-lg break-words bg-gray-700 message-content inline-block">
          {isImage ? (
            <div dangerouslySetInnerHTML={{ __html: msg.text }} />
          ) : (
            msg.text
          )}
        </div>
      </div>

      {showAdminMenu && (
        <div
          ref={menuRef}
          className={`relative self-center ${
            isCurrentUser ? "mr-2" : "ml-2"
          }`}
        >
          <button
            onClick={() => setIsMenuOpen((prev) => !prev)}
            className="text-gray-400 hover:text-gray-200 p-1 rounded-full hover:bg-gray-700 transition duration-150"
          >
            ⋯
          </button>

          {isMenuOpen && (
            <div
              className={`absolute top-0 w-32 bg-gray-700 border border-gray-600 rounded-lg shadow-xl z-10 
                ${isCurrentUser ? "right-full translate-x-3" : "left-full -translate-x-3"}`}
            >
              <button
                onClick={() => {
                  pinMessage(index);
                  setIsMenuOpen(false);
                }}
                className="flex items-center w-full text-left px-3 py-2 text-yellow-400 hover:bg-gray-600 rounded-lg"
              >
                📌 Fijar
              </button>
              <button
                onClick={() => {
                  deleteMessage();
                  setIsMenuOpen(false);
                }}
                className="flex items-center w-full text-left px-3 py-2 text-red-400 hover:bg-gray-600 rounded-lg"
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
}) => {
  const [messageInput, setMessageInput] = useState("");
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const chatBoxRef = useRef<HTMLDivElement | null>(null);
  const emojiPickerRef = useRef<HTMLDivElement | null>(null);

  const currentChatChannels = isGroup
    ? Object.keys(channelChats[currentChatKey] || {})
    : [];
  const currentDescription =
    isGroup && currentChannel ? channelDescriptions[currentChannel] : null;

  // Auto scroll
  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [messages, currentChannel]);

  // Cerrar emoji picker al hacer clic fuera
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
      const imageHTML = `<img src="${reader.result}" class="max-w-xs rounded-lg mt-1">`;
      sendMessage(imageHTML);
      setMessageInput("");
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (messageInput.trim() === "") return;
    sendMessage(messageInput);
    setMessageInput("");
    setIsEmojiPickerOpen(false);
  };

  return (
    <div className="flex-1 flex">
      {/* CANALES DE GRUPO */}
      <div
        id="groupChannels"
        className={`w-52 bg-gray-850 border-r border-gray-700 p-4 flex-col space-y-2 ${
          isGroup ? "flex" : "hidden"
        }`}
      >
        <div className="text-gray-200 font-bold mb-2">{currentChatKey}</div>
        {currentChatChannels.map((c) => {
          const fullChannelKey = `${currentChatKey}${c}`;
          const isMuted = mutedChannels.has(fullChannelKey);
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
              <span onClick={() => loadChannel(c)}>{c}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleMuteChannel(fullChannelKey);
                }}
                className={`text-lg p-0.5 rounded ${
                  isMuted
                    ? "text-gray-500 hover:text-gray-300"
                    : "text-gray-400 hover:text-white"
                }`}
                title={isMuted ? "Des-silenciar canal" : "Silenciar canal"}
              >
                {isMuted ? "🔇" : "🔔"}
              </button>
            </div>
          );
        })}
      </div>

      {/* CHAT CENTRAL */}
      <div className="flex-1 flex flex-col">
        <div
          id="chatHeader"
          className="bg-gray-800 p-4 border-b border-gray-700 font-semibold text-lg"
        >
          {isGroup && currentChannel
            ? `${currentChatKey} ${currentChannel}`
            : currentChatKey || "Selecciona un chat"}
          {currentDescription && (
            <p className="text-gray-400 text-sm mt-1">{currentDescription}</p>
          )}
        </div>

        {isGroup && pinnedMessage && (
          <div className="bg-gray-700/50 border-l-4 border-yellow-500 p-3 rounded-lg flex items-center justify-between text-sm mx-4 my-2">
            <div className="flex items-center space-x-2 overflow-hidden">
              <span className="text-yellow-500 font-bold flex-shrink-0">
                📌 FIJADO ({pinnedMessage.name}):
              </span>
              <span className="text-gray-200 truncate">
                {pinnedMessage.text.replace(
                  /<img src="data:image\/[^>]+>/,
                  "[Imagen Adjunta]"
                )}
              </span>
            </div>
            <button
              onClick={() => pinMessage(null)}
              className="text-gray-400 hover:text-white flex-shrink-0 ml-2 text-xl"
            >
              ✕
            </button>
          </div>
        )}

        <div
          id="chatBox"
          ref={chatBoxRef}
          className="flex-1 overflow-y-auto p-4 space-y-4 flex flex-col"
        >
          {messages.length === 0 ? (
            <p className="text-gray-500">No hay mensajes aún</p>
          ) : (
            messages.map((msg, index) => (
              <MessageBubble
                key={index}
                msg={msg}
                index={index}
                isGroup={isGroup}
                groupKey={currentChatKey}
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
              id="emojiPicker"
              ref={emojiPickerRef}
              className="absolute bottom-full left-4 mb-2 p-3 bg-gray-700 rounded-lg shadow-xl flex flex-wrap w-64"
            >
              {emojis.map((emoji, index) => (
                <span
                  key={index}
                  className="text-2xl cursor-pointer hover:bg-gray-600 rounded p-1"
                  onClick={() => handleEmojiClick(emoji)}
                >
                  {emoji}
                </span>
              ))}
            </div>
          )}

          <form
            id="chatForm"
            className="flex items-center space-x-2"
            onSubmit={handleSubmit}
          >
            <button
              type="button"
              id="emojiBtn"
              onClick={() => setIsEmojiPickerOpen((prev) => !prev)}
              className="bg-gray-700 hover:bg-gray-600 p-2 rounded-lg text-xl"
            >
              😊
            </button>

            <input
              type="file"
              id="fileInput"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleFileChange}
            />

            <button
              type="button"
              id="attachBtn"
              onClick={handleAttachClick}
              className="bg-gray-700 hover:bg-gray-600 p-2 rounded-lg text-xl"
            >
              📎
            </button>

            <input
              id="messageInput"
              type="text"
              placeholder="Escribe un mensaje..."
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              className="flex-1 bg-gray-700 text-gray-200 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />

            <button
              type="submit"
              className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg font-medium"
            >
              Enviar
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChatArea;
