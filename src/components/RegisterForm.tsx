// src/auth/components/RegisterForm.tsx
import React, { useState } from "react";
import { registerUser } from "../auth/services/authService";
import Input from "../components/Input";
import Button from "../components/Button";

const RegisterForm: React.FC = () => {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    try {
      await registerUser(form);
      setMessage("Usuario creado con éxito.");
      setForm({ name: "", email: "", password: "" });
    } catch (err: any) {
      if (err?.message && typeof err.message === "string") {
        setError(err.message);
      } else {
        console.error(err);
        setError(null);
      }
    }
  };

  return (
    <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
      <h2 className="text-2xl font-bold text-blue-600 mb-2">Crea tu cuenta</h2>
      <p className="text-gray-500 mb-6">Únete a nuestra plataforma de gestión (en desarrollo)</p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input type="text" name="name" placeholder="Nombre" value={form.name} onChange={handleChange} />
        <Input type="email" name="email" placeholder="Correo electrónico" value={form.email} onChange={handleChange} />
        <Input type="password" name="password" placeholder="Contraseña" value={form.password} onChange={handleChange} />
        <Button type="submit">Registrarse</Button>
      </form>

      {error && <p className="text-red-500 text-sm mt-2 text-center">{error}</p>}
      {message && <p className="text-green-500 text-sm mt-2 text-center">{message}</p>}

      <p className="text-gray-400 text-xs mt-4 text-center">
        Al registrarte aceptas nuestros Términos y Condiciones
      </p>
    </div>
  );
};

export default RegisterForm;
