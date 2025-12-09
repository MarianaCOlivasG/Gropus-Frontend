import React, { useState } from "react";
import AuthForm from "../components/AuthForm";
import { loginUser } from "../auth/services/authService";
import { useNavigate } from "react-router-dom";

const LoginForm: React.FC = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    try {
      const data = await loginUser(form);

      
      localStorage.setItem("token", data.accessToken);
      localStorage.setItem("uid", data.user.uid);

      setMessage("Inicio de sesión exitoso.");

      setTimeout(() => {
        navigate("/panel");
      }, 1500);

    } catch (err: any) {
      setError(err?.message || "Error al iniciar sesión.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthForm
      title="Inicia sesión"
      description="Bienvenido de nuevo"
      fields={[
        { name: "email", type: "email", placeholder: "Correo electrónico", value: form.email },
        { name: "password", type: "password", placeholder: "Contraseña", value: form.password },
      ]}
      onChange={handleChange}
      onSubmit={handleSubmit}
      submitText={loading ? "Verificando..." : "Ingresar"}
      message={message}
      error={error}
    />
  );
};

export default LoginForm;


