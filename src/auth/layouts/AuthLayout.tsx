import { Outlet, useLocation } from "react-router-dom";
import { SistemaLayout } from "../../sistema/layouts/SistemaLayout";

const AuthLayout = () => {
  const location = useLocation();

  let imageSrc = "";
  if (location.pathname.includes("login")) {
    imageSrc = "https://wallpapers.com/images/featured/paisajes-naturales-k9tfch0hpfjbaxel.jpg";
  } else if (location.pathname.includes("register")) {
    imageSrc = "https://images.unsplash.com/photo-1494500764479-0c8f2919a3d8?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cGFpc2FqZSUyMG1vcmFkb3xlbnwwfHwwfHx8MA%3D%3D";
  }

  return (
    <SistemaLayout>
      <div className="min-h-screen flex flex-col md:flex-row bg-gray-100">
      {/* Lado izquierdo: formulario + header */}
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-center text-blue-600">Plataforma Gestión</h1>
        </header>

        <main className="w-full max-w-md">
          <Outlet />
        </main>
      </div>

        {/* Lado derecho: imagen */}
        <div className="flex-1 hidden md:flex items-center justify-center bg-blue-100">
          <img
            src={imageSrc}
            alt="Auth Illustration"
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </SistemaLayout>
  );
};

export default AuthLayout;
