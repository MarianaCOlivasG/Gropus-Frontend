import Swal from 'sweetalert2';
import { io } from 'socket.io-client';
import type { ChatSliceCreator, ChannelItem, Message } from '../types';

const API_URL = import.meta.env?.VITE_API_URL;
const SOCKET_URL = import.meta.env?.VITE_SOCKET_URL;

export const createChatSlice: ChatSliceCreator<any> = (set, get) => ({
  currentChatKey: null,
  chatDisplayName: null,
  currentChannel: '#general',
  isGroup: false,
  currentChannels: [],
  currentChannelObjects: [],
  messages: [],
  isLoadingMessages: false,
  pinnedMessage: null,
  mutedChannels: new Set(),
  socket: null, 

  
  connectSocket: () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    if (get().socket?.connected) return;

    const newSocket = io(SOCKET_URL, {
      auth: { token },
      query: { Authorization: `Bearer ${token}` }
    });

    newSocket.on('connect', () => {
      console.log('Socket connected:', newSocket.id);
      const { currentChannel, currentChannelObjects } = get();
      const activeChannelObj = currentChannelObjects.find(c => c.key === currentChannel);

      if (activeChannelObj) {
          newSocket.emit('join_channel', { channelUid: activeChannelObj.id });
      }
    });

    newSocket.on('connect_error', (err) => {
      console.error('Socket connection error:', err);
    });

    //LISTENER PARA PERMISOS/TAGS 
    newSocket.on('member_updated', (data: { userId: string, groupId: string, tags: any[] }) => {
        const { currentMembers, currentChatKey } = get();
        if (currentChatKey === data.groupId) {
            const updatedMembers = currentMembers.map(member => {
                if (member.key === data.userId) { 
                    return { ...member, tags: data.tags }; 
                }
                return member;
            });
            set({ currentMembers: updatedMembers });
        }
    });

    // LISTENER: MENSAJE NUEVO 
    newSocket.on('new_message', (incomingMsg: any) => {
        const { currentChannelObjects, currentChannel } = get();
        const activeChannelObj = currentChannelObjects.find(c => c.key === currentChannel);
        const msgChannelId = incomingMsg.channel || incomingMsg.id_chat;

        if (activeChannelObj && activeChannelObj.id === msgChannelId) {
            const formattedMsg = formatMessage(incomingMsg); 
            set((state) => ({ messages: [...state.messages, formattedMsg] }));
        }
    });

    newSocket.on('history_messages', (data: { channelUid: string, messages: any[] }) => {
        const { currentChannelObjects, currentChannel } = get();
        const activeChannelObj = currentChannelObjects.find(c => c.key === currentChannel);

        if (activeChannelObj && activeChannelObj.id === data.channelUid) {
            const formattedHistory = data.messages.map(msg => formatMessage(msg));
            
            set({ 
                messages: formattedHistory,
                isLoadingMessages: false 
            });
        }
    });

    set({ socket: newSocket });
  },

  disconnectSocket: () => {
    const { socket } = get();
    if (socket) {
      socket.disconnect();
      set({ socket: null });
    }
  },

  loadChat: async (chatKey: string) => {
    const { allGroups, allFriends } = get();
    const { socket, currentChatKey } = get();

    if (socket && socket.connected) {
        if (currentChatKey) {
            socket.emit('leave_group', currentChatKey);
        }
        socket.emit('join_group', chatKey);
    }
    
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
      currentMembers: [], 
      tags: []
    });

    if (isGroupChat && group) {
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
                description: ch.description,
                tags: ch.tags || [] 
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
            console.error("Error loading channels", e);
        } finally {
          set(state => ({ loadingGroupChannels: { ...state.loadingGroupChannels, [chatKey]: false } }));
        }
    }

    if (isGroupChat) {
        await get().fetchGroupMembers(chatKey);
        await get().fetchTags();
    }

    await get().loadChannel(get().currentChannel);
  },

  loadChannel: async (channelKey: string) => {
    const { socket, currentChannelObjects } = get();
    
    const previousKey = get().currentChannel;
    const prevChannelObj = currentChannelObjects.find(c => c.key === previousKey);
    
    if (socket && prevChannelObj) {
        socket.emit('leave_channel', { channelUid: prevChannelObj.id });
    }

    set({ currentChannel: channelKey, isLoadingMessages: true, messages: [] });
    const nextChannelObj = currentChannelObjects.find(c => c.key === channelKey);
    if (nextChannelObj && socket) {
        socket.emit('join_channel', { channelUid: nextChannelObj.id });
    } else {
        set({ isLoadingMessages: false });
    }
  },

  sendMessage: async (text: string) => {
    const { currentChatKey, currentChannel, currentChannelObjects, currentUser, socket } = get();
    
    if (!currentChatKey || !text.trim() || !currentUser) return;
    
    const channelObj = currentChannelObjects.find(c => c.key === currentChannel);
    if (!channelObj) return;

    if (socket && socket.connected) {
        socket.emit('send_message', {
            channelUid: channelObj.id,
            content: text
        });
    } else {
        Swal.fire('Error', 'No hay conexión con el chat', 'error');
    }
  },

  deleteMessage: async (index: number, messageId: string) => {
    const { messages } = get();
    const newMessages = messages.filter((_, idx) => idx !== index);
    set({ messages: newMessages });

    if (messageId) {
        try {
            const token = localStorage.getItem('token');
            await fetch(`${API_URL}/messages/${messageId}`, {
                  method: 'DELETE',
                  headers: { Authorization: `Bearer ${token}` }
            });
        } catch (error) {
            console.error("Error deleting message", error);
        }
    }
  },

  pinMessage: (index: number) => {
    if (index === null) return set({ pinnedMessage: null });
    const msg = get().messages[index];
    if (msg) set({ pinnedMessage: { ...msg, index } });
  },

  toggleMuteChannel: (fullKey: string) => {
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
  }
});

//Formateo de Mensajes
const formatMessage = (msg: any): Message => {
    return {
        id: msg.uid || msg.id,
        sender: msg.sender?.uid || msg.sender || msg.id_user, 
        name: msg.sender?.name || msg.sender?.username || "Usuario",
        avatar: msg.sender?.picture || msg.sender?.avatar || "",
        text: msg.content || msg.message, 
        time: new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        role: msg.sender?.role || 'user'
    };
};