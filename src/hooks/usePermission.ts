import { useChatStore } from "../store/useChatStore";

export const usePermission = (requiredPermission: string): boolean => {
  const currentUser = useChatStore((state) => state.currentUser);
  const currentMembers = useChatStore((state) => state.currentMembers);

  if (!currentUser) return false;
  const myMemberProfile = currentMembers.find(member => member.key === currentUser.uid);

  if (myMemberProfile?.role === 'admin') {
      return true; 
  }

  const myTags = myMemberProfile?.tags || [];
  
  const hasPermission = myTags.some((tag) => 
    tag.permissions?.includes(requiredPermission)
  );

  return hasPermission;
};