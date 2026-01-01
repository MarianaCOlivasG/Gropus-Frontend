import { Outlet } from "react-router-dom";
import ParticlesBackground from "../../components/ui/ParticlesBackground"; 

const AuthLayout = () => {

  return (
    
      <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-[#1a1a1a]">
        
        <ParticlesBackground />

        {/* Header */}
        <header className="mb-8 z-10 relative">
          <h1 className="text-3xl font-bold text-center text-white">
            Plataforma Gestión
          </h1>
        </header>

        <main className="w-full max-w-md px-4 z-10 relative">
          <Outlet />
        </main>

      </div>
    
  );
};

export default AuthLayout;
