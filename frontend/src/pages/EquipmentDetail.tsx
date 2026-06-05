import { useParams, useNavigate } from 'react-router-dom';
import { useApi } from '../hooks/useApi';
import { api } from '../services/api';
import { Equipment, Fault, STATUS_LABELS } from '../types';
import { LoadingSpinner, StatusBadge } from '../components/ui/Common';
import { QRCode } from '../components/ui/QRCode';
import { ArrowLeft, Wrench, MapPin, Heart, AlertTriangle, ClipboardList, Activity, QrCode } from 'lucide-react';
import { useState } from 'react';

export default function EquipmentDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: equipment, loading: eqLoading } = useApi<Equipment>(() => api.equipment.get(id!));
  const { data: faults, loading: faultsLoading } = useApi<Fault[]>(() => api.equipment.faults(id!));
  const [showQR, setShowQR] = useState(false);

  if (eqLoading) return <LoadingSpinner />;
  if (!equipment) return <p className="text-muted">Équipement introuvable.</p>;

  const qrValue = `${window.location.origin}/equipment/${equipment.id}`;

  return (
    <div className="space-y-10 max-w-4xl animate-fade-in">
      <button onClick={() => navigate('/equipment')} className="btn-ghost">
        <ArrowLeft className="w-5 h-5" /> Retour
      </button>

      <div className="card-glow">
        <div className="flex items-start justify-between mb-8">
          <div className="flex items-center gap-6">
            <div className="p-5 rounded-2xl bg-gradient-to-br from-brand-500/20 to-brand-600/10 border border-brand-500/20 shadow-lg">
              <Wrench className="w-8 h-8 text-brand-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-main">{equipment.name}</h1>
              <p className="text-base text-muted mt-1.5 font-medium">{equipment.category}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <button onClick={() => setShowQR(!showQR)} className="btn-ghost btn-sm">
              <QrCode className="w-4 h-4" /> QR Code
            </button>
            <StatusBadge status={equipment.status} labels={{ active: 'Actif', maintenance: 'Maintenance', retired: 'Retiré' }} />
          </div>
        </div>

        {showQR && (
          <div className="mb-8 flex justify-center animate-slide-up">
            <QRCode value={qrValue} label={equipment.name} />
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          {equipment.location && (
            <div className="p-4 rounded-xl bg-card-30 border-subtle">
              <p className="text-sm text-dim flex items-center gap-2 mb-1.5"><MapPin className="w-4 h-4" /> Localisation</p>
              <p className="text-base font-semibold text-main">{equipment.location}</p>
            </div>
          )}
          <div className="p-4 rounded-xl bg-card-30 border-subtle">
            <p className="text-sm text-dim flex items-center gap-2 mb-1.5"><Heart className="w-4 h-4 text-red-400" /> Santé</p>
            <p className={`text-base font-bold ${equipment.health_score > 70 ? 'text-green-400' : equipment.health_score > 40 ? 'text-amber-400' : 'text-red-400'}`}>
              {equipment.health_score}%
            </p>
          </div>
          <div className="p-4 rounded-xl bg-card-30 border-subtle">
            <p className="text-sm text-dim flex items-center gap-2 mb-1.5"><Activity className="w-4 h-4 text-brand-400" /> Statut</p>
            <p className="text-base font-bold text-main capitalize">{equipment.status}</p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm text-dim">
            <span>Health Score</span>
            <span className={equipment.health_score > 70 ? 'text-green-400' : equipment.health_score > 40 ? 'text-amber-400' : 'text-red-400'}>{equipment.health_score}%</span>
          </div>
          <div className="w-full h-3 rounded-full bg-card-40 overflow-hidden p-0.5">
            <div
              className={`h-full rounded-full transition-all duration-1000 ${
                equipment.health_score > 70 ? 'bg-gradient-to-r from-green-500 to-emerald-400' : equipment.health_score > 40 ? 'bg-gradient-to-r from-amber-500 to-yellow-400' : 'bg-gradient-to-r from-red-500 to-rose-400'
              }`}
              style={{ width: `${equipment.health_score}%` }}
            />
          </div>
        </div>

        {equipment.description && (
          <p className="text-base text-muted mt-6 leading-relaxed">{equipment.description}</p>
        )}
      </div>

      <div className="card-glow">
        <h2 className="text-xl font-bold text-main mb-6 flex items-center gap-3">
          <AlertTriangle className="w-6 h-6 text-amber-400" />
          Historique des pannes
          <span className="text-base font-medium text-dim ml-auto">({faults?.length || 0} panne{(faults?.length || 0) > 1 ? 's' : ''})</span>
        </h2>

        {faultsLoading ? <LoadingSpinner />
        : faults && faults.length > 0 ? (
          <div className="space-y-4">
            {faults.map((f, i) => (
              <div
                key={f.id}
                onClick={() => navigate(`/faults/${f.id}`)}
                className="flex items-center justify-between p-5 rounded-xl bg-card-30 border-subtle hover:border-brand-500/20 transition-all cursor-pointer animate-slide-up group"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${f.priority === 'critical' ? 'bg-red-500 animate-pulse' : f.priority === 'high' ? 'bg-orange-500' : f.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'}`} />
                    <p className="text-base font-semibold text-main group-hover:text-brand-400 transition-colors truncate">{f.title}</p>
                  </div>
                  <p className="text-sm text-dim ml-6 mt-1">{new Date(f.created_at).toLocaleDateString('fr-FR')}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0 ml-4">
                  <StatusBadge status={f.priority} labels={{ low: 'Faible', medium: 'Moyenne', high: 'Haute', critical: 'Critique' }} />
                  <StatusBadge status={f.status} labels={STATUS_LABELS} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <ClipboardList className="w-14 h-14 text-dim mx-auto mb-4" />
            <p className="text-base text-dim font-medium">Aucune panne enregistrée</p>
          </div>
        )}
      </div>
    </div>
  );
}
