import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, Wrench, ClipboardList, Package, Bell, Kanban } from 'lucide-react';
import { useNotifications } from '../../hooks/useNotifications';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/kanban', icon: Kanban, label: 'Kanban' },
  { to: '/equipment', icon: Wrench, label: 'Équipements' },
  { to: '/spare-parts', icon: Package, label: 'Pièces' },
  { to: '/notifications', icon: Bell, label: 'Activité' },
];

export default function Layout() {
  const location = useLocation();
  const { unread } = useNotifications();

  return (
    <div className="flex h-screen overflow-hidden">
      <aside className="w-64 bg-slate-900/80 border-r border-slate-800 flex flex-col shrink-0">
        <div className="p-5 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-brand-600 flex items-center justify-center font-bold text-sm">M</div>
            <div>
              <h1 className="text-base font-semibold text-white">MaintainX Pro</h1>
              <p className="text-xs text-slate-500">Industrial Maintenance</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-brand-600/20 text-brand-400 border border-brand-600/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50 border border-transparent'
                }`
              }
            >
              <item.icon className="w-4 h-4 shrink-0" />
              <span>{item.label}</span>
              {item.to === '/notifications' && unread > 0 && (
                <span className="ml-auto bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                  {unread > 99 ? '99+' : unread}
                </span>
              )}
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-slate-800/50">
            <div className="w-8 h-8 rounded-full bg-brand-600/30 flex items-center justify-center text-xs font-bold text-brand-400">A</div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-white truncate">Admin</p>
              <p className="text-xs text-slate-500">admin@maintainx.com</p>
            </div>
          </div>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto bg-slate-950">
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
