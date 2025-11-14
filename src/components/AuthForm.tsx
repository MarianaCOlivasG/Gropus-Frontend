import React from "react";
import Input from "./Input";
import Button from "./Button";

interface AuthFormProps {
  title: string;
  description?: string;
  fields: { name: string; type: string; placeholder: string; value: string }[];
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  submitText: string;
  message?: string | null;
  error?: string | null;
}

const AuthForm: React.FC<AuthFormProps> = ({
  title,
  description,
  fields,
  onChange,
  onSubmit,
  submitText,
  message,
  error,
}) => {
  return (
    <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
      <h2 className="text-2xl font-bold text-blue-600 mb-2">{title}</h2>
      {description && <p className="text-gray-500 mb-6">{description}</p>}

      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        {fields.map((f) => (
          <Input
            key={f.name}
            type={f.type}
            name={f.name}
            placeholder={f.placeholder}
            value={f.value}
            onChange={onChange}
          />
        ))}
        <Button type="submit">{submitText}</Button>
      </form>

      {error && <p className="text-red-500 text-sm mt-2 text-center">{error}</p>}
      {message && <p className="text-green-500 text-sm mt-2 text-center">{message}</p>}
    </div>
  );
};

export default AuthForm;
