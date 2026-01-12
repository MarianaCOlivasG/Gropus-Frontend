import React, { useState, useEffect } from 'react';
import { useChatStore } from '../store/useChatStore'; 
import Swal from 'sweetalert2'; 
import Sidebar from './components/Sidebar';
import ChatArea from './components/ChatArea';
import MembersBar from './components/MembersBar';
import AddFriendModal from './components/AddFriendModal';
import CreateGroupModal from './components/CreateGroupModal';
import UserProfileModal from './components/UserProfileModal';
import AddMemberModal from './components/AddMemberModal';
import type { GroupMember } from '../store/types';

const PanelApp: React.FC = () => {
  const {
    allGroups,
    allFriends,
    currentChatKey,
    isGroup,
    isLoading, 
    loadingGroupChannels,
    currentMembers, 
    initAuth,
    loadChat, 
    createGroup,
    updateGroup,      
    logout,
    connectSocket,
    disconnectSocket,
    currentUser, 
  } = useChatStore();

  const [selectedUser, setSelectedUser] = useState<GroupMember | null>(null);

  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState<boolean>(false);
  const [isAddFriendModalOpen, setIsAddFriendModalOpen] = useState<boolean>(false);
  
  // ESTADOS PARA EL MODAL DE GRUPO (CREAR/EDITAR)
  const [isCreateGroupModalOpen, setIsCreateGroupModalOpen] = useState<boolean>(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [editingData, setEditingData] = useState<any>(null);
  
  const isNewUser = !isLoading && allGroups.length === 0 && allFriends.length === 0;

  useEffect(() => {
    initAuth();
  }, []);

  useEffect(() => {
    if (currentUser) {
      connectSocket();
    } else {
      disconnectSocket();
    }
    return () => {
      disconnectSocket();
    };
  }, [currentUser]);


  // Función para abrir modo CREAR
  const handleOpenCreate = () => {
    setModalMode('create');
    setEditingData(null);
    setIsCreateGroupModalOpen(true);
  };

  // Función para abrir modo EDITAR 
  const handleOpenEdit = () => {
    const group = allGroups.find(g => g.key === currentChatKey);
    if (group) {
      setModalMode('edit');
      setEditingData(group);
      setIsCreateGroupModalOpen(true);
    }
  };

  // Función unificada que decide si crear o actualizar en elservidor 
  const handleSaveGroup = async (data: any) => {
    try {
      if (modalMode === 'create') {
        await createGroup(data);
        Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Grupo creado', timer: 2000, showConfirmButton: false });
      } else {
        if (currentChatKey) {
          await updateGroup(currentChatKey, data);
          Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Ajustes guardados', timer: 2000, showConfirmButton: false });
        }
      }
      setIsCreateGroupModalOpen(false);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="bg-[#313338] text-gray-100 h-screen flex overflow-hidden font-sans">
      
      {/* 1. BARRA LATERAL IZQUIERDA (Iconos de servidores) */}
      {!isNewUser && (
        <Sidebar
          friendsList={allFriends} 
          groupList={allGroups}
          loadChat={loadChat} 
          currentChatKey={currentChatKey}
          onOpenCreateGroup={handleOpenCreate}
          loadingGroupChannels={loadingGroupChannels}
          onLogout={logout} 
          currentUser={currentUser} 
        />
      )}

      {/* 2. ÁREA CENTRAL (Canales + Chat) */}
      <div className="flex-1 flex min-w-0">
        <ChatArea 
          openUserProfile={(u: any) => setSelectedUser(u)} 
          onOpenAddFriend={() => setIsAddFriendModalOpen(true)}
          onOpenCreateGroup={handleOpenCreate}
          onEditGroup={handleOpenEdit} 
        />

        {/* 3. BARRA DE MIEMBROS (DERECHA) */}
        {isGroup && currentChatKey && !isNewUser && (
          <MembersBar
            members={currentMembers} 
            groupKey={currentChatKey}
            openAddMemberModal={() => setIsAddMemberModalOpen(true)}
            openUserProfile={(u: any) => setSelectedUser(u)}
          />
        )}
      </div>
      
      {/* MODALES DEL SISTEMA */}
      <UserProfileModal
        isOpen={!!selectedUser}
        userKey={selectedUser?.key} 
        initialUser={selectedUser}  
        onClose={() => setSelectedUser(null)}
      />

      <AddFriendModal
        isOpen={isAddFriendModalOpen}
        onClose={() => setIsAddFriendModalOpen(false)}
        onAddFriend={() => {}}
      />

      {/* MODAL DE GRUPO ÚNICO (MANEJA CREACIÓN Y EDICIÓN) */}
      <CreateGroupModal
        isOpen={isCreateGroupModalOpen}
        onClose={() => setIsCreateGroupModalOpen(false)}
        onCreateGroup={handleSaveGroup} 
        mode={modalMode}
        initialData={editingData}
      />

      {isGroup && currentChatKey && (
        <AddMemberModal
          isOpen={isAddMemberModalOpen}
          onClose={() => setIsAddMemberModalOpen(false)}
        />
      )}
    </div>
  );
};

export default PanelApp;