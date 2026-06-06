export function StatCard({ title, value, icon: Icon, color, subtitle }: {
  title: string;
  value: string | number;
  icon: any;
  color: string;
  subtitle?: string;
}) {
  return (
    <div className="card card-hover flex items-start gap-4">
      <div className={`p-3 rounded-2xl ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="min-w-0">
        <p className="text-2xl font-semibold text-ink tracking-tight">{value}</p>
        <p className="text-sm text-ink-soft">{title}</p>
        {subtitle && <p className="text-xs text-ink-faint mt-0.5">{subtitle}</p>}
      </div>
    </div>
  );
}

export function StatusBadge({ status, labels }: { status: string; labels: Record<string, string> }) {
  const colorMap: Record<string, string> = {
    submitted: 'bg-blue-50 text-blue-700 border-blue-200',
    analysis: 'bg-purple-50 text-purple-700 border-purple-200',
    inspection: 'bg-amber-50 text-amber-700 border-amber-200',
    validation: 'bg-cyan-50 text-cyan-700 border-cyan-200',
    manufacturing: 'bg-orange-50 text-orange-700 border-orange-200',
    delivery: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    closed: 'bg-green-50 text-green-700 border-green-200',
    active: 'bg-green-50 text-green-700 border-green-200',
    maintenance: 'bg-amber-50 text-amber-700 border-amber-200',
    retired: 'bg-zinc-100 text-ink-soft border-line',
    pending: 'bg-zinc-100 text-ink-soft border-line',
    ordered: 'bg-blue-50 text-blue-700 border-blue-200',
    received: 'bg-cyan-50 text-cyan-700 border-cyan-200',
    installed: 'bg-green-50 text-green-700 border-green-200',
    cancelled: 'bg-red-50 text-red-700 border-red-200',
    critical: 'bg-red-50 text-red-700 border-red-200',
    high: 'bg-orange-50 text-orange-700 border-orange-200',
    medium: 'bg-amber-50 text-amber-700 border-amber-200',
    low: 'bg-green-50 text-green-700 border-green-200',
  };
  return (
    <span className={`badge border ${colorMap[status] || 'bg-zinc-100 text-ink-soft border-line'}`}>
      {labels[status] || status}
    </span>
  );
}

export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="w-8 h-8 border-[2.5px] border-brand-500/25 border-t-brand-500 rounded-full animate-spin" />
    </div>
  );
}

export function Modal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div className="w-full max-w-lg rounded-3xl border border-line-soft bg-surface shadow-apple-lg animate-scale-in" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-line-soft">
          <h2 className="text-base font-semibold text-ink tracking-tight">{title}</h2>
          <button onClick={onClose} className="btn-ghost btn-xs text-lg leading-none">&times;</button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
