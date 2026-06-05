export function StatCard({ title, value, icon: Icon, color, subtitle }: {
  title: string;
  value: string | number;
  icon: any;
  color: string;
  subtitle?: string;
}) {
  return (
    <div className="card flex items-start gap-4">
      <div className={`p-3 rounded-xl ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="min-w-0">
        <p className="text-2xl font-bold text-white">{value}</p>
        <p className="text-sm text-slate-400">{title}</p>
        {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
      </div>
    </div>
  );
}

export function StatusBadge({ status, labels }: { status: string; labels: Record<string, string> }) {
  const colorMap: Record<string, string> = {
    submitted: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    analysis: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    inspection: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    validation: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
    manufacturing: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    delivery: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
    closed: 'bg-green-500/20 text-green-400 border-green-500/30',
    active: 'bg-green-500/20 text-green-400 border-green-500/30',
    maintenance: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    retired: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
    pending: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
    ordered: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    received: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
    installed: 'bg-green-500/20 text-green-400 border-green-500/30',
    cancelled: 'bg-red-500/20 text-red-400 border-red-500/30',
    critical: 'bg-red-500/20 text-red-400 border-red-500/30',
    high: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    low: 'bg-green-500/20 text-green-400 border-green-500/30',
  };
  return (
    <span className={`badge border ${colorMap[status] || 'bg-slate-500/20 text-slate-400'}`}>
      {labels[status] || status}
    </span>
  );
}

export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="w-8 h-8 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
    </div>
  );
}

export function Modal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-lg rounded-xl border border-slate-700 bg-slate-900 shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-slate-800">
          <h2 className="text-lg font-semibold text-white">{title}</h2>
          <button onClick={onClose} className="btn-ghost btn-xs">&times;</button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}
