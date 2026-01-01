import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({ children, ...props }) => {
  return (
    <button
      {...props}
      className="bg-[#5865F2] text-white text-lg px-6 py-3 rounded-md hover:bg-[#4752c4] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-semibold w-full shadow-sm active:scale-[0.98]"
    >
      {children}
    </button>
  );
};

export default Button;
