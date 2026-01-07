import Swal from 'sweetalert2';
import type { ChatSliceCreator, GroupListItem, ChatState } from '../types';

const API_URL = import.meta.env?.VITE_API_URL;

export const createGroupSlice: ChatSliceCreator<any> = (set, get) => ({
  allGroups: [],
  allFriends: [],
  loadingGroupChannels: {},

  fetchGroups: async (tokenOverride?: string) => {
    const token = tokenOverride || localStorage.getItem('token');
    const uid = localStorage.getItem('uid');
    if (!uid || !token) { set({ isLoading: false }); return; }

    try {
      const res = await fetch(`${API_URL}/groups/user/${uid}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401) { get().logout(); return; }
      
      const result = await res.json();
      const mappedGroups: GroupListItem[] = (result?.data || []).map((g: any) => ({
        key: g.id,
        display: g.name,
        avatar: g.image || 'bg-gray-700',
        description: g.description || "",
        channels: undefined,
      }));
      set({ allGroups: mappedGroups });
    } catch (err) { console.error(err); } 
  },

  createGroup: async (data: any) => {
    const token = localStorage.getItem('token');
    if(!token) return;
    try {
      const res = await fetch(`${API_URL}/groups`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ 
            name: data.groupName, 
            description: data.groupDescription, 
            image: null, 
            privacy: 'public' 
        }),
      });
      if (!res.ok) throw new Error("Error creando grupo");
      const json = await res.json();
      const newId = (json.data?.group || json.data || json).id;

      let finalImageUrl: string | null = null; 
      if (data.groupImageFile) {
          const formData = new FormData();
          formData.append('file', data.groupImageFile); 
          const resUpload = await fetch(`${API_URL}/groups/upload/${newId}`, {
              method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: formData
          });
          if (resUpload.ok) {
              const uploadJson = await resUpload.json();
              finalImageUrl = uploadJson.data?.image || uploadJson.data?.picture || uploadJson.url;
          }
      }

      await fetch(`${API_URL}/channels`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ name: 'general', group_uid: newId }),
      });
      
      set((_state: ChatState) => ({ 
            currentChatKey: newId,          
            isGroup: true,                  
            chatDisplayName: data.groupName,       
            currentChannel: '#general',     
            messages: []
      }));
      await get().fetchGroups();
      await get().loadChat(newId);
    } catch (e: any) { console.error(e); Swal.fire('Error', e.message, 'error'); }
  },

  updateGroup: async (groupKey: string, data: any) => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/groups/${groupKey}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ 
          name: data.groupName, 
          description: data.groupDescription,
          privacy: 'public' 
        }),
      });
      if (!res.ok) throw new Error("Error al actualizar textos");

      if (data.groupImageFile) {
        const formData = new FormData();
        formData.append('file', data.groupImageFile); 
        await fetch(`${API_URL}/groups/upload/${groupKey}`, {
          method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: formData
        });
      }

      await get().fetchGroups(); 
      if (get().currentChatKey === groupKey) {
          set({ chatDisplayName: data.groupName });
      }
    } catch (e: any) { console.error(e); Swal.fire('Error', e.message, 'error'); throw e; }
  },

  deleteGroup: async (groupKey:string) => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/groups/${groupKey}`, {
        method: 'DELETE', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
      });
      if (!res.ok) throw new Error('Error borrando grupo');
      set((_state: ChatState) => ({
          allGroups: _state.allGroups.filter((g) => g.key !== groupKey),
          currentChatKey: _state.currentChatKey === groupKey ? null : _state.currentChatKey,
      }));
    } catch (error: any) { console.error(error); throw error; }
  },

  createNewChannel: async (name:string) => {
    const { currentChatKey } = get();
    const token = localStorage.getItem('token');
    if (!currentChatKey) return;
    try {
      const res = await fetch(`${API_URL}/channels`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name, group_uid: currentChatKey }),
      });
      if (res.ok) { await get().loadChat(currentChatKey); get().loadChannel(`#${name}`); }
    } catch (e) { console.error(e); }
  },

  updateChannel: async (id:string, name:string) => {
    const { currentChatKey } = get();
    const token = localStorage.getItem('token');
    try {
      await fetch(`${API_URL}/channels/${id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ name }),
      });
      if (currentChatKey) get().loadChat(currentChatKey);
    } catch (e) { console.error(e); }
  },

  deleteChannel: async (id:string) => {
    const { currentChatKey, currentChannel } = get();
    const token = localStorage.getItem('token');
    try {
      await fetch(`${API_URL}/channels/${id}`, {
        method: 'DELETE', headers: { Authorization: `Bearer ${token}` },
      });
      if (currentChatKey) {
          await get().loadChat(currentChatKey);
          if (get().currentChannel === currentChannel) { set({ currentChannel: '#general' }); get().loadChannel('#general'); }
      }
    } catch (e) { console.error(e); }
  }
});