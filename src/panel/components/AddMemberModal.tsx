import React, { useState, useEffect } from "react";
import { useChatStore } from "../../store/useChatStore";

interface AddMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AddMemberModal: React.FC<AddMemberModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { 
      currentChatKey, 
      potentialMembers, 
      fetchUsersToAdd,  
      addMembersToGroup 
  } = useChatStore();

  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && currentChatKey) {
      fetchUsersToAdd(currentChatKey);
      setSelectedUsers(new Set()); 
    }
  }, [isOpen, currentChatKey]);

  if (!isOpen) return null;

  const toggleSelection = (key: string) => {
    setSelectedUsers((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(key)) {
        newSet.delete(key);
      } else {
        newSet.add(key);
      }
      return newSet;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const keysToAdd = Array.from(selectedUsers);

    if (keysToAdd.length === 0 || !currentChatKey) return;

    setLoading(true);
    await addMembersToGroup(keysToAdd, currentChatKey);
    setLoading(false);
    
    onClose(); 
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-gray-800 p-6 rounded-xl w-96 relative shadow-2xl border border-gray-700 animate-in fade-in zoom-in duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold mb-4 text-white">Añadir Miembros</h2>

        <form onSubmit={handleSubmit}>
          <p className="text-gray-400 text-sm mb-3">
            Usuarios disponibles ({potentialMembers.length}):
          </p>

          <div className="max-h-60 overflow-y-auto mb-4 border border-gray-700 rounded-lg p-2 bg-gray-900/30 custom-scrollbar">
            {potentialMembers.length === 0 ? (
              <p className="text-gray-500 text-center py-6 text-sm">
                No hay más usuarios disponibles.
              </p>
            ) : (
              potentialMembers.map((user) => (
                <div
                  key={user.key}
                  onClick={() => toggleSelection(user.key)}
                  className={`flex items-center p-3 rounded-md cursor-pointer transition mb-1 ${
                    selectedUsers.has(user.key)
                      ? "bg-purple-600/30 border border-purple-500/50"
                      : "hover:bg-gray-700/50 border border-transparent"
                  }`}
                >
                  {(() => {
     
                      const isImage = user.avatar.startsWith('http') || user.avatar.startsWith('data:');
                      
                      return isImage ? (
                        // CASO 1: Es imagen
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="w-8 h-8 rounded-full mr-3 object-cover bg-gray-600"
                        />
                      ) : (
                        // CASO 2: Es estilo (bg-gray-700)
                        <div className={`w-8 h-8 rounded-full mr-3 flex-shrink-0 flex items-center justify-center text-white text-xs font-bold ${user.avatar}`}>
                            {user.name.charAt(0).toUpperCase()}
                        </div>
                      );
                    })()}
                  <div className="flex-1 min-w-0">
                     <span className="text-white text-sm font-medium block truncate">{user.name}</span>
                     {/* Opcional: mostrar email o username pequeño */}
                  </div>

                  <input
                    type="checkbox"
                    readOnly
                    checked={selectedUsers.has(user.key)}
                    className="w-4 h-4 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500 ml-2"
                  />
                </div>
              ))
            )}
          </div>

          <div className="flex justify-between items-center text-xs mb-6 px-1">
            <span className="text-gray-400 uppercase tracking-wider font-semibold">
              {selectedUsers.size} seleccionados
            </span>
            {selectedUsers.size > 0 && (
              <button
                type="button"
                onClick={() => setSelectedUsers(new Set())}
                className="text-red-400 hover:text-red-300 transition"
              >
                Limpiar
              </button>
            )}
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-300 hover:text-white transition"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={selectedUsers.size === 0 || loading}
              className={`px-6 py-2 rounded-lg text-sm font-bold transition ${
                selectedUsers.size === 0 || loading
                  ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                  : "bg-purple-600 text-white hover:bg-purple-500 shadow-lg shadow-purple-900/20"
              }`}
            >
              {loading ? 'Añadiendo...' : 'Añadir al grupo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddMemberModal;