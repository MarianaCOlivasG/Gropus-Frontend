import { useEffect, useRef } from 'react';

// Este hook recibe un array de dependencias.
// Cada vez que algo en ese array cambie (mensajes nuevos, cambio de canal),
// el scroll bajará automáticamente al final.
export const useChatScroll = (dependencies: any[]) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'auto' 
      });
    }
  }, dependencies);

  return scrollRef;
};