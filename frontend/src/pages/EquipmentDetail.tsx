import { useParams, useNavigate } from 'react-router-dom';
import { useApi } from '../hooks/useApi';
import { api } from '../services/api';
import { Equipment, Fault, STATUS_LABELS } from '../types';
import { LoadingSpinner, StatusBadge } from '../components/ui/Common';
import { ArrowLeft, Wrench, MapPin, Heart, AlertTriangle, ClipboardList } from 'lucide-react';

export default function EquipmentDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: equipment, loading: eqLoading } = useApi<Equipment>(() => api.equipment.get(id!));
  const { data: faults, loading: faultsLoading } = useApi<Fault[]>(() => api.equipment.faults(id!));

  if (eqLoading) return <LoadingSpinner />;
  if (!equipment) return <p className="text-slate-400">Équipement introuvable.</p>;

  return (
    <div className="space-y-6 max-w-4xl">
      <button onClick={() => navigate('/equipment')} className="btn-ghost btn-sm">
        <ArrowLeft className="w-4 h-4" /> Retour
      </button>

      <div className="card">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-brand-600/20">
              <Wrench className="w-6 h-6 text-brand-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">{equipment.name}</h1>
              <p className="text-sm text-slate-400">{equipment.category}</p>
            </div>
          </div>
          <StatusBadge status={equipment.status} labels={{ active: 'Actif', maintenance: 'Maintenance', retired: 'Retiré' }} />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          {equipment.location && (
            <div>
              <p className="text-xs text-slate-500 flex items-center gap-1"><MapPin className="w-3 h-3" /> Localisation</p>
              <p className="text-sm text-white mt-0.5">{equipment.location}</p>
            </div>
          )}
          <div>
            <p className="text-xs text-slate-500 flex items-center gap-1"><Heart className="w-3 h-3 text-red-400" /> Santé</p>
            <p className={`text-sm font-medium mt-0.5 ${equipment.health_score > 70 ? 'text-green-400' : equipment.health_score > 40 ? 'text-amber-400' : 'text-red-400'}`}>
              {equipment.health_score}%
            </p>
          </div>
        </div>

        <div className="w-full h-2 rounded-full bg-slate-700 overflow-hidden">
          <div
            className={`h-full rounded-full ${
              equipment.health_score > 70 ? 'bg-green-500' : equipment.health_score > 40 ? 'bg-amber-500' : 'bg-red-500'
            }`}
            style={{ width: `${equipment.health_score}%` }}
          />
        </div>

        {equipment.description && (
          <p className="text-sm text-slate-300 mt-4">{equipment.description}</p>
        )}
      </div>

      <div className="card">
        <h2 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-400" />
          Historique des pannes ({faults?.length || 0})
        </h2>

        {faultsLoading ? (
          <LoadingSpinner />
        ) : faults && faults.length > 0 ? (
          <div className="space-y-3">
            {faults.map(f => (
              <div
                key={f.id}
                onClick={() => navigate(`/faults/${f.id}`)}
                className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50 cursor-pointer hover:bg-slate-800 transition-colors"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-white truncate">{f.title}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{new Date(f.created_at).toLocaleDateString('fr-FR')}</p>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={f.priority} labels={{ low: 'Faible', medium: 'Moyenne', high: 'Haute', critical: 'Critique' }} />
                  <StatusBadge status={f.status} labels={STATUS_LABELS} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-500 flex items-center gap-2">
            <ClipboardList className="w-4 h-4" /> Aucune panne enregistrée pour cet équipement.
          </p>
        )}
      </div>
    </div>
  );
}
