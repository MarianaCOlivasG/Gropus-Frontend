import React, { useState } from 'react';
import type { Message } from '../../store/types';

interface MediaGalleryProps {
  messages: Message[];
  onClose: () => void;
  onImageClick: (url: string, name: string, type: 'image' | 'pdf') => void;
}

type TabType = 'MEDIA' | 'DOCS' | 'LINKS';

const MediaGallery: React.FC<MediaGalleryProps> = ({ messages, onClose, onImageClick }) => {
  const [activeTab, setActiveTab] = useState<TabType>('MEDIA');

  const media = messages.filter(m => m.attachmentType === 'image');
  const docs = messages.filter(m => m.attachmentType === 'document');

  const links = messages.filter(m => {
      const urlRegex = /(https?:\/\/[^\s]+)/g;
      return m.text && typeof m.text === 'string' && m.text.match(urlRegex);
  });

  return (
    <div className="w-80 bg-[#232428] border-l border-white/5 flex flex-col h-full animate-in slide-in-from-right duration-300">
      
      {/* CABECERA */}
      <div className="p-4 bg-[#1e1f22] border-b border-black/20">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-gray-200 font-bold text-sm tracking-tight">Archivos del canal</h3>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-white transition-colors p-1 hover:bg-white/5 rounded"
          >
            ✕
          </button>
        </div>

        {/* SELECTOR DE PESTAÑAS */}
        <div className="flex bg-black/20 rounded-lg p-1">
          {['MEDIA', 'DOCS', 'LINKS'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as TabType)}
              className={`flex-1 py-1.5 text-[10px] font-black rounded-md transition-all ${
                activeTab === tab ? 'bg-purple-600 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* CONTENIDO SCROLLABLE */}
      <div className="flex-1 overflow-y-auto p-3 scrollbar-thin scrollbar-thumb-gray-800">
        
        {/* SECCIÓN MEDIA */}
        {activeTab === 'MEDIA' && (
          <div className="grid grid-cols-3 gap-2">
            {media.length > 0 ? media.map((img, i) => (
              <div 
                key={i} 
                onClick={() => onImageClick(img.attachmentUrl || '', img.fileName || 'Imagen', 'image')} 
                className="aspect-square rounded-md overflow-hidden bg-black/20 cursor-pointer hover:ring-2 hover:ring-purple-500 transition-all group"
              >
                <img 
                  src={img.attachmentUrl || ''} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" 
                  alt="" 
                />
              </div>
            )) : <p className="col-span-3 text-center text-gray-500 text-xs py-10 italic">No hay imágenes</p>}
          </div>
        )}

        {/* SECCIÓN DOCUMENTOS */}
        {activeTab === 'DOCS' && (
          <div className="space-y-2">
            {docs.length > 0 ? docs.map((doc, i) => {
              const isPdf = doc.mimeType?.includes('pdf') || doc.fileName?.toLowerCase().endsWith('.pdf');
              
              return (
                <div 
                  key={i} 
                  onClick={() => {
                    if (isPdf) {
                      // Si es PDF, disparamos el visor interno
                      onImageClick(doc.attachmentUrl || '', doc.fileName || 'Documento', 'pdf');
                    } else {
                      // Si es otro documento (word, excel), lo abrimos/descargamos externo
                      window.open(doc.attachmentUrl || '#', '_blank');
                    }
                  }}
                  className="flex items-center gap-3 p-2.5 rounded-lg bg-black/20 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all group cursor-pointer"
                >
                  <div className={`p-2 rounded font-bold text-[10px] flex-shrink-0 ${
                    isPdf ? 'bg-red-500/10 text-red-500' : 'bg-blue-500/10 text-blue-500'
                  }`}>
                    {isPdf ? 'PDF' : 'DOC'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-gray-200 truncate font-semibold leading-tight">{doc.fileName || 'Archivo'}</p>
                    <p className="text-[9px] text-gray-500 uppercase font-bold tracking-wider">
                      {isPdf ? 'Ver en visor' : 'Descargar archivo'}
                    </p>
                  </div>
                </div>
              );
            }) : <p className="text-center text-gray-500 text-xs py-10 italic">No hay documentos</p>}
          </div>
        )}

        {/* SECCIÓN LINKS */}
        {activeTab === 'LINKS' && (
          <div className="space-y-2">
            {links.length > 0 ? links.map((link, i) => (
              <div key={i} className="p-3 rounded-lg bg-black/20 border border-white/5 space-y-2 hover:border-purple-500/30 transition-colors">
                <div className="flex items-center gap-2 text-purple-400">
                   <span className="text-xs">🔗</span>
                   <span className="text-[9px] font-black uppercase tracking-widest">Enlace Compartido</span>
                </div>
                <p className="text-xs text-gray-300 break-words line-clamp-2 leading-snug">{link.text}</p>
                <a 
                  href={link.text} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="text-[10px] text-blue-400 hover:text-blue-300 hover:underline inline-block font-bold"
                >
                  Abrir enlace externo
                </a>
              </div>
            )) : <p className="text-center text-gray-500 text-xs py-10 italic">No hay enlaces</p>}
          </div>
        )}
      </div>
    </div>
  );
};

export default MediaGallery;