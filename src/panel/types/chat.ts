// src/panel/types/chat.ts

export interface User {
  avatar: string;
  align: 'left' | 'right';
  status: 'active' | 'inactive';
  name: string;
}

export interface Message {
  sender: string;
  name: string;
  text: string;
  time: string;
}

export type Role = 'admin' | 'moderator' | 'member';

export interface Roles {
  [groupKey: string]: { [userKey: string]: Role };
}

export interface MembersBarProps {
  groupMembersData: GroupMembersData;
  currentChat: string;
  roles: Roles;
  openAddMember: () => void;
  openUserModal: (key: string) => void;
}

export interface Chats {
  [chatKey: string]: Message[];
}

export interface ChannelChats {
  [groupKey: string]: {
    [channelName: string]: Message[];
  };
}

export interface Friend {
  key: string;
  name: string;
  avatar: string;
  status: 'active' | 'inactive';
  chat: string;
}

export interface GroupMember {
  key: string;
  name: string;
  avatar: string;
  status: 'active' | 'inactive';
}

export interface GroupMembersData {
  [groupKey: string]: GroupMember[];
}
export interface AddMemberModalProps {
  open: boolean;
  friendsList?: Friend[];
  groupMembersData?: GroupMembersData;
  currentChat: string;
  onClose: () => void;
  onConfirm: (toAdd: GroupMember[]) => void;
}


export interface SidebarProps {
  friendsList?: Friend[];
  onSelectChat: (chatKey: string) => void;
}

export type UsersMap = Record<string, User>;


export interface UserProfileModalProps {
  open: boolean;
  userKey: string | null;
  users: UsersMap;
  onClose: () => void;
}


export interface ChatAreaProps {
  users: UsersMap;
  chats: Chats;
  channelChats: ChannelChats;
  currentChat: string;
  currentChannel: string;
  setCurrentChannel: (channel: string) => void;
  getMessagesArray: () => Message[];
  addMessage: (text: string) => void;
  editMessage: (index: number, newText: string) => void;
  deleteMessage: (index: number) => void;
  canManageMessage: (senderKey: string) => boolean;
  openUserModal: (key: string) => void;
}