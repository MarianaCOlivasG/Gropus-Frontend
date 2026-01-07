import { useEffect } from 'react'; 
import { useChatStore } from '../../store/useChatStore';

export const FilePreviewModal = () => {
  const { previewFile, closeFilePreview } = useChatStore() as any;

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => { 
      if (e.key === 'Escape') closeFilePreview(); 
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [closeFilePreview]);

  if (!previewFile) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/90 z-[99999] flex items-center justify-center p-4 animate-in fade-in duration-200" 
      onClick={closeFilePreview}
    >
      <div 
        className="relative bg-[#1e1f22] rounded-xl overflow-hidden shadow-2xl max-w-5xl w-full max-h-[90vh] flex flex-col" 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-3 bg-black/20 border-b border-white/5">
          <h3 className="text-gray-200 font-medium truncate ml-2">{previewFile.name}</h3>
          <button 
            onClick={closeFilePreview} 
            className="text-gray-400 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors"
          >
            ✕
          </button>
        </div>
        <div className="flex-1 overflow-auto flex items-center justify-center bg-black/40 p-2 min-h-[400px]">
          {previewFile.type === 'image' ? (
            <img 
              src={previewFile.url} 
              className="max-w-full max-h-[80vh] object-contain shadow-2xl" 
              alt="" 
            />
          ) : (
            <embed 
              src={previewFile.url} 
              type="application/pdf" 
              width="100%" 
              height="100%" 
              className="rounded-b-lg min-h-[70vh]" 
            />
          )}
        </div>
      </div>
    </div>
  );
};