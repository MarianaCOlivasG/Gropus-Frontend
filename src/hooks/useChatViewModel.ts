import { useShallow } from 'zustand/react/shallow';
import { useChatStore } from '../store/useChatStore';

export const useChatViewModel = () => {
  const store = useChatStore(
    useShallow((state) => ({
      currentChatKey: state.currentChatKey,
      chatDisplayName: state.chatDisplayName,
      currentChannel: state.currentChannel,
      isGroup: state.isGroup,
      messages: state.messages,
      pinnedMessage: state.pinnedMessage,
      mutedChannels: state.mutedChannels,
      currentChannels: state.currentChannels,
      currentChannelObjects: state.currentChannelObjects,
      allGroups: state.allGroups,
      allFriends: state.allFriends, 
      isLoading: state.isLoading,
      loadChannel: state.loadChannel,
      sendMessage: state.sendMessage,
      deleteMessage: state.deleteMessage,
      pinMessage: state.pinMessage,
      toggleMuteChannel: state.toggleMuteChannel,
      createNewChannel: state.createNewChannel,
      updateChannel: state.updateChannel,
      deleteChannel: state.deleteChannel,
      deleteGroup: state.deleteGroup, 
    }))
  );

  const currentChannelDescription = store.currentChannelObjects.find(
    (ch) => ch.key === store.currentChannel
  )?.description || null;

  const formatChannelName = (name: string) =>
    name.startsWith('#') ? name : `#${name}`;

  const displayTitle =
    store.isGroup && store.currentChannel
      ? formatChannelName(store.currentChannel)
      : store.chatDisplayName || 'Chat';

   const isNewUser = !store.isLoading && store.allGroups.length === 0 && store.allFriends.length === 0;

  return {
    ...store,
    displayTitle,
    currentChannelDescription,
    isNewUser,
  };
};