export interface RegisterForm {
  name: string;
  email: string;
  password: string;
}

export const registerUser = async (formData: RegisterForm) => {
  const res = await fetch("http://localhost:3501/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(formData),
  });

  const data = await res.json();

  if (!res.ok) {
    // Mostrar solo el mensaje que viene del backend
    if (data.message) {
      throw new Error(data.message);
    } else if (data.error) {
      // Para arrays o strings en 'error'
      if (typeof data.error === "string") throw new Error(data.error);
      if (Array.isArray(data.error)) throw new Error(data.error.join("\n"));
    }
    // Si viene otro objeto raro, no mostrar nada
    console.error(data);
    throw new Error("");
  }

  return data;
};



