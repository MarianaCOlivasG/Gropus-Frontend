// import { useEffect } from 'react';
// import { useChatStore } from '../store/useChatStore';

// export const useChatInitialization = () => {
//   const { fetchGroups, currentChatKey, currentChannel } = useChatStore();

//   useEffect(() => {
//     fetchGroups();
//   }, [fetchGroups]);

//   // Sincronización con LocalStorage 
//   useEffect(() => {
//     if (currentChatKey) {
//       localStorage.setItem('lastChatKey', currentChatKey);
//     }
//   }, [currentChatKey]);

//   useEffect(() => {
//     if (currentChannel) {
//       localStorage.setItem('lastChannel', currentChannel);
//     }
//   }, [currentChannel]);
// };