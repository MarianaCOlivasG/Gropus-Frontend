import React, { useState, useRef, useEffect } from "react";
import { useChatStore } from "../../store/useChatStore"; 

interface ChatInputProps {
  onSendMessage: (text: string) => void;
  placeholder: string;
}

const EMOJI_DATA = [
  { category: "Caras", items: ["😀", "😃", "😄", "😁", "😅", "😂", "🤣", "😊", "😇", "🙂", "🙃", "😉", "😌", "😍", "🥰", "😘", "😗", "😙", "😚", "😋", "😛", "😝", "😜", "🤪", "🤨", "🧐", "🤓", "😎", "🤩", "🥳", "😏", "😒", "😞", "😔", "😟", "😕", "🙁", "☹️", "😣", "😖", "😫", "😩", "🥺", "😢", "😭", "😤", "😠", "😡", "🤬", "🤯", "😳", "🥵", "🥶", "😱", "😨", "😰", "😥", "😓", "🤔", "🤭", "🤫", "🤥", "😶", "😐", "😑", "😬", "🙄", "😯", "😦", "😧", "😮", "😲", "🥱", "😴", "🤤", "😪", "😵", "🤐", "🥴", "🤢", "🤮", "🤧", "😷", "🤒", "🤕"] },
  { category: "Manos", items: ["👋", "🤚", "🖐️", "✋", "🖖", "👌", "🤏", "✌️", "🤞", "🤟", "🤘", "🤙", "👈", "👉", "👆", "👇", "☝️", "👍", "👎", "✊", "👊", "🤛", "🤜", "👏", "🙌", "👐", "🤲", "🤝", "🙏"] },
  { category: "Amor", items: ["❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "🤍", "🤎", "💔", "❣️", "💕", "💞", "💓", "💗", "💖", "💘", "💝", "💟"] },
  { category: "Varios", items: ["✨", "🔥", "💥", "💯", "💢", "💨", "💦", "💤", "🚀", "💬", "⭐", "🌟", "🎉", "🎊", "🎈", "🎂", "🌈", "☀️", "🌙"] }
];

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, placeholder }) => {
  const [text, setText] = useState("");
  const [showEmojis, setShowEmojis] = useState(false);
  const [activeTab, setActiveTab] = useState(0); 
  const emojiRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- LÓGICA DE ESCRITURA (Typing) ---
  const { setTypingStatus, sendFileMessage } = useChatStore() as any;
  const typingTimeoutRef = useRef<any>(null);
  const [isTypingLocal, setIsTypingLocal] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setText(value);

    // Si el usuario empieza a escribir y no habíamos avisado, avisamos al socket
    if (!isTypingLocal && value.trim().length > 0) {
      setIsTypingLocal(true);
      setTypingStatus(true);
    }

    // Limpiamos el temporizador anterior
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    // Si pasan 2 segundos sin escribir, avisamos que nos detuvimos
    typingTimeoutRef.current = setTimeout(() => {
      setIsTypingLocal(false);
      setTypingStatus(false);
    }, 2000);
  };

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    setIsTypingLocal(false);
    setTypingStatus(false);

    onSendMessage(text);
    setText("");
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      sendFileMessage(file);
      e.target.value = '';
    }
  };

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (emojiRef.current && !emojiRef.current.contains(e.target as Node)) {
        setShowEmojis(false);
      }
    };
    if (showEmojis) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [showEmojis]);

  return (
    <div className="p-3 bg-[#1e1f22] border-t border-white/5 relative z-20">
      
      {/* SELECTOR DE EMOJIS */}
      {showEmojis && (
        <div 
          ref={emojiRef} 
          className="absolute bottom-20 left-4 bg-[#2b2d31] border border-white/10 rounded-2xl shadow-2xl w-72 overflow-hidden animate-in fade-in zoom-in duration-200"
        >
          <div className="flex border-b border-white/5 bg-[#1e1f22]/50">
            {EMOJI_DATA.map((cat, idx) => (
              <button
                key={cat.category}
                type="button"
                onClick={() => setActiveTab(idx)}
                className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest transition-all ${
                  activeTab === idx ? "text-purple-400 border-b-2 border-purple-500 bg-purple-500/5" : "text-gray-500 hover:text-gray-300"
                }`}
              >
                {cat.category}
              </button>
            ))}
          </div>

          <div className="p-3 grid grid-cols-6 gap-1 max-h-52 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
            {EMOJI_DATA[activeTab].items.map((e, index) => (
              <button 
                key={index} 
                type="button"
                onClick={() => setText((prev) => prev + e)} 
                className="text-xl hover:bg-white/10 rounded-xl p-2 transition-all transform hover:scale-125 active:scale-95 flex items-center justify-center"
              >
                {e}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* BARRA DE ENTRADA */}
      <form 
        onSubmit={handleSubmit} 
        className="bg-[#2b2d31] flex items-center px-2 py-1.5 rounded-full border border-white/5 shadow-sm focus-within:border-purple-500/50 focus-within:ring-2 focus-within:ring-purple-500/20 transition-all duration-300"
      >
        <div className="flex items-center gap-0.5 pl-1">
          <input type="file" ref={fileInputRef} className="hidden" onChange={handleFile} />
          
          <button 
            type="button" 
            onClick={() => fileInputRef.current?.click()} 
            className="w-9 h-9 flex items-center justify-center rounded-full text-gray-400 hover:text-purple-300 hover:bg-white/5 transition-all"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          </button>

          <button 
            type="button" 
            onClick={() => setShowEmojis(!showEmojis)} 
            className={`w-9 h-9 flex items-center justify-center rounded-full transition-all ${showEmojis ? 'text-purple-400 bg-purple-500/10' : 'text-gray-400 hover:text-purple-300 hover:bg-white/5'}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M8 14s1.5 2 4 2 4-2 4-2"></path><line x1="9" y1="9" x2="9.01" y2="9"></line><line x1="15" y1="9" x2="15.01" y2="9"></line></svg>
          </button>
        </div>

        <input 
          value={text} 
          onChange={handleInputChange} 
          placeholder={placeholder}
          className="flex-1 bg-transparent text-gray-200 placeholder-gray-500/80 font-medium px-3 focus:outline-none text-[15px] ml-1"
        />
        
        <button 
          type="submit" 
          disabled={!text.trim()} 
          className={`w-10 h-10 flex items-center justify-center rounded-full transition-all duration-300 transform active:scale-90 ml-1 ${text.trim() ? 'bg-purple-600 text-white shadow-md shadow-purple-500/30 hover:bg-purple-500' : 'bg-transparent text-gray-500 cursor-not-allowed opacity-40 -rotate-45'}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" /></svg>
        </button>
      </form>
    </div>
  );
};

export default ChatInput;