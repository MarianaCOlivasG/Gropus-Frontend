import React, { useState } from 'react';

interface User {
  id: string;
  name: string;
  tag: string;
  avatar: string;
}

interface AddFriendModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddFriend: (friendName: string) => void;
}

const ALL_USERS: User[] = [
  { id: 'user1', name: 'America', tag: '#1234', avatar: 'https://i.pravatar.cc/40?img=29' },
  { id: 'user2', name: 'Bill', tag: '#5678', avatar: 'https://i.pravatar.cc/150?img=12' },
  { id: 'user3', name: 'Ford', tag: '#9012', avatar: 'https://i.pravatar.cc/40?img=62' },
  { id: 'user4', name: 'Lucy', tag: '#3456', avatar: 'https://i.pravatar.cc/150?img=10' },
  { id: 'user5', name: 'James', tag: '#123', avatar: 'https://i.pravatar.cc/150?img=33' },
];

const AddFriendModal: React.FC<AddFriendModalProps> = ({ isOpen, onClose, onAddFriend }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // BÚSQUEDA COMO VALOR CALCULADO
  const term = searchTerm.toLowerCase().trim();

  const filteredUsers = term.length >= 2
    ? ALL_USERS.filter(user =>
        user.name.toLowerCase().includes(term) ||
        user.tag.includes(term)
      ).slice(0, 5)
    : [];

  // Lógica de selección exacta
  const exactMatch = ALL_USERS.find(user =>
    (user.name.toLowerCase() + user.tag).includes(term)
  );

  // Función de reseteo
  const handleClose = () => {
    setSearchTerm('');
    setSelectedUser(null);
    onClose();
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const finalSelectedUser = selectedUser || (exactMatch && term.includes('#') ? exactMatch : null);

    if (!finalSelectedUser) {
      alert("Por favor, selecciona un usuario de la lista.");
      return;
    }

    onAddFriend(finalSelectedUser.name);
    handleClose();
  };

  const handleSelectUser = (user: User) => {
    setSelectedUser(user);
    setSearchTerm(`${user.name}${user.tag}`);
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50"
      onClick={handleClose}
    >
      <div
        className="bg-gray-800 p-8 rounded-xl w-full max-w-sm relative shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-red-500 text-xl transition"
        >
          &times;
        </button>

        <h3 className="text-2xl font-bold text-gray-100 mb-5 border-b border-gray-700 pb-2">
          📧 Añadir Amigo
        </h3>

        <p className="text-gray-400 mb-4 text-sm">
          Busca a un usuario por nombre o ID (Ej: JuanPerez#1234).
        </p>

        <form onSubmit={handleSubmit}>
          <div className="relative">
            <input
              type="text"
              placeholder="Nombre o ID de usuario..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setSelectedUser(null);
              }}
              className="w-full p-3 mb-2 rounded-lg bg-gray-700 text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              autoFocus
            />

            {filteredUsers.length > 0 && (
              <div className="w-full bg-gray-700 rounded-lg shadow-lg max-h-48 overflow-y-auto mb-2 border border-gray-600">
                {filteredUsers.map((user) => (
                  <div
                    key={user.id}
                    onClick={() => handleSelectUser(user)}
                    className="flex items-center space-x-3 p-3 cursor-pointer hover:bg-gray-600 transition"
                  >
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-8 h-8 rounded-full"
                    />
                    <div>
                      <p className="font-semibold text-gray-100">{user.name}</p>
                      <p className="text-xs text-gray-400">{user.tag}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {(selectedUser || (exactMatch && term.includes('#'))) && (
            <div className="flex items-center space-x-3 p-3 bg-indigo-900 bg-opacity-30 rounded-lg mb-4 mt-4 border border-indigo-500">
              <p className="text-sm font-semibold text-indigo-400">Seleccionado:</p>
              <img
                src={(selectedUser || exactMatch)!.avatar}
                alt={(selectedUser || exactMatch)!.name}
                className="w-6 h-6 rounded-full"
              />
              <p className="font-semibold text-gray-100">{(selectedUser || exactMatch)!.name}</p>
              <p className="text-xs text-gray-400">{(selectedUser || exactMatch)!.tag}</p>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-500 transition duration-200"
            disabled={!selectedUser && !(exactMatch && term.includes('#'))}
          >
            Enviar Solicitud
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddFriendModal;


