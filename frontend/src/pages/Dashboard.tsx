import { useApi } from '../hooks/useApi';
import { api } from '../services/api';
import { DashboardData } from '../types';
import { StatCard, LoadingSpinner, StatusBadge } from '../components/ui/Common';
import { AlertTriangle, Wrench, Package, Activity, CheckCircle, Heart, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useState, useEffect } from 'react';

const COLORS = ['#3b82f6', '#8b5cf6', '#f59e0b', '#06b6d4', '#f97316', '#6366f1', '#22c55e'];

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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-sm text-slate-400 mt-1">Vue d'ensemble de la maintenance industrielle</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/30">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-xs text-green-400 font-medium">Système actif</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Équipements" value={d.totalEquipment} icon={Wrench} color="bg-brand-600/20 text-brand-400" subtitle={`Santé moyenne: ${d.avgHealth}%`} />
        <StatCard title="Pannes actives" value={d.activeFaults} icon={AlertTriangle} color="bg-red-500/20 text-red-400" subtitle={`${d.criticalFaults} critiques`} />
        <StatCard title="Pannes résolues" value={d.closedFaults} icon={CheckCircle} color="bg-green-500/20 text-green-400" />
        <StatCard title="Pièces en attente" value={d.pendingParts} icon={Package} color="bg-amber-500/20 text-amber-400" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2"><Activity className="w-4 h-4 text-brand-400" /> Flux des statuts</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={d.statusFlow.map((s: any) => ({ ...s, label: ({ submitted: 'Soumis', analysis: 'Analyse', inspection: 'Inspection', validation: 'Validation', manufacturing: 'Fabrication', delivery: 'Livraison', closed: 'Clôturé' } as any)[s.status] || s.status }))}>
                <XAxis dataKey="label" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={{ stroke: '#334155' }} tickLine={false} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={{ stroke: '#334155' }} tickLine={false} />
                <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, color: '#fff' }} />
                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2"><TrendingUp className="w-4 h-4 text-brand-400" /> Priorités des pannes</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={d.faultsByPriority.map((p: any) => ({ ...p, label: ({ low: 'Faible', medium: 'Moyenne', high: 'Haute', critical: 'Critique' } as any)[p.priority] || p.priority }))} dataKey="count" nameKey="label" cx="50%" cy="50%" outerRadius={80} label={({ label, count }) => `${label}: ${count}`}>
                  {d.faultsByPriority.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, color: '#fff' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2"><Heart className="w-4 h-4 text-red-400" /> Équipements à surveiller</h3>
          {d.lowHealthEquipment.length === 0 ? (
            <p className="text-sm text-slate-500">Tous les équipements sont en bonne santé.</p>
          ) : (
            <div className="space-y-3">
              {d.lowHealthEquipment.map((e: any) => (
                <div key={e.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50">
                  <span className="text-sm font-medium text-white">{e.name}</span>
                  <span className={`badge border ${e.health_score < 40 ? 'bg-red-500/20 text-red-400 border-red-500/30' : 'bg-amber-500/20 text-amber-400 border-amber-500/30'}`}>
                    {e.health_score}%
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <h3 className="text-sm font-semibold text-white mb-4">Dernières pannes signalées</h3>
          <div className="space-y-3">
            {d.recentFaults.map((f: any) => (
              <div key={f.id} className="flex items-start justify-between p-3 rounded-lg bg-slate-800/50">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-white truncate">{f.title}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{f.equipment_name}</p>
                </div>
                <StatusBadge status={f.priority} labels={{ low: 'Faible', medium: 'Moyenne', high: 'Haute', critical: 'Critique' }} />
              </div>
            ))}
            {d.recentFaults.length === 0 && <p className="text-sm text-slate-500">Aucune panne récente.</p>}
          </div>
        </div>
      </div>

      <div className="card">
        <h3 className="text-sm font-semibold text-white mb-4">Équipements par catégorie</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {d.equipmentByCategory.map((c: any) => (
            <div key={c.category} className="text-center p-4 rounded-lg bg-slate-800/30">
              <p className="text-2xl font-bold text-white">{c.count}</p>
              <p className="text-xs text-slate-400 mt-1">{c.category}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
