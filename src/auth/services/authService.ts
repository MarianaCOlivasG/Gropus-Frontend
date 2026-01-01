export interface RegisterForm {
  name: string;
  email: string;
  password: string;
}

export interface LoginForm {
  email: string;
  password: string;
}
const API_URL = import.meta.env?.VITE_API_URL;
// Registro
export const registerUser = async (formData: RegisterForm) => {

  const res = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(formData),
  });

  const data = await res.json();

    if (!res.ok) {
      if (data.message) throw new Error(data.message);
      if (data.error) {
        if (typeof data.error === "string") throw new Error(data.error);
        if (Array.isArray(data.error)) throw new Error(data.error.join("\n"));
      }
      console.error(data);
      throw new Error("");
    }

    if (data.accessToken) {
      localStorage.setItem("token", data.accessToken);
    } else {
      console.warn("El backend no devolvió accessToken");
    }

  return data;
};

// Login
export const loginUser = async (formData: LoginForm) => {

  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(formData),
  });

  const data = await res.json();

    if (!res.ok) {
      if (data.message) throw new Error(data.message);
      if (data.error) {
        if (typeof data.error === "string") throw new Error(data.error);
        if (Array.isArray(data.error)) throw new Error(data.error.join("\n"));
      }
      console.error(data);
      throw new Error("");
    }

    if (data.accessToken) {
      localStorage.setItem("token", data.accessToken);
    } else {
      console.warn("El backend no devolvió accessToken");
    }

  return data;
};





