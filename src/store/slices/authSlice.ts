import type { ChatSliceCreator } from '../types';
const API_URL = import.meta.env?.VITE_API_URL;

export const createAuthSlice: ChatSliceCreator<any> = (set, get) => ({
  currentUser: null,
  isCheckingAuth: false,
  isNewUserMode: false,
  isLoading: true,

  initAuth: async () => {
    if (get().isCheckingAuth) return;
    const token = localStorage.getItem('token');
    
    if (!token) {
        get().logout();
        set({ isLoading: false });
        return;
    }

    set({ isCheckingAuth: true });
    try {
        const res = await fetch(`${API_URL}/auth/renew/user`, {
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Cache-Control': 'no-cache' 
            }
        });

        if (!res.ok) throw new Error('Sesión inválida');
        const data = await res.json();
        const serverData = data.data || data; 
        const newToken = serverData.token || serverData.accessToken || token;
        const user = serverData.user || serverData.customer;
        

        localStorage.setItem('token', newToken);
        localStorage.setItem('uid', user.uid || user.id);
        
        set({ 
            currentUser: { 
                uid: user.uid || user.id, 
                name: user.name, 
                avatar: user.picture || 'bg-gray-700' 
            }
        });
        
        await get().fetchGroups(newToken);
        await get().fetchTags();
        await get().fetchFriends();

    } catch (error) {
        console.error("Error de sesión:", error);
        get().logout();
    } finally {
        set({ isCheckingAuth: false, isLoading: false });
    }
  },

  updateUserProfile: async (data: { name: string; bio?: string; imageFile?: File | null }) => {
    const token = localStorage.getItem('token');
    const { currentUser } = get(); 
    
    if (!token || !currentUser) return; 

    try {
        let newName = data.name; 
        let newAvatar = currentUser.avatar;
    
        const bodyData = {
            name: data.name,       
            description: data.bio  
        };

        const res = await fetch(`${API_URL}/users/${currentUser.uid}`, { 
            method: 'PUT', 
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(bodyData)
        });

        if(!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.message || "Error actualizando perfil");
        }

        if (data.imageFile) {
            const formData = new FormData();
            formData.append('file', data.imageFile);
        
            const resImg = await fetch(`${API_URL}/users/${currentUser.uid}/image`, { 
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });

            if(!resImg.ok) throw new Error("Error subiendo imagen");
            const resultImg = await resImg.json();
            newAvatar = resultImg.data?.picture || resultImg.data?.image || resultImg.data?.url;
        }

        const updatedUserObj = {
            ...currentUser,
            name: newName,  
            bio: data.bio,
            avatar: newAvatar
        };

        const uid = currentUser.uid;

        set((state) => ({
            currentUser: updatedUserObj,
            currentMembers: state.currentMembers.map(member => 
                member.key === uid 
                ? { ...member, name: newName, avatar: newAvatar } 
                : member
            ),
            allFriends: state.allFriends.map(friend => 
                friend.key === uid 
                ? { ...friend, name: newName, avatar: newAvatar } 
                : friend
            ),
        }));

    } catch (error) {
        console.error("Update Profile Error:", error);
        throw error;
    }
  },
  logout: () => {
    localStorage.clear(); 
    window.location.reload();
  }
});