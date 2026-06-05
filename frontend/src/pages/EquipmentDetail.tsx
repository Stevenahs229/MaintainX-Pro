import { useParams, useNavigate } from 'react-router-dom';
import { useApi } from '../hooks/useApi';
import { api } from '../services/api';
import { Equipment, Fault, STATUS_LABELS } from '../types';
import { LoadingSpinner, StatusBadge } from '../components/ui/Common';
import { ArrowLeft, Wrench, MapPin, Heart, AlertTriangle, ClipboardList, Activity } from 'lucide-react';

export default function EquipmentDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: equipment, loading: eqLoading } = useApi<Equipment>(() => api.equipment.get(id!));
  const { data: faults, loading: faultsLoading } = useApi<Fault[]>(() => api.equipment.faults(id!));

  if (eqLoading) return <LoadingSpinner />;
  if (!equipment) return <p className="text-slate-400">Équipement introuvable.</p>;

  return (
    <div className="space-y-8 max-w-4xl animate-fade-in">
      <button onClick={() => navigate('/equipment')} className="btn-ghost btn-sm">
        <ArrowLeft className="w-4 h-4" /> Retour
      </button>

      <div className="card-glow">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-5">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-brand-500/20 to-brand-600/10 border border-brand-500/20 shadow-lg">
              <Wrench className="w-7 h-7 text-brand-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">{equipment.name}</h1>
              <p className="text-sm text-slate-400 mt-1 font-medium">{equipment.category}</p>
            </div>
          </div>
          <StatusBadge status={equipment.status} labels={{ active: 'Actif', maintenance: 'Maintenance', retired: 'Retiré' }} />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-6">
          {equipment.location && (
            <div className="p-3 rounded-xl bg-slate-800/30 border border-slate-800/50">
              <p className="text-xs text-slate-500 flex items-center gap-1.5 mb-1"><MapPin className="w-3.5 h-3.5" /> Localisation</p>
              <p className="text-sm font-semibold text-white">{equipment.location}</p>
            </div>
          )}
          <div className="p-3 rounded-xl bg-slate-800/30 border border-slate-800/50">
            <p className="text-xs text-slate-500 flex items-center gap-1.5 mb-1"><Heart className="w-3.5 h-3.5 text-red-400" /> Santé</p>
            <p className={`text-sm font-bold ${equipment.health_score > 70 ? 'text-green-400' : equipment.health_score > 40 ? 'text-amber-400' : 'text-red-400'}`}>
              {equipment.health_score}%
            </p>
          </div>
          <div className="p-3 rounded-xl bg-slate-800/30 border border-slate-800/50">
            <p className="text-xs text-slate-500 flex items-center gap-1.5 mb-1"><Activity className="w-3.5 h-3.5 text-brand-400" /> Statut</p>
            <p className="text-sm font-bold text-white capitalize">{equipment.status}</p>
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-slate-500">
            <span>Health Score</span>
            <span className={equipment.health_score > 70 ? 'text-green-400' : equipment.health_score > 40 ? 'text-amber-400' : 'text-red-400'}>{equipment.health_score}%</span>
          </div>
          <div className="w-full h-2.5 rounded-full bg-slate-700/50 overflow-hidden p-0.5">
            <div
              className={`h-full rounded-full transition-all duration-1000 ${
                equipment.health_score > 70 ? 'bg-gradient-to-r from-green-500 to-emerald-400' : equipment.health_score > 40 ? 'bg-gradient-to-r from-amber-500 to-yellow-400' : 'bg-gradient-to-r from-red-500 to-rose-400'
              }`}
              style={{ width: `${equipment.health_score}%` }}
            />
          </div>
        </div>

        {equipment.description && (
          <p className="text-sm text-slate-300 mt-5 leading-relaxed">{equipment.description}</p>
        )}
      </div>

      <div className="card-glow">
        <h2 className="text-lg font-bold text-white mb-5 flex items-center gap-2.5">
          <AlertTriangle className="w-5 h-5 text-amber-400" />
          Historique des pannes
          <span className="text-sm font-medium text-slate-500 ml-auto">({faults?.length || 0} panne{(faults?.length || 0) > 1 ? 's' : ''})</span>
        </h2>

        {faultsLoading ? <LoadingSpinner />
        : faults && faults.length > 0 ? (
          <div className="space-y-3">
            {faults.map((f, i) => (
              <div
                key={f.id}
                onClick={() => navigate(`/faults/${f.id}`)}
                className="flex items-center justify-between p-4 rounded-xl bg-slate-800/30 border border-slate-800/50 hover:border-brand-500/20 transition-all cursor-pointer animate-slide-up group"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${f.priority === 'critical' ? 'bg-red-500 animate-pulse' : f.priority === 'high' ? 'bg-orange-500' : f.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'}`} />
                    <p className="text-sm font-semibold text-white group-hover:text-brand-400 transition-colors truncate">{f.title}</p>
                  </div>
                  <p className="text-xs text-slate-500 ml-4 mt-1">{new Date(f.created_at).toLocaleDateString('fr-FR')}</p>
                </div>
                <div className="flex items-center gap-2.5 shrink-0 ml-3">
                  <StatusBadge status={f.priority} labels={{ low: 'Faible', medium: 'Moyenne', high: 'Haute', critical: 'Critique' }} />
                  <StatusBadge status={f.status} labels={STATUS_LABELS} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <ClipboardList className="w-12 h-12 text-slate-700 mx-auto mb-3" />
            <p className="text-sm text-slate-500 font-medium">Aucune panne enregistrée</p>
          </div>
        )}
      </div>
    </div>
  );
}
