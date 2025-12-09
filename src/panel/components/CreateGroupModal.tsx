import React, { useState, useRef } from "react";

interface NewGroupData {
  groupName: string;
  groupDescription: string;
  groupImage: string | null;
}

interface CreateGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateGroup: (data: NewGroupData) => void;
}

const CreateGroupModal: React.FC<CreateGroupModalProps> = ({
  isOpen,
  onClose,
  onCreateGroup,
}) => {
  const [groupName, setGroupName] = useState("");
  const [groupDescription, setGroupDescription] = useState("");
  const [groupImage, setGroupImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("La imagen es demasiado grande. Máximo 5MB.");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setGroupImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (groupName.trim() === "") {
      alert("Por favor, ingresa un nombre para el grupo.");
      return;
    }

    onCreateGroup({
      groupName: groupName.trim(),
      groupDescription: groupDescription.trim(),
      groupImage,
    });

    setGroupName("");
    setGroupDescription("");
    setGroupImage(null);
    onClose();
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
        <h2 className="text-xl font-bold mb-4 text-white">Crear Nuevo Grupo</h2>

        <form onSubmit={handleSubmit}>
          {/* Imagen del grupo */}
          <div className="flex flex-col items-center mb-4">
            <div
              className="w-20 h-20 rounded-full bg-gray-700 flex items-center justify-center text-gray-400 cursor-pointer overflow-hidden mb-2"
              onClick={() => fileInputRef.current?.click()}
            >
              {groupImage ? (
                <img
                  src={groupImage}
                  alt="Avatar del Grupo"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-sm">Logo</span>
              )}
            </div>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageChange}
              accept="image/*"
              className="hidden"
            />

            <span className="text-xs text-gray-400">
              Clic para subir imagen
            </span>
          </div>

          {/* Nombre */}
          <label
            htmlFor="groupName"
            className="block text-sm font-medium text-gray-400 mb-1"
          >
            Nombre del Grupo <span className="text-red-500">*</span>
          </label>

          <input
            id="groupName"
            type="text"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            placeholder="Ej: Proyecto Alfa"
            required
            className="w-full p-2 mb-4 rounded bg-gray-700 text-gray-200 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />

          {/* Descripción */}
          <label
            htmlFor="groupDescription"
            className="block text-sm font-medium text-gray-400 mb-1"
          >
            Descripción
          </label>

          <textarea
            id="groupDescription"
            value={groupDescription}
            onChange={(e) => setGroupDescription(e.target.value)}
            placeholder="Una breve descripción de tu grupo..."
            rows={2}
            className="w-full p-2 mb-6 rounded bg-gray-700 text-gray-200 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
          />

          {/* Botones */}
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
              className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition"
              disabled={groupName.trim() === ""}
            >
              Crear Grupo
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateGroupModal;
