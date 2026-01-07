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
  pinnedMessages: {}, 
  mutedChannels: new Set(),
  socket: null, 

  // ESTADO PARA EL VISOR DE ARCHIVOS
  previewFile: null, // Guardará { url, type, name }

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

    newSocket.on('user_typing', (data: { channelUid: string, userName: string, isTyping: boolean }) => {
        set((state) => {
            const typing = { ...state.typingUsers };
            const usersInChannel = [...(typing[data.channelUid] || [])];
            
            if (data.isTyping) {
                if (!usersInChannel.includes(data.userName)) {
                    usersInChannel.push(data.userName);
                }
            } else {
                typing[data.channelUid] = usersInChannel.filter(name => name !== data.userName);
                return { typingUsers: typing };
            }
            
            typing[data.channelUid] = usersInChannel;
            return { typingUsers: typing };
        });
    });

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

    newSocket.on('new_message', (incomingMsg: any) => {
        const { currentChannelObjects, currentChannel } = get();
        const activeChannelObj = currentChannelObjects.find(c => c.key === currentChannel);
        const msgChannelId = incomingMsg.channel || incomingMsg.id_chat;

        if (activeChannelObj && activeChannelObj.id === msgChannelId) {
            const formattedMsg = formatMessage(incomingMsg); 
            set((state) => ({ messages: [...state.messages, formattedMsg] }));
        }
    });

    newSocket.on('message_deleted', (data: { messageId: string, channelUid: string }) => {
        const { currentChannelObjects, currentChannel } = get();
        const activeChannelObj = currentChannelObjects.find(c => c.key === currentChannel);
        if (activeChannelObj && activeChannelObj.id === data.channelUid) {
             set((state) => ({
                 messages: state.messages.filter(msg => msg.id !== data.messageId)
             }));
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

  setTypingStatus: (isTyping: boolean) => {
    const { socket, currentChannelObjects, currentChannel } = get();
    const activeChannelObj = currentChannelObjects.find(c => c.key === currentChannel);
    if (socket && activeChannelObj) {
        socket.emit('typing', { channelUid: activeChannelObj.id, isTyping });
    }
  },

  loadChat: async (chatKey: string) => {
    const { allGroups, allFriends, currentChatKey } = get();
    const { socket } = get();
    
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

  sendFileMessage: async (file: File) => {
    const { currentChannelObjects, currentChannel } = get();
    const token = localStorage.getItem('token');
    
    const channelObj = currentChannelObjects.find(c => c.key === currentChannel);
    if (!channelObj) return Swal.fire('Error', 'Canal no encontrado', 'error');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('channelUid', channelObj.id); 

    try {
        const res = await fetch(`${API_URL}/messages/upload`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });

        if (!res.ok) throw new Error('Error al subir archivo');

    } catch (error) {
        console.error("Error subiendo archivo:", error);
        Swal.fire('Error', 'No se pudo enviar el archivo', 'error');
    }
  },

  deleteMessage: async (index: number, messageId: string) => {
    const { messages, socket } = get();
    const newMessages = messages.filter((_, idx) => idx !== index);
    set({ messages: newMessages });

    if (messageId && socket && socket.connected) {
        socket.emit('delete_message', { messageId }); 
    } else {
        console.error("No hay conexión socket para borrar el mensaje");
    }
  },

  pinMessage: (index: number | null, channelId: string) => {
    if (!channelId) return;
    const { messages, pinnedMessages } = get();
    const newPinnedRecord = { ...pinnedMessages };

    if (index === null) {
      delete newPinnedRecord[channelId];
    } else {
      const msg = messages[index];
      if (msg) {
        newPinnedRecord[channelId] = { ...msg, index };
      }
    }
    set({ pinnedMessages: newPinnedRecord });
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
  },

  //FUNCIONES PARA EL VISOR DE ARCHIVOS
  openFilePreview: (url: string, type: string, name: string = "Archivo") => {
    // Si la URL es de imagen interna backend pegamos el API_URL
    const fullUrl = (type === 'image' && !url.startsWith('http')) 
      ? `${API_URL}/images/${url.replace(/^\//, '')}` 
      : url;
    
    set({ previewFile: { url: fullUrl, type, name } });
  },

  closeFilePreview: () => {
    set({ previewFile: null });
  }
});

const formatMessage = (msg: any): Message => {
    const content = msg.content || msg.message || "";
    const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(content);
    const isPdf = /\.pdf$/i.test(content);
    const isUrl = content.startsWith('http://') || content.startsWith('https://');
    const isOtherFile = !isImage && !isPdf && !isUrl && (content.includes('/') || content.includes('\\'));

    let type: 'image' | 'pdf' | 'file' | null = null;
    if (isImage) type = 'image';
    else if (isPdf) type = 'pdf';
    else if (isOtherFile) type = 'file';

    let finalUrl = null;
    let fileName = content.split(/[/\\]/).pop();
    try { if (fileName) fileName = decodeURIComponent(fileName); } catch {}

    if (type) {
        if (content.startsWith('http')) {
            finalUrl = content;
        } else {
            const cleanPath = content.startsWith('/') ? content.slice(1) : content;
            finalUrl = `${API_URL}/images/${cleanPath}`;
        }
    }

    return {
        id: msg.uid || msg.id,
        sender: msg.sender?.uid || msg.sender || msg.id_user, 
        name: msg.sender?.name || "Usuario",
        avatar: msg.sender?.picture || "",
        text: type ? "" : content, 
        time: new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        role: msg.sender?.role || 'user',
        attachmentUrl: finalUrl,
        attachmentType: type,
        fileName: fileName || "Archivo",
        created_at: msg.created_at
    };
};