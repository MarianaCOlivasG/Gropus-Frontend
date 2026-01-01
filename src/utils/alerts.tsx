import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import type { SweetAlertIcon } from 'sweetalert2';

const MySwal = withReactContent(Swal);
const style = document.createElement('style');
style.innerHTML = `
  .swal2-timer-progress-bar { background-color: #a855f7 !important; }
  .swal2-popup { border: 1px solid #374151 !important; } /* Borde sutil */
`;
document.head.appendChild(style);

// Configuración de colores oscuros 
const darkConfig = {
  background: '#1f2937', 
  color: '#f3f4f6',     
  confirmButtonColor: '#9333ea', 
  cancelButtonColor: '#ef4444',
};

export const fireStyledAlert = async (options: { 
  title: string; 
  text?: string; 
  icon?: SweetAlertIcon; 
  showCancelButton?: boolean; 
  confirmButtonText?: string; 
}) => {
  return MySwal.fire({
    title: options.title,
    text: options.text,
    icon: options.icon,
    
    // Colores
    background: darkConfig.background,
    color: darkConfig.color,
    confirmButtonColor: darkConfig.confirmButtonColor,
    cancelButtonColor: darkConfig.cancelButtonColor,
    
    // Opciones
    showCancelButton: options.showCancelButton,
    confirmButtonText: options.confirmButtonText || 'Entendido',
    cancelButtonText: 'Cancelar',
    
    // Estilo redondeado
    customClass: {
      popup: 'rounded-xl shadow-2xl',
      confirmButton: 'px-6 py-2 rounded-lg font-bold',
      cancelButton: 'px-6 py-2 rounded-lg'
    }
  });
};

export const fireToast = (options: { title: string; icon?: SweetAlertIcon }) => {
  const Toast = Swal.mixin({
    toast: true,
    position: 'bottom-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true, 
    background: '#1f2937', // bg-gray-800
    color: '#fff',
    didOpen: (toast) => {
      toast.onmouseenter = Swal.stopTimer;
      toast.onmouseleave = Swal.resumeTimer;
    }
  });

  Toast.fire({
    icon: options.icon || 'success',
    title: options.title
  });
};