// src/data.ts

// ==========================
// Tipos base
// ==========================
export interface User {
  key: string;
  avatar: string;
  align: 'left' | 'right';
  status: 'active' | 'inactive';
  name: string;
  //  CAMPOS AÑADIDOS PARA EL MODAL DE PERFIL
  description: string;
  last_seen: string; 
}

export interface Friend {
  key: string;
  name: string;
  avatar: string;
  status: string;
  chat: string;
}

export interface Message {
  sender: string;
  name: string;
  text: string;
  time: string;
}

export interface GroupMember {
  key: string;
  name: string;
  avatar: string;
  status: string;
}

// Claves de grupos conocidas
export type GroupKey = 'grupo1' | 'grupo2';

// ==========================
// Datos
// ==========================

export const currentUserKey = 'B';

// OBJETO DE USUARIOS (Con datos completos para el perfil: description y last_seen)
export const users: Record<string, User> = {
  'B': { 
    key: 'B', 
    name: 'Beatriz', 
    avatar: 'https://i.pravatar.cc/40?img=31', 
    status: 'active', 
    align: 'right',
    description: 'Trabajando en mi nueva aplicación de chat, siempre con un café.', 
    last_seen: 'Ahora mismo', 
  },
  'A': { 
    key: 'A', 
    name: 'América', 
    avatar: 'https://i.pravatar.cc/40?img=29', 
    status: 'inactive', 
    align: 'left',
    description: 'Disponible pronto, enviame un DM para soporte.', 
    last_seen: 'Ayer, 18:30', 
  },
  'F': { 
    key: 'F', 
    name: 'Ford', 
    avatar: 'https://i.pravatar.cc/40?img=62', 
    status: 'active', 
    align: 'left',
    description: 'Desarrollador web full-stack. ¡Amante de React!', 
    last_seen: 'Hace 5 minutos', 
  },
  'J': { 
    key: 'J', 
    name: 'James', 
    avatar: 'https://i.pravatar.cc/40?img=33', 
    status: 'inactive', 
    align: 'left',
    description: 'Fuera de la oficina. Volveré el lunes.', 
    last_seen: 'Hace 2 días', 
  },
  'L': { 
    key: 'L', 
    name: 'Lucy', 
    avatar: 'https://i.pravatar.cc/40?img=10', 
    status: 'active', 
    align: 'left',
    description: 'Diseñadora UX/UI, buscando la perfección visual.', 
    last_seen: 'Hace 30 segundos', 
  },
  'BI': { 
    key: 'BI', 
    name: 'Bill', 
    avatar: 'https://i.pravatar.cc/40?img=12', 
    status: 'inactive', 
    align: 'left',
    description: 'Miembro nuevo del equipo. Hola a todos!', 
    last_seen: 'Hace 1 hora', 
  }
};


export const roles: Record<string, Record<string, string>>  = {
  grupo1: { B: 'admin', A: 'member', F: 'member' },
  grupo2: { B: 'moderator', A: 'member', F: 'member' }
};

// Chats Individuales
export const chats: Record<string, Message[]> = {
  America: [
    { sender: 'A', name: 'América', text: 'Hola Beatriz, ¿me puedes ayudar con este bug?', time: '11:00' },
    { sender: 'B', name: 'Beatriz', text: 'Claro, envíame el código.', time: '11:05' },
    { sender: 'B', name: 'Beatriz', text: 'Listo. Te veo en el zoom en 30 minutos.', time: '12:07' },
  ],
  Ford: [
    { sender: 'B', name: 'Beatriz', text: 'El nuevo diseño se ve increíble Ford!', time: '15:00' },
    { sender: 'F', name: 'Ford', text: 'Gracias! Lo terminé esta mañana.', time: '15:05' },
    { sender: 'F', name: 'Ford', text: '¿Hay detalles?', time: '15:15' },
    { sender: 'B', name: 'Beatriz', text: 'Para nada! Está muy bien.', time: '15:42' },
  ],
  Bill: [
    { sender: 'BI', name: 'Bill', text: 'El código ya funciona!', time: '11:00' },
    { sender: 'B', name: 'Beatriz', text: 'Gracias! Lo reviso.', time: '13:12' },
  ],
James: [
    { sender: 'J', name: 'James', text: 'La reunión comienza a las 13:30', time: '12:00' },
    { sender: 'B', name: 'Beatriz', text: 'Gracias, le avisaré a los demas.', time: '12:17' },
    { sender: 'J', name: 'James', text: 'En el grupo general! Ahí todos lo veremos!', time: '12:20' },
  ],
  // ... (otros chats directos)
};

// Miembros de grupos (para la barra lateral derecha)
export const groupMembersData: Record<string, GroupMember[]> = {
  grupo1: [
    // La información de estos miembros debería ser un subset de 'users'
    { key: 'B', name: 'Beatriz', avatar: 'https://i.pravatar.cc/40?img=31', status: 'active' },
    { key: 'A', name: 'América', avatar: 'https://i.pravatar.cc/40?img=29', status: 'inactive' },
    { key: 'F', name: 'Ford', avatar: 'https://i.pravatar.cc/40?img=62', status: 'active' },
  ],
  grupo2: [
    { key: 'B', name: 'Beatriz', avatar: 'https://i.pravatar.cc/40?img=31', status: 'moderator' },
    { key: 'J', name: 'James', avatar: 'https://i.pravatar.cc/40?img=33', status: 'inactive' },
    { key: 'L', name: 'Lucy', avatar: 'https://i.pravatar.cc/40?img=10', status: 'active' },
  ]
};

// Estructura de chats para canales dentro de grupos (GroupKey -> ChannelName -> Messages[])
export const channelChats: Record<string, Record<string, Message[]>> = {
  grupo1: {
    general: [
      { sender: 'B', name: 'Beatriz', text: '¡Hola a todos! Este es el canal general.', time: '09:00' },
      { sender: 'A', name: 'América', text: 'Buenos días. ¿Empezamos con el proyecto?', time: '09:05' },
      { sender: 'B', name: 'Beatriz', text: 'Por supuesto, les comparto el link del Zoom.', time: '09:08' },
      { sender: 'F', name: 'Ford', text: 'Listo, ¿aún no añaden a Bill al grupo?', time: '10:15' },
      { sender: 'B', name: 'Beatriz', text: 'Ups..', time: '10:16' },
    ],
    desarrollo: [
      { sender: 'F', name: 'Ford', text: 'He subido el nuevo branch a GitHub.', time: '10:15' },
      { sender: 'B', name: 'Beatriz', text: 'Perfecto, lo reviso ahora.', time: '10:20' },
      { sender: 'F', name: 'Ford', text: 'Te di los permisos, deberías poder acceder.', time: '10:22' },
      { sender: 'B', name: 'Beatriz', text: 'Listo!', time: '10:25' },
    ],
  },
  grupo2: {
    general: [
      { sender: 'B', name: 'Beatriz', text: 'Bienvenidos al grupo de Diseño.', time: '14:00' },
      { sender: 'L', name: 'Lucy', text: 'Tengo un prototipo listo para mostrar.', time: '14:30' },
      { sender: 'L', name: 'Lucy', text: 'Espera, falta James!', time: '14:32' },
    ],
  },
};

// Descripciones de Canales
export const channelDescriptions: Record<string, Record<string, string>> = {
  grupo1: {
    general: 'Discusiones generales del proyecto.',
    desarrollo: 'Temas técnicos y código.',
  },
  grupo2: {
    general: 'Canal de ideas y diseño UX/UI.',
  },
};

// Lista de amigos (para el Sidebar)
export const friendsList: Friend[] = [
  { key: 'A', name: 'América', avatar: 'https://i.pravatar.cc/40?img=29', status: 'offline', chat: 'America' },
  { key: 'F', name: 'Ford', avatar: 'https://i.pravatar.cc/40?img=62', status: 'active', chat: 'Ford' },
  { key: 'J', name: 'James', avatar: 'https://i.pravatar.cc/40?img=33', status: 'offline', chat: 'James' },
  { key: 'L', name: 'Lucy', avatar: 'https://i.pravatar.cc/40?img=10', status: 'active', chat: 'Lucy' },
];


