import { useRef, useLayoutEffect, useState, useEffect } from 'react';

export const useChatScroll = (
  messages: any[], 
  isLoadingMore?: boolean,
  loadMoreMessages?: () => void
) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const prevScrollHeightRef = useRef(0);
  const prevMessagesLength = useRef(0);
  
  // Estado local 
  const [hasReachedEnd, setHasReachedEnd] = useState(false);

  useEffect(() => {
     if (messages.length === 0) {
        setHasReachedEnd(false);
        prevMessagesLength.current = 0;
     }
  }, [messages.length]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    
    if (!loadMoreMessages || isLoadingMore || hasReachedEnd) return;

    const scrollHeight = container.scrollHeight;
    const clientHeight = container.clientHeight;
    const scrollTop = Math.abs(container.scrollTop);
    const distanceToVisualTop = scrollHeight - clientHeight - scrollTop;

    //Carga
    if (distanceToVisualTop < 100) {
        prevScrollHeightRef.current = scrollHeight;
        prevMessagesLength.current = messages.length; 
        loadMoreMessages();
    }
  };

  useLayoutEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    if (!isLoadingMore) {
        if (prevScrollHeightRef.current > 0) {
            
            const msgsAdded = messages.length - prevMessagesLength.current;
            
            if (msgsAdded === 0 && messages.length > 0) {
                setHasReachedEnd(true);
                prevScrollHeightRef.current = 0;
                return; 
            }

            prevScrollHeightRef.current = 0;
        }
    }
  }, [messages, isLoadingMore]);

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return { scrollRef, handleScroll, scrollToBottom };
};