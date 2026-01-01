import Swal from 'sweetalert2';
import { fireStyledAlert, fireToast } from '../utils/alerts'; 

export const useChannelActions = (
  createChannel: (name: string) => void,
  updateChannel: (id: string, name: string) => void,
  deleteChannel: (id: string) => void
) => {

  const handleCreate = async () => {
    const { value: channelName } = await Swal.fire({
      title: "Crear Nuevo Canal",
      input: "text",
      inputPlaceholder: "ej: general",
      background: '#1f2937', 
      color: '#fff',
      confirmButtonColor: '#9333ea', 
      showCancelButton: true,
      confirmButtonText: "Crear",
      customClass: {
        input: 'bg-gray-700 text-white border-gray-600 focus:ring-purple-500 rounded'
      },
      inputValidator: (value) => {
        if (!value?.trim()) return "¡Escribe un nombre!";
        if (value.includes(' ')) return "Sin espacios, usa guiones.";
        return null;
      }
    });

    if (channelName) {
      createChannel(channelName.trim());
      fireToast({ title: `Canal #${channelName} creado`, icon: 'success' });
    }
  };

  const handleUpdate = async (channelId: string, currentName: string) => {
    const cleanName = currentName.replace('#', '');
    const { value: newName } = await Swal.fire({
      title: `Editar ${currentName}`,
      input: "text",
      inputValue: cleanName,
      background: '#1f2937',
      color: '#fff',
      confirmButtonColor: '#9333ea',
      showCancelButton: true,
      confirmButtonText: "Guardar",
      customClass: {
        input: 'bg-gray-700 text-white border-gray-600 focus:ring-purple-500 rounded'
      }
    });

    if (newName && newName.trim() !== "") {
      updateChannel(channelId, newName.trim());
      fireToast({ title: "Actualizado correctamente", icon: 'success' });
    }
  };

  const handleDelete = async (channelId: string, channelName: string) => {
    const result = await fireStyledAlert({
      title: "¿Eliminar canal?",
      text: `Se borrará ${channelName} permanentemente.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar"
    });

    if (result.isConfirmed) {
      deleteChannel(channelId);
      fireToast({ title: "Canal eliminado", icon: 'success' });
    }
  };

  return { handleCreate, handleUpdate, handleDelete };
};