import { Outlet } from "react-router-dom";

export const PanelLayout = () => (
  <div className="w-full h-full bg-gray-900 text-gray-100">
    <Outlet />
  </div>
);
