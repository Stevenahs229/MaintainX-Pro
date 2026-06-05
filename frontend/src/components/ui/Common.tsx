import { useEffect, useRef, useState } from 'react';

export function StatCard({ title, value, icon: Icon, color, subtitle }: {
  title: string;
  value: string | number;
  icon: any;
  color: string;
  subtitle?: string;
}) {
  const [displayValue, setDisplayValue] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const numValue = typeof value === 'number' ? value : parseInt(value as string) || 0;
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!ref.current || hasAnimated.current) return;
    hasAnimated.current = true;
    let start = 0;
    const duration = 800;
    const step = Math.ceil(numValue / (duration / 16));
    const timer = setInterval(() => {
      start += step;
      if (start >= numValue) { setDisplayValue(numValue); clearInterval(timer); }
      else setDisplayValue(start);
    }, 16);
    return () => clearInterval(timer);
  }, [numValue]);

  const colors: Record<string, string> = {
    'bg-brand-600/20 text-brand-400': 'from-brand-500/20 to-brand-600/10 border-brand-500/20 shadow-brand-500/10',
    'bg-red-500/20 text-red-400': 'from-red-500/20 to-red-600/10 border-red-500/20 shadow-red-500/10',
    'bg-green-500/20 text-green-400': 'from-green-500/20 to-green-600/10 border-green-500/20 shadow-green-500/10',
    'bg-amber-500/20 text-amber-400': 'from-amber-500/20 to-amber-600/10 border-amber-500/20 shadow-amber-500/10',
  };
  const gradientClass = colors[color] || 'from-slate-500/20 to-slate-600/10';

  return (
    <div ref={ref} className="stat-card group">
      <div className={`stat-icon bg-gradient-to-br ${gradientClass} border ${color.split(' ').slice(-1)[0] + '/20' || 'border-white/10'}`}>
        <Icon className="w-5 h-5 lg:w-6 lg:h-6" />
      </div>
      <div className="min-w-0">
        <p className="text-2xl lg:text-3xl font-bold text-white tabular-nums tracking-tight">{displayValue}</p>
        <p className="text-sm text-slate-400 mt-0.5 font-medium">{title}</p>
        {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
      </div>
    </div>
  );
}

export function StatusBadge({ status, labels }: { status: string; labels: Record<string, string> }) {
  const colorMap: Record<string, string> = {
    submitted: 'bg-gradient-to-r from-blue-500/15 to-blue-600/10 text-blue-400 border-blue-500/20 shadow-blue-500/5',
    analysis: 'bg-gradient-to-r from-purple-500/15 to-purple-600/10 text-purple-400 border-purple-500/20 shadow-purple-500/5',
    inspection: 'bg-gradient-to-r from-amber-500/15 to-amber-600/10 text-amber-400 border-amber-500/20 shadow-amber-500/5',
    validation: 'bg-gradient-to-r from-cyan-500/15 to-cyan-600/10 text-cyan-400 border-cyan-500/20 shadow-cyan-500/5',
    manufacturing: 'bg-gradient-to-r from-orange-500/15 to-orange-600/10 text-orange-400 border-orange-500/20 shadow-orange-500/5',
    delivery: 'bg-gradient-to-r from-indigo-500/15 to-indigo-600/10 text-indigo-400 border-indigo-500/20 shadow-indigo-500/5',
    closed: 'bg-gradient-to-r from-green-500/15 to-green-600/10 text-green-400 border-green-500/20 shadow-green-500/5',
    active: 'bg-gradient-to-r from-green-500/15 to-green-600/10 text-green-400 border-green-500/20',
    maintenance: 'bg-gradient-to-r from-amber-500/15 to-amber-600/10 text-amber-400 border-amber-500/20',
    retired: 'bg-gradient-to-r from-slate-500/15 to-slate-600/10 text-slate-400 border-slate-500/20',
    pending: 'bg-gradient-to-r from-slate-500/15 to-slate-600/10 text-slate-400 border-slate-500/20',
    ordered: 'bg-gradient-to-r from-blue-500/15 to-blue-600/10 text-blue-400 border-blue-500/20',
    received: 'bg-gradient-to-r from-cyan-500/15 to-cyan-600/10 text-cyan-400 border-cyan-500/20',
    installed: 'bg-gradient-to-r from-green-500/15 to-green-600/10 text-green-400 border-green-500/20',
    cancelled: 'bg-gradient-to-r from-red-500/15 to-red-600/10 text-red-400 border-red-500/20',
    critical: 'bg-gradient-to-r from-red-500/15 to-red-600/10 text-red-400 border-red-500/20',
    high: 'bg-gradient-to-r from-orange-500/15 to-orange-600/10 text-orange-400 border-orange-500/20',
    medium: 'bg-gradient-to-r from-yellow-500/15 to-yellow-600/10 text-yellow-400 border-yellow-500/20',
    low: 'bg-gradient-to-r from-green-500/15 to-green-600/10 text-green-400 border-green-500/20',
  };
  return (
    <span className={`badge ${colorMap[status] || 'bg-slate-500/10 text-slate-400 border-slate-500/20'}`}>
      {labels[status] || status}
    </span>
  );
}

export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-32">
      <div className="relative">
        <div className="w-12 h-12 rounded-full border-2 border-brand-500/20 border-t-brand-500 animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-4 h-4 rounded-full bg-brand-500/30 animate-pulse" />
        </div>
      </div>
    </div>
  );
}

export function Modal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div
        className="w-full max-w-xl rounded-2xl border border-slate-700/50 bg-slate-900 shadow-2xl shadow-black/50 animate-scale-in"
        style={{ backdropFilter: 'blur(40px)' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-slate-800/50">
          <h2 className="text-lg font-bold text-white">{title}</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-white hover:bg-slate-800 transition-all text-lg">✕</button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

export function PageHeader({ title, description, action }: { title: string; description?: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between mb-8">
      <div className="animate-slide-up">
        <h1 className="text-2xl lg:text-3xl font-bold text-white tracking-tight">{title}</h1>
        {description && <p className="text-sm lg:text-base text-slate-400 mt-1.5">{description}</p>}
      </div>
      {action && <div className="animate-scale-in">{action}</div>}
    </div>
  );
}
