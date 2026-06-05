import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useApi } from '../hooks/useApi';
import { api } from '../services/api';
import { Fault, FaultStatus, STATUS_LABELS, PRIORITY_LABELS } from '../types';
import { LoadingSpinner, StatusBadge, Modal } from '../components/ui/Common';
import { ArrowLeft, Send, Package, Plus, MessageSquare, Clock, Wrench } from 'lucide-react';

const statusFlow: FaultStatus[] = ['submitted', 'analysis', 'inspection', 'validation', 'manufacturing', 'delivery', 'closed'];

export default function FaultDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: fault, loading, refetch } = useApi<Fault>(() => api.faults.get(id!));
  const [comment, setComment] = useState('');
  const [showPartsModal, setShowPartsModal] = useState(false);

  if (loading) return <LoadingSpinner />;
  if (!fault) return <p className="text-slate-400">Panne introuvable.</p>;

  const currentIndex = statusFlow.indexOf(fault.status);

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

      <div className="card">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/20">
              <Wrench className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">{fault.title}</h1>
              <p className="text-sm text-slate-400">{fault.equipment_name}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge status={fault.priority} labels={PRIORITY_LABELS} />
            <StatusBadge status={fault.status} labels={STATUS_LABELS} />
          </div>
        </div>

        <p className="text-sm text-slate-300 mb-4">{fault.description}</p>

        <div className="flex items-center gap-2 text-xs text-slate-500 mb-4">
          <Clock className="w-3 h-3" />
          Créée le {new Date(fault.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
        </div>

        <div className="space-y-2">
          <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Progression</p>
          <div className="flex items-center gap-1">
            {statusFlow.map((s, i) => (
              <div key={s} className="flex items-center flex-1">
                <div className={`w-full h-2 rounded-full ${
                  i <= currentIndex ? 'bg-brand-600' : 'bg-slate-700'
                } transition-colors`} />
                {i < statusFlow.length - 1 && (
                  <div className={`w-1 h-1 -ml-0.5 ${i < currentIndex ? 'bg-brand-600' : 'bg-slate-700'}`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between text-[10px] text-slate-500">
            {statusFlow.map(s => <span key={s}>{STATUS_LABELS[s]}</span>)}
          </div>
        </div>

        {currentIndex < statusFlow.length - 1 && (
          <button onClick={advanceStatus} className="btn-primary mt-4">
            Avancer au statut suivant : {STATUS_LABELS[statusFlow[currentIndex + 1]]}
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Package className="w-4 h-4 text-brand-400" /> Pièces détachées
            </h3>
            <button onClick={() => setShowPartsModal(true)} className="btn-ghost btn-xs">
              <Plus className="w-3 h-3" /> Ajouter
            </button>
          </div>
          {fault.spare_parts && fault.spare_parts.length > 0 ? (
            <div className="space-y-3">
              {fault.spare_parts.map(p => (
                <div key={p.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50">
                  <div>
                    <p className="text-sm font-medium text-white">{p.name}</p>
                    <p className="text-xs text-slate-500">{p.reference} x{p.quantity}</p>
                  </div>
                  <StatusBadge status={p.status} labels={{
                    pending: 'En attente', ordered: 'Commandé', received: 'Reçu', installed: 'Installé', cancelled: 'Annulé'
                  }} />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500">Aucune pièce associée.</p>
          )}
        </div>

        <div className="card">
          <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-brand-400" /> Commentaires
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
          <div className="space-y-3 max-h-60 overflow-y-auto">
            {fault.comments && fault.comments.length > 0 ? (
              fault.comments.map(c => (
                <div key={c.id} className="p-3 rounded-lg bg-slate-800/30">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-slate-300">{c.user_name || 'Anonyme'}</span>
                    <span className="text-[10px] text-slate-600">{new Date(c.created_at).toLocaleDateString('fr-FR')}</span>
                  </div>
                  <p className="text-sm text-slate-300">{c.content}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500">Aucun commentaire.</p>
            )}
          </div>
        </div>
      </div>

      <Modal open={showPartsModal} onClose={() => setShowPartsModal(false)} title="Ajouter une pièce détachée">
        <PartsForm faultId={fault.id} onDone={() => { setShowPartsModal(false); refetch(); }} />
      </Modal>
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
