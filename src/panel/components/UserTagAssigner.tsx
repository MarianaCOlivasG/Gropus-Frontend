import React, { useMemo } from 'react';
import { useChatStore } from '../../store/useChatStore';
import type { GroupMember } from '../../store/types';
import { usePermission } from '../../hooks/usePermission';

interface Props {
  member: GroupMember;
}

export const UserTagAssigner: React.FC<Props> = ({ member }) => {

    const { tags, assignTagToUser, removeTagFromUser, currentMembers } = useChatStore();

    const liveMember = useMemo(() => {
      return currentMembers.find(m => m.key === member.key) || member;
    }, [currentMembers, member]);

    const canCreateTag = usePermission('tag_assigner');
    const memberTags = liveMember.tags || [];

    const isAssigned = (tagUid: string) => {
      return memberTags.some((t: any) => {
        const tId = String(t.uid || t.id || t._id); 
        const targetId = String(tagUid);            
        return tId === targetId;
      });
    };

    const handleToggle = async (tagUid: string) => {
      if (!canCreateTag) return; 

      if (isAssigned(tagUid)) {
        await removeTagFromUser(member.key, tagUid);
      } else {
        await assignTagToUser(member.key, tagUid);
      }
    };

    return (
      <div className="mt-4 bg-[#2b2d31] p-3 rounded-xl border border-gray-700/50">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider">
              Etiquetas y Roles
          </h3>
          <span className="text-[10px] text-gray-500 font-mono">
              {memberTags.length} / {tags.length} asignados
          </span>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {tags.length === 0 && <span className="text-gray-500 text-xs py-2">No hay etiquetas en este grupo.</span>}
          
          {tags.map(tag => {
            const active = isAssigned(tag.uid);
            const color = tag.color || '#9ca3af';
            const baseStyle = `
              px-2.5 py-1 rounded-md text-xs font-medium border flex items-center gap-1.5 shadow-sm transition-all duration-200
            `;

            if (!canCreateTag) {
              return (
                  <div
                    key={tag.uid}
                    className={`${baseStyle} opacity-80 cursor-not-allowed`}
                    style={{ 
                      backgroundColor: active ? color : 'transparent',
                      borderColor: active ? color : '#4b5563', 
                      color: active ? '#fff' : '#6b7280', 
                      boxShadow: 'none'
                    }}
                    title="No tienes permiso para modificar roles"
                  >
                    <div 
                      className={`w-1.5 h-1.5 rounded-full`} 
                      style={{ backgroundColor: active ? '#fff' : '#6b7280' }}
                    />
                    {tag.name}
                  </div>
              );
            }

            return (
              <button
                key={tag.uid}
                onClick={() => handleToggle(tag.uid)}
                className={`
                  ${baseStyle}
                  ${active ? 'translate-y-[1px]' : 'hover:brightness-125 cursor-pointer'}
                `}
                style={{ 
                  backgroundColor: active ? color : 'transparent',
                  borderColor: color,
                  color: active ? '#fff' : color,
                  boxShadow: active ? `0 0 10px -3px ${color}` : 'none'
                }}
              >
                <div 
                  className={`w-1.5 h-1.5 rounded-full transition-all`} 
                  style={{ backgroundColor: active ? '#fff' : color }}
                />
                {tag.name}
              </button>
            )
          })}
        </div>
        
        {!canCreateTag && (
            <p className="mt-2 text-[9px] text-gray-500 text-center italic">
                Solo usuarios autorizados pueden gestionar roles.
            </p>
        )}
      </div>
    );
};