import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useApi } from '../hooks/useApi';
import { api } from '../services/api';
import { Fault, FaultStatus, STATUS_LABELS, PRIORITY_LABELS, parseImages } from '../types';
import { LoadingSpinner, StatusBadge, Modal } from '../components/ui/Common';
import { ArrowLeft, Send, Package, Plus, MessageSquare, Clock, Wrench, ScanLine, Camera } from 'lucide-react';
import ImageGallery from '../components/ui/ImageGallery';
import CameraScanner from '../components/scan/CameraScanner';
import { useAuth } from '../context/AuthContext';
import { faultImage, faultImages } from '../lib/equipmentImages';

const statusFlow: FaultStatus[] = ['submitted', 'analysis', 'inspection', 'validation', 'manufacturing', 'delivery', 'closed'];

export default function FaultDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: fault, loading, refetch } = useApi<Fault>(() => api.faults.get(id!));
  const [comment, setComment] = useState('');
  const [showPartsModal, setShowPartsModal] = useState(false);
  const { user } = useAuth();
  const [showScan, setShowScan] = useState(false);

  if (loading) return <LoadingSpinner />;
  if (!fault) return <p className="text-ink-soft">Panne introuvable.</p>;

  const currentIndex = statusFlow.indexOf(fault.status);
  const images = parseImages(fault.images);
  const galleryImages = images.length > 0 ? images : faultImages(fault);

  async function handleAddImages(imgs: string[]) {
    setShowScan(false);
    if (!imgs.length) return;
    await api.faults.addImages(fault!.id, imgs);
    refetch();
  }

  async function advanceStatus() {
    const nextIdx = currentIndex + 1;
    if (nextIdx >= statusFlow.length) return;
    await api.faults.updateStatus(fault!.id, statusFlow[nextIdx]);
    refetch();
  }

  async function handleAddComment(e: React.FormEvent) {
    e.preventDefault();
    if (!comment.trim()) return;
    await api.faults.addComment(fault!.id, { content: comment });
    setComment('');
    refetch();
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <button onClick={() => navigate('/kanban')} className="btn-ghost btn-sm">
        <ArrowLeft className="w-4 h-4" /> Retour au Kanban
      </button>

      <div className="card overflow-hidden p-0">
        <img
          src={galleryImages[0]}
          alt={fault.title}
          className="h-48 w-full object-cover"
        />
        <div className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-xl font-semibold text-ink tracking-tight">{fault.title}</h1>
            <p className="text-sm text-ink-soft">{fault.equipment_name}</p>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge status={fault.priority} labels={PRIORITY_LABELS} />
            <StatusBadge status={fault.status} labels={STATUS_LABELS} />
          </div>
        </div>

        <p className="text-sm text-ink-soft mb-4">{fault.description}</p>

        <div className="flex items-center gap-2 text-xs text-ink-faint mb-4">
          <Clock className="w-3 h-3" />
          Créée le {new Date(fault.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
        </div>

        <div className="space-y-2">
          <p className="text-xs text-ink-faint font-medium uppercase tracking-wider">Progression</p>
          <div className="flex items-center gap-1">
            {statusFlow.map((s, i) => (
              <div key={s} className="flex items-center flex-1">
                <div className={`w-full h-1.5 rounded-full ${
                  i <= currentIndex ? 'bg-brand-600' : 'bg-zinc-200'
                } transition-colors`} />
              </div>
            ))}
          </div>
          <div className="flex justify-between text-[10px] text-ink-faint">
            {statusFlow.map(s => <span key={s}>{STATUS_LABELS[s]}</span>)}
          </div>
        </div>

        {currentIndex < statusFlow.length - 1 && (
          <button onClick={advanceStatus} className="btn-primary mt-4">
            Avancer au statut suivant : {STATUS_LABELS[statusFlow[currentIndex + 1]]}
          </button>
        )}
        </div>
      </div>

      <div className="card">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-ink">
            <Camera className="h-4 w-4 text-accent-600" /> Preuves visuelles ({galleryImages.length})
          </h3>
          <button onClick={() => setShowScan(true)} className="btn-ghost btn-xs">
            <ScanLine className="h-3 w-3" /> Ajouter un scan
          </button>
        </div>
        <ImageGallery images={galleryImages} emptyLabel="Aucune preuve visuelle — lancez un scan guidé" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-ink flex items-center gap-2">
              <Package className="w-4 h-4 text-brand-600" /> Pièces détachées
            </h3>
            <button onClick={() => setShowPartsModal(true)} className="btn-ghost btn-xs">
              <Plus className="w-3 h-3" /> Ajouter
            </button>
          </div>
          {fault.spare_parts && fault.spare_parts.length > 0 ? (
            <div className="space-y-2.5">
              {fault.spare_parts.map(p => (
                <div key={p.id} className="flex items-center justify-between p-3 rounded-xl bg-surface-muted">
                  <div>
                    <p className="text-sm font-medium text-ink">{p.name}</p>
                    <p className="text-xs text-ink-faint">{p.reference} x{p.quantity}</p>
                  </div>
                  <StatusBadge status={p.status} labels={{
                    pending: 'En attente', ordered: 'Commandé', received: 'Reçu', installed: 'Installé', cancelled: 'Annulé'
                  }} />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-ink-faint">Aucune pièce associée.</p>
          )}
        </div>

        <div className="card">
          <h3 className="text-sm font-semibold text-ink mb-4 flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-brand-600" /> Commentaires
          </h3>
          <form onSubmit={handleAddComment} className="flex gap-2 mb-4">
            <input
              className="input flex-1"
              placeholder="Ajouter un commentaire..."
              value={comment}
              onChange={e => setComment(e.target.value)}
            />
            <button type="submit" className="btn-primary btn-sm"><Send className="w-3 h-3" /></button>
          </form>
          <div className="space-y-2.5 max-h-60 overflow-y-auto">
            {fault.comments && fault.comments.length > 0 ? (
              fault.comments.map(c => (
                <div key={c.id} className="p-3 rounded-xl bg-surface-muted">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-ink-soft">{c.user_name || 'Anonyme'}</span>
                    <span className="text-[10px] text-ink-faint">{new Date(c.created_at).toLocaleDateString('fr-FR')}</span>
                  </div>
                  <p className="text-sm text-ink-soft">{c.content}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-ink-faint">Aucun commentaire.</p>
            )}
          </div>
        </div>

        {fault.status === 'closed' && (user?.role === 'technician' || user?.role === 'admin') && (
          <InterventionReport faultId={fault.id} report={(fault as any).intervention_report} onSaved={refetch} />
        )}
      </div>

      <Modal open={showPartsModal} onClose={() => setShowPartsModal(false)} title="Ajouter une pièce détachée">
        <PartsForm faultId={fault.id} onDone={() => { setShowPartsModal(false); refetch(); }} />
      </Modal>

      <Modal open={showScan} onClose={() => setShowScan(false)} title="Scan guidé — preuves visuelles">
        <CameraScanner onComplete={handleAddImages} onCancel={() => setShowScan(false)} minShots={1} />
      </Modal>
    </div>
  );
}

function InterventionReport({ faultId, report, onSaved }: { faultId: string; report?: any; onSaved: () => void }) {
  const [form, setForm] = useState({
    hours_spent: report?.hours_spent || 0,
    actions_taken: report?.actions_taken || '',
    estimated_cost: report?.estimated_cost || 0,
    recommendations: report?.recommendations || '',
  });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    await api.faults.submitReport(faultId, form);
    onSaved();
  }

  return (
    <div className="card lg:col-span-2">
      <h3 className="text-sm font-semibold text-ink mb-4">Rapport d'intervention</h3>
      {report ? (
        <div className="text-sm space-y-2 text-ink-soft">
          <p><strong>Temps passé :</strong> {report.hours_spent}h</p>
          <p><strong>Actions :</strong> {report.actions_taken}</p>
          <p><strong>Coût estimé :</strong> {report.estimated_cost} €</p>
          {report.recommendations && <p><strong>Recommandations :</strong> {report.recommendations}</p>}
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-3">
          <input className="input" type="number" step="0.5" placeholder="Heures passées" value={form.hours_spent} onChange={e => setForm({ ...form, hours_spent: +e.target.value })} />
          <textarea className="input min-h-[80px]" placeholder="Actions réalisées" value={form.actions_taken} onChange={e => setForm({ ...form, actions_taken: e.target.value })} />
          <input className="input" type="number" placeholder="Coût total estimé (€)" value={form.estimated_cost} onChange={e => setForm({ ...form, estimated_cost: +e.target.value })} />
          <textarea className="input min-h-[60px]" placeholder="Recommandations anti-récurrence" value={form.recommendations} onChange={e => setForm({ ...form, recommendations: e.target.value })} />
          <button type="submit" className="btn-primary">Soumettre le rapport</button>
        </form>
      )}
    </div>
  );
}

function PartsForm({ faultId, onDone }: { faultId: string; onDone: () => void }) {
  const [form, setForm] = useState({ name: '', reference: '', quantity: 1, unit_price: 0, supplier: '' });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await api.spareParts.create({ ...form, fault_id: faultId });
      onDone();
    } catch (err: any) {
      alert(err.message);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="label">Nom *</label>
        <input className="input" required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
      </div>
      <div>
        <label className="label">Référence</label>
        <input className="input" value={form.reference} onChange={e => setForm(f => ({ ...f, reference: e.target.value }))} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Quantité</label>
          <input className="input" type="number" min={1} value={form.quantity} onChange={e => setForm(f => ({ ...f, quantity: +e.target.value }))} />
        </div>
        <div>
          <label className="label">Prix unitaire</label>
          <input className="input" type="number" min={0} step={0.01} value={form.unit_price} onChange={e => setForm(f => ({ ...f, unit_price: +e.target.value }))} />
        </div>
      </div>
      <div>
        <label className="label">Fournisseur</label>
        <input className="input" value={form.supplier} onChange={e => setForm(f => ({ ...f, supplier: e.target.value }))} />
      </div>
      <button type="submit" className="btn-primary w-full">Ajouter la pièce</button>
    </form>
  );
}
