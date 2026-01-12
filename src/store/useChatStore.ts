import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { ChatState } from './types';
import { createAuthSlice } from './slices/authSlice';
import { createGroupSlice } from './slices/groupSlice';
import { createChatSlice } from './slices/chatSlice';
import { createMemberSlice } from './slices/memberSlice';
import { createTagSlice } from './slices/tagSlice';

export const useChatStore = create<ChatState>()(
  persist(
    (...a) => ({
      ...createAuthSlice(...a),
      ...createGroupSlice(...a),
      ...createChatSlice(...a),
      ...createMemberSlice(...a),
      ...createTagSlice(...a),
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
        pinnedMessages: state.pinnedMessages,
        currentMembers: state.currentMembers,
        tags: state.tags,
        allFriends: state.allFriends,
        
      }),
    }
  )
);