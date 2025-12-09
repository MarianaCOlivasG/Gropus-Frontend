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

export const roles: Record<string, Record<string, string>>  = {
  grupo1: { B: 'admin', A: 'member', F: 'member' },
  grupo2: { B: 'moderator', A: 'member', F: 'member' }
};

export const chats: Record<string, Message[]> = {
  beatriz: [
    { sender: 'B', name: 'Beatriz', text: 'Hola, ¿cómo va todo?', time: '10:00' },
    { sender: 'A', name: 'América', text: 'Todo bien, ¿y tú?', time: '10:01' }
  ],
  america: [
    { sender: 'A', name: 'América', text: 'Hey, ¿lista para el proyecto?', time: '11:00' }
  ],
  james: [
    { sender: 'J', name: 'James', text: 'Hola! Vendra Lucy?', time: '12:00' }
  ],
  lucy: [
    { sender: 'L', name: 'Lucy', text: 'Buenas tardes! No creo llegar esta mañana!', time: '09:00' }
  ],
  bill: [
    { sender: 'BI', name: 'Bill', text: 'Mañana por la tarde es la reunión para hablar sobre ese tema, no lo olvides!', time: '07:00' }
  ],
  grupo1: [
    { sender: 'B', name: 'Beatriz', text: 'Hola grupo!', time: '09:30' },
    { sender: 'A', name: 'América', text: 'Hola Beatriz!', time: '09:31' },
    { sender: 'F', name: 'Ford', text: 'Hola a todos', time: '09:32' }
  ],
  grupo2: [
    { sender: 'A', name: 'América', text: 'Vamos a estudiar?', time: '12:00' },
    { sender: 'F', name: 'Ford', text: 'Sí, claro!', time: '12:01' }
  ]
};

export const channelChats: Record<string, Record<string, Message[]>> = {
  grupo1: {
    '#general': [
      { sender: 'B', name: 'Beatriz', text: 'Bienvenidos al canal general!', time: '09:00' },
      { sender: 'A', name: 'América', text: 'Hola a todos!', time: '09:01' }
    ],
    '#proyectos': [
      { sender: 'B', name: 'Beatriz', text: 'Tenemos que entregar la práctica mañana.', time: '10:00' }
    ],
    '#memes': [
      { sender: 'F', name: 'Ford', text: '¿Alguien vio el meme del gato?', time: '11:00' }
    ]
  },
  grupo2: {
    '#general': [
      { sender: 'A', name: 'América', text: 'Vamos a estudiar?', time: '12:00' }
    ],
    '#proyectos': [
      { sender: 'F', name: 'Ford', text: 'Sí, listo para el proyecto!', time: '12:01' }
    ],
    '#memes': [
      { sender: 'A', name: 'América', text: 'Miren este meme que encontré!', time: '12:05' }
    ]
  }
};

export const users: Record<string, User> = {
  B: { key: 'B', avatar: 'https://i.pravatar.cc/40?img=1', align: 'right', status: 'active', name: 'Beatriz' },
  A: { key: 'A', avatar: 'https://i.pravatar.cc/40?img=2', align: 'left', status: 'inactive', name: 'América' },
  L: { key: 'L', avatar: 'https://i.pravatar.cc/40?img=5', align: 'left', status: 'inactive', name: 'Lucy' },
  BI: { key: 'BI', avatar: 'https://i.pravatar.cc/40?img=12', align: 'left', status: 'active', name: 'Bill' },
  F: { key: 'F', avatar: 'https://i.pravatar.cc/40?img=3', align: 'left', status: 'active', name: 'Ford' }
};

export const friendsList: Friend[] = [
  { key: 'B', name: 'Beatriz', avatar: 'https://i.pravatar.cc/40?img=1', status: 'active', chat: 'beatriz' },
  { key: 'A', name: 'América', avatar: 'https://i.pravatar.cc/40?img=2', status: 'inactive', chat: 'america' },
  { key: 'F', name: 'Ford', avatar: 'https://i.pravatar.cc/40?img=3', status: 'active', chat: 'ford' },
  { key: 'J', name: 'James', avatar: 'https://i.pravatar.cc/40?img=4', status: 'active', chat: 'james' },
  { key: 'L', name: 'Lucy', avatar: 'https://i.pravatar.cc/40?img=5', status: 'active', chat: 'lucy' },
  { key: 'BI', name: 'Bill', avatar: 'https://i.pravatar.cc/40?img=12', status: 'inactive', chat: 'bill' }
];

export const groupMembersData: Record<string, GroupMember[]> = {
  grupo1: [
    { key: 'B', name: 'Beatriz', avatar: 'https://i.pravatar.cc/40?img=1', status: 'active' },
    { key: 'A', name: 'América', avatar: 'https://i.pravatar.cc/40?img=2', status: 'inactive' },
    { key: 'F', name: 'Ford', avatar: 'https://i.pravatar.cc/40?img=3', status: 'active' }
  ],
  grupo2: [
    { key: 'A', name: 'América', avatar: 'https://i.pravatar.cc/40?img=2', status: 'inactive' },
    { key: 'F', name: 'Ford', avatar: 'https://i.pravatar.cc/40?img=3', status: 'active' }
  ]
};

export const channelDescriptions: Record<string, string> = {
  '#general': 'Canal principal del grupo. Aquí se hablan cosas generales.',
  '#proyectos': 'Espacio para coordinar tareas, ideas y avances del equipo.',
  '#memes': 'Solo diversión. Comparte tus mejores memes ✨'
};
