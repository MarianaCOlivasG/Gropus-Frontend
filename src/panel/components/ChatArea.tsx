import React, { useEffect, useRef } from "react"; 
import { useChatStore } from "../../store/useChatStore"; 
import { useChatViewModel } from "../../hooks/useChatViewModel"; 
import { useChatScroll } from "../../hooks/useChatScroll";
import { isSameDay, formatDateLabel } from "../../utils/date";
import ChatSidebar from "./ChatSidebar";
import ChatHeader from "./ChatHeader";
import ChatInput from "./ChatInput";
import MessageBubble from "./MessageBubble";
import EmptyChatView from "./EmptyChatView";
import DateBadge from "./DateBadge";
import { FilePreviewModal } from "./FilePreviewModal"; // <-- IMPORTAR

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
  const { currentUser } = useChatStore(); 
  const scrollContainerRef = useChatScroll(chat?.messages || [], currentUser?.uid);

  const floatingContainerRef = useRef<HTMLDivElement>(null);
  const floatingTextRef = useRef<HTMLSpanElement>(null);
  const currentFloatingDateRef = useRef<string | null>(null);
  const scrollTimeoutRef = useRef<number | undefined>(undefined);

  const fullMuteKey = `${chat?.currentChatKey}${chat?.currentChannel}`;
  const isMuted = chat?.mutedChannels?.has(fullMuteKey); 

  const prevMsgCount = useRef(chat?.messages?.length || 0);
  const sendSound = useRef(new Audio("https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3"));
  const receiveSound = useRef(new Audio("https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3"));

  useEffect(() => {
    if (!chat?.messages) return;
    if (chat.messages.length > prevMsgCount.current) {
      const lastMessage = chat.messages[chat.messages.length - 1];
      if (prevMsgCount.current > 0 && !isMuted) {
        if (lastMessage.sender === currentUser?.uid) {
          sendSound.current.currentTime = 0;
          sendSound.current.play().catch(() => {}); 
        } else {
          receiveSound.current.currentTime = 0;
          receiveSound.current.play().catch(() => {});
        }
      }
    }
    prevMsgCount.current = chat.messages.length;
  }, [chat?.messages, currentUser?.uid, isMuted]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    const containerRect = container.getBoundingClientRect();
    if (scrollTimeoutRef.current) window.clearTimeout(scrollTimeoutRef.current);

    const childrenVisualOrder = Array.from(container.children).reverse();
    const topMostElement = childrenVisualOrder.find((child) => {
        const rect = child.getBoundingClientRect();
        return rect.bottom > containerRect.top;
    });

    if (topMostElement instanceof HTMLElement && floatingContainerRef.current && floatingTextRef.current) {
        const dateAttr = topMostElement.dataset.createdAt;
        if (dateAttr) {
            if (currentFloatingDateRef.current !== dateAttr) {
                floatingTextRef.current.innerText = formatDateLabel(dateAttr);
                currentFloatingDateRef.current = dateAttr;
            }
            floatingContainerRef.current.style.opacity = "1";
            scrollTimeoutRef.current = window.setTimeout(() => {
                if (floatingContainerRef.current) floatingContainerRef.current.style.opacity = "0";
            }, 1500);
        }
    }
  };

  const jumpToMessage = (index: number) => {
    const element = document.getElementById(`msg-${index}`);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
      element.classList.add("ring-2", "ring-purple-500", "rounded-lg", "transition-all", "bg-purple-500/10");
      setTimeout(() => { element.classList.remove("ring-2", "ring-purple-500", "bg-purple-500/10"); }, 2000);
    }
  };

  if (!chat) return <div className="flex-1 bg-gray-900 flex items-center justify-center text-white">Cargando chat...</div>;

  if (!chat.currentChatKey) {
    if (chat.isNewUser) return <EmptyChatView onOpenAddFriend={onOpenAddFriend} onOpenCreateGroup={onOpenCreateGroup} />;
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-900 text-gray-400 font-medium font-bold">
        <div className="text-center">
            <span className="text-6xl mb-4 block opacity-20">👋</span>
            <p>Selecciona un chat para comenzar</p>
        </div>
      </div>
    );
  }

  const activeChannelObj = chat.currentChannelObjects?.find(c => c.key === chat.currentChannel);
  const activeChannelId = activeChannelObj?.id || "";
  const channelPinnedMessage = chat.pinnedMessages?.[activeChannelId] || null;
  const channelName = chat.displayTitle || 'general';
  const placeholderText = channelName.startsWith('#') ? `Mensaje en ${channelName}` : `Mensaje en #${channelName}`;
  const hasMessages = chat.messages && chat.messages.length > 0; 

  return (
    <div className="flex-1 flex h-full overflow-hidden bg-gray-900 relative">
      
      {/* --- EL VISOR VA AQUÍ ARRIBA --- */}
      <FilePreviewModal />

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

      <div className="flex-1 flex flex-col min-w-0 bg-gray-900 relative">
        <ChatHeader
          title={chat.displayTitle}
          subtitle={chat.isGroup && chat.currentChannel ? chat.chatDisplayName || "" : undefined}
          description={chat.currentChannelDescription || ""}
          pinnedMessage={channelPinnedMessage}
          onUnpin={() => chat.pinMessage(null, activeChannelId)}
          onJump={() => channelPinnedMessage && jumpToMessage(channelPinnedMessage.index)}
          isMuted={isMuted}
          onToggleMute={() => chat.toggleMuteChannel(fullMuteKey)}
        />

        <div ref={floatingContainerRef} className="absolute top-20 left-0 right-1.5 z-30 flex justify-center pointer-events-none opacity-0 px-4 pt-2">
            <span ref={floatingTextRef} className="bg-gray-800 text-gray-400 text-[11px] font-bold px-3 py-1 rounded-full border border-white/5 shadow-sm uppercase tracking-wider"></span>
        </div>
        
        <div ref={scrollContainerRef} onScroll={handleScroll} className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-gray-800 scrollbar-track-transparent flex flex-col-reverse relative z-10">
          {!hasMessages ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 opacity-60">
              <div className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center mb-4"><span className="text-4xl">💬</span></div>
              <p className="font-semibold">¡Es el comienzo de algo nuevo!</p>
            </div>
          ) : (
            chat.messages.slice().reverse().map((msg, index, array) => {
              const currentMsgDate = new Date(msg.created_at);
              const nextMsg = array[index + 1]; 
              const showDate = !nextMsg || !isSameDay(currentMsgDate, new Date(nextMsg.created_at));
              return (
                <div key={msg.id || index} data-created-at={msg.created_at} className="flex flex-col">
                  {showDate && (
                      <div className="date-separator pb-4 pt-2 flex justify-center w-full" data-date={msg.created_at}>
                        <DateBadge date={msg.created_at} />
                      </div>
                  )}
                  <MessageBubble
                    msg={msg} index={index}
                    isGroup={chat.isGroup} groupKey={chat.currentChatKey!}
                    channelId={activeChannelId}
                    openUserProfile={openUserProfile}
                    deleteMessage={() => chat.deleteMessage(index, msg.id)}
                    pinMessage={(idx) => chat.pinMessage(idx, activeChannelId)}
                  />
                </div>
              );
            })
          )}
        </div>
        <ChatInput onSendMessage={chat.sendMessage} placeholder={placeholderText} />
      </div>
    </div>
  );
};

export default ChatArea;