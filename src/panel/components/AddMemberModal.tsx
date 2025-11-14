import React from 'react';
import { friendsList, groupMembersData } from '../data';
import type {GroupKey} from '../data'

interface AddMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentGroupKey: GroupKey;
}

const AddMemberModal: React.FC<AddMemberModalProps> = ({ isOpen, onClose, currentGroupKey }) => {
  if (!isOpen) return null;

  const currentMembersKeys = (groupMembersData[currentGroupKey] || []).map(m => m.key);
  const friendsToAddToGroup = friendsList.filter(f => !currentMembersKeys.includes(f.key));

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-gray-800 p-6 rounded-lg w-96 relative" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-2 right-2 text-gray-400 hover:text-white font-bold">
          X
        </button>

        <h3 className="text-lg font-semibold text-gray-100 mb-3">
          Añadir miembros a {currentGroupKey}
        </h3>

        <div className="space-y-2 max-h-64 overflow-y-auto">
          {friendsToAddToGroup.length === 0 ? (
            <p className="text-gray-400 p-4">Todos tus amigos están ya en este grupo.</p>
          ) : (
            friendsToAddToGroup.map(friend => (
              <div key={friend.chat} className="flex items-center justify-between bg-gray-900 p-2 rounded">
                <div className="flex items-center gap-2">
                  <input type="checkbox" className="add-member-checkbox" data-key={friend.key} />
                  <img src={friend.avatar} className="w-8 h-8 rounded-full" alt={friend.name} />
                  <div>
                    <div className="text-gray-200">{friend.name}</div>
                    <div className="text-gray-400 text-xs">Amigo</div>
                  </div>
                </div>
                <select className="add-member-role bg-gray-800 text-gray-200 rounded px-2 py-1" data-key={friend.key}>
                  <option value="member">Miembro</option>
                  <option value="moderator">Moderador</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            ))
          )}
        </div>

        <div className="mt-4 flex justify-end space-x-2">
          <button
            onClick={() => alert("Función 'Añadir' debe ser implementada en App.tsx")}
            className="bg-green-600 hover:bg-green-700 px-3 py-1 rounded"
          >
            Añadir seleccionados
          </button>
          <button
            onClick={onClose}
            className="bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddMemberModal;
