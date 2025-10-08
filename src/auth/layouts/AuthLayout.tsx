
//import React from "react";
import { Outlet } from "react-router-dom";

const AuthLayout = () => {
    return (
        <div className="auth-layout">
            {/* Aquí puedes poner header, sidebar, etc. */}
            <header>
                <h1>Plataforma Gestión</h1>
            </header>

            {/* Render de las rutas hijas */}
            <main>
                <Outlet />
            </main>
        </div>
    );
};

export default AuthLayout;
