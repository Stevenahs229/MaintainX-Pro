import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/AuthContext';
import { useNotifications } from '../../hooks/useNotifications';
import { LayoutDashboard, Wrench, Package, Bell, Kanban, Hexagon, LogOut, User } from 'lucide-react';

const adminNav = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/kanban', icon: Kanban, label: 'Kanban' },
  { to: '/equipment', icon: Wrench, label: 'Équipements' },
  { to: '/spare-parts', icon: Package, label: 'Pièces' },
  { to: '/notifications', icon: Bell, label: 'Activité' },
];

const userNav = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/kanban', icon: Kanban, label: 'Mes pannes' },
  { to: '/equipment', icon: Wrench, label: 'Équipements' },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const { unread } = useNotifications();
  const navigate = useNavigate();
  const isAdmin = user?.role === 'admin' || user?.role === 'manager';
  const navItems = isAdmin ? adminNav : userNav;

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  return (
    <div className="flex h-screen overflow-hidden relative z-10">
      <aside className="w-72 lg:w-80 bg-sidebar border-r border-card flex flex-col shrink-0 backdrop-blur-xl">
        <div className="p-6 lg:p-7 border-b border-card">
          <div className="flex items-center gap-4">
            <div className="w-13 h-13 lg:w-14 lg:h-14 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-xl shadow-brand-500/20 animate-float">
              <Hexagon className="w-6 h-6 lg:w-7 lg:h-7 text-white" />
            </div>
            <div>
              <h1 className="text-xl lg:text-2xl font-bold text-main tracking-tight">MaintainX Pro</h1>
              <p className="text-xs lg:text-sm text-muted font-medium tracking-wider uppercase">
                {isAdmin ? 'Admin Suite' : 'Espace employé'}
              </p>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-4 lg:p-5 space-y-1.5 overflow-y-auto">
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                isActive ? 'navbar-link-active' : 'navbar-link'
              }
            >
              <item.icon className="w-5 h-5 lg:w-5.5 lg:h-5.5 shrink-0 relative z-10" />
              <span className="relative z-10 text-base lg:text-lg">{item.label}</span>
              {item.to === '/notifications' && unread > 0 && (
                <span className="ml-auto relative z-10 bg-red-500/90 text-white text-xs font-bold rounded-full min-w-[24px] h-6 flex items-center justify-center px-1.5 shadow-xl shadow-red-500/20">
                  {unread > 99 ? '99+' : unread}
                </span>
              )}
            </NavLink>
          ))}
        </nav>
        <div className="p-4 lg:p-5 border-t border-card">
          <div className="flex items-center gap-4 px-4 py-3.5 rounded-xl bg-hover hover:bg-white/[0.08] transition-colors cursor-pointer group">
            <div className="w-10 h-10 lg:w-11 lg:h-11 rounded-full bg-gradient-to-br from-brand-400 to-purple-500 flex items-center justify-center text-sm font-bold text-white shadow-lg shrink-0">
              {(user?.name || 'A')[0]}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-base lg:text-lg font-medium text-main truncate group-hover:text-brand-400 transition-colors">{user?.name}</p>
              <p className="text-xs lg:text-sm text-dim truncate capitalize">{user?.role}</p>
            </div>
            <button onClick={handleLogout} className="p-2 rounded-lg hover:bg-hover text-dim hover:text-muted transition-all shrink-0">
              <LogOut className="w-4 h-4 lg:w-5 lg:h-5" />
            </button>
          </div>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto">
        <div className="p-6 lg:p-10 max-w-7xl mx-auto animate-fade-in">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
