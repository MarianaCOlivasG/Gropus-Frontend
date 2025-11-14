// import { createContext, useContext, useState } from "react";
// import type { ReactNode } from "react";
// import type { ChatData, Message } from "../types/chat";

// const initial: ChatData = {
//   currentUserKey: "B",
//   roles: {
//     grupo1: { B: "admin", A: "member", F: "member" },
//     grupo2: { B: "moderator", A: "member", F: "member" },
//   },
//   chats: {},
//   channelChats: {},
//   users: {
//     A: { avatar: "👩", align: "left", status: "active", name: "Ana" },
//     B: { avatar: "🧑‍💻", align: "right", status: "active", name: "Bruno" },
//     F: { avatar: "🧔", align: "left", status: "inactive", name: "Felipe" },
//   },
//   friendsList: [
//     { key: "A", name: "Ana", avatar: "👩", status: "active", chat: "chatA" },
//     { key: "F", name: "Felipe", avatar: "🧔", status: "inactive", chat: "chatF" },
//   ],
//   groupMembersData: {
//     grupo1: [
//       { key: "A", name: "Ana", avatar: "👩", status: "active" },
//       { key: "B", name: "Bruno", avatar: "🧑‍💻", status: "active" },
//       { key: "F", name: "Felipe", avatar: "🧔", status: "inactive" },
//     ],
//     grupo2: [
//       { key: "A", name: "Ana", avatar: "👩", status: "active" },
//       { key: "B", name: "Bruno", avatar: "🧑‍💻", status: "active" },
//     ],
//   },
// };

// interface ChatContextType extends ChatData {
//   currentChat: string;
//   setCurrentChat: (chat: string) => void;
//   currentChannel: string;
//   setCurrentChannel: (channel: string) => void;
//   getMessagesArray: (chatKey: string) => Message[];
//   addMessage: (chatKey: string, text: string) => void;
//   editMessage: (chatKey: string, index: number, text: string) => void;
//   deleteMessage: (chatKey: string, index: number) => void;
//   getMembersList: (chatKey: string) => any[]; // 
// }

// const ChatContext = createContext<ChatContextType | undefined>(undefined);

// export const ChatProvider = ({ children }: { children: ReactNode }) => {
//   const [roles, setRoles] = useState(initial.roles);
//   const [chats, setChats] = useState(initial.chats);
//   const [channelChats, setChannelChats] = useState(initial.channelChats);
//   const [users, setUsers] = useState(initial.users);
//   const [friendsList, setFriendsList] = useState(initial.friendsList);
//   const [groupMembersData, setGroupMembersData] = useState(initial.groupMembersData);

//   const [currentUserKey] = useState(initial.currentUserKey);
//   const [currentChat, setCurrentChat] = useState("grupo1");
//   const [currentChannel, setCurrentChannel] = useState("#general");

//   function getMessagesArray(chatKey: string): Message[] {
//     if (chatKey.startsWith("grupo") && channelChats[chatKey]?.[currentChannel]) {
//       return channelChats[chatKey][currentChannel];
//     }
//     return chats[chatKey] || [];
//   }

//   function addMessage(chatKey: string, text: string) {
//     const now = new Date();
//     const time = now.toTimeString().slice(0, 5);
//     const newMsg = { sender: currentUserKey, name: users[currentUserKey].name, text, time };
//     if (chatKey.startsWith("grupo")) {
//       setChannelChats((prev) => ({
//         ...prev,
//         [chatKey]: {
//           ...prev[chatKey],
//           [currentChannel]: [...(prev[chatKey]?.[currentChannel] || []), newMsg],
//         },
//       }));
//     } else {
//       setChats((prev) => ({
//         ...prev,
//         [chatKey]: [...(prev[chatKey] || []), newMsg],
//       }));
//     }
//   }

//   function editMessage(chatKey: string, index: number, newText: string) {
//     // Aquí podrías implementar edición si la necesitas
//   }

//   function deleteMessage(chatKey: string, index: number) {
//     // Aquí podrías implementar eliminación si la necesitas
//   }

//   function getMembersList(chatKey: string) {
//     return groupMembersData[chatKey] || [];
//   }

//   return (
//     <ChatContext.Provider
//       value={{
//         ...initial,
//         roles,
//         chats,
//         channelChats,
//         users,
//         friendsList,
//         groupMembersData,
//         currentChat,
//         setCurrentChat,
//         currentChannel,
//         setCurrentChannel,
//         getMessagesArray,
//         addMessage,
//         editMessage,
//         deleteMessage,
//         getMembersList, // 
//       }}
//     >
//       {children}
//     </ChatContext.Provider>
//   );
// };

// export const useChat = () => {
//   const ctx = useContext(ChatContext);
//   if (!ctx) throw new Error("useChat must be used within ChatProvider");
//   return ctx;
// };
