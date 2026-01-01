import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../auth/services/authService";
import AuthForm from "../components/AuthForm";

const LoginForm: React.FC = () => {

    const navigate = useNavigate();
    const [form, setForm] = useState({ email: "", password: "" });
    const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});
    
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null); 
    const [loading, setLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm({ ...form, [e.target.name]: e.target.value });
      
      
      if (fieldErrors[e.target.name as keyof typeof fieldErrors]) {
        setFieldErrors({ ...fieldErrors, [e.target.name]: "" });
      }
    };

    
    const validateForm = () => {
      const errors: { email?: string; password?: string } = {};
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; 

      if (!form.email) {
        errors.email = "El correo es obligatorio.";
      } else if (!emailRegex.test(form.email)) {
        errors.email = "Ingresa un correo válido (ej: usuario@gmail.com).";
      }

      if (!form.password) {
        errors.password = "La contraseña es necesaria.";
      }

      setFieldErrors(errors);
      return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);
      setMessage(null);

      // Validación 
      if (!validateForm()) {
        return; 
      }

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
        log={true}
        submitText={loading ? "Verificando..." : "Ingresar"}
        message={message}
        error={error} 
      />
    );

};

export default LoginForm;


