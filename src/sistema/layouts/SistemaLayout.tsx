import { Outlet } from "react-router-dom";
import React from "react";

interface SistemaLayoutProps {
  children?: React.ReactNode;
}

export const SistemaLayout: React.FC<SistemaLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <header className="bg-white shadow-md text-white py-4 px-8 flex justify-between items-center">
        <h1 className="text-xl font-bold text-gray-800">Logo Empresa</h1>
        <nav className="space-x-6 text-gray-700 font-medium hidden md:flex">
          <a href="/" className="hover:text-blue-500">
            Inicio
          </a>
          <a href="/nosotros" className="hover:text-blue-500">
            Nosotros
          </a>
          <a href="/contacto" className="hover:text-blue-500">
            Contacto
          </a>
        </nav>
      </header>

      <main className="flex-1 p-8">
        {children || <Outlet />}
      </main>

      <footer className="bg-gray-200 text-center py-4 mt-8 text-sm text-gray-600">
        © 2025 Sistema de Gestión — Todos los derechos reservados
      </footer>
    </div>
  );
};
