import { createBrowserRouter, Navigate } from "react-router";
import { SistemaLayout } from "./sistema/layouts/SistemaLayout";
import { HomePage } from "./sistema/pages/home/HomePage";
import LoginPage from "./auth/pages/login/LoginPage";
//import { RegisterPage } from "./auth/pages/register/RegisterPage";
import { lazy } from "react";
import RegisterPage from "./auth/pages/register/RegisterPage";
import { PanelPage } from "./sistema/pages/panel/PanelPage";


const AuthLayout = lazy(() => import("./auth/layouts/AuthLayout"))

export const appRouter = createBrowserRouter([
    //Main Route
    {
        path: '/',
        element: <SistemaLayout/>,
        children: [
        {
            index: true,
            element: <HomePage/>
        },
        // {
        // path: "panel",
        // element: <PanelPage/>  
        // }
        ],
    },

    //Auth Route
    {
        path: '/auth',
        element: <AuthLayout/>,
        children: [
            {
                index:true,
                element: <Navigate to="auth/login"/>
            },
            {
                path: 'login',
                element: <LoginPage/>
            },
            {
                path: 'register',
                element: <RegisterPage/>
            }
        ]
    },
    {
        path: '/panel',
        element: <PanelPage/>
    },
    {
        path: '*',
        element: <Navigate to="/" />

    },
])