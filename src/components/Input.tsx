import React from "react";

interface InputProps {
  type: string;
  name: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  label?: string;
  error?: string; 
}

const Input: React.FC<InputProps> = ({
  type,
  name,
  placeholder,
  value,
  onChange,
  label,
  error,
}) => {
  return (
    <div className="flex flex-col gap-1 w-full">
      {label && (
        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide ml-1">
          {label}
        </label>
      )}
      
      <input
        type={type}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={`w-full bg-[#202225] text-white p-3 rounded-md outline-none transition-all border-2 
          ${error 
            ? "border-red-500 focus:border-red-500" 
            : "border-transparent focus:border-indigo-500"
          }`}
      />
      
      {error && (
        <span className="text-red-400 text-xs ml-1 animate-pulse">
          {error}
        </span>
      )}
    </div>
  );
};

export default Input;
