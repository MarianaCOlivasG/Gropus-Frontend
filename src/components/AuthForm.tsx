import React from "react";
import { Link } from "react-router-dom";
import Input from "./Input";
import Button from "./Button";


interface AuthFormProps {
  title: string;
  description?: string;
  log?: boolean;
  disabled?: boolean;
  
  fields: { 
    name: string; 
    type: string; 
    label: string;
    placeholder: string; 
    value: string; 
    error?: string; 
  }[];
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  submitText: string;
  message?: string | null;
  error?: string | null;
}

const AuthForm: React.FC<AuthFormProps> = ({
  title,
  description,
  log,
  fields,
  onChange,
  onSubmit,
  submitText,
  message,
  error,
}) => {
  return (

    <div className="bg-[#2f3136] p-8 rounded-2xl shadow-lg w-full max-w-md">
      
      <h2 className="text-3xl font-bold text-center text-white mb-2">{title}</h2>
      
      {description && <p className="text-gray-400 text-center mb-8">{description}</p>}

      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
        {fields.map((f) => (
          <Input
            key={f.name}
            type={f.type}
            name={f.name}
            placeholder={f.placeholder}
            value={f.value}
            onChange={onChange}
            label={f.label}
            error={f.error} 
          />
        ))}
        <div className="mt-2">
            <Button type="submit">{submitText}</Button>
        </div>
        <div className="text-center mt-4 text-sm text-gray-400">
          {log ? (
            <p>
              ¿No tienes una cuenta?{" "}
              <Link to="/auth/register" className="text-blue-400 hover:text-blue-300 hover:underline transition-colors">
                Regístrate ahora.
              </Link>
            </p>
          ) : (
            <p>
              ¿Ya tienes una cuenta?{" "}
              <Link to="/auth/login" className="text-blue-400 hover:text-blue-300 hover:underline transition-colors">
                Inicia sesión aquí.
              </Link>
            </p>
          )}
        </div>
      </form>

      {!log && (
        <p className="text-gray-500 text-xs mt-6 text-center">
          Al registrarte aceptas nuestros Términos y Condiciones
        </p>
      )}

      {error && <p className="text-red-400 text-sm mt-4 text-center bg-red-500/10 p-3 rounded-lg border border-red-500/20">{error}</p>}
      {message && <p className="text-green-400 text-sm mt-4 text-center bg-green-500/10 p-3 rounded-lg border border-green-500/20">{message}</p>}
    </div>
  );
};

export default AuthForm;
