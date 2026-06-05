import { api } from '../services/api';
import { DashboardData } from '../types';
import { StatCard, LoadingSpinner, StatusBadge, PageHeader } from '../components/ui/Common';
import { LiveClock } from '../components/ui/Dynamic';
import { useAutoRefresh } from '../hooks/useAutoRefresh';
import { AlertTriangle, Wrench, Package, Activity, CheckCircle, Heart, TrendingUp, Zap } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#4D1BFF', '#8b5cf6', '#f59e0b', '#06b6d4', '#f97316', '#6366f1', '#22c55e'];

export default function Dashboard() {
  const { data: d, loading } = useAutoRefresh<DashboardData>(() => api.dashboard.get(), 15000);

  if (loading && !d) return <LoadingSpinner />;
  if (!d) return <p className="text-muted">Aucune donnée disponible.</p>;

  return (
    <div className="relative min-h-screen -m-6 lg:-m-10 p-6 lg:p-10"
      style={{ backgroundImage: 'url(/pictures/accueil.jpg)', backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed' }}>
      <div className="absolute inset-0 bg-black/70" />
      <div className="relative space-y-10">
        <div className="flex items-start gap-6">
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold text-main tracking-tight">Dashboard</h1>
            <p className="text-base lg:text-lg text-muted mt-2">Vue d'ensemble de la maintenance industrielle</p>
          </div>
          <div className="hidden lg:flex items-center gap-3 px-5 py-2.5 rounded-xl bg-green-500/10 border border-green-500/20 shadow-lg shadow-green-500/5 animate-pulse-soft">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500" />
            </span>
            <span className="text-sm font-semibold text-green-400">Live</span>
          </div>
        </div>
        <LiveClock />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Équipements" value={d.totalEquipment} icon={Wrench} color="bg-brand-600/20 text-brand-400" subtitle={`Santé moyenne: ${d.avgHealth}%`} />
        <StatCard title="Pannes actives" value={d.activeFaults} icon={AlertTriangle} color="bg-red-500/20 text-red-400" subtitle={`${d.criticalFaults} critiques`} />
        <StatCard title="Pannes résolues" value={d.closedFaults} icon={CheckCircle} color="bg-green-500/20 text-green-400" />
        <StatCard title="Pièces en attente" value={d.pendingParts} icon={Package} color="bg-amber-500/20 text-amber-400" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 card-glow">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold text-main flex items-center gap-3">
              <Activity className="w-6 h-6 text-brand-400 animate-pulse-soft" />
              Flux des statuts
            </h3>
            <span className="text-sm text-dim font-medium bg-card px-4 py-2 rounded-full border-card">Répartition</span>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={d.statusFlow.map((s: any) => ({ ...s, label: ({ submitted: 'Soumis', analysis: 'Analyse', inspection: 'Inspection', validation: 'Validation', manufacturing: 'Fabrication', delivery: 'Livraison', closed: 'Clôturé' } as any)[s.status] || s.status }))}>
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#4D1BFF" stopOpacity={1} />
                    <stop offset="100%" stopColor="#3d0fd9" stopOpacity={0.6} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="label" tick={{ fill: '#64748b', fontSize: 14 }} axisLine={{ stroke: '#1e293b' }} tickLine={false} />
                <YAxis tick={{ fill: '#64748b', fontSize: 14 }} axisLine={{ stroke: '#1e293b' }} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: 'rgba(15, 23, 42, 0.95)', border: '1px solid rgba(51, 65, 85, 0.5)', borderRadius: 12, color: '#fff', boxShadow: '0 20px 60px rgba(0,0,0,0.5)', backdropFilter: 'blur(20px)', fontSize: '14px' }}
                  cursor={{ fill: 'rgba(77, 27, 255, 0.05)' }}
                />
                <Bar dataKey="count" fill="url(#barGradient)" radius={[10, 10, 0, 0]} maxBarSize={56} animationDuration={800} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card-glow">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold text-main flex items-center gap-3">
              <TrendingUp className="w-6 h-6 text-brand-400 animate-pulse-soft" />
              Priorités
            </h3>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <defs>
                  {['#4D1BFF', '#8b5cf6', '#f59e0b', '#06b6d4'].map((c, i) => (
                    <linearGradient key={i} id={`pieGrad${i}`} x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor={c} stopOpacity={1} />
                      <stop offset="100%" stopColor={c} stopOpacity={0.6} />
                    </linearGradient>
                  ))}
                </defs>
                <Pie
                  data={d.faultsByPriority.map((p: any) => ({ ...p, label: ({ low: 'Faible', medium: 'Moyenne', high: 'Haute', critical: 'Critique' } as any)[p.priority] || p.priority }))}
                  dataKey="count" nameKey="label" cx="50%" cy="50%" innerRadius={65} outerRadius={105}
                  paddingAngle={4} stroke="none" animationDuration={800}
                >
                  {d.faultsByPriority.map((_: any, i: number) => <Cell key={i} fill={`url(#pieGrad${i})`} />)}
                </Pie>
                <Tooltip contentStyle={{ background: 'rgba(15, 23, 42, 0.95)', border: '1px solid rgba(51, 65, 85, 0.5)', borderRadius: 12, color: '#fff', backdropFilter: 'blur(20px)', fontSize: '14px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-3 mt-4">
            {d.faultsByPriority.map((p: any, i: number) => (
              <div key={p.priority} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-card-30 border-subtle">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                <span className="text-sm text-muted font-medium">{p.count} {(p.priority === 'critical' ? 'critique' : p.priority === 'high' ? 'haute' : p.priority === 'medium' ? 'moyenne' : 'faible')}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="card-glow">
          <div className="flex items-center gap-3 mb-6">
            <Heart className="w-6 h-6 text-red-400 animate-pulse-soft" />
            <h3 className="text-xl font-bold text-main">Équipements à surveiller</h3>
          </div>
          {d.lowHealthEquipment.length === 0 ? (
            <div className="py-12 text-center">
              <CheckCircle className="w-16 h-16 text-green-500/30 mx-auto mb-4" />
              <p className="text-lg text-muted font-medium">Tous les équipements sont en bonne santé</p>
            </div>
          ) : (
            <div className="space-y-4">
              {d.lowHealthEquipment.map((e: any, i: number) => (
                <div key={e.id} className="flex items-center justify-between p-5 rounded-xl bg-card-30 border-subtle hover:border-red-500/20 hover:bg-red-500/5 transition-all animate-slide-up group" style={{ animationDelay: `${i * 100}ms` }}>
                  <div className="flex items-center gap-4">
                    <div className="w-3 h-3 rounded-full bg-red-400 animate-pulse" />
                    <span className="text-base font-semibold text-main group-hover:text-red-400 transition-colors">{e.name}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-28 h-2 rounded-full bg-card-40 overflow-hidden">
                      <div className="h-full rounded-full bg-gradient-to-r from-red-500 to-amber-500 transition-all duration-1000" style={{ width: `${e.health_score}%` }} />
                    </div>
                    <span className="text-sm font-bold text-red-400">{e.health_score}%</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card-glow">
          <div className="flex items-center gap-3 mb-6">
            <Zap className="w-6 h-6 text-amber-400 animate-pulse-soft" />
            <h3 className="text-xl font-bold text-main">Dernières pannes</h3>
          </div>
          <div className="space-y-4">
            {d.recentFaults.map((f: any, i: number) => (
              <div key={f.id} className="flex items-start justify-between p-5 rounded-xl bg-card-30 border-subtle hover:border-brand-500/20 hover:bg-brand-500/5 transition-all animate-slide-up group cursor-pointer" style={{ animationDelay: `${i * 80}ms` }}>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-3 mb-1.5">
                    <div className={`w-3 h-3 rounded-full ${f.priority === 'critical' ? 'bg-red-500 animate-pulse' : f.priority === 'high' ? 'bg-orange-500' : f.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'}`} />
                    <p className="text-base font-semibold text-main group-hover:text-brand-400 transition-colors truncate">{f.title}</p>
                  </div>
                  <p className="text-sm text-dim ml-6">{f.equipment_name}</p>
                </div>
                <StatusBadge status={f.priority} labels={{ low: 'Faible', medium: 'Moyenne', high: 'Haute', critical: 'Critique' }} />
              </div>
            ))}
            {d.recentFaults.length === 0 && <p className="text-dim text-center py-12">Aucune panne récente</p>}
          </div>
        </div>
      </div>

      <div className="card-glow">
        <div className="flex items-center gap-3 mb-8">
          <Wrench className="w-6 h-6 text-brand-400 animate-pulse-soft" />
          <h3 className="text-xl font-bold text-main">Équipements par catégorie</h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-5">
          {d.equipmentByCategory.map((c: any, i: number) => (
            <div key={c.category} className="text-center p-6 rounded-xl bg-gradient-to-b from-card-40 to-card-20 border-subtle hover:border-brand-500/20 hover:scale-[1.02] hover:bg-brand-500/[0.02] transition-all animate-slide-up group" style={{ animationDelay: `${i * 80}ms` }}>
              <p className="text-4xl font-bold text-main group-hover:text-brand-400 transition-colors">{c.count}</p>
              <p className="text-sm text-muted mt-2 font-medium">{c.category}</p>
              <div className="w-full h-1.5 rounded-full bg-card-40 mt-4 overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-r from-brand-500 to-brand-400 w-1/2 transition-all duration-500 group-hover:w-3/4" />
              </div>
            </div>
          ))}
        </div>
        </div>
      </div>
    </div>
  );
}
