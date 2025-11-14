import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import ChatArea from './components/ChatArea';
import MembersBar from './components/MembersBar';
import {
  friendsList,
  groupMembersData,
  channelChats,
  chats,
  currentUserKey,
  roles,
  users,
} from './data';
import type { GroupKey,Message } from './data';
import UserProfileModal from './components/UserProfileModal';
import AddMemberModal from './components/AddMemberModal';

// 🔹 Helper para obtener mensajes según el tipo de chat
const getMessages = (
  chatKey: string,
  channelKey: string,
  isGroup: boolean
): Message[] => {
  if (isGroup) {
    return channelChats[chatKey as GroupKey]?.[channelKey] || [];
  }
  return chats[chatKey] || [];
};

const PanelApp: React.FC = () => {
  // Estados principales
  const [currentChatKey, setCurrentChatKey] = useState<GroupKey | string>('grupo1');
  const [currentChannel, setCurrentChannel] = useState<string>('#general');
  const [isGroup, setIsGroup] = useState<boolean>(true);
  const [messages, setMessages] = useState<Message[]>(getMessages('grupo1', '#general', true));

  // Estados para modales
  const [selectedUserKey, setSelectedUserKey] = useState<string | null>(null);
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState<boolean>(false);

  // Mensaje fijado
  const [pinnedMessage, setPinnedMessage] = useState<(Message & { index: number }) | null>(null);

  //  Canales silenciados
  const [mutedChannels, setMutedChannels] = useState<Set<string>>(new Set(['grupo1#memes']));

  // Alternar silencio de canal
  const toggleMuteChannel = (fullChannelKey: string) => {
    setMutedChannels((prev) => {
      const newMutes = new Set(prev);
      if (newMutes.has(fullChannelKey)) {
        newMutes.delete(fullChannelKey);
        alert(`Canal ${fullChannelKey} DES-SILENCIADO.`);
      } else {
        newMutes.add(fullChannelKey);
        alert(`Canal ${fullChannelKey} SILENCIADO.`);
      }
      return newMutes;
    });
  };

  // Cargar chat (grupo o amigo)
  const loadChat = (chatKey: string) => {
    setCurrentChatKey(chatKey);
    const isGroupChat = chatKey.startsWith('grupo');
    setIsGroup(isGroupChat);

    let targetChannel = '#general';
    if (isGroupChat) {
      targetChannel = currentChannel || '#general';
      setPinnedMessage(null);
    }

    setMessages(getMessages(chatKey, targetChannel, isGroupChat));
    setCurrentChannel(targetChannel);
  };

  // Cargar canal dentro de grupo
  const loadChannel = (channelKey: string) => {
    setCurrentChannel(channelKey);
    setMessages(getMessages(currentChatKey, channelKey, true));
    setPinnedMessage(null);
  };

  // Obtener miembros actuales (solo grupos)
  const currentMembers = isGroup ? groupMembersData[currentChatKey as GroupKey] : [];

  // Enviar mensaje
  const sendMessage = (text: string) => {
    if (!currentChatKey || text.trim() === '') return;

    const now = new Date();
    const time = `${now.getHours().toString().padStart(2, '0')}:${now
      .getMinutes()
      .toString()
      .padStart(2, '0')}`;
    const newMsg: Message = {
      sender: currentUserKey,
      name: users[currentUserKey]?.name || 'Yo',
      text,
      time,
    };

    setMessages((prev) => [...prev, newMsg]);
    if (isGroup) {
      channelChats[currentChatKey as GroupKey][currentChannel].push(newMsg);
    } else {
      chats[currentChatKey].push(newMsg);
    }
  };

  // Eliminar mensaje
  const deleteMessage = (indexToDelete: number) => {
    if (!currentChatKey) return;

    alert('Mensaje eliminado correctamente.');

    const targetArray = isGroup
      ? channelChats[currentChatKey as GroupKey][currentChannel]
      : chats[currentChatKey];
    if (targetArray) {
      targetArray.splice(indexToDelete, 1);
    }

    setMessages((prev) => prev.filter((_, index) => index !== indexToDelete));

    if (pinnedMessage && pinnedMessage.index === indexToDelete) {
      setPinnedMessage(null);
    }
  };

  // Fijar o desfijar mensaje
  const pinMessage = (messageIndex: number | null) => {
    if (messageIndex === null) {
      setPinnedMessage(null);
      return;
    }

    const messageToPin = messages[messageIndex];
    if (messageToPin) {
      setPinnedMessage({ ...messageToPin, index: messageIndex });
      alert(`Mensaje de ${messageToPin.name} fijado.`);
    }
  };

  // Render principal
  return (
    <div className="bg-gray-900 text-gray-100 h-screen flex">
      <Sidebar
        friendsList={friendsList}
        loadChat={loadChat}
        currentChatKey={currentChatKey}
      />

      <div className="flex-1 flex">
        <ChatArea
          currentChatKey={currentChatKey}
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
        />

        {isGroup && (
          <MembersBar
            members={currentMembers || []}
            groupKey={currentChatKey as GroupKey}
            openAddMemberModal={() => setIsAddMemberModalOpen(true)}
            openUserProfile={setSelectedUserKey}
          />
        )}
      </div>

      <UserProfileModal
        isOpen={selectedUserKey !== null}
        userKey={selectedUserKey ?? undefined}
        onClose={() => setSelectedUserKey(null)}
      />

      <AddMemberModal
        isOpen={isAddMemberModalOpen}
        onClose={() => setIsAddMemberModalOpen(false)}
        currentGroupKey={currentChatKey as GroupKey}
      />
    </div>
  );
};

export default PanelApp;

