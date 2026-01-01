import { useEffect } from 'react';
import { useChatStore } from '../../store/useChatStore'; 
import type { Tag } from '../../store/types';
import Swal from 'sweetalert2';

export const TagManager = () => {
  const { tags, fetchTags, createTag, deleteTag, updateTag } = useChatStore();

  useEffect(() => {
    fetchTags();
  }, []);

  const handleCreate = async () => {
    const { value: formValues } = await Swal.fire({
      title: 'Nueva Etiqueta',
      html:
        '<input id="swal-input1" class="swal2-input" placeholder="Nombre">' +
        '<input type="color" id="swal-input2" class="swal2-input" value="#3b82f6" style="height:50px; width:100px;">',
      focusConfirm: false,
      preConfirm: () => {
        return [
          (document.getElementById('swal-input1') as HTMLInputElement).value,
          (document.getElementById('swal-input2') as HTMLInputElement).value
        ]
      }
    });

    if (formValues) {
      if(!formValues[0]) return Swal.fire('Error', 'El nombre es obligatorio', 'error');
      await createTag(formValues[0], formValues[1]);
    }
  };

  const handleEdit = async (tag: Tag) => {
    const { value: formValues } = await Swal.fire({
      title: 'Editar Etiqueta',
      html:
        `<input id="swal-input1" class="swal2-input" value="${tag.name}" placeholder="Nombre">` +
        `<input type="color" id="swal-input2" class="swal2-input" value="${tag.color || '#000000'}" style="height:50px; width:100px;">`,
      focusConfirm: false,
      preConfirm: () => {
        return [
          (document.getElementById('swal-input1') as HTMLInputElement).value,
          (document.getElementById('swal-input2') as HTMLInputElement).value
        ]
      }
    });

    if (formValues) {
      await updateTag(tag.uid, formValues[0], formValues[1]);
    }
  }

  return (
    <div className="p-4 bg-gray-800 text-white rounded-lg w-full max-w-md">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold">Gestionar Etiquetas</h3>
        <button 
          onClick={handleCreate}
          className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded text-sm"
        >
          + Crear
        </button>
      </div>

      <div className="space-y-2 max-h-60 overflow-y-auto">
        {tags.map((tag) => (
          <div key={tag.uid} className="flex items-center justify-between bg-gray-700 p-2 rounded">
            <div className="flex items-center gap-2">
              <div 
                className="w-4 h-4 rounded-full" 
                style={{ backgroundColor: tag.color || '#ccc' }}
              />
              <span>{tag.name}</span>
            </div>
            <div className="flex gap-2">
              <button onClick={() => handleEdit(tag)} className="text-gray-300 hover:text-white text-xs">Editar</button>
              <button onClick={() => deleteTag(tag.uid)} className="text-red-400 hover:text-red-300 text-xs">Borrar</button>
            </div>
          </div>
        ))}
        {tags.length === 0 && <p className="text-gray-500 text-center">No hay etiquetas creadas.</p>}
      </div>
    </div>
  );
};