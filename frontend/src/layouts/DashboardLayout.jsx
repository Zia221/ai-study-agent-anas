import Sidebar from "../components/Sidebar";

function DashboardLayout({ children }) {
  return (
    <div className="flex h-screen overflow-hidden bg-zinc-950">
      <Sidebar />

      <div className="flex min-h-0 min-w-0 flex-1 overflow-y-auto">
        {children}
      </div>
    </div>
  );
}

export default DashboardLayout;
