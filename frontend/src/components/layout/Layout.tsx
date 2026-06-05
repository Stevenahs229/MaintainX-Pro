import { Outlet, NavLink } from 'react-router-dom';
import { LayoutDashboard, Wrench, Package, Bell, Kanban, Hexagon, LogOut } from 'lucide-react';
import { useNotifications } from '../../hooks/useNotifications';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/kanban', icon: Kanban, label: 'Kanban' },
  { to: '/equipment', icon: Wrench, label: 'Équipements' },
  { to: '/spare-parts', icon: Package, label: 'Pièces' },
  { to: '/notifications', icon: Bell, label: 'Activité' },
];

export default function Layout() {
  const { unread } = useNotifications();

  return (
    <div className="flex h-screen overflow-hidden relative z-10">
      <aside className="w-64 lg:w-72 bg-slate-900/60 border-r border-slate-800/50 flex flex-col shrink-0 backdrop-blur-xl">
        <div className="p-5 lg:p-6 border-b border-slate-800/50">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 lg:w-12 lg:h-12 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-lg shadow-brand-500/20 animate-float">
              <Hexagon className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
            </div>
            <div>
              <h1 className="text-base lg:text-lg font-bold text-white tracking-tight">MaintainX Pro</h1>
              <p className="text-[11px] lg:text-xs text-slate-500 font-medium tracking-wider uppercase">Industrial Suite</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-3 lg:p-4 space-y-1 overflow-y-auto">
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                isActive ? 'navbar-link-active' : 'navbar-link text-slate-400'
              }
            >
              <item.icon className="w-4.5 h-4.5 lg:w-5 lg:h-5 shrink-0 relative z-10" />
              <span className="relative z-10">{item.label}</span>
              {item.to === '/notifications' && unread > 0 && (
                <span className="ml-auto relative z-10 bg-red-500/90 text-white text-[10px] font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1.5 shadow-lg shadow-red-500/20">
                  {unread > 99 ? '99+' : unread}
                </span>
              )}
            </NavLink>
          ))}
        </nav>
        <div className="p-3 lg:p-4 border-t border-slate-800/50">
          <div className="flex items-center gap-3.5 px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.05] hover:bg-white/[0.05] transition-colors cursor-pointer group">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-400 to-purple-500 flex items-center justify-center text-xs font-bold text-white shadow-lg shrink-0">
              A
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-white truncate group-hover:text-brand-400 transition-colors">Admin</p>
              <p className="text-[11px] text-slate-500 truncate">admin@maintainx.com</p>
            </div>
            <LogOut className="w-4 h-4 text-slate-600 group-hover:text-slate-400 transition-colors shrink-0" />
          </div>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto">
        <div className="p-5 lg:p-8 max-w-7xl mx-auto animate-fade-in">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
