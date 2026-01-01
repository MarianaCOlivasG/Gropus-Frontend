import React, { useState, useRef, useEffect } from "react";

interface ChatInputProps {
  onSendMessage: (text: string) => void;
  placeholder: string;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, placeholder }) => {
  const [text, setText] = useState("");
  const [showEmojis, setShowEmojis] = useState(false);
  const emojiRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const emojis = ["😄", "😍", "👍", "🔥", "🎉", "🚀", "💬", "💔", "🤔", "💯"];

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (emojiRef.current && !emojiRef.current.contains(e.target as Node)) {
        setShowEmojis(false);
      }
    };
    if (showEmojis) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [showEmojis]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    onSendMessage(text);
    setText("");
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => onSendMessage(`<img src="${reader.result}" class="max-w-xs rounded-lg mt-1 border border-gray-700">`);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="p-4 bg-gray-900 border-t border-gray-800 relative z-20">
      
      {/* Emoji Picker (Flotante) */}
      {showEmojis && (
        <div ref={emojiRef} className="absolute bottom-20 left-4 p-2 bg-[#2b2d31] border border-gray-700 rounded-xl shadow-2xl grid grid-cols-5 gap-2 w-72 animate-fade-in-up">
          {emojis.map((e) => (
            <button 
              key={e} 
              onClick={() => setText((prev) => prev + e)} 
              className="text-2xl hover:bg-gray-700 rounded-lg p-2 transition transform hover:scale-110"
            >
              {e}
            </button>
          ))}
        </div>
      )}

      {/* BARRA DE HERRAMIENTAS */}
      <form onSubmit={handleSubmit} className="flex items-center gap-3">
        
        {/* GRUPO DE ACCIONES (El "Cuadro" detrás de los iconos) */}
        <div className="flex items-center gap-1">
            <button 
                type="button" 
                onClick={() => setShowEmojis(!showEmojis)} 
                className={`
                    w-10 h-10 flex items-center justify-center rounded-lg transition-all duration-200
                    ${showEmojis ? 'bg-purple-600 text-white' : 'bg-[#2b2d31] text-gray-400 hover:text-gray-100 hover:bg-gray-700'}
                `}
                title="Emojis"
            >
                <span className="text-xl">😊</span>
            </button>

            {/* Input File */}
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFile} />
            <button 
                type="button" 
                onClick={() => fileInputRef.current?.click()} 
                className="w-10 h-10 flex items-center justify-center rounded-lg bg-[#2b2d31] text-gray-400 hover:text-green-400 hover:bg-gray-700 transition-all duration-200"
                title="Adjuntar archivo"
            >
                <span className="text-xl transform -rotate-45">📎</span>
            </button>
        </div>

        {/* INPUT DE TEXTO */}
        <div className="flex-1 bg-[#383a40] rounded-lg flex items-center px-4 py-2 border border-transparent focus-within:border-purple-500/50 focus-within:ring-2 focus-within:ring-purple-500/20 transition-all">
            <input 
                value={text} 
                onChange={(e) => setText(e.target.value)} 
                placeholder={placeholder}
                className="flex-1 bg-transparent text-gray-200 placeholder-gray-500 focus:outline-none h-6"
            />
        </div>
        
        {/* BOTÓN ENVIAR */}
        <button 
            type="submit" 
            disabled={!text.trim()} 
            className="w-10 h-10 flex items-center justify-center bg-purple-600 hover:bg-purple-500 rounded-lg text-white shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none transition-all transform active:scale-95"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 ml-0.5">
            <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
          </svg>
        </button>

      </form>
    </div>
  );
};

export default ChatInput;