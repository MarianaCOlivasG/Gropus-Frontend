import React, { useEffect, useRef, useState } from "react"; 
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
import { FilePreviewModal } from "./FilePreviewModal"; 
import MediaGallery from "./MediaGallery";

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
  const { currentUser, openFilePreview, allFriends, isLoadingMore } = useChatStore() as any; 
  
  const { scrollRef, handleScroll: handleScrollPagination } = useChatScroll(
      chat?.messages || [], 
      isLoadingMore,        
      chat.loadMoreMessages 
  ) as any;

  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [isChannelLoading, setIsChannelLoading] = useState(true);

  // REFS PARA UI
  const floatingContainerRef = useRef<HTMLDivElement>(null);
  const floatingTextRef = useRef<HTMLSpanElement>(null);
  const currentFloatingDateRef = useRef<string | null>(null);
  const scrollTimeoutRef = useRef<number | undefined>(undefined);

  // REFS PARA LÓGICA DE SONIDO ESTRICTA
  const prevMsgCount = useRef(0);
  const prevLastMessageId = useRef<string | null>(null);
  const isInitialChannelLoad = useRef(true); // Bloquea sonido en la primera carga

  const sendSound = useRef(new Audio("https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3"));
  const receiveSound = useRef(new Audio("https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3"));

  const fullMuteKey = `${chat?.currentChatKey}${chat?.currentChannel}`;
  const isMuted = chat?.mutedChannels?.has(fullMuteKey); 

  // 1. EFECTO DE RESET
  useEffect(() => {
    setIsChannelLoading(true);
    isInitialChannelLoad.current = true;
    prevMsgCount.current = 0;
    prevLastMessageId.current = null;

    const timer = setTimeout(() => setIsChannelLoading(false), 1000);
    return () => clearTimeout(timer);
  }, [chat?.currentChatKey, chat?.currentChannel]);

  // 2. CONTROL DEL SPINNER
  useEffect(() => {
    if (chat?.messages && chat.messages.length > 0) {
        setIsChannelLoading(false);
    }
  }, [chat?.messages]);

  // 3. LÓGICA DE SONIDOS Y SCROLL AUTOMÁTICO
  useEffect(() => {
    // Si no hay mensajes, reseteamos y salimos
    if (!chat?.messages || chat.messages.length === 0) {
        prevMsgCount.current = 0;
        prevLastMessageId.current = null;
        return;
    }
    
    const currentLastMessage = chat.messages[chat.messages.length - 1];
    const isNewMessageAtBottom = currentLastMessage.id !== prevLastMessageId.current;

    // Solo verificamos sonido si NO es la carga inicial del componente/canal
    if (!isInitialChannelLoad.current) {
        if (chat.messages.length > prevMsgCount.current && isNewMessageAtBottom) {
          
          if (!isMuted) {
            if (currentLastMessage.sender === currentUser?.uid) {
              // ENVÍO: Suena y hace scroll abajo
              sendSound.current.currentTime = 0;
              sendSound.current.play().catch(() => {});
              
              if (scrollRef.current) {
                scrollRef.current.scrollTop = 0;
              }
            } else {
              // RECEPCIÓN: Solo suena
              receiveSound.current.currentTime = 0;
              receiveSound.current.play().catch(() => {});
            }
          }
        }
    } else {
        // Una vez que los mensajes del historial se cargan por primera vez, 
        // desactivamos el bloqueo para permitir sonidos en los siguientes mensajes.
        isInitialChannelLoad.current = false;
    }

    // Actualizamos las referencias para la siguiente comparación
    prevMsgCount.current = chat.messages.length;
    prevLastMessageId.current = currentLastMessage.id;

  }, [chat?.messages, currentUser?.uid, isMuted, scrollRef]);

  // SCROLL PARA FECHAS
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (handleScrollPagination) handleScrollPagination(e);

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

  if (!chat) return <div className="flex-1 bg-gray-900 flex items-center justify-center text-white font-bold">Cargando chat...</div>;

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

  const activeChannelObj = chat.currentChannelObjects?.find((c: any) => c.key === chat.currentChannel);
  const activeChannelId = activeChannelObj?.id || "";
  const channelPinnedMessage = chat.pinnedMessages?.[activeChannelId] || null;
  const friendInfo = !chat.isGroup ? allFriends?.find((f: any) => f.chat === chat.currentChatKey) : null;
  const channelName = chat.isGroup ? (chat.displayTitle || 'general') : (friendInfo?.name || chat.displayTitle || "Chat");
  const placeholderText = channelName.startsWith('#') ? `Mensaje en ${channelName}` : `Mensaje en #${channelName}`;
  const hasMessages = chat.messages && chat.messages.length > 0; 

  return (
    <div className="flex-1 flex h-full overflow-hidden bg-gray-900 relative">
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

      <div className="flex-1 flex min-w-0 bg-gray-900 relative">
        <div className="flex-1 flex flex-col min-w-0">
          
          <ChatHeader
            title={channelName}
            subtitle={chat.isGroup && chat.currentChannel ? chat.chatDisplayName || "" : (friendInfo?.status || "En línea")}
            description={chat.isGroup ? (chat.currentChannelDescription || "") : "Mensajes directos"}
            pinnedMessage={channelPinnedMessage}
            onUnpin={() => chat.pinMessage(null, activeChannelId)}
            onJump={() => channelPinnedMessage && jumpToMessage(channelPinnedMessage.index)}
            isMuted={isMuted}
            onToggleMute={() => chat.toggleMuteChannel(fullMuteKey)}
            onToggleGallery={() => setIsGalleryOpen(!isGalleryOpen)}
            isGalleryActive={isGalleryOpen}
            isGroup={chat.isGroup} 
            avatar={!chat.isGroup ? friendInfo?.avatar : null}
            tag={friendInfo?.role || friendInfo?.tag}
          />

          <div ref={floatingContainerRef} className="absolute top-20 left-0 right-1.5 z-30 flex justify-center pointer-events-none opacity-0 px-4 pt-2">
              <span ref={floatingTextRef} className="bg-gray-800 text-gray-400 text-[11px] font-bold px-3 py-1 rounded-full border border-white/5 shadow-sm uppercase tracking-wider"></span>
          </div>
          
          <div 
            ref={scrollRef} 
            onScroll={handleScroll} 
            className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-gray-800 scrollbar-track-transparent flex flex-col-reverse relative z-10"
          >
            {isChannelLoading ? (
                <div className="h-full flex flex-col items-center justify-center opacity-50">
                    <div className="w-8 h-8 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
                </div>
            ) : !hasMessages ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-400 opacity-60">
                    <div className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center mb-4"><span className="text-4xl">💬</span></div>
                    <p className="font-semibold">¡Es el comienzo de algo nuevo!</p>
                </div>
            ) : (
                chat.messages.slice().reverse().map((msg: any, visualIndex: number, array: any[]) => {
                    const realIndex = chat.messages.length - 1 - visualIndex;
                    const currentMsgDate = new Date(msg.created_at);
                    const nextMsg = array[visualIndex + 1]; 
                    const showDate = !nextMsg || !isSameDay(currentMsgDate, new Date(nextMsg.created_at));
                    
                    return (
                    <div key={msg.id || realIndex} data-created-at={msg.created_at} className="flex flex-col">
                        {showDate && (
                            <div className="date-separator pb-4 pt-2 flex justify-center w-full" data-date={msg.created_at}>
                                <DateBadge date={msg.created_at} />
                            </div>
                        )}
                        <MessageBubble
                            msg={msg} 
                            index={realIndex}
                            isGroup={chat.isGroup} 
                            groupKey={chat.currentChatKey!}
                            channelId={activeChannelId || ""} 
                            openUserProfile={openUserProfile}
                            deleteMessage={() => chat.deleteMessage(realIndex, msg.id)}
                            pinMessage={(idx: number | null) => chat.pinMessage(idx, activeChannelId)}
                        />
                    </div>
                    );
                })
            )}
          </div>
          <ChatInput onSendMessage={chat.sendMessage} placeholder={placeholderText} />
        </div>

        {isGalleryOpen && (
        <MediaGallery 
            messages={chat.messages} 
            onClose={() => setIsGalleryOpen(false)}
            onImageClick={(url: string, name: string, type: 'image' | 'pdf') => {
                openFilePreview(url, type, name);
            }}
        />
        )}
      </div>
    </div>
  );
};

export default ChatArea;