import { useEffect, useMemo, useState } from 'react';
import { useChatStore } from '../../store/useChatStore';

export const FilePreviewModal = () => {
  const { previewFile, closeFilePreview, openFilePreview, messages } = useChatStore() as any;
  
  // Estado para zoom
  const [scale, setScale] = useState(1);

  // Filtramos solo imágenes para el carrusel de navegación
  const mediaList = useMemo(() => 
    messages.filter((m: any) => m.attachmentType === 'image'),
    [messages]
  );

  const currentIndex = mediaList.findIndex((m: any) => m.attachmentUrl === previewFile?.url);
  const currentMsg = mediaList[currentIndex];

  useEffect(() => {
    setScale(1);
  }, [previewFile?.url]);

  const goToNext = () => {
    if (currentIndex < mediaList.length - 1) {
      const next = mediaList[currentIndex + 1];
      openFilePreview(next.attachmentUrl, next.attachmentType, next.fileName || next.file_name);
    }
  };

  const goToPrev = () => {
    if (currentIndex > 0) {
      const prev = mediaList[currentIndex - 1];
      openFilePreview(prev.attachmentUrl, prev.attachmentType, prev.fileName || prev.file_name);
    }
  };

  const handleZoomIn = () => setScale(prev => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setScale(prev => Math.max(prev - 0.25, 0.5));

  const handleDownload = async () => {
    if (!previewFile?.url) return;
    try {
      const response = await fetch(previewFile.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = previewFile.name || 'descarga';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      window.open(previewFile.url, '_blank');
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeFilePreview();
      if (e.key === 'ArrowRight') goToNext();
      if (e.key === 'ArrowLeft') goToPrev();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, mediaList]);

  if (!previewFile) return null;

  const displayName = currentMsg?.fileName || currentMsg?.file_name || previewFile.name || "Archivo";

  return (
    <div className="fixed inset-0 bg-black/95 z-[99999] flex flex-col animate-in fade-in duration-200">
      
      {/* CABECERA */}
      <div className="flex justify-between items-center p-4 bg-black/40 backdrop-blur-md border-b border-white/5 z-10 flex-shrink-0">
        <div className="flex flex-col ml-4">
          <h3 className="text-gray-200 font-bold text-sm truncate max-w-md">{displayName}</h3>
          <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">
            {currentIndex >= 0 ? `${currentIndex + 1} de ${mediaList.length}` : 'Vista Previa'}
          </p>
        </div>

        <div className="flex items-center gap-2 bg-white/5 p-1 rounded-xl border border-white/5">
          {previewFile.type === 'image' && (
            <>
              <button onClick={handleZoomOut} className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-all" title="Alejar">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><line x1="8" y1="11" x2="14" y2="11"></line></svg>
              </button>
              <span className="text-[10px] font-bold text-gray-500 w-10 text-center">{Math.round(scale * 100)}%</span>
              <button onClick={handleZoomIn} className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-all" title="Acercar">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><line x1="11" cy="8" x2="11" y2="14"></line><line x1="8" y1="11" x2="14" y2="11"></line></svg>
              </button>
              <div className="w-px h-4 bg-white/10 mx-1" />
            </>
          )}
          <button onClick={handleDownload} className="p-2 text-gray-400 hover:text-purple-400 hover:bg-white/10 rounded-lg transition-all" title="Descargar">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
          </button>
          <div className="w-px h-4 bg-white/10 mx-1" />
          <button onClick={closeFilePreview} className="p-2 text-gray-400 hover:text-red-400 hover:bg-white/10 rounded-lg transition-all">
             <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
      </div>

      {/* ÁREA CENTRAL */}
      <div className="flex-1 relative flex items-center justify-center overflow-hidden group min-h-0">
        {currentIndex > 0 && (
          <button onClick={goToPrev} className="absolute left-6 z-20 p-4 bg-black/40 hover:bg-purple-600 text-white rounded-full transition-all opacity-0 group-hover:opacity-100 backdrop-blur-sm">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
          </button>
        )}

        <div className="w-full h-full flex items-center justify-center p-6 overflow-auto scrollbar-hide" onClick={closeFilePreview}>
          <div 
            className="relative transition-transform duration-200 ease-out flex items-center justify-center"
            style={{ transform: `scale(${scale})` }}
            onClick={(e) => e.stopPropagation()}
          >
            {previewFile.type === 'image' ? (
              <img 
                src={previewFile.url} 
                style={{ 
                  maxWidth: 'calc(100vw - 80px)', 
                  maxHeight: 'calc(100vh - 200px)', 
                  objectFit: 'contain' 
                }}
                className="shadow-2xl rounded-sm select-none pointer-events-none" 
                alt="" 
              />
            ) : (
              <embed src={previewFile.url} type="application/pdf" className="w-[85vw] h-[75vh] bg-white rounded-sm shadow-2xl" />
            )}
          </div>
        </div>

        {currentIndex < mediaList.length - 1 && (
          <button onClick={goToNext} className="absolute right-6 z-20 p-4 bg-black/40 hover:bg-purple-600 text-white rounded-full transition-all opacity-0 group-hover:opacity-100 backdrop-blur-sm">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
          </button>
        )}
      </div>

      {/* MINIATURAS INFERIORES */}
      <div className="h-24 bg-black/60 backdrop-blur-md flex items-center justify-center gap-3 px-6 overflow-x-auto border-t border-white/5 flex-shrink-0">
        {mediaList.map((m: any, i: number) => (
          <div 
            key={i} 
            onClick={() => openFilePreview(m.attachmentUrl, 'image', m.fileName || m.file_name)}
            className={`h-14 w-14 rounded-lg cursor-pointer transition-all overflow-hidden flex-shrink-0 border-2 ${
              i === currentIndex ? 'border-purple-500 scale-110 shadow-lg' : 'border-transparent opacity-40 hover:opacity-100'
            }`}
          >
            <img src={m.attachmentUrl} className="w-full h-full object-cover" alt="" />
          </div>
        ))}
      </div>
    </div>
  );
};