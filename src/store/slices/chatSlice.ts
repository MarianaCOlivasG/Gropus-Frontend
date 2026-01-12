import Swal from 'sweetalert2';
import { io } from 'socket.io-client';
import type { ChatSliceCreator, Message } from '../types';

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
  isLoadingMore: false,

  // VISOR DE ARCHIVOS
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
        const { currentChannelObjects, currentChannel, currentChatKey, isGroup } = get();
        
        let activeTargetId = "";
        
        if (isGroup) {
             const activeChannelObj = currentChannelObjects.find(c => c.key === currentChannel);
             activeTargetId = activeChannelObj?.id || "";
        } else {
             activeTargetId = currentChatKey || "";
        }

        const msgTargetId = incomingMsg.channel || incomingMsg.id_chat || incomingMsg.privateChat;

        if (activeTargetId && activeTargetId === msgTargetId) {
            const formattedMsg = formatMessage(incomingMsg); 
            set((state) => ({ messages: [...state.messages, formattedMsg] }));
        }
    });

    newSocket.on('message_deleted', (data: { messageId: string, channelUid: string }) => {
        const { currentChannelObjects, currentChannel, currentChatKey, isGroup } = get();
        
        let activeTargetId = "";
        if (isGroup) {
             const activeChannelObj = currentChannelObjects.find(c => c.key === currentChannel);
             activeTargetId = activeChannelObj?.id || "";
        } else {
             activeTargetId = currentChatKey || "";
        }

        if (activeTargetId && activeTargetId === data.channelUid) {
             set((state) => ({
                 messages: state.messages.filter(msg => msg.id !== data.messageId)
             }));
        }
    });

    newSocket.on('history_messages', (data: { channelUid: string, messages: any[], isPagination?: boolean }) => {
        const { currentChannelObjects, currentChannel, currentChatKey, isGroup } = get();
        let activeTargetId = "";
        if (isGroup) {
             const activeChannelObj = currentChannelObjects.find(c => c.key === currentChannel);
             activeTargetId = activeChannelObj?.id || "";
        } else {
             activeTargetId = currentChatKey || "";
        }

        if (activeTargetId && activeTargetId === data.channelUid) {
            const formattedHistory = data.messages.map(msg => formatMessage(msg));
            
            set((state) => {
                if (data.isPagination) {
                  if (formattedHistory.length === 0) {
                    return { isLoadingMore: false }; 
                  }
                  return {
                    messages: [...formattedHistory, ...state.messages],
                    isLoadingMore: false 
                  };
                } else {
                  return {
                    messages: formattedHistory,
                    isLoadingMessages: false 
                  };
                }
            });
            
            // set({ 
            //     messages: formattedHistory,
            //     isLoadingMessages: false 
            // });
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

  loadMoreMessages: () => {
    const { currentChannel, messages, socket, currentChannelObjects, isGroup, currentChatKey } = get();
    
    let targetUid = "";
    if (isGroup) {
        const activeChannelObj = currentChannelObjects.find(c => c.key === currentChannel);
        if (!activeChannelObj) return;
        targetUid = activeChannelObj.id;
    } else {
        targetUid = currentChatKey || "";
    }
    const oldestMessage = messages[0];

    console.log("Cargando mensajes anteriores a:", oldestMessage.created_at);
    set({ isLoadingMore: true });

    socket.emit('request_more_history', {
        channelUid: targetUid,
        beforeDate: oldestMessage.created_at 
    });
  },

  setTypingStatus: (isTyping: boolean) => {
    const { socket, currentChannelObjects, currentChannel } = get();
    const activeChannelObj = currentChannelObjects.find(c => c.key === currentChannel);
    if (socket && activeChannelObj) {
        socket.emit('typing', { channelUid: activeChannelObj.id, isTyping });
    }
  },

  loadChat: async (chatKey: string) => {
    const { allGroups, allFriends, currentChatKey, socket, currentUser } = get(); 
    
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

    set({ 
      currentChatKey: chatKey,
      isGroup: isGroupChat,
      chatDisplayName: displayName,
      messages: [], 
      currentMembers: [], 
      tags: []
    });
    
    if (isGroupChat) {
        set(state => ({ loadingGroupChannels: { ...state.loadingGroupChannels, [chatKey]: true } }));
        
        const channelObjs = group?.channels || [];
        const savedChannel = get().currentChannel || '#general';
        const initialChannel = channelObjs.length > 0 
           ? (channelObjs.some(c => c.key === savedChannel) ? savedChannel : '#general')
           : '#general';

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
              
              set({
                allGroups: updatedGroups,
                currentChannelObjects: finalChannels,
                currentChannels: finalChannels.map(c => c.key),
                currentChannel: initialChannel 
              });
          }
        } catch(e) {
            console.error(e);
        } finally {
          set(state => ({ loadingGroupChannels: { ...state.loadingGroupChannels, [chatKey]: false } }));
        }

        await get().fetchGroupMembers(chatKey);
        await get().fetchTags();
        await get().loadChannel(get().currentChannel);

    } else {
    
        const dmChannelObj = {
            id: chatKey,        
            key: chatKey,       
            name: displayName,
            description: 'Mensaje Directo',
            tags: []
        };

        const friendData = allFriends.find(f => f.chat === chatKey);
        const privateMembers = [];
        
        if (currentUser) {
             privateMembers.push({
                key: currentUser.uid,
                name: currentUser.name,
                avatar: currentUser.avatar,
                role: 'owner' 
             });
        }
        if (friendData) {
            privateMembers.push({
                key: friendData.key, 
                name: friendData.name,
                avatar: friendData.avatar,
                role: 'member'
            });
        }

        set({
            currentChannelObjects: [dmChannelObj],
            currentChannels: [chatKey],
            currentChannel: chatKey, 
            loadingGroupChannels: { ...get().loadingGroupChannels, [chatKey]: false },
            currentMembers: privateMembers 
        });

        if (socket) {
            socket.emit('join_channel', { channelUid: chatKey });
        }
        
        set({ isLoadingMessages: true });
    }
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
    const { currentChatKey, currentChannel, currentChannelObjects, currentUser, isGroup, socket } = get();
    if (!currentChatKey || !text.trim() || !currentUser) return;

    let targetUid = "";

    if (isGroup) {
        const channelObj = currentChannelObjects.find(c => c.key === currentChannel);
        if (!channelObj) return;
        targetUid = channelObj.id;
    } else {
        targetUid = currentChatKey || "";
    }

    if (socket && socket.connected) {
        socket.emit('send_message', {
            channelUid: targetUid,
            content: text
        });
    } else {
        Swal.fire('Error', 'No hay conexión con el chat', 'error');
    }
  },

  sendFileMessage: async (file: File) => {
    const { currentChannelObjects, currentChannel, currentChatKey, isGroup } = get();
    const token = localStorage.getItem('token');
    
    let targetUid = "";
    if (isGroup) {
        const channelObj = currentChannelObjects.find(c => c.key === currentChannel);
        if (!channelObj) return Swal.fire('Error', 'Canal no encontrado', 'error');
        targetUid = channelObj.id;
    } else {
        targetUid = currentChatKey || "";
    }

    const formData = new FormData();
    formData.append('file', file);
    if (isGroup) {
        formData.append('channelUid', targetUid); 
    } else {
        formData.append('privateChatUid', targetUid); 
    }

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

  fetchFriends: async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
        const res = await fetch(`${API_URL}/chats/private/mine`, { 
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        if (res.ok) {
            const friendsList = await res.json();
            set({ allFriends: friendsList });
        } else {
            console.error("Error al obtener chats privados:", res.statusText);
        }
    } catch (error) {
        console.error("Error en fetchFriends:", error);
    }
  },

  getOrCreatePrivateChat: async (targetUser: any) => {
    const { allFriends, loadChat } = get(); 

    const existingFriend = allFriends.find((f: any) => f.key === targetUser.key);
    if (existingFriend && existingFriend.chat) {
      loadChat(existingFriend.chat);
      return;
    }

    try {
        const token = localStorage.getItem('token');
        const API_URL = import.meta.env.VITE_API_URL;

        const res = await fetch(`${API_URL}/chats/private`, { 
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ partnerId: targetUser.key })
        });

        if (!res.ok) throw new Error("Error creando chat");
        const data = await res.json(); 

        const newDMChat = {
            key: targetUser.key,
            chat: data.chatId, 
            name: targetUser.name,
            avatar: targetUser.avatar || 'bg-gray-700',
            status: targetUser.status || 'offline'
        };

        set((state: any) => ({
            allFriends: [newDMChat, ...state.allFriends] 
        }));

        loadChat(data.chatId);

    } catch (error) {
        console.error("Error getOrCreatePrivateChat:", error);
    }
  },

  
  openFilePreview: (url: string, type: string, name: string = "Archivo") => {
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
    const typeFromDB = msg.type || 'text'; 
    const isAttachment = typeFromDB === 'image' || typeFromDB === 'document';
    const content = msg.content || msg.message || "";

    let finalUrl = null;
    
    if (isAttachment) {
        if (content.startsWith('http')) {
            finalUrl = content;
        } else {
            const cleanPath = content.replace(/^\/+/, '');
            finalUrl = `${API_URL}/images/${cleanPath}`;
        }
    }

    return {
        id: msg.uid || msg.id,
        sender: msg.sender?.uid || msg.sender || msg.id_user, 
        name: msg.sender?.name || "Usuario",
        avatar: msg.sender?.picture || "",
        text: !isAttachment ? content : "",
        attachmentType: isAttachment ? typeFromDB : undefined, 
        attachmentUrl: finalUrl,
        mimeType: msg.mime_type,   
        fileName: msg.file_name || "Archivo",
        fileSize: msg.file_size,   
        imageWidth: msg.img_width || null,
        imageHeight: msg.img_height || null,
        time: new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        role: msg.sender?.role || 'user',
        created_at: msg.created_at
    };
};