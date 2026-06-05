import { useNotifications } from '../hooks/useNotifications';
import { LoadingSpinner } from '../components/ui/Common';
import { Bell, CheckCheck, AlertTriangle, RefreshCw, Package, PlusCircle, Wrench } from 'lucide-react';
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
  fault_created: 'text-red-400 bg-red-500/10',
  status_change: 'text-blue-400 bg-blue-500/10',
  part_ordered: 'text-amber-400 bg-amber-500/10',
  part_received: 'text-green-400 bg-green-500/10',
  equipment_added: 'text-brand-400 bg-brand-500/10',
  comment: 'text-purple-400 bg-purple-500/10',
};

export default function Notifications() {
  const { activities, unread, markRead, markAllRead } = useNotifications();
  const navigate = useNavigate();

  async function handleClick(a: any) {
    if (!a.read) await markRead(a.id);
    if (a.related_type === 'fault' && a.related_id) {
      navigate(`/faults/${a.related_id}`);
    }
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Activité récente</h1>
          <p className="text-sm text-slate-400 mt-1">
            {unread > 0 ? `${unread} notification${unread > 1 ? 's' : ''} non lue${unread > 1 ? 's' : ''}` : 'Tout est à jour'}
          </p>
        </div>
        {unread > 0 && (
          <button onClick={markAllRead} className="btn-secondary btn-sm">
            <CheckCheck className="w-4 h-4" /> Tout marquer lu
          </button>
        )}
      </div>

      <div className="space-y-2">
        {activities.length === 0 ? (
          <div className="text-center py-20 card">
            <Bell className="w-12 h-12 text-slate-700 mx-auto mb-3" />
            <p className="text-slate-400">Aucune activité</p>
          </div>
        ) : (
          activities.map(a => {
            const Icon = iconMap[a.type] || Bell;
            const color = colorMap[a.type] || 'text-slate-400 bg-slate-500/10';
            return (
              <div
                key={a.id}
                onClick={() => handleClick(a)}
                className={`card flex items-start gap-4 cursor-pointer transition-colors hover:border-slate-700 ${
                  !a.read ? 'border-brand-600/30 bg-brand-950/20' : ''
                }`}
              >
                <div className={`p-2 rounded-lg ${color} shrink-0`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className={`text-sm ${!a.read ? 'text-white font-medium' : 'text-slate-300'}`}>
                    {a.message}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    {new Date(a.created_at).toLocaleDateString('fr-FR', {
                      day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit'
                    })}
                  </p>
                </div>
                {!a.read && <div className="w-2 h-2 rounded-full bg-brand-500 shrink-0 mt-2" />}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
