import type { StateCreator } from 'zustand';


export interface Tag {
  uid: string;
  name: string;
  color: string | null;
  is_active?: boolean;
  permissions?: string[];
}

export interface Message {
  id: string;
  sender: string;
  name: string;
  avatar?: string;
  text: string;
  time: string;
  created_at: string;
  index?: number;
  role?: string;
  attachmentType?: "image" | "document" | "pdf" | "file" | null;
  attachmentUrl?: string | null;
  mimeType?: string;
  fileName?: string;
  fileSize?: string;
  imageWidth?: number;
  imageHeight?: number;
}

export interface ChannelItem {
  id: string;
  name: string;
  key: string;
  description?: string;
  tags?: Tag[]; 
}

export interface GroupListItem {
  key: string;
  display: string;
  avatar: string;
  description?: string;
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
  tags?: Tag[]; 
}

export interface AuthSlice {
  currentUser: { uid: string; name: string; avatar: string; tags?: Tag[]; role?: string; } | null;
  isCheckingAuth: boolean;
  isNewUserMode: boolean;
  isLoading: boolean;
  updateUserProfile: (data: { name: string; bio?: string; imageFile?: File | null }) => Promise<void>;
  initAuth: () => Promise<void>;
  logout: () => void;
}

export interface GroupSlice {
  allGroups: GroupListItem[];
  allFriends: FriendItem[];
  loadingGroupChannels: Record<string, boolean>;
  fetchGroups: (tokenOverride?: string) => Promise<void>;
  createGroup: (data: any) => Promise<void>;
  updateGroup: (groupKey: string, data: any) => Promise<void>;
  deleteGroup: (groupKey: string) => Promise<void>;
  createNewChannel: (name: string) => Promise<void>;
  updateChannel: (id: string, name: string) => Promise<void>;
  deleteChannel: (id: string) => Promise<void>;
  
}

export interface ChatSlice {
  currentChatKey: string | null;
  chatDisplayName: string | null;
  currentChannel: string;
  isGroup: boolean;
  currentChannels: string[];
  currentChannelObjects: ChannelItem[];
  messages: Message[];
  isLoadingMessages: boolean;
  isLoadingMore: boolean;
  pinnedMessages: Record<string, (Message & { index: number }) | null>; 
  mutedChannels: Set<string>;
  socket: any;
  typingUsers: Record<string, string[]>;
   

  previewFile: { url: string; type: 'image' | 'pdf' | string; name: string } | null;
  openFilePreview: (url: string, type: string, name?: string) => void;
  closeFilePreview: () => void;

  getOrCreatePrivateChat: (friend: FriendItem) => Promise<void>;
  fetchFriends: () => Promise<void>;
  
  loadMoreMessages: () => Promise<void>;
  loadChat: (chatKey: string) => Promise<void>;
  loadChannel: (channelKey: string) => Promise<void>;
  sendMessage: (text: string) => Promise<void>;
  deleteMessage: (index: number, messageId?: string) => Promise<void>;
  pinMessage: (index: number | null, channelId: string) => void; 
  toggleMuteChannel: (fullKey: string) => void;
  connectSocket: () => void;   
  disconnectSocket: () => void; 
}

export interface MemberSlice {
  currentMembers: GroupMember[];
  potentialMembers: GroupMember[];
  isLoadingMembers: boolean;
  fetchGroupMembers: (groupKey: string) => Promise<void>;
  fetchUsersToAdd: (groupKey: string) => Promise<void>;
  addMembersToGroup: (keys: string[], groupKey: string) => Promise<void>;
  kickMember: (groupKey: string, userUid: string) => Promise<void>;
}

export interface TagSlice {
  tags: Tag[];
  fetchTags: () => Promise<void>;
  createTag: (name: string, color: string, permissions?: string[]) => Promise<void>;
  updateTag: (uid: string, name: string, color: string, permissions?: string[]) => Promise<void>;
  deleteTag: (uid: string) => Promise<void>;
  assignTagToChannel: (channelUid: string, tagUid: string) => Promise<void>;
  removeTagFromChannel: (channelUid: string, tagUid: string) => Promise<void>;
  assignTagToUser: (userUid: string, tagUid: string) => Promise<void>;
  removeTagFromUser: (userUid: string, tagUid: string) => Promise<void>;
}

// Unión de Slices en un solo estado global
export type ChatState = AuthSlice & GroupSlice & ChatSlice & MemberSlice & TagSlice;

// Helper para crear Slices individuales
export type ChatSliceCreator<T> = StateCreator<ChatState, [], [], T>;