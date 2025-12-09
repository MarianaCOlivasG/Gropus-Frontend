import React, { useState, useEffect } from "react";
import type { GroupKey, Member } from "../data1";

// Interfaz básica de Friend para el listado
interface FriendListItem {
  key: string;
  name: string;
  avatar: string;
}

interface AddMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentGroupKey: GroupKey;
  friendsList: FriendListItem[];
  groupMembers: Member[];
  onAddMembers: (selectedMemberKeys: string[], groupKey: GroupKey) => void;
}

const AddMemberModal: React.FC<AddMemberModalProps> = ({
  isOpen,
  onClose,
  currentGroupKey,
  friendsList,
  groupMembers,
  onAddMembers,
}) => {
  const [selectedFriends, setSelectedFriends] = useState<Set<string>>(new Set());
  const [availableFriends, setAvailableFriends] = useState<FriendListItem[]>([]);

  // 1. Filtrar amigos disponibles
  useEffect(() => {
    if (isOpen) {
      const memberKeys = new Set(groupMembers.map((m) => m.key));
      const filtered = friendsList.filter((friend) => !memberKeys.has(friend.key));
      setAvailableFriends(filtered);
      setSelectedFriends(new Set());
    }
  }, [isOpen, friendsList, groupMembers]);

  if (!isOpen) return null;

  const toggleFriendSelection = (key: string) => {
    setSelectedFriends((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(key)) {
        newSet.delete(key);
      } else {
        newSet.add(key);
      }
      return newSet;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const keysToAdd = Array.from(selectedFriends);

    if (keysToAdd.length === 0) {
      alert("Selecciona al menos un amigo para añadir.");
      return;
    }

    onAddMembers(keysToAdd, currentGroupKey);
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-gray-800 p-6 rounded-lg w-96 relative shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold mb-4 text-white">Añadir Miembros al Grupo</h2>

        <form onSubmit={handleSubmit}>
          <p className="text-gray-400 text-sm mb-3">
            Amigos disponibles para añadir ({availableFriends.length}):
          </p>

          <div className="max-h-60 overflow-y-auto mb-4 border border-gray-700 rounded p-2 bg-gray-700/50">
            {availableFriends.length === 0 ? (
              <p className="text-gray-500 text-center py-4">
                Todos tus amigos están ya en este grupo.
              </p>
            ) : (
              availableFriends.map((friend) => (
                <div
                  key={friend.key}
                  onClick={() => toggleFriendSelection(friend.key)}
                  className={`flex items-center p-2 rounded cursor-pointer transition ${
                    selectedFriends.has(friend.key)
                      ? "bg-purple-600/50"
                      : "hover:bg-gray-700"
                  }`}
                >
                  <img
                    src={friend.avatar}
                    alt={friend.name}
                    className="w-8 h-8 rounded-full mr-3"
                  />
                  <span className="text-white flex-1">{friend.name}</span>

                  <input
                    type="checkbox"
                    checked={selectedFriends.has(friend.key)}
                    onChange={() => toggleFriendSelection(friend.key)}
                    className="form-checkbox text-purple-600 bg-gray-700 border-gray-600 rounded"
                  />
                </div>
              ))
            )}
          </div>

          <div className="flex justify-between items-center text-sm mb-4">
            <span className="text-gray-300">
              Seleccionados: {selectedFriends.size}
            </span>
            <button
              type="button"
              onClick={() => setSelectedFriends(new Set())}
              className="text-red-400 hover:text-red-300 transition"
            >
              Deseleccionar
            </button>
          </div>

          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition"
            >
              Cancelar
            </button>

            <button
              type="submit"
              className={`px-4 py-2 text-white rounded transition ${
                selectedFriends.size === 0
                  ? "bg-purple-600/50 cursor-not-allowed"
                  : "bg-purple-600 hover:bg-purple-700"
              }`}
              disabled={selectedFriends.size === 0}
            >
              Añadir ({selectedFriends.size})
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddMemberModal;
