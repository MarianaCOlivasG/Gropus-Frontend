import React, { useMemo, useState } from 'react';
import { useChatStore } from '../../store/useChatStore';
import type { ChannelItem } from '../../store/types';
import { fireToast } from '../../utils/alerts'; 

interface Props {
  isOpen: boolean;
  onClose: () => void;
  channel: ChannelItem;
}

export const ChannelSettingsModal: React.FC<Props> = ({ isOpen, onClose, channel }) => {
  const { 
    tags, 
    assignTagToChannel, 
    removeTagFromChannel, 
    updateChannel,
    currentChannelObjects 
  } = useChatStore();
  
  const [name, setName] = useState(channel.name);

  const liveChannel = useMemo(() => {
    return currentChannelObjects.find(c => c.id === channel.id) || channel;
  }, [currentChannelObjects, channel]);

  if (!isOpen) return null;

  const channelTags = liveChannel.tags || [];

  const isAssigned = (tagUid: string) => {
    return channelTags.some((t: any) => {
        const tId = String(t.uid || t.id || t._id); 
        const targetId = String(tagUid);            
        return tId === targetId;
    });
  };

  const handleToggleTag = async (tagUid: string) => {
    if (isAssigned(tagUid)) {
      await removeTagFromChannel(channel.id, tagUid);
    } else {
      await assignTagToChannel(channel.id, tagUid);
    }
  };

  const handleRename = async () => {
      await updateChannel(channel.id, name);
      fireToast({ 
          title: `Canal actualizado a #${name}`, 
          icon: 'success' 
      });
      onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-[#313338] p-6 rounded-xl w-96 border border-gray-700 animate-in fade-in zoom-in duration-200" onClick={e => e.stopPropagation()}>
        <h2 className="text-white text-lg font-bold mb-4">Editar Canal #{channel.name}</h2>
        
        {/* INPUT NOMBRE */}
        <div className="mb-6">
            <label className="text-xs uppercase text-gray-400 font-bold mb-1 block">Nombre del canal</label>
            <input 
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#1e1f22] text-white p-2 rounded border border-gray-700 focus:outline-none focus:border-blue-500 font-medium"
            />
        </div>

        {/* ETIQUETAS */}
        <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
                <label className="text-xs uppercase text-gray-400 font-bold block">Etiquetas Requeridas</label>
                <span className="text-[10px] text-gray-500 font-mono">
                    {channelTags.length}/{tags.length} asignadas
                </span>
            </div>
            
            <div className="flex flex-wrap gap-2">
                {tags.length === 0 && <span className="text-gray-500 text-xs italic">No hay etiquetas disponibles.</span>}

                {tags.map(tag => {
                    const active = isAssigned(tag.uid);
                    const color = tag.color || '#9ca3af';

                    return (
                        <button
                            key={tag.uid}
                            onClick={() => handleToggleTag(tag.uid)}
                            className={`
                                px-2.5 py-1 rounded-md text-xs font-medium border transition-all duration-200 flex items-center gap-1.5 shadow-sm
                                ${active ? 'translate-y-[1px]' : 'hover:brightness-125'}
                            `}
                            style={{ 
                                backgroundColor: active ? color : 'transparent',
                                borderColor: color,
                                color: active ? '#fff' : color,
                                boxShadow: active ? `0 0 10px -3px ${color}` : 'none'
                            }}
                        >
                            <div 
                                className={`w-1.5 h-1.5 rounded-full transition-all`} 
                                style={{ backgroundColor: active ? '#fff' : color }}
                            />
                            {tag.name}
                        </button>
                    )
                })}
            </div>
        </div>

        {/* FOOTER BOTONES */}
        <div className="flex justify-end gap-2 border-t border-gray-700 pt-4">
            <button 
                onClick={onClose} 
                className="text-gray-300 px-4 py-2 hover:underline text-sm font-medium transition-colors"
            >
                Cancelar
            </button>
            <button 
                onClick={handleRename} 
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-500 text-sm font-bold shadow-lg shadow-blue-900/20 transition-all"
            >
                Guardar Cambios
            </button>
        </div>
      </div>
    </div>
  );
};