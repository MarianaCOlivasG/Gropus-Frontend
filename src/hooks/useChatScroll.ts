import { useLayoutEffect, useRef } from 'react';

export const useChatScroll = (messages: any[], currentUserId?: string) => {

  const scrollRef = useRef<HTMLDivElement>(null);
  const lastMessageIdRef = useRef<string | null>(null);

  useLayoutEffect(() => {
    if (!messages || messages.length === 0) return;

    const lastMessage = messages[messages.length - 1];
    const prevLastId = lastMessageIdRef.current;
    lastMessageIdRef.current = lastMessage.id;

    if (!prevLastId) return;

    if (lastMessage.id !== prevLastId) {
      if (lastMessage.sender === currentUserId) {
        const container = scrollRef.current;
        if (container) {
          setTimeout(() => {
            container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
          }, 50);
        }
      }
    }
    
  }, [messages, currentUserId]);

  return scrollRef;
};