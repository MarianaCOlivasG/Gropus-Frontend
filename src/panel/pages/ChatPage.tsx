// import { Sidebar } from "../components/Sidebar";
// import  ChatArea  from "../components/ChatArea";
// import { MembersBar } from "../components/MembersBar";
// import { useChat } from "../context/ChatContext";

// export const ChatPage = () => {
//   const { friendsList, getMessagesArray, addMessage, currentChat, setCurrentChat } = useChat();

//   return (
//     <div className="flex h-screen bg-gray-900 text-gray-100">
//       <Sidebar friendsList={friendsList} onSelectChat={setCurrentChat} />
//       <ChatArea
//         chat={getMessagesArray(currentChat)}
//         addMessage={(text) => addMessage(currentChat, text)}
//       />
//       <MembersBar />
//     </div>
//   );
// };
