import { useApi } from '../hooks/useApi';
import { api } from '../services/api';
import { DashboardData } from '../types';
import { StatCard, LoadingSpinner, StatusBadge, PageHeader } from '../components/ui/Common';
import { AlertTriangle, Wrench, Package, Activity, CheckCircle, Heart, TrendingUp, ArrowUpRight, Zap } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { useState, useEffect } from 'react';

const COLORS = ['#3b82f6', '#8b5cf6', '#f59e0b', '#06b6d4', '#f97316', '#6366f1', '#22c55e'];
const GRADIENT_COLORS = ['url(#blueGradient)', 'url(#purpleGradient)', 'url(#amberGradient)', 'url(#cyanGradient)', 'url(#orangeGradient)', 'url(#indigoGradient)', 'url(#greenGradient)'];

export default function Dashboard() {
  const { data, loading } = useApi<DashboardData>(() => api.dashboard.get());
  const [dynamicData, setDynamicData] = useState<any>(null);

  useEffect(() => {
    if (data) setDynamicData(data);
  }, [data]);

  if (loading && !dynamicData) return <LoadingSpinner />;
  const d = dynamicData || data;
  if (!d) return <p className="text-slate-400">Aucune donnée disponible.</p>;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Dashboard"
        description="Vue d'ensemble de la maintenance industrielle"
        action={
          <div className="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-green-500/10 border border-green-500/20 shadow-lg shadow-green-500/5">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
            </span>
            <span className="text-sm font-semibold text-green-400">En ligne</span>
          </div>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard title="Équipements" value={d.totalEquipment} icon={Wrench} color="bg-brand-600/20 text-brand-400" subtitle={`Santé moyenne: ${d.avgHealth}%`} />
        <StatCard title="Pannes actives" value={d.activeFaults} icon={AlertTriangle} color="bg-red-500/20 text-red-400" subtitle={`${d.criticalFaults} critiques`} />
        <StatCard title="Pannes résolues" value={d.closedFaults} icon={CheckCircle} color="bg-green-500/20 text-green-400" />
        <StatCard title="Pièces en attente" value={d.pendingParts} icon={Package} color="bg-amber-500/20 text-amber-400" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card-glow">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2.5">
              <Activity className="w-5 h-5 text-brand-400" />
              Flux des statuts
            </h3>
            <span className="text-xs text-slate-500 font-medium bg-slate-800/50 px-3 py-1.5 rounded-full border border-slate-700/50">Répartition</span>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={d.statusFlow.map((s: any) => ({ ...s, label: ({ submitted: 'Soumis', analysis: 'Analyse', inspection: 'Inspection', validation: 'Validation', manufacturing: 'Fabrication', delivery: 'Livraison', closed: 'Clôturé' } as any)[s.status] || s.status }))}>
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity={1} />
                    <stop offset="100%" stopColor="#2563eb" stopOpacity={0.6} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="label" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={{ stroke: '#1e293b' }} tickLine={false} />
                <YAxis tick={{ fill: '#64748b', fontSize: 12 }} axisLine={{ stroke: '#1e293b' }} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: 'rgba(15, 23, 42, 0.95)', border: '1px solid rgba(51, 65, 85, 0.5)', borderRadius: 12, color: '#fff', boxShadow: '0 20px 60px rgba(0,0,0,0.5)', backdropFilter: 'blur(20px)' }}
                  cursor={{ fill: 'rgba(59, 130, 246, 0.05)' }}
                />
                <Bar dataKey="count" fill="url(#barGradient)" radius={[8, 8, 0, 0]} maxBarSize={48} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card-glow">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2.5">
              <TrendingUp className="w-5 h-5 text-brand-400" />
              Priorités
            </h3>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <defs>
                  {['#3b82f6', '#8b5cf6', '#f59e0b', '#06b6d4'].map((c, i) => (
                    <linearGradient key={i} id={`pieGrad${i}`} x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor={c} stopOpacity={1} />
                      <stop offset="100%" stopColor={c} stopOpacity={0.6} />
                    </linearGradient>
                  ))}
                </defs>
                <Pie
                  data={d.faultsByPriority.map((p: any) => ({ ...p, label: ({ low: 'Faible', medium: 'Moyenne', high: 'Haute', critical: 'Critique' } as any)[p.priority] || p.priority }))}
                  dataKey="count" nameKey="label" cx="50%" cy="50%" innerRadius={55} outerRadius={90}
                  paddingAngle={4}
                  stroke="none"
                >
                  {d.faultsByPriority.map((_: any, i: number) => <Cell key={i} fill={`url(#pieGrad${i})`} />)}
                </Pie>
                <Tooltip contentStyle={{ background: 'rgba(15, 23, 42, 0.95)', border: '1px solid rgba(51, 65, 85, 0.5)', borderRadius: 12, color: '#fff', backdropFilter: 'blur(20px)' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {d.faultsByPriority.map((p: any, i: number) => (
              <div key={p.priority} className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-slate-800/30 border border-slate-800/50">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                <span className="text-xs text-slate-400 font-medium">{p.count} {(p.priority === 'critical' ? 'critique' : p.priority === 'high' ? 'haute' : p.priority === 'medium' ? 'moyenne' : 'faible')}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card-glow">
          <div className="flex items-center gap-2.5 mb-5">
            <Heart className="w-5 h-5 text-red-400" />
            <h3 className="text-lg font-bold text-white">Équipements à surveiller</h3>
          </div>
          {d.lowHealthEquipment.length === 0 ? (
            <div className="py-8 text-center">
              <CheckCircle className="w-12 h-12 text-green-500/30 mx-auto mb-3" />
              <p className="text-slate-400 font-medium">Tous les équipements sont en bonne santé</p>
            </div>
          ) : (
            <div className="space-y-3">
              {d.lowHealthEquipment.map((e: any, i: number) => (
                <div key={e.id} className="flex items-center justify-between p-4 rounded-xl bg-slate-800/30 border border-slate-800/50 hover:border-red-500/20 transition-all animate-slide-up" style={{ animationDelay: `${i * 100}ms` }}>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
                    <span className="text-sm font-semibold text-white">{e.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-20 h-1.5 rounded-full bg-slate-700 overflow-hidden">
                      <div className="h-full rounded-full bg-gradient-to-r from-red-500 to-amber-500" style={{ width: `${e.health_score}%` }} />
                    </div>
                    <span className="text-xs font-bold text-red-400">{e.health_score}%</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card-glow">
          <div className="flex items-center gap-2.5 mb-5">
            <Zap className="w-5 h-5 text-amber-400" />
            <h3 className="text-lg font-bold text-white">Dernières pannes</h3>
          </div>
          <div className="space-y-3">
            {d.recentFaults.map((f: any, i: number) => (
              <div key={f.id} className="flex items-start justify-between p-4 rounded-xl bg-slate-800/30 border border-slate-800/50 hover:border-brand-500/20 transition-all animate-slide-up group cursor-pointer" style={{ animationDelay: `${i * 80}ms` }}>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <div className={`w-2 h-2 rounded-full ${f.priority === 'critical' ? 'bg-red-500' : f.priority === 'high' ? 'bg-orange-500' : f.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'}`} />
                    <p className="text-sm font-semibold text-white group-hover:text-brand-400 transition-colors truncate">{f.title}</p>
                  </div>
                  <p className="text-xs text-slate-500 ml-4">{f.equipment_name}</p>
                </div>
                <StatusBadge status={f.priority} labels={{ low: 'Faible', medium: 'Moyenne', high: 'Haute', critical: 'Critique' }} />
              </div>
            ))}
            {d.recentFaults.length === 0 && <p className="text-slate-500 text-center py-8">Aucune panne récente</p>}
          </div>
        </div>
      </div>

      <div className="card-glow">
        <div className="flex items-center gap-2.5 mb-6">
          <Wrench className="w-5 h-5 text-brand-400" />
          <h3 className="text-lg font-bold text-white">Équipements par catégorie</h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {d.equipmentByCategory.map((c: any, i: number) => (
            <div key={c.category} className="text-center p-5 rounded-xl bg-gradient-to-b from-slate-800/40 to-slate-800/10 border border-slate-800/50 hover:border-brand-500/20 transition-all animate-slide-up group" style={{ animationDelay: `${i * 80}ms` }}>
              <p className="text-3xl font-bold text-white group-hover:text-brand-400 transition-colors">{c.count}</p>
              <p className="text-xs text-slate-400 mt-1.5 font-medium">{c.category}</p>
              <div className="w-full h-1 rounded-full bg-slate-700/50 mt-3 overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-r from-brand-500 to-brand-400 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
