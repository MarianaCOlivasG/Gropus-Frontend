import Swal from 'sweetalert2';
import type { ChatSliceCreator } from '../types';
const API_URL = import.meta.env?.VITE_API_URL;

export const createTagSlice: ChatSliceCreator<any> = (set, get) => ({
  tags: [],

  fetchTags: async () => {
    const { currentChatKey } = get();
    if (!currentChatKey) return;
    const token = localStorage.getItem('token');
      try {
        const res = await fetch(`${API_URL}/tags/group/${currentChatKey}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          const tagsList = Array.isArray(data) ? data : (data.data || []);
          set({ tags: tagsList });
        }
      } catch (error) {
        console.error("Error cargando tags", error);
      }
  },

  createTag: async (name:string, color:string, permissions: string[]) => {
    const { currentChatKey, tags} = get();
    const token = localStorage.getItem('token');
    const tagExists = tags.some(t => t.name.toLowerCase().trim() === name.toLowerCase().trim());

    if (tagExists) {
        Swal.fire('Atención', 'Ya existe una etiqueta con ese nombre en este grupo.', 'warning');
        return; 
    }
    try {
      const res = await fetch(`${API_URL}/tags`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name, color,groupUid: currentChatKey, permissions })
      });
      
      if (res.ok) {
        await get().fetchTags(); 
        Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Etiqueta creada', timer: 1500, showConfirmButton: false });
      } else {
        throw new Error('Error al crear');
      }
    } catch (error) {
      Swal.fire('Error', 'No se pudo crear la etiqueta', 'error');
    }
  },

  updateTag: async (uid:string, name:string, color:string, permissions: string[]) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_URL}/tags/${uid}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name, color, permissions })
      });
      if (res.ok) {
        await get().fetchTags();
        Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Etiqueta actualizada', timer: 1500, showConfirmButton: false });
      }
    } catch (error) {
      console.error(error);
    }
  },

  deleteTag: async (uid:string) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_URL}/tags/${uid}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        set(state => ({ tags: state.tags.filter(t => t.uid !== uid) }));
        Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Etiqueta eliminada', timer: 1500, showConfirmButton: false });
      }
    } catch (error) {
      Swal.fire('Error', 'No se pudo borrar', 'error');
    }
  },

  assignTagToChannel: async (channelUid:string, tagUid:string) => {
    const token = localStorage.getItem('token');
    const tagObj = get().tags.find(t => t.uid === tagUid);

    if (tagObj) {
        set(state => ({
            currentChannelObjects: state.currentChannelObjects.map(ch => {
                if (ch.id === channelUid) {
                    const hasTag = ch.tags?.some(t => t.uid === tagUid);
                    if (hasTag) return ch;
                    return { ...ch, tags: [...(ch.tags || []), tagObj] };
                }
                return ch;
            })
        }));
    }

    try {
      const res = await fetch(`${API_URL}/channels/${channelUid}/tag/${tagUid}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.ok) {
        Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Tag asignado', timer: 1000, showConfirmButton: false });
      } else {
        console.error("Error al asignar");
        const currentGroup = get().currentChatKey;
        if(currentGroup) get().loadChat(currentGroup);
      }
    } catch (e) { console.error(e); }
  },

  removeTagFromChannel: async (channelUid:string, tagUid:string) => {
    const token = localStorage.getItem('token');
    set(state => ({
        currentChannelObjects: state.currentChannelObjects.map(ch => {
            if (ch.id === channelUid) {
                return {
                    ...ch,
                    tags: (ch.tags || []).filter(t => t.uid !== tagUid) 
                };
            }
            return ch;
        })
    }));

    try {
      const res = await fetch(`${API_URL}/channels/${channelUid}/tag/${tagUid}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!res.ok) {
        console.error("Error al eliminar");
        const currentGroup = get().currentChatKey;
        if(currentGroup) get().loadChat(currentGroup);
      }
    } catch (e) { console.error(e); }
  },
  
  assignTagToUser: async (userUid:string, tagUid:string) => {
    const { socket, currentChatKey, tags } = get();
    const token = localStorage.getItem('token');
    const tagObj = tags.find(t => t.uid === tagUid);

    if (tagObj) {
        set(state => ({
            currentMembers: state.currentMembers.map(m => {
                if (m.key === userUid) {
                    const hasTag = m.tags?.some(t => t.uid === tagUid);
                    if (hasTag) return m;

                    return { 
                        ...m, 
                        tags: [...(m.tags || []), tagObj] 
                    };
                }
                return m;
            })
        }));
    }
    
    try {
      const res = await fetch(`${API_URL}/tags/assign/${tagUid}/${userUid}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
          if (socket && socket.connected && currentChatKey && tagObj) {
              const member = get().currentMembers.find(m => m.key === userUid);
              socket.emit('notify_permissions_change', {
                  groupUid: currentChatKey,
                  userId: userUid,
                  newTags: member?.tags || []
              });
          }
          Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Tag asignado al usuario', timer: 1500, showConfirmButton: false });
      }
    } catch (e) { console.error(e); }
  },

  removeTagFromUser: async (userUid:string, tagUid:string) => {
    const { socket, currentChatKey, currentMembers } = get();
    const token = localStorage.getItem('token');

    const member = currentMembers.find(m => m.key === userUid);
    if (!member) return;
    const misNuevosTags = (member.tags || []).filter(t => t.uid !== tagUid);
    try {
      const res = await fetch(`${API_URL}/tags/remove/${tagUid}/${userUid}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
          if (socket && socket.connected && currentChatKey) {
              socket.emit('notify_permissions_change', {
                  groupUid: currentChatKey,
                  userId: userUid,
                  newTags: misNuevosTags
              });
          }
          //if(currentChatKey) get().fetchGroupMembers(currentChatKey);
          set({
             currentMembers: currentMembers.map(m => 
                 m.key === userUid ? { ...m, tags: misNuevosTags } : m
             )
          });
      }
    } catch (e) { console.error(e); }
  }
});