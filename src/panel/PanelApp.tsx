import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import ChatArea from './components/ChatArea';
import MembersBar from './components/MembersBar';
import EmptyChatView from './components/EmptyChatView';
import AddFriendModal from './components/AddFriendModal';
import CreateGroupModal from './components/CreateGroupModal';
import {
  friendsList,
  groupMembersData,
  channelChats,
  chats,
  currentUserKey,
  users,
} from './data';
import type { GroupKey, Message, GroupMember } from './data';
import UserProfileModal from './components/UserProfileModal';
import AddMemberModal from './components/AddMemberModal';

//Tipo para el grupo, incluyendo el avatar para el Sidebar
interface ChannelItem {
  id: string;
  name: string; 
  key: string; 
}

interface GroupListItem {
  key: string;
  display: string;
  avatar: string;
  channels?: ChannelItem[];
}

// Datos iniciales de grupos
const INITIAL_GROUPS: GroupListItem[] = [];

interface NewGroupData {
  groupName: string;
  groupDescription: string;
  groupImage: string | null;
}

// Helper para obtener mensajes
const getMessages = (
  chatKey: string,
  channelKey: string,
  isGroup: boolean
): Message[] => {
  if (isGroup && channelChats[chatKey as GroupKey]) {
    return channelChats[chatKey as GroupKey]?.[channelKey] || [];
  }
  return chats[chatKey] || [];
};

const PanelApp: React.FC = () => {
  const [allGroups, setAllGroups] = useState<GroupListItem[]>(INITIAL_GROUPS);
  const [isNewUserMode, setIsNewUserMode] = useState<boolean>(true);
  const [currentChatKey, setCurrentChatKey] = useState<GroupKey | string | null>(null);
  const [currentChannel, setCurrentChannel] = useState<string>('#general');
  const [isGroup, setIsGroup] = useState<boolean>(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentChatDisplayName, setCurrentChatDisplayName] = useState<string | null>(null);

  // Estados para modales
  const [selectedUserKey, setSelectedUserKey] = useState<string | null>(null);
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState<boolean>(false);
  const [isAddFriendModalOpen, setIsAddFriendModalOpen] = useState<boolean>(false);
  const [isCreateGroupModalOpen, setIsCreateGroupModalOpen] = useState<boolean>(false);

  // Mensaje fijado
  const [pinnedMessage, setPinnedMessage] = useState<(Message & { index: number }) | null>(null);

  // Canales silenciados
  const [mutedChannels, setMutedChannels] = useState<Set<string>>(new Set());

  // Cargando datos iniciales
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const token = localStorage.getItem('token');

  const fetchChannels = async (groupUid: string): Promise<ChannelItem[]> => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:3501/api/channels/group/${groupUid}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        console.warn(`Error al obtener canales para grupo ${groupUid}`);
        return [];
      }
      const result = await res.json();
      // mapear a ChannelItem intentando leer varios campos de id
      const channels: ChannelItem[] = (result.data || []).map((ch: any) => ({
        id: ch.id ?? ch._id ?? ch.uid ?? String(ch.name),
        name: ch.name,
        key: `#${ch.name}`,
      }));
      return channels;
    } catch (err) {
      console.error(err);
      return [];
    }
  };



  // --- CARGA DE GRUPOS ---
  useEffect(() => {
    const savedChatKey = localStorage.getItem('lastChatKey');
    const savedChannel = localStorage.getItem('lastChannel') || '#general';

    const fetchGroups = async () => {
      try {
        const uid = localStorage.getItem('uid');
        if (!uid) return;

        const res = await fetch(`http://localhost:3501/api/groups/user/${uid}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const result = await res.json();
        const backendGroups: any[] = result?.data || [];

        const mappedGroups: GroupListItem[] = await Promise.all(
          backendGroups.map(async g => {
            const channelsFromBackend = await fetchChannels(g.id); // traer los canales (ChannelItem[])
            return {
              key: g.id,
              display: g.name,
              avatar: g.image || 'bg-gray-700',
              channels: channelsFromBackend.length > 0 ? channelsFromBackend : [{ id: 'general', name: 'general', key: '#general' }],
            };
          })
        );


        setAllGroups(mappedGroups);
        setIsNewUserMode(mappedGroups.length === 0 && friendsList.length === 0);

        if (savedChatKey) {
          const isGroupChat = mappedGroups.some(g => g.key === savedChatKey);
          setIsGroup(isGroupChat);
          setCurrentChatDisplayName(
            isGroupChat
              ? mappedGroups.find(g => g.key === savedChatKey)?.display || savedChatKey
              : friendsList.find(f => f.chat === savedChatKey)?.name || savedChatKey
          );
          setMessages(getMessages(savedChatKey, savedChannel, isGroupChat));
          setCurrentChannel(savedChannel);
          setCurrentChatKey(savedChatKey);
        }
      } catch (err) {
        console.error('Error cargando grupos del usuario:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGroups();
  }, []);

  // --- GUARDAR ÚLTIMA SESIÓN ---
  useEffect(() => {
    if (currentChatKey) localStorage.setItem('lastChatKey', currentChatKey.toString());
    if (currentChannel) localStorage.setItem('lastChannel', currentChannel);
  }, [currentChatKey, currentChannel]);

  // --- FUNCIONES DE CHAT, PIN, ELIMINAR, SILENCIAR ---
  const toggleMuteChannel = (fullChannelKey: string) => {
    const isMuted = mutedChannels.has(fullChannelKey);
    alert(`Canal ${fullChannelKey} ${isMuted ? 'DES-SILENCIADO' : 'SILENCIADO'}`);
    setMutedChannels(prev => {
      const copy = new Set(prev);
      isMuted ? copy.delete(fullChannelKey) : copy.add(fullChannelKey);
      return copy;
    });
  };

  // --- Cargar chat y sus canales ---
const loadChat = async (chatKey: string) => {
  setCurrentChatKey(chatKey);
  const isGroupChat = allGroups.some(g => g.key === chatKey);
  setIsGroup(isGroupChat);

  const displayName = isGroupChat
    ? allGroups.find(g => g.key === chatKey)?.display || chatKey
    : friendsList.find(f => f.chat === chatKey)?.name || chatKey;
  setCurrentChatDisplayName(displayName);

  const targetChannel = '#general';
  setMessages(getMessages(chatKey, targetChannel, isGroupChat));
  setCurrentChannel(targetChannel);
  setPinnedMessage(null);
  setIsNewUserMode(false);

  // --- Si es grupo, traer los canales del backend si no están ya cargados --- 
  if (isGroupChat) {
    if (!channelChats[chatKey]) {
      const channelsFromBackend = await fetchChannels(chatKey);
      if (!channelChats[chatKey]) (channelChats as any)[chatKey] = {};
      channelsFromBackend.forEach((ch: any) => {
        const key = ch.key || `#${ch.name}`;
        if (!channelChats[chatKey][key]) channelChats[chatKey][key] = [];
      });
    }
  }
};


  const loadChannel = (channelKey: string) => {
    setCurrentChannel(channelKey);
    if (currentChatKey) setMessages(getMessages(currentChatKey, channelKey, true));
    setPinnedMessage(null);
  };

  const sendMessage = (text: string) => {
    if (!currentChatKey || text.trim() === '') return;

    const now = new Date();
    const newMsg: Message = {
      sender: currentUserKey,
      name: users[currentUserKey]?.name || 'Yo',
      text,
      time: `${now.getHours().toString().padStart(2,'0')}:${now.getMinutes().toString().padStart(2,'0')}`,
    };

    setMessages(prev => [...prev, newMsg]);
    if (isGroup) {
      if (!channelChats[currentChatKey as GroupKey][currentChannel]) channelChats[currentChatKey as GroupKey][currentChannel] = [];
      channelChats[currentChatKey as GroupKey][currentChannel].push(newMsg);
    } else {
      chats[currentChatKey].push(newMsg);
    }
  };

  const deleteMessage = (indexToDelete: number) => {
    if (!currentChatKey) return;
    alert('Mensaje eliminado correctamente.');
    const targetArray = isGroup ? channelChats[currentChatKey as GroupKey][currentChannel] : chats[currentChatKey];
    if (targetArray) targetArray.splice(indexToDelete, 1);
    setMessages(prev => prev.filter((_, idx) => idx !== indexToDelete));
    if (pinnedMessage?.index === indexToDelete) setPinnedMessage(null);
  };

  const pinMessage = (messageIndex: number | null) => {
    if (messageIndex === null) return setPinnedMessage(null);
    const msg = messages[messageIndex];
    if (msg) {
      setPinnedMessage({ ...msg, index: messageIndex });
      alert(`Mensaje de ${msg.name} fijado.`);
    }
  };

  const handleAddFriend = (friendName: string) => {
    alert(`¡Bienvenido! Amigo ${friendName} añadido (simulado).`);
    setIsNewUserMode(false);
    setIsAddFriendModalOpen(false);
  };

  const handleCreateGroup = async (data: NewGroupData) => {
    try {
      const res = await fetch('http://localhost:3501/api/groups', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: data.groupName,
          description: data.groupDescription,
          privacy: 'public',
          image: data.groupImage,
        }),
      });
      if (!res.ok) throw new Error('Error al crear grupo');

      const createdGroup = await res.json();
      const groupId = createdGroup?.group?.id ?? createdGroup?.data?.id ?? createdGroup?.data?.group?.id;
      if (!groupId) throw new Error('El backend no devolvió un ID válido');

      const groupRes = await fetch(`http://localhost:3501/api/groups/${groupId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!groupRes.ok) throw new Error('Error al obtener grupo');

      const fullGroupData = await groupRes.json();
      const group = fullGroupData.data;

      const newGroup: GroupListItem = {
        key: group.id,
        display: group.name,
        avatar: group.image ?? 'bg-gray-700',
      };

      if (!channelChats[group.id]) (channelChats as any)[group.id] = { '#general': [] };

      setAllGroups(prev => {
        const exists = prev.some(g => g.key === newGroup.key);
        return exists ? prev : [...prev, newGroup];
      });

      setIsNewUserMode(false);
      setCurrentChatKey(group.id);
      setIsGroup(true);
      setCurrentChatDisplayName(newGroup.display);
      setCurrentChannel('#general');
      setMessages([]);
      setPinnedMessage(null);

      alert(`¡Grupo "${group.name}" creado exitosamente!`);
      setIsCreateGroupModalOpen(false);
    } catch (error: any) {
      console.error(error);
      alert('Hubo un error al crear el grupo.');
    }
  };

  const addMembersToGroup = (selectedMemberKeys: string[], groupKey: GroupKey) => {
    const groupData = groupMembersData[groupKey] || [];
    const existingKeys = new Set(groupData.map(m => m.key));

    const newMembers: GroupMember[] = selectedMemberKeys
      .filter(key => !existingKeys.has(key))
      .map(key => ({ key, name: '', avatar: '', status: 'active' }));

    if (newMembers.length > 0) {
      (groupMembersData as any)[groupKey] = [...groupData, ...newMembers];
      alert(`Se añadieron ${newMembers.length} nuevos miembros al grupo ${groupKey}.`);
    } else {
      alert('Todos los usuarios seleccionados ya son miembros.');
    }

    setIsAddMemberModalOpen(false);
    setSelectedUserKey(null);
    setTimeout(() => setSelectedUserKey(null), 1);
  };

  const createNewChannel = async (channelName: string) => {
    if (!currentChatKey || !isGroup) return alert('Error: No estás en un grupo.');
    const groupKey = currentChatKey as GroupKey;

    try {
      const res = await fetch('http://localhost:3501/api/channels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: channelName, description: 'Canal desde frontend', group_uid: groupKey }),
      });
      if (!res.ok) throw new Error('Error creando canal');
      const data = await res.json();
      // intentar extraer id y name
      const newId = data.data?.id ?? data.id ?? data.data?.uid ?? String(channelName);
      const newName = data.data?.name ?? data.name ?? channelName;
      const newChannel = { id: newId, name: newName, key: `#${newName}` };

      // asegurar estructura en channelChats
      if (!channelChats[groupKey]) (channelChats as any)[groupKey] = {};
      (channelChats as any)[groupKey][newChannel.key] = [];

      // actualizar allGroups
      setAllGroups(prev => prev.map(g =>
        g.key === groupKey
          ? { ...g, channels: [...(g.channels || [{ id: 'general', name: 'general', key: '#general' }]), newChannel] }
          : g
      ));

      setCurrentChannel(newChannel.key);
      setMessages([]);
      alert(`Canal '${newName}' creado con éxito.`);
    } catch (err) {
      console.error(err);
      alert('Error al crear canal.');
    }
  };
// --- Función para actualizar un canal (usa channelId) ---
const updateChannel = async (channelId: string, newName: string) => {
  if (!currentChatKey || !isGroup) return alert('No estás en un grupo.');
  console.log('🔄 UPDATE - ID:', channelId, 'New Name:', newName);

  try {
    const res = await fetch(`http://localhost:3501/api/channels/${channelId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name: newName }),
    });
    if (!res.ok) {
      const errMsg = await res.text();
      console.error('❌ PUT ERROR:', res.status, errMsg);
      throw new Error(`Error al actualizar canal: ${res.status}`);
    }
    const respData = await res.json();
    console.log('✅ PUT SUCCESS:', respData);

    // Actualizar estado local: allGroups
    setAllGroups(prev => prev.map(g => {
      if (g.key !== currentChatKey) return g;
      return {
        ...g,
        channels: (g.channels || []).map(ch => ch.id === channelId ? { ...ch, name: newName, key: `#${newName}` } : ch),
      };
    }));

    // actualizar channelChats keys si existen (intento simple por nombre)
    if (channelChats[currentChatKey as GroupKey]) {
      const channels = channelChats[currentChatKey as GroupKey];
      const keyToRename = Object.keys(channels).find(k => k.replace('#','') === newName);
      if (keyToRename) {
        channels[`#${newName}`] = channels[keyToRename];
        if (keyToRename !== `#${newName}`) delete channels[keyToRename];
      }
    }

    // if current channel was the one renamed, update it
    if (currentChannel && currentChannel.replace('#','') === newName) {
      setCurrentChannel(`#${newName}`);
      setMessages(getMessages(currentChatKey, `#${newName}`, true));
    }

    alert(`Canal actualizado a '${newName}' con éxito.`);
  } catch (err) {
    console.error(err);
    alert('Error al actualizar canal.');
  }
};

// --- Función para eliminar un canal (usa channelId) ---
const deleteChannel = async (channelId: string) => {
  const token = localStorage.getItem("token");
  if (!currentChatKey || !isGroup) return alert('No estás en un grupo.');
  if (!confirm(`¿Seguro que quieres eliminar el canal ${channelId}?`)) return;

  try {
    const res = await fetch(`http://localhost:3501/api/channels/${channelId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Error al eliminar canal');

    // Actualizar allGroups
    setAllGroups(prev => prev.map(g =>
      g.key === currentChatKey
        ? { ...g, channels: (g.channels || []).filter(ch => ch.id !== channelId) }
        : g
    ));

    // actualizar channelChats: eliminar key con ese nombre si existe
    if (channelChats[currentChatKey as GroupKey]) {
      const channels = channelChats[currentChatKey as GroupKey];
      const keyToDelete = Object.keys(channels).find(k => k.replace('#','') === channelId || k === channelId || k === `#${channelId}`);
      if (keyToDelete) delete channels[keyToDelete];
    }

    // Si el canal eliminado era el actual, cambiar a #general
    const fallback = '#general';
    if (currentChannel && currentChannel.replace('#','') === channelId) setCurrentChannel(fallback);
    setMessages(getMessages(currentChatKey, fallback, true));

    alert(`Canal eliminado correctamente.`);
  } catch (err) {
    console.error(err);
    alert('Error al eliminar canal.');
  }
};

  const currentMembers = isGroup && currentChatKey ? groupMembersData[currentChatKey as GroupKey] || [] : [];
  const currentChannels = isGroup && currentChatKey
    ? allGroups.find(g => g.key === currentChatKey)?.channels || [{ id: 'general', name: 'general', key: '#general' }]
    : [];

  if (isLoading) {
    return (
      <div className="bg-gray-900 text-gray-100 h-screen flex items-center justify-center">
        Cargando...
      </div>
    );
  }

  return (
    <div className="bg-gray-900 text-gray-100 h-screen flex">
      {!isNewUserMode && (
        <Sidebar
          friendsList={friendsList}
          groupList={allGroups}
          loadChat={loadChat}
          currentChatKey={currentChatKey}
          onOpenCreateGroup={() => setIsCreateGroupModalOpen(true)}
        />
      )}

      {currentChatKey === null && isNewUserMode ? (
        <EmptyChatView
          onOpenAddFriend={() => setIsAddFriendModalOpen(true)}
          onOpenCreateGroup={() => setIsCreateGroupModalOpen(true)}
        />
      ) : (
        <div className="flex-1 flex">
          <ChatArea
            currentChatKey={currentChatKey}
            chatDisplayName={currentChatDisplayName}
            currentChannel={currentChannel}
            isGroup={isGroup}
            messages={messages}
            loadChannel={loadChannel}
            sendMessage={sendMessage}
            deleteMessage={deleteMessage}
            openUserProfile={setSelectedUserKey}
            pinnedMessage={pinnedMessage}
            pinMessage={pinMessage}
            mutedChannels={mutedChannels}
            toggleMuteChannel={toggleMuteChannel}
            createNewChannel={createNewChannel}
            currentChannels={currentChannels}
             updateChannel={updateChannel}          
              deleteChannel={deleteChannel} 
          />

          {isGroup && currentChatKey && (
            <MembersBar
              members={currentMembers}
              groupKey={currentChatKey as GroupKey}
              openAddMemberModal={() => setIsAddMemberModalOpen(true)}
              openUserProfile={setSelectedUserKey}
            />
          )}
        </div>
      )}

      {/* Modales */}
      <UserProfileModal
        isOpen={!!selectedUserKey}
        userKey={selectedUserKey || undefined}
        onClose={() => setSelectedUserKey(null)}
      />

      <AddFriendModal
        isOpen={isAddFriendModalOpen}
        onClose={() => setIsAddFriendModalOpen(false)}
        onAddFriend={handleAddFriend}
      />

      <CreateGroupModal
        isOpen={isCreateGroupModalOpen}
        onClose={() => setIsCreateGroupModalOpen(false)}
        onCreateGroup={handleCreateGroup}
      />

      {isGroup && currentChatKey && (
        <AddMemberModal
          isOpen={isAddMemberModalOpen}
          onClose={() => setIsAddMemberModalOpen(false)}
          currentGroupKey={currentChatKey as GroupKey}
          friendsList={friendsList}
          groupMembers={currentMembers}
          onAddMembers={addMembersToGroup}
        />
      )}
    </div>
  );
};

export default PanelApp;

