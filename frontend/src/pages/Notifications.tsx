import { useNotifications } from '../hooks/useNotifications';
import { Bell, CheckCheck, AlertTriangle, RefreshCw, Package, Wrench, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const iconMap: Record<string, any> = {
  fault_created: AlertTriangle,
  status_change: RefreshCw,
  part_ordered: Package,
  part_received: Package,
  equipment_added: Wrench,
  comment: Bell,
};

const colorMap: Record<string, string> = {
  fault_created: 'from-red-500/20 to-red-600/10 border-red-500/20 text-red-400',
  status_change: 'from-blue-500/20 to-blue-600/10 border-blue-500/20 text-blue-400',
  part_ordered: 'from-amber-500/20 to-amber-600/10 border-amber-500/20 text-amber-400',
  part_received: 'from-green-500/20 to-green-600/10 border-green-500/20 text-green-400',
  equipment_added: 'from-brand-500/20 to-brand-600/10 border-brand-500/20 text-brand-400',
  comment: 'from-purple-500/20 to-purple-600/10 border-purple-500/20 text-purple-400',
};

export default function Notifications() {
  const { activities, unread, markRead, markAllRead } = useNotifications();
  const navigate = useNavigate();

  async function handleClick(a: any) {
    if (!a.read) await markRead(a.id);
    if (a.related_type === 'fault' && a.related_id) navigate(`/faults/${a.related_id}`);
  }

  return (
    <div className="space-y-6 max-w-3xl animate-fade-in">
      <div className="flex items-center justify-between mb-2">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl lg:text-3xl font-bold text-white tracking-tight">Activité récente</h1>
            {unread > 0 && (
              <span className="px-3 py-1 rounded-full bg-red-500/15 border border-red-500/20 text-xs font-bold text-red-400 animate-pulse">
                {unread} nouveau{unread > 1 ? 'x' : ''}
              </span>
            )}
          </div>
          <p className="text-sm text-slate-400 mt-1.5">
            {unread > 0 ? 'Des événements nécessitent votre attention' : 'Tout est à jour, aucun nouveau message'}
          </p>
        </div>
        {unread > 0 && (
          <button onClick={markAllRead} className="btn-secondary btn-sm shadow-lg">
            <CheckCheck className="w-4 h-4" /> Tout marquer lu
          </button>
        )}
      </div>

      <div className="space-y-2.5">
        {activities.length === 0 ? (
          <div className="text-center py-24 card-glow">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-700/30 to-slate-800/30 border border-slate-700/30 flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-7 h-7 text-slate-600" />
            </div>
            <p className="text-base text-slate-500 font-medium">Aucune activité pour le moment</p>
          </div>
        ) : (
          activities.map((a, i) => {
            const Icon = iconMap[a.type] || Bell;
            const color = colorMap[a.type] || 'from-slate-500/20 to-slate-600/10 border-slate-500/20 text-slate-400';
            return (
              <div
                key={a.id}
                onClick={() => handleClick(a)}
                className={`flex items-start gap-4 p-5 rounded-2xl border transition-all duration-200 cursor-pointer animate-slide-up ${
                  !a.read
                    ? 'bg-gradient-to-r from-brand-500/5 to-transparent border-brand-500/30 shadow-lg shadow-brand-500/5'
                    : 'bg-slate-900/30 border-slate-800/30 hover:border-slate-700/50 hover:bg-slate-800/20'
                }`}
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <div className={`p-3 rounded-xl bg-gradient-to-br ${color} border shrink-0`}>
                  <Icon className="w-4.5 h-4.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className={`text-sm ${!a.read ? 'text-white font-semibold' : 'text-slate-300'}`}>
                    {a.message}
                  </p>
                  <p className="text-xs text-slate-500 mt-1.5 font-medium">
                    {new Date(a.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                {!a.read && (
                  <span className="relative flex h-2.5 w-2.5 shrink-0 mt-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-brand-500" />
                  </span>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
