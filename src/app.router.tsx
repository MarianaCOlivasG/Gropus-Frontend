import { createBrowserRouter, Navigate, redirect } from "react-router-dom"; 
import { lazy, Suspense } from "react";
import { SistemaLayout } from "./sistema/layouts/SistemaLayout";
import { HomePage } from "./sistema/pages/home/HomePage";
import AuthLayout from "./auth/layouts/AuthLayout"; 
import LoginPage from "./auth/pages/login/LoginPage"; 
import RegisterPage from "./auth/pages/register/RegisterPage";
 
const PanelPage = lazy(() => import("./sistema/pages/panel/PanelPage"));

const publicLoader = async () => {
  const token = localStorage.getItem('token');
  if (token) return redirect('/panel');
  return null;
};

const protectedLoader = async () => {
  const token = localStorage.getItem('token');
  if (!token) return redirect('/auth/login');
  return null;
};

const Load = (Component: React.ComponentType) => (
  <Suspense fallback={
    <div className="bg-gray-900 text-gray-100 h-screen flex items-center justify-center">
        <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
            <p>Cargando...</p>
        </div>
    </div>
  }>
    <Component />
  </Suspense>
);

export const appRouter = createBrowserRouter([
    {
        path: '/',
        element: <SistemaLayout/>, 
        children: [
            {
                index: true,
                element: <HomePage/> 
            },
        ],
    },

    {
        path: '/auth',
        element: <AuthLayout />, 
        children: [
            {
                index: true,
                element: <Navigate to="login" replace /> 
            },
            {
                path: 'login',
                loader: publicLoader, 
                element: <LoginPage />
            },
            {
                path: 'register',
                loader: publicLoader, 
                element: <RegisterPage />
            }
        ]
    },
    {
        path: '/panel',
        loader: protectedLoader, 
        element: Load(PanelPage)
    },

    {
        path: '*',
        element: <Navigate to="/auth/login" replace />
    },
]);