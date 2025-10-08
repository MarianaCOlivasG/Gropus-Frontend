import React, { useState } from "react";
import { registerUser } from "../../services/authService";
import "./RegisterPage.css";

const RegisterPage: React.FC = () => {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Maneja los cambios en los inputs
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Envía el formulario
  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError(null);
  setMessage(null);

  try {
    await registerUser(form);
    setMessage("Usuario creado con éxito.");
    setForm({ name: "", email: "", password: "" });
  } catch (err: any) {
    // Solo mostramos el mensaje si existe
    if (err?.message && typeof err.message === "string") {
      setError(err.message);
    } else {
      // Para cualquier otro error que no sea string, no mostrar nada
      console.error(err); // Solo en consola para depuración
      setError(null);
    }
  }
};

  return (
    <div className="register-container">
      <div className="register-card">
        <h2>Crea tu cuenta</h2>
        <p>Únete a nuestra plataforma de gestión (en desarrollo)</p>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="name"
            placeholder="Nombre"
            value={form.name}
            onChange={handleChange}
          />
          <input
            type="email"
            name="email"
            placeholder="Correo electrónico"
            value={form.email}
            onChange={handleChange}
          />
          <input
            type="password"
            name="password"
            placeholder="Contraseña"
            value={form.password}
            onChange={handleChange}
          />
          <button type="submit">Registrarse</button>
        </form>

        {/* Mensajes dinámicos */}
        {error && <p className="message-error">{error}</p>}
        {message && <p className="message-success">{message}</p>}

        <p style={{ fontSize: "12px", marginTop: "15px", color: "#888" }}>
          Al registrarte aceptas nuestros Términos y Condiciones
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;




