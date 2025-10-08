import { RouterProvider } from "react-router"
import { appRouter } from "./app.router"

export const SistemaGestionApp = () => {
  return (
    // <div>
    //    <h1>SistemaGestionApp</h1>    
    // </div>
    <RouterProvider router={appRouter}/>
  )
}
