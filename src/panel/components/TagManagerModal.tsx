import React, { useState, useEffect } from "react";
import { useChatStore } from "../../store/useChatStore";
import type { Tag } from "../../store/types";

const PERMISSIONS = [
  { id: 'create_channel', label: 'Crear Canales', desc: 'Permite generar nuevos espacios de chat.' },
  { id: 'edit_channel',   label: 'Editar Canales', desc: 'Permite modificar nombres y ajustes.' },
  { id: 'delete_channel', label: 'Borrar Canales', desc: 'Permite la eliminación definitiva de canales.' },
  { id: 'add_members',    label: 'Añadir Miembros', desc: 'Permite crear invitaciones para nuevos usuarios.' },
  { id: 'kick_members',   label: 'Expulsar Usuarios', desc: 'Autoriza remover miembros del grupo.' },
  { id: 'tag_assigner',   label: 'Crear Etiquetas', desc: 'Permite crear etiquetas a miembros' },
  
  { 
    id: 'delete_server', 
    label: 'ELIMINAR SERVIDOR', 
    desc: '¡PELIGRO! Permite borrar el grupo entero.', 
    danger: true 
  },
];

interface Props { isOpen: boolean; onClose: () => void; }

export const TagManagerModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { tags, fetchTags, createTag, updateTag, deleteTag } = useChatStore();
  const [tagName, setTagName] = useState("");
  const [tagColor, setTagColor] = useState("#7c4dff");
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => { if (isOpen) fetchTags(); }, [isOpen]);

  const reset = () => { setTagName(""); setTagColor("#7c4dff"); setSelectedPermissions([]); setEditingId(null); };

  const handleEdit = (tag: Tag) => {
    setEditingId(tag.uid);
    setTagName(tag.name);
    setTagColor(tag.color || "#7c4dff");
    setSelectedPermissions(tag.permissions || []);
  };

  const togglePerm = (id: string) => {
    setSelectedPermissions(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);
  };

  const save = async () => {
    if (!tagName.trim()) return;
    
    if (editingId) {
        await updateTag(editingId, tagName, tagColor, selectedPermissions);
    } else {
        await createTag(tagName, tagColor, selectedPermissions);
    }
    
    reset();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm font-sans" onClick={onClose}>
      <div 
        className="bg-[#313338] w-full max-w-2xl rounded-xl shadow-[0_20px_60px_rgba(0,0,0,0.8)] border border-[#1e1f22] flex flex-col overflow-hidden animate-in zoom-in duration-300" 
        onClick={e => e.stopPropagation()}
      >
        
        {/* CABECERA */}
        <div className="p-5 border-b border-[#1e1f22] bg-[#2b2d31] flex justify-between items-center relative">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-[#7c4dff]"></div>
          <h2 className="text-white font-bold text-xl uppercase tracking-tight ml-2">
            {editingId ? 'Personalizar Rol' : 'Gestión de Etiquetas'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-all hover:scale-110">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8 overflow-y-auto max-h-[75vh] custom-scrollbar">
          
          {/*CONFIGURACIÓN*/}
          <div className="space-y-6">
            <div className="bg-[#2b2d31] p-5 rounded-lg border border-[#1e1f22]">
              <label className="text-[10px] uppercase font-bold text-gray-500 mb-3 block tracking-widest">Ajustes del Rango</label>
              <input 
                type="text" 
                className="w-full bg-[#1e1f22] text-white p-3 rounded font-medium border-2 border-transparent focus:border-[#7c4dff] outline-none transition-all placeholder-gray-600 mb-4" 
                placeholder="Nombre del rol..." 
                value={tagName} 
                onChange={e => setTagName(e.target.value)} 
              />
              <div className="flex gap-3">
                <input type="color" className="w-12 h-12 rounded cursor-pointer border-none bg-transparent active:scale-90 transition-transform" value={tagColor} onChange={e => setTagColor(e.target.value)} />
                <button 
                  onClick={save} 
                  className="flex-1 bg-[#7c4dff] hover:bg-[#6c3cf0] text-white font-bold uppercase tracking-wider rounded transition-all active:scale-95 shadow-lg"
                >
                  {editingId ? 'Guardar' : 'Crear'}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase font-bold text-gray-500 pl-1 block tracking-widest">Roles Existentes ({tags.length})</label>
              {tags.map(tag => (
                <div 
                  key={tag.uid} 
                  className={`group flex items-center justify-between p-4 bg-[#2b2d31] rounded border-l-4 transition-all duration-300 cursor-pointer hover:bg-[#35373d]
                    ${editingId === tag.uid ? 'border-[#7c4dff]' : 'border-transparent hover:border-gray-600'}
                  `}
                  onClick={() => handleEdit(tag)}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: tag.color || '#ccc', boxShadow: `0 0 8px ${tag.color}` }}></div>
                    <span className="text-sm font-bold text-gray-200">{tag.name}</span>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); deleteTag(tag.uid); }} className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-500 transition-all">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/*PERMISOS */}
          <div className="space-y-4">
            <label className="text-[10px] uppercase font-bold text-gray-500 pl-1 block tracking-widest">Atribuciones del Rol</label>
            <div className="space-y-3">
              {PERMISSIONS.map((perm, index) => {
                const active = selectedPermissions.includes(perm.id);
                const activeClass = perm.danger 
                    ? 'bg-red-500/10 border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.2)]' 
                    : 'bg-[#7c4dff]/10 border-[#7c4dff] shadow-[0_0_15px_rgba(124,77,255,0.1)]';
                
                const iconColor = active 
                    ? (perm.danger ? 'text-red-500' : 'text-[#7c4dff]') 
                    : 'text-gray-500';

                return (
                  <div 
                    key={perm.id}
                    onClick={() => togglePerm(perm.id)}
                    className={`
                      relative p-4 rounded-lg border-2 cursor-pointer transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]
                      hover:-translate-y-1 hover:scale-[1.02] active:scale-95 flex items-center gap-4
                      ${active ? activeClass : 'bg-[#2b2d31] border-transparent hover:border-gray-600'}
                    `}
                    style={{ transitionDelay: `${index * 40}ms` }}
                  >
                    <div className={`p-2 rounded bg-[#1e1f22] transition-colors ${iconColor}`}>
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        {perm.id === 'create_channel' && <path d="M12 4v16m8-8H4" />}
                        {perm.id === 'edit_channel' && <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />}
                        {perm.id === 'delete_channel' && <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />}
                        {perm.id === 'add_members' && (
                            <>
                                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                <circle cx="8.5" cy="7" r="4" />
                                <line x1="20" y1="8" x2="20" y2="14" />
                                <line x1="23" y1="11" x2="17" y2="11" />
                            </>
                        )}
                        {perm.id === 'kick_members' && <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />}
                        {perm.id === 'tag_assigner' && <path d="M5 13l4 4L19 7" />}
                        {perm.id === 'delete_server' && <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />}
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className={`text-xs font-bold uppercase ${active ? (perm.danger ? 'text-red-400' : 'text-white') : 'text-gray-300'}`}>{perm.label}</p>
                      <p className="text-[10px] text-gray-500 leading-tight font-medium">{perm.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
            {editingId && (
              <button onClick={reset} className="w-full py-2 text-[10px] font-bold text-gray-500 hover:text-white transition-colors uppercase tracking-widest">
                ← Volver al modo creación
              </button>
            )}
          </div>

        </div>

        {/* FOOTER */}
        <div className="p-4 bg-[#2b2d31] border-t border-[#1e1f22] flex justify-end gap-4">
           <button onClick={onClose} className="px-8 py-2 bg-[#1e1f22] hover:bg-black text-white text-xs font-bold uppercase tracking-widest rounded transition-all">Cerrar</button>
        </div>
      </div>
    </div>
  );
};