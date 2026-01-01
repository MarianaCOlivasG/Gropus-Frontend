import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../auth/services/authService";
import AuthForm from "./AuthForm"; 

const RegisterForm: React.FC = () => {
  
    const [form, setForm] = useState({ name: "", email: "", password: "" });
    const [fieldErrors, setFieldErrors] = useState<{ name?: string; email?: string; password?: string }>({});
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate(); 

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm({ ...form, [e.target.name]: e.target.value });
      if (fieldErrors[e.target.name as keyof typeof fieldErrors]) {
        setFieldErrors({ ...fieldErrors, [e.target.name]: "" });
      }
    };

    const validateForm = () => {
      const errors: { name?: string; email?: string; password?: string } = {};
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!form.name.trim()) errors.name = "El nombre es obligatorio.";
      
      if (!form.email) {
        errors.email = "El correo es obligatorio.";
      } else if (!emailRegex.test(form.email)) {
        errors.email = "Ingresa un correo válido.";
      }

      if (!form.password) {
        errors.password = "La contraseña es obligatoria.";
      } else if (form.password.length < 8) {
        errors.password = "Debe tener al menos 8 caracteres.";
      }

      setFieldErrors(errors);
      return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);
      setMessage(null);

      if (!validateForm()) return;

      try {
        await registerUser(form);
        setMessage("Usuario creado con éxito.");
        setForm({ name: "", email: "", password: "" });
        setTimeout(() => {
          navigate("/panel");
        }, 1500);
      } catch (err: any) {
        setError(err?.message || "Ocurrió un error al registrarse.");
      }
    };

    return (
      <div className="w-full flex justify-center">
        <AuthForm
          title="Crea tu cuenta"
          description="Únete a nuestra plataforma de gestión"
          log={false} 
          fields={[
            { 
              name: "name", 
              type: "text",
              label: "Nombre", 
              placeholder: "Nombre completo", 
              value: form.name, 
              error: fieldErrors.name 
            },
            { 
              name: "email", 
              type: "email", 
              label: "Correo electrónico",
              placeholder: "Correo electrónico", 
              value: form.email, 
              error: fieldErrors.email 
            },
            { 
              name: "password", 
              type: "password", 
              label: "Contraseña",
              placeholder: "Contraseña", 
              value: form.password, 
              error: fieldErrors.password 
            },
          ]}
          onChange={handleChange}
          onSubmit={handleSubmit}
          submitText="Registrarse"
          message={message}
          error={error}
        />
      </div>
    );
};

export default RegisterForm;