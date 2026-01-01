import React from "react";
import { useChatViewModel } from "../../hooks/useChatViewModel"; 
import { useChatScroll } from "../../hooks/useChatScroll";
import ChatSidebar from "./ChatSidebar";
import ChatHeader from "./ChatHeader";
import ChatInput from "./ChatInput";
import MessageBubble from "./MessageBubble";
import EmptyChatView from "./EmptyChatView";

interface ChatAreaProps {
  openUserProfile: (user: any) => void;
  onOpenAddFriend: () => void;
  onOpenCreateGroup: () => void;
  onEditGroup: () => void; 
}

const ChatArea: React.FC<ChatAreaProps> = ({ 
  openUserProfile, 
  onOpenAddFriend, 
  onOpenCreateGroup,
  onEditGroup 
}) => {
  const chat = useChatViewModel();
  const chatBoxRef = useChatScroll([chat?.messages || [], chat?.currentChannel]);

  if (!chat) return <div className="flex-1 bg-gray-900 flex items-center justify-center text-white">Cargando chat...</div>;

  if (!chat.currentChatKey) {
    if (chat.isNewUser) {
      return <EmptyChatView onOpenAddFriend={onOpenAddFriend} onOpenCreateGroup={onOpenCreateGroup} />;
    }
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-900 text-gray-400 font-medium">
        <div className="text-center">
            <span className="text-6xl mb-4 block opacity-20">👋</span>
            <p>Selecciona un chat para comenzar</p>
        </div>
      </div>
    );
  }

  const channelName = chat.displayTitle || 'general';
  const placeholderText = channelName.startsWith('#') ? `Mensaje en ${channelName}` : `Mensaje en #${channelName}`;

  return (
    <div className="flex-1 flex h-full overflow-hidden bg-gray-900">
      
      {/* SIDEBAR */}
      <ChatSidebar
        chatName={chat.chatDisplayName || "Grupo"}
        isGroup={chat.isGroup}
        currentChatKey={chat.currentChatKey}
        currentChannels={chat.currentChannels || []}
        currentChannel={chat.currentChannel}
        mutedChannels={chat.mutedChannels}
        currentChannelObjects={chat.currentChannelObjects}
        loadChannel={chat.loadChannel}
        toggleMuteChannel={chat.toggleMuteChannel}
        createNewChannel={chat.createNewChannel}
        updateChannel={chat.updateChannel}
        deleteChannel={chat.deleteChannel}
        deleteGroup={chat.deleteGroup} 
        onEditGroup={onEditGroup} 
      />

      <div className="flex-1 flex flex-col min-w-0 bg-gray-900">
        <ChatHeader
          title={chat.displayTitle}
          subtitle={chat.isGroup && chat.currentChannel ? `en ${chat.chatDisplayName}` : undefined}
          description={chat.currentChannelDescription || ""}
          pinnedMessage={chat.pinnedMessage}
          onUnpin={() => chat.pinMessage(null)}
        />
        
        <div ref={chatBoxRef} className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-gray-800 scrollbar-track-transparent">
          {(!chat.messages || chat.messages.length === 0) ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 opacity-60">
              <div className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center mb-4"><span className="text-4xl">💬</span></div>
              <p className="font-semibold">¡Es el comienzo de algo nuevo!</p>
              <p className="text-sm">Envía el primer mensaje.</p>
            </div>
          ) : (
            chat.messages.map((msg, index) => (
              <MessageBubble
                key={msg.id || index} msg={msg} index={index}
                isGroup={chat.isGroup} groupKey={chat.currentChatKey!}
                openUserProfile={openUserProfile}
                deleteMessage={() => chat.deleteMessage(index, msg.id)} 
                pinMessage={chat.pinMessage}
              />
            ))
          )}
        </div>
        
        <ChatInput onSendMessage={chat.sendMessage} placeholder={placeholderText} />
      </div>
    </div>
  );
};

export default ChatArea;