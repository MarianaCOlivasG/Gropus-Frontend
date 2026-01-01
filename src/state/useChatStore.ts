import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware'; 
import Swal from 'sweetalert2';

const API_URL = import.meta.env?.VITE_API_URL;

// --- INTERFACES DE DATOS ---
export interface Message {
  id?: string;
  sender: string;
  name: string;
  avatar?: string;
  text: string;
  time: string;
}

export interface ChannelItem {
  id: string;
  name: string;
  key: string;
  description?: string;
}

export interface GroupListItem {
  key: string;
  display: string;
  avatar: string;
  channels?: ChannelItem[];
}

export interface FriendItem {
  key: string;
  chat: string;
  name: string;
  avatar: string;
  status: string;
}

export interface GroupMember {
  key: string;
  name: string;
  avatar: string;
  role?: string;   
  status?: string; 
}

// --- INTERFAZ DEL ESTADO (STATE) ---
interface ChatState {
  currentUser: { uid: string; name: string; avatar: string } | null;
  allGroups: GroupListItem[];
  allFriends: FriendItem[];
  
  currentChatKey: string | null;
  chatDisplayName: string | null;
  currentChannel: string;
  isGroup: boolean;
  
  currentChannels: string[];       
  currentChannelObjects: ChannelItem[];
  currentMembers: GroupMember[];
  
  potentialMembers: GroupMember[]; 
  
  messages: Message[];
  isLoadingMessages: boolean;
  isLoadingMembers: boolean;
  isLoading: boolean;
  isNewUserMode: boolean;
  isCheckingAuth: boolean;
  pinnedMessage: (Message & { index: number }) | null;
  mutedChannels: Set<string>;
  loadingGroupChannels: Record<string, boolean>;

  // --- ACCIONES ---
  initAuth: () => void;
  fetchGroups: (tokenOverride?: string) => Promise<void>;
  loadChat: (chatKey: string) => Promise<void>;
  loadChannel: (channelKey: string) => Promise<void>;
  
  fetchGroupMembers: (groupKey: string) => Promise<void>;
  fetchUsersToAdd: (groupKey: string) => Promise<void>;

  sendMessage: (text: string) => Promise<void>;
  deleteMessage: (index: number, messageId?: string) => Promise<void>;
  pinMessage: (index: number | null) => void;
  toggleMuteChannel: (fullKey: string) => void;
  
  createGroup: (data: any) => Promise<void>;
  deleteGroup: (groupKey: string) => Promise<void>; 
  createNewChannel: (name: string) => Promise<void>;
  updateChannel: (id: string, name: string) => Promise<void>;
  deleteChannel: (id: string) => Promise<void>;
  
  addMembersToGroup: (keys: string[], groupKey: string) => Promise<void>;
  
  logout: () => void;
}

// --- STORE IMPLEMENTATION ---
export const useChatStore = create<ChatState>()(
  persist( 
    (set, get) => ({
      currentUser: null,
      allGroups: [],
      allFriends: [],
      
      currentChatKey: null,
      chatDisplayName: null,
      
      currentChannel: '#general',
      isGroup: false,
      
      currentChannels: [],       
      currentChannelObjects: [], 
      currentMembers: [], 
      potentialMembers: [], 

      messages: [],
      isLoadingMessages: false,
      isLoadingMembers: false,
      isLoading: true,
      isCheckingAuth: false,
      isNewUserMode: false,
      pinnedMessage: null,
      mutedChannels: new Set(),
      loadingGroupChannels: {},

      // 1. INICIALIZACIÓN Y RENOVACIÓN DE TOKEN
      initAuth: async () => {
        if (get().isCheckingAuth) return;
        const token = localStorage.getItem('token');
        
        if (!token) {
            get().logout();
            set({ isLoading: false });
            return;
        }

        set({ isCheckingAuth: true });
        try {
            // Intentamos renovar/validar el token con el backend
            const res = await fetch(`${API_URL}/auth/renew/customer`, {
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Cache-Control': 'no-cache' 
                }
            });

            if (!res.ok) throw new Error('Sesión inválida o expirada');
            
            const data = await res.json();
            const serverData = data.data || data; 
            const newToken = serverData.token || serverData.accessToken || token;
            const user = serverData.user || serverData.customer;

            localStorage.setItem('token', newToken);
            localStorage.setItem('uid', user.uid || user.id);
            
            set({ 
                currentUser: { 
                    uid: user.uid || user.id, 
                    name: user.name || user.username, 
                    avatar: user.picture || 'https://i.pravatar.cc/150' 
                }
            });
            // Cargamos grupos con el token validado
            await get().fetchGroups(newToken);

        } catch (error) {
            console.error("Error de sesión:", error);
            get().logout(); // Si falla la renovación, sacamos al usuario
        } finally {
            set({ isCheckingAuth: false, isLoading: false });
        }
      },

      // 2. CARGA DE GRUPOS (CON PROTECCIÓN ANTI-HACKEO)
      fetchGroups: async (tokenOverride?: string) => {
        const token = tokenOverride || localStorage.getItem('token');
        const uid = localStorage.getItem('uid');

        if (!uid || !token) {
          set({ isLoading: false });
          return;
        }

        try {
          const res = await fetch(`${API_URL}/groups/user/${uid}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          
          // BLOQUEO DE SEGURIDAD 
          // Si el token es falso o expiró, cerramos sesión inmediatamente
          if (res.status === 401) {
             console.warn("Token rechazado por el servidor. Cerrando sesión...");
             get().logout();
             return;
          }
          
          if (!res.ok) throw new Error('Error obteniendo grupos');

          const result = await res.json();
          const mappedGroups: GroupListItem[] = (result?.data || []).map((g: any) => ({
            key: g.id,
            display: g.name,
            avatar: g.image || 'bg-gray-700',
            channels: undefined,
          }));

          set({ allGroups: mappedGroups });
          
          // Restaurar el chat anterior si existe en la lista
          const { currentChatKey } = get();
          if (currentChatKey) {
             const exists = mappedGroups.some(g => g.key === currentChatKey);
             if (exists && get().currentChannelObjects.length === 0) {
                 get().loadChat(currentChatKey);
             }
          }

        } catch (err) {
          console.error(err);
        } 
      },

      loadChat: async (chatKey) => {
        const { allGroups, allFriends } = get();
        
        const group = allGroups.find(g => g.key === chatKey);
        const friend = allFriends.find(f => f.chat === chatKey);
        
        const isGroupChat = !!group;
        const displayName = group?.display || friend?.name || "Chat";

        let channelObjs: ChannelItem[] = group?.channels || [];
        
        const savedChannel = get().currentChannel || '#general';
        const initialChannel = channelObjs.length > 0 
        ? (channelObjs.some(c => c.key === savedChannel) ? savedChannel : '#general')
        : '#general';

        set({ 
          currentChatKey: chatKey,
          isGroup: isGroupChat,
          chatDisplayName: displayName,
          currentChannel: initialChannel,
          pinnedMessage: null,
          messages: [], 
          currentChannelObjects: channelObjs,
          currentChannels: channelObjs.map(c => c.key),
          currentMembers: [] 
        });

        // Cargar canales si es grupo y no tiene
        if (isGroupChat && group && (!group.channels || group.channels.length === 0)) {
            set(state => ({ loadingGroupChannels: { ...state.loadingGroupChannels, [chatKey]: true } }));
            try {
              const token = localStorage.getItem('token');
              const res = await fetch(`${API_URL}/channels/group/${chatKey}`, {
                headers: { Authorization: `Bearer ${token}` },
              });
              
              if(res.ok) {
                  const result = await res.json();
                  const channelsData = Array.isArray(result) ? result : Object.values(result);
                  
                  const finalChannels = channelsData.map((ch: any) => ({
                    id: ch.uid || ch.id,
                    name: ch.name,
                    key: `#${ch.name}`,
                    description: ch.description
                  }));
                  
                  const updatedGroups = get().allGroups.map(g => g.key === chatKey ? { ...g, channels: finalChannels } : g);
                  const validSavedChannel = finalChannels.some(c => c.key === initialChannel) ? initialChannel : '#general';

                  set({
                    allGroups: updatedGroups,
                    currentChannelObjects: finalChannels,
                    currentChannels: finalChannels.map(c => c.key),
                    currentChannel: validSavedChannel 
                  });
              }
            } catch(e) {
                console.error("Error cargando canales", e);
            } finally {
              set(state => ({ loadingGroupChannels: { ...state.loadingGroupChannels, [chatKey]: false } }));
            }
        }

        if (isGroupChat) {
            await get().fetchGroupMembers(chatKey);
        }

        await get().loadChannel(get().currentChannel);
      },

      fetchGroupMembers: async (groupKey) => {
        set({ isLoadingMembers: true });
        const token = localStorage.getItem('token');
        const storedUid = localStorage.getItem('uid'); 
        
        try {
            const res = await fetch(`${API_URL}/member_groups/${groupKey}/members`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.ok) {
                const json = await res.json();
                const rawMembers = Array.isArray(json) ? json : (json.data || []);

                const mappedMembers: GroupMember[] = rawMembers.map((m: any) => {
                    const memberUid = m.userUid || m.uid || m.id;
                    
                    let role = 'member';
                    if (m.role === 'owner' || m.role === 'admin') role = 'admin';
                    if (m.role === 'moderator') role = 'moderator';

                    const userObj = m.user || {};
                    
                    const realName = userObj.name || userObj.username || 'Usuario';
                    const realAvatar = userObj.picture || userObj.avatar || 'https://i.pravatar.cc/150';

                    return {
                        key: memberUid,
                        name: realName, 
                        avatar: realAvatar,
                        role: role,
                        status: userObj.is_online ? 'online' : 'offline'
                    };
                });

                if (storedUid && !mappedMembers.find(m => m.key === storedUid)) {
                    const { currentUser } = get();
                    mappedMembers.unshift({
                        key: storedUid,
                        name: currentUser?.name || 'Yo (Admin)',
                        avatar: currentUser?.avatar || 'https://i.pravatar.cc/150',
                        role: 'admin',
                        status: 'online'
                    });
                }

                set({ currentMembers: mappedMembers });
            }
        } catch (error) {
            console.error("Error cargando miembros:", error);
        } finally {
            set({ isLoadingMembers: false });
        }
      },
      
      fetchUsersToAdd: async () => {
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`${API_URL}/users`, { 
                headers: { Authorization: `Bearer ${token}` }
            });
            
            if (res.ok) {
                const json = await res.json();
                const allUsers = json.data || [];

                const currentMemberIds = get().currentMembers.map(m => m.key);

                const availableUsers = allUsers
                   .filter((u: any) => !currentMemberIds.includes(u.uid)) 
                   .map((u: any) => ({
                       key: u.uid,
                       name: u.name || u.username, 
                       avatar: u.picture || 'https://i.pravatar.cc/150',
                       status: u.is_online ? 'online' : 'offline',
                       role: 'member'
                   }));

                set({ potentialMembers: availableUsers });
            }
        } catch (error) {
            console.error("Error buscando usuarios", error);
            set({ potentialMembers: [] });
        }
      },

      loadChannel: async (channelKey) => {
        set({ currentChannel: channelKey, isLoadingMessages: true });
        // Fetch de mensajes reales si hubiera endpoint
        set({ messages: [], isLoadingMessages: false });
      },

      sendMessage: async (text) => {
        const { currentChatKey, currentChannel, currentUser, messages } = get();
        if (!currentChatKey || !text.trim() || !currentUser) return;

        const tempId = Date.now().toString();
        const now = new Date();
        const newMessage: Message = {
          id: tempId,
          sender: currentUser.uid,
          name: currentUser.name,
          avatar: currentUser.avatar,
          text,
          time: `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`,
        };

        set({ messages: [...messages, newMessage] });

        try {
            const token = localStorage.getItem('token');
            await fetch(`${API_URL}/messages`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({
                    content: text,
                    chat_id: currentChatKey,
                    channel_name: currentChannel, 
                    sender_uid: currentUser.uid
                })
            });
        } catch (error) {
            console.error("Error enviando mensaje", error);
        }
      },

      deleteMessage: async (index, messageId) => {
        const { messages } = get();
        const newMessages = messages.filter((_, idx) => idx !== index);
        set({ messages: newMessages });

        if (messageId) {
            const token = localStorage.getItem('token');
            await fetch(`${API_URL}/messages/${messageId}`, {
                  method: 'DELETE',
                  headers: { Authorization: `Bearer ${token}` }
            });
        }
      },

      pinMessage: (index) => {
        if (index === null) return set({ pinnedMessage: null });
        const msg = get().messages[index];
        if (msg) set({ pinnedMessage: { ...msg, index } });
      },

      toggleMuteChannel: (fullKey) => {
        let isMutedAfter = false;
        set((state) => {
          const newMuted = new Set(state.mutedChannels);
          if (newMuted.has(fullKey)) {
            newMuted.delete(fullKey);
            isMutedAfter = false; 
          } else {
            newMuted.add(fullKey);
            isMutedAfter = true; 
          }
          return { mutedChannels: newMuted };
        });

        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: isMutedAfter ? 'warning' : 'success',
          title: isMutedAfter ? 'Notificaciones silenciadas' : 'Notificaciones activadas',
          showConfirmButton: false,
          timer: 1500,
        });
      },

      createGroup: async (data) => {
        const token = localStorage.getItem('token');
        try {
          const res = await fetch(`${API_URL}/groups`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json', 
                Authorization: `Bearer ${token}` 
            },
            body: JSON.stringify({ 
                name: data.groupName, 
                description: data.groupDescription, 
                image: data.groupImage, 
                privacy: 'public' 
            }),
          });

          if (!res.ok) throw new Error(`Error: ${await res.text()}`);

          const json = await res.json();
          const groupObject = json.data?.group || json.group || json.data || json;
          const newId = String(groupObject.id || groupObject.uid || groupObject._id);
          const newName = groupObject.name || data.groupName;

          // Crear canal default
          try {
              await fetch(`${API_URL}/channels`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                  body: JSON.stringify({ name: 'general', group_uid: newId }),
              });
          } catch (err) { console.error("Error creando canal", err); }
          
          const defaultChannel = { id: `temp-${Date.now()}`, name: 'general', key: '#general', description: 'General' };
          const newGroupItem = {
                key: newId,
                display: newName,
                avatar: groupObject.image || data.groupImage || 'bg-gray-700',
                channels: [defaultChannel] 
          };

          set((state) => ({ 
                allGroups: [...state.allGroups, newGroupItem],
                currentChatKey: newId, isGroup: true, chatDisplayName: newName,       
                currentChannelObjects: [defaultChannel], currentChannels: ['#general'],
                currentChannel: '#general', messages: []                    
          }));
          setTimeout(() => { get().fetchGroups(); }, 2500);

        } catch (e: any) {
          console.error(e);
          Swal.fire('Error', e.message, 'error');
        }
      },

      deleteGroup: async (groupKey) => {
        const token = localStorage.getItem('token');
        if (!token) return;

        try {
          const res = await fetch(`${API_URL}/groups/${groupKey}`, {
            method: 'DELETE',
            headers: { 
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });

          if (!res.ok) {
            throw new Error('Error borrando grupo');
          }

          set((state) => {
            const updatedGroups = state.allGroups.filter((g) => g.key !== groupKey);
            const wasViewing = state.currentChatKey === groupKey;
            return {
              allGroups: updatedGroups,
              currentChatKey: wasViewing ? null : state.currentChatKey,
              chatDisplayName: wasViewing ? null : state.chatDisplayName,
              messages: wasViewing ? [] : state.messages,
            };
          });
        } catch (error: any) {
          console.error("Error eliminando grupo:", error);
          throw error;
        }
      },

      createNewChannel: async (name) => {
        const { currentChatKey } = get();
        const token = localStorage.getItem('token');
        if (!currentChatKey) return;

        try {
          const res = await fetch(`${API_URL}/channels`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ name, group_uid: currentChatKey }),
          });

          if (res.ok) {
            const resChannels = await fetch(`${API_URL}/channels/group/${currentChatKey}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            
            if (resChannels.ok) {
                const result = await resChannels.json();
                const channelsData = Array.isArray(result) ? result : Object.values(result);
                
                const finalChannels = channelsData.map((ch: any) => ({
                    id: ch.uid || ch.id,
                    name: ch.name,
                    key: `#${ch.name}`,
                    description: ch.description
                }));

                set((state) => ({
                    allGroups: state.allGroups.map(g => g.key === currentChatKey ? { ...g, channels: finalChannels } : g),
                    currentChannelObjects: finalChannels,
                    currentChannels: finalChannels.map(c => c.key),
                    currentChannel: `#${name}` 
                }));
                
                get().loadChannel(`#${name}`);
            }
          }
        } catch (e) { 
            console.error(e);
            Swal.fire('Error', 'No se pudo crear el canal', 'error');
        }
      },

      updateChannel: async (id, name) => {
        const { currentChatKey } = get();
        const token = localStorage.getItem('token');
        try {
          await fetch(`${API_URL}/channels/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ name }),
          });
          if (currentChatKey) get().loadChat(currentChatKey);
        } catch (e) { console.error(e); }
      },

      deleteChannel: async (id) => {
        const { currentChatKey, currentChannel } = get();
        const token = localStorage.getItem('token');
        try {
          await fetch(`${API_URL}/channels/${id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` },
          });

          const resChannels = await fetch(`${API_URL}/channels/group/${currentChatKey}`, {
              headers: { Authorization: `Bearer ${token}` },
          });

          if (resChannels.ok) {
              const result = await resChannels.json();
              const channelsData = Array.isArray(result) ? result : Object.values(result);
              
              const finalChannels = channelsData.map((ch: any) => ({
                  id: ch.uid || ch.id,
                  name: ch.name,
                  key: `#${ch.name}`,
                  description: ch.description
              }));

              const channelStillExists = finalChannels.some(c => c.key === currentChannel);
              const nextChannel = channelStillExists ? currentChannel : '#general';

              set((state) => ({
                  allGroups: state.allGroups.map(g => g.key === currentChatKey ? { ...g, channels: finalChannels } : g),
                  currentChannelObjects: finalChannels,
                  currentChannels: finalChannels.map(c => c.key),
                  currentChannel: nextChannel
              }));

              if (!channelStillExists) {
                  get().loadChannel('#general');
              }
          }
        } catch (e) { console.error(e); }
      },

      addMembersToGroup: async (keys, groupKey) => {
        const token = localStorage.getItem('token');
        try {
            await Promise.all(keys.map(memberUid => 
              fetch(`${API_URL}/member_groups/${groupKey}/members`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ memberUid }),
              })
            ));
            await get().fetchGroupMembers(groupKey);
            set({ potentialMembers: [] });
            
            Swal.fire('Éxito', 'Miembros añadidos', 'success');
        } catch(e) {
            Swal.fire('Error', 'No se pudieron añadir algunos miembros', 'error');
        }
      },

      logout: () => {
        localStorage.clear(); 
        window.location.href = '/auth/login'; // Redirección limpia
      }
    }),
  
    {
      name: 'chat-storage', 
      storage: createJSONStorage(() => localStorage), 
      
      partialize: (state) => ({
        currentChatKey: state.currentChatKey,
        chatDisplayName: state.chatDisplayName,
        currentChannel: state.currentChannel,
        isGroup: state.isGroup,
        currentUser: state.currentUser, 
        currentChannelObjects: state.currentChannelObjects,
        currentChannels: state.currentChannels,
        currentMembers: state.currentMembers,
      }),
    }
  )
);