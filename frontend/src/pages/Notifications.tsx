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
    <div className="space-y-8 max-w-3xl animate-fade-in">
      <div className="flex items-center justify-between mb-2">
        <div>
          <div className="flex items-center gap-4">
            <h1 className="text-3xl lg:text-4xl font-bold text-main tracking-tight">Activité récente</h1>
            {unread > 0 && (
              <span className="px-4 py-1.5 rounded-full bg-red-500/15 border border-red-500/20 text-sm font-bold text-red-400 animate-pulse">
                {unread} nouveau{unread > 1 ? 'x' : ''}
              </span>
            )}
          </div>
          <p className="text-base text-muted mt-2">
            {unread > 0 ? 'Des événements nécessitent votre attention' : "Tout est à jour, aucun nouveau message"}
          </p>
        </div>
        {unread > 0 && (
          <button onClick={markAllRead} className="btn-secondary shadow-lg">
            <CheckCheck className="w-5 h-5" /> Tout marquer lu
          </button>
        )}
      </div>

      <div className="space-y-3">
        {activities.length === 0 ? (
          <div className="text-center py-24 card-glow">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-700/30 to-slate-800/30 border border-slate-700/30 flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-7 h-7 text-subtle" />
            </div>
            <p className="text-base text-dim font-medium">Aucune activité pour le moment</p>
          </div>
        ) : (
          activities.map((a, i) => {
            const Icon = iconMap[a.type] || Bell;
            const color = colorMap[a.type] || 'from-slate-500/20 to-slate-600/10 border-slate-500/20 text-muted';
            return (
              <div
                key={a.id}
                onClick={() => handleClick(a)}
                className={`flex items-start gap-5 p-6 rounded-2xl border transition-all duration-200 cursor-pointer animate-slide-up ${
                  !a.read
                    ? 'bg-gradient-to-r from-brand-500/5 to-transparent border-brand-500/30 shadow-lg shadow-brand-500/5'
                    : 'bg-card-30 border-subtle hover:border-card hover:bg-card-20'
                }`}
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <div className={`p-4 rounded-xl bg-gradient-to-br ${color} border shrink-0`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className={`text-base ${!a.read ? 'text-main font-semibold' : 'text-muted'}`}>
                    {a.message}
                  </p>
                  <p className="text-sm text-dim mt-2 font-medium">
                    {new Date(a.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                {!a.read && (
                  <span className="relative flex h-3 w-3 shrink-0 mt-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-brand-500" />
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
