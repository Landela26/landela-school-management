import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";

function DashboardLayout() {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-50">
      <Sidebar />
      <main className="relative flex-1 min-w-0 h-full overflow-y-auto border border-slate-200 bg-white !p-2 shadow-sm">
        <Outlet />
      </main>
    </div>
  );
}

export default DashboardLayout;
