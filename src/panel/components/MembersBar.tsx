import React from "react";
import { roles, currentUserKey } from "../data";

// 🔹 Tipos auxiliares
export interface Member {
  key: string;
  name: string;
  avatar: string;
  status: "active" | "inactive" | string;
}

export type Role = "admin" | "moderator" | "member" | string;
export type GroupKey = keyof typeof roles;

// 🔹 Props del componente
interface MembersBarProps {
  members: Member[];
  groupKey: GroupKey;
  openAddMemberModal: () => void;
  openUserProfile: (key: string) => void;
}

const MembersBar: React.FC<MembersBarProps> = ({
  members,
  groupKey,
  openAddMemberModal,
  openUserProfile,
}) => {
  const myRole = (roles[groupKey] || {})[currentUserKey] as Role | undefined;
  const isAdmin = myRole === "admin";

  const roleBadgeFor = (key: string) => {
    const r = (roles[groupKey] || {})[key] as Role | undefined;
    if (!r) return null;

    const badgeClass =
      r === "admin"
        ? "bg-yellow-500 text-gray-900"
        : r === "moderator"
        ? "bg-blue-600 text-white"
        : "bg-gray-600 text-white";

    return (
      <span
        className={`ml-2 text-xs px-2 py-0.5 rounded-full font-semibold flex-shrink-0 ${badgeClass}`}
      >
        {r}
      </span>
    );
  };

  return (
    <div
      id="groupMembers"
      className="w-56 bg-gray-800 border-l border-gray-700 p-4 flex flex-col space-y-4 overflow-y-auto"
    >
      <div className="flex items-center justify-between mb-2">
        <div className="text-gray-300 font-semibold">
          Miembros ({members ? members.length : 0})
        </div>
        {isAdmin && (
          <button
            id="openAddMember"
            onClick={openAddMemberModal}
            className="bg-green-600 hover:bg-green-700 px-2 py-1 rounded text-sm"
          >
            ➕ Añadir
          </button>
        )}
      </div>

      {members &&
        members.map((m) => {
          const statusColor =
            m.status === "active" ? "bg-green-500" : "bg-gray-500";
          return (
            <div
              key={m.key}
              className="flex items-center space-x-3 p-1 rounded hover:bg-gray-700 cursor-pointer transition"
              onClick={() => openUserProfile(m.key)}
            >
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                <img
                  src={m.avatar}
                  className="w-10 h-10 rounded-full"
                  alt={m.name}
                />
                <span
                  className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-gray-800 ${statusColor}`}
                ></span>
              </div>

              {/* Nombre + Estado */}
              <div className="flex flex-col overflow-hidden leading-tight">
                <div className="flex items-center text-sm font-medium whitespace-nowrap">
                  <div className="truncate text-gray-200">{m.name}</div>
                  {roleBadgeFor(m.key)}
                </div>

                <div className="text-gray-400 text-xs truncate">
                  Estado: {m.status === "active" ? "En línea" : "Desconectado"}
                </div>
              </div>
            </div>
          );
        })}
    </div>
  );
};

export default MembersBar;

