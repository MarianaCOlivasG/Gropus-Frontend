import Swal from 'sweetalert2';
import type { ChatSliceCreator, GroupMember } from '../types';
const API_URL = import.meta.env?.VITE_API_URL;

export const createMemberSlice: ChatSliceCreator<any> = (set, get) => ({
  currentMembers: [],
  potentialMembers: [],
  isLoadingMembers: false,

  fetchGroupMembers: async (groupKey:string) => {
    set({ isLoadingMembers: true });
    const token = localStorage.getItem('token');
    const storedUid = localStorage.getItem('uid'); 
    
    try {
        const res = await fetch(`${API_URL}/member_groups/${groupKey}/members`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        if (res.ok) {
            const json = await res.json();
            const rawMembers = Array.isArray(json) ? json : (json.data || []);

            const mappedMembers: GroupMember[] = rawMembers.map((m: any) => {
                const memberUid = m.userUid || m.uid || m.id;
                
                let role = 'member';
                if (m.role === 'owner' || m.role === 'admin') role = 'admin';
                if (m.role === 'moderator') role = 'moderator';

                const userObj = m.user || {};
                const realName = userObj.name || userObj.username || 'Usuario';
                const realAvatar = userObj.picture || userObj.avatar || 'bg-gray-700';

                return {
                    key: memberUid,
                    name: realName, 
                    avatar: realAvatar,
                    role: role,
                    status: userObj.is_online ? 'online' : 'offline',
                    tags: m.tags || userObj.tags || [] 
                };
            });
            
            if (storedUid && !mappedMembers.find(m => m.key === storedUid)) {
                const { currentUser } = get();
                mappedMembers.unshift({
                    key: storedUid,
                    name: currentUser?.name || 'Yo (Admin)',
                    avatar: currentUser?.avatar || 'https://i.pravatar.cc/150',
                    role: 'admin',
                    status: 'online',
                    tags: []
                });
            }

            set({ currentMembers: mappedMembers });
        }
    } catch (error) {
        console.error("Error cargando miembros:", error);
    } finally {
        set({ isLoadingMembers: false });
    }
  },

  fetchUsersToAdd: async () => {
    const token = localStorage.getItem('token');
    try {
        const res = await fetch(`${API_URL}/users`, { 
            headers: { Authorization: `Bearer ${token}` }
        });
        
        if (res.ok) {
            const json = await res.json();
            const allUsers = json.data || [];

            const currentMemberIds = get().currentMembers.map(m => m.key);

            const availableUsers = allUsers
                .filter((u: any) => !currentMemberIds.includes(u.uid)) 
                .map((u: any) => ({
                   key: u.uid,
                   name: u.name || u.username, 
                   avatar: u.picture || 'bg-gray-700',
                   status: u.is_online ? 'online' : 'offline',
                   role: 'member'
                }));

            set({ potentialMembers: availableUsers });
        }
    } catch (error) {
        console.error("Error buscando usuarios", error);
        set({ potentialMembers: [] });
    }
  },

  addMembersToGroup: async (keys:string[], groupKey:string) => {
    const token = localStorage.getItem('token');
    try {
        await Promise.all(keys.map(memberUid => 
          fetch(`${API_URL}/member_groups/${groupKey}/members`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ memberUid }),
          })
        ));
        await get().fetchGroupMembers(groupKey);
        set({ potentialMembers: [] });
        
        Swal.fire('Éxito', 'Miembros añadidos', 'success');
    } catch(e) {
        Swal.fire('Error', 'No se pudieron añadir algunos miembros', 'error');
    }
  },

  kickMember: async (groupKey:string, userUid:string) => {
    const token = localStorage.getItem('token');
    try {
        const res = await fetch(`${API_URL}/member_groups/${groupKey}/members/${userUid}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` }
        });

        if (res.ok) {
            set(state => ({
                currentMembers: state.currentMembers.filter(m => m.key !== userUid)
            }));
            Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Miembro expulsado', timer: 1500, showConfirmButton: false });
        } else {
            throw new Error("No se pudo expulsar");
        }
    } catch (e) {
        console.error(e);
        Swal.fire('Error', 'No se pudo expulsar al miembro', 'error');
    }
  }
});