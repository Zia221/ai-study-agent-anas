import { NavLink, useNavigate } from "react-router-dom";
import { removeToken } from "../services/auth";

const menuItems = [
  { label: "Chat", icon: "💬", path: "/" },
  { label: "Learning Agent", icon: "🤖", path: "/learning-agent" },
  { label: "Documents", icon: "📄", path: "/documents" },
  { label: "Tests", icon: "📝", path: "/tests" },
  { label: "Flashcards", icon: "🧠", path: "/flashcards" },
  { label: "Notes", icon: "📚", path: "/notes" },
  { label: "Progress", icon: "📊", path: "/progress" },
];

function Sidebar() {
  const navigate = useNavigate();

  function handleLogout() {
    removeToken();
    navigate("/login");
  }

  return (
    <aside className="flex h-screen w-64 shrink-0 flex-col border-r border-zinc-800 bg-zinc-950 text-white">
      {/* Logo */}
      <div className="border-b border-zinc-800 px-5 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-xl">
            🧠
          </div>

          <div>
            <h1 className="text-base font-bold tracking-tight">
              AI Study Agent
            </h1>

            <p className="mt-0.5 text-xs text-zinc-500">
              Your personal AI tutor
            </p>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="min-h-0 flex-1 overflow-y-auto px-3 py-5">
        <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-wider text-zinc-600">
          Main
        </p>

        <div className="space-y-1">
          {menuItems.map((item) => (
            <NavLink
              key={item.label}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                  isActive
                    ? "bg-white/10 text-white"
                    : "text-zinc-400 hover:bg-white/5 hover:text-white"
                }`
              }
            >
              <span className="flex w-6 items-center justify-center text-base">
                {item.icon}
              </span>

              <span>{item.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Bottom Section */}
      <div className="border-t border-zinc-800 px-3 py-4">
        {/* Settings */}
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
              isActive
                ? "bg-white/10 text-white"
                : "text-zinc-400 hover:bg-white/5 hover:text-white"
            }`
          }
        >
          <span className="flex w-6 items-center justify-center text-base">
            ⚙️
          </span>

          <span>Settings</span>
        </NavLink>

        {/* Student */}
        <div className="mt-4 border-t border-zinc-800 pt-4">
          <div className="flex items-center gap-3 px-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-sm">
              👤
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-zinc-200">
                Student
              </p>

              <p className="text-xs text-zinc-500">Learning</p>
            </div>
          </div>

          {/* Logout */}
          <button
            type="button"
            onClick={handleLogout}
            className="mt-3 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-zinc-400 transition hover:bg-white/5 hover:text-white"
          >
            <span className="flex w-6 items-center justify-center text-base">
              🚪
            </span>

            <span>Logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
