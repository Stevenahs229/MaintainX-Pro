import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useApi } from '../hooks/useApi';
import { api } from '../services/api';
import { Fault, FaultStatus, STATUS_LABELS, PRIORITY_LABELS } from '../types';
import { LoadingSpinner, StatusBadge, Modal } from '../components/ui/Common';
import { ArrowLeft, Send, Package, Plus, MessageSquare, Clock, Wrench, CheckCircle2, Circle } from 'lucide-react';

const statusFlow: FaultStatus[] = ['submitted', 'analysis', 'inspection', 'validation', 'manufacturing', 'delivery', 'closed'];

const statusIcons: Record<string, any> = {
  submitted: Circle, analysis: Circle, inspection: Circle,
  validation: Circle, manufacturing: Circle, delivery: Circle, closed: CheckCircle2,
};

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
    <div className="space-y-8 max-w-4xl animate-fade-in">
      <button onClick={() => navigate('/kanban')} className="btn-ghost btn-sm">
        <ArrowLeft className="w-4 h-4" /> Retour au Kanban
      </button>

      <div className="card-glow">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className={`p-3.5 rounded-2xl border shadow-lg ${
              fault.priority === 'critical' ? 'bg-gradient-to-br from-red-500/20 to-red-600/10 border-red-500/20' :
              fault.priority === 'high' ? 'bg-gradient-to-br from-orange-500/20 to-orange-600/10 border-orange-500/20' :
              'bg-gradient-to-br from-amber-500/20 to-amber-600/10 border-amber-500/20'
            }`}>
              <Wrench className={`w-6 h-6 ${
                fault.priority === 'critical' ? 'text-red-400' :
                fault.priority === 'high' ? 'text-orange-400' : 'text-amber-400'
              }`} />
            </div>
            <div>
              <h1 className="text-xl lg:text-2xl font-bold text-white">{fault.title}</h1>
              <p className="text-sm text-slate-400 mt-1 font-medium">{fault.equipment_name}</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5 shrink-0">
            <StatusBadge status={fault.priority} labels={PRIORITY_LABELS} />
            <StatusBadge status={fault.status} labels={STATUS_LABELS} />
          </div>
        </div>

        <p className="text-sm text-slate-300 mb-6 leading-relaxed">{fault.description}</p>

        <div className="flex items-center gap-2 text-xs text-slate-500 mb-6 bg-slate-800/30 rounded-xl px-4 py-3 border border-slate-800/50">
          <Clock className="w-3.5 h-3.5" />
          Créée le {new Date(fault.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
        </div>

        <div className="space-y-3">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Progression</p>
          <div className="flex items-center gap-1">
            {statusFlow.map((s, i) => (
              <div key={s} className="flex items-center flex-1">
                <div className={`flex items-center gap-2 ${
                  i <= currentIndex ? 'text-brand-400' : 'text-slate-700'
                }`}>
                  {i <= currentIndex
                    ? <div className="w-6 h-6 rounded-full bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center shadow-lg shadow-brand-500/30">
                        <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                      </div>
                    : <div className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700/50 flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-slate-600" />
                      </div>
                  }
                </div>
                {i < statusFlow.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-1 rounded-full ${
                    i < currentIndex ? 'bg-gradient-to-r from-brand-500 to-brand-400' : 'bg-slate-800'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between text-[10px] text-slate-600 font-medium">
            {statusFlow.map((s, i) => (
              <span key={s} className={i <= currentIndex ? 'text-brand-400' : ''}>{STATUS_LABELS[s]}</span>
            ))}
          </div>
        </div>

        {currentIndex < statusFlow.length - 1 && (
          <button onClick={advanceStatus} className="btn-primary mt-6 shadow-lg shadow-brand-500/20">
            Avancer → {STATUS_LABELS[statusFlow[currentIndex + 1]]}
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card-glow">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-base font-bold text-white flex items-center gap-2.5">
              <Package className="w-4.5 h-4.5 text-brand-400" /> Pièces détachées
            </h3>
            <button onClick={() => setShowPartsModal(true)} className="btn-ghost btn-sm">
              <Plus className="w-3.5 h-3.5" /> Ajouter
            </button>
          </div>
          {fault.spare_parts && fault.spare_parts.length > 0 ? (
            <div className="space-y-3">
              {fault.spare_parts.map(p => (
                <div key={p.id} className="flex items-center justify-between p-3.5 rounded-xl bg-slate-800/30 border border-slate-800/50 hover:border-brand-500/20 transition-all">
                  <div>
                    <p className="text-sm font-semibold text-white">{p.name}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{p.reference}<span className="mx-1.5">·</span>x{p.quantity}</p>
                  </div>
                  <StatusBadge status={p.status} labels={{ pending: 'En attente', ordered: 'Commandé', received: 'Reçu', installed: 'Installé', cancelled: 'Annulé' }} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Package className="w-10 h-10 text-slate-700 mx-auto mb-2" />
              <p className="text-sm text-slate-500">Aucune pièce associée</p>
            </div>
          )}
        </div>

        <div className="card-glow">
          <h3 className="text-base font-bold text-white mb-5 flex items-center gap-2.5">
            <MessageSquare className="w-4.5 h-4.5 text-brand-400" /> Commentaires
          </h3>
          <form onSubmit={handleAddComment} className="flex gap-3 mb-5">
            <input className="input flex-1" placeholder="Ajouter un commentaire..." value={comment} onChange={e => setComment(e.target.value)} />
            <button type="submit" className="btn-primary btn-sm"><Send className="w-4 h-4" /></button>
          </form>
          <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
            {fault.comments && fault.comments.length > 0 ? (
              fault.comments.map(c => (
                <div key={c.id} className="p-3.5 rounded-xl bg-slate-800/20 border border-slate-800/50">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-slate-300 flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-gradient-to-br from-brand-400 to-purple-500 flex items-center justify-center text-[8px] font-bold text-white">
                        {(c.user_name || 'A')[0]}
                      </div>
                      {c.user_name || 'Anonyme'}
                    </span>
                    <span className="text-[10px] text-slate-600">{new Date(c.created_at).toLocaleDateString('fr-FR')}</span>
                  </div>
                  <p className="text-sm text-slate-300 ml-7">{c.content}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500 text-center py-6">Aucun commentaire. Sois le premier à réagir !</p>
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
    try { await api.spareParts.create({ ...form, fault_id: faultId }); onDone(); }
    catch (err: any) { alert(err.message); }
  }
  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div><label className="label">Nom</label><input className="input" required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
      <div><label className="label">Référence</label><input className="input" value={form.reference} onChange={e => setForm(f => ({ ...f, reference: e.target.value }))} /></div>
      <div className="grid grid-cols-2 gap-4">
        <div><label className="label">Quantité</label><input className="input" type="number" min={1} value={form.quantity} onChange={e => setForm(f => ({ ...f, quantity: +e.target.value }))} /></div>
        <div><label className="label">Prix unitaire</label><input className="input" type="number" min={0} step={0.01} value={form.unit_price} onChange={e => setForm(f => ({ ...f, unit_price: +e.target.value }))} /></div>
      </div>
      <div><label className="label">Fournisseur</label><input className="input" value={form.supplier} onChange={e => setForm(f => ({ ...f, supplier: e.target.value }))} /></div>
      <button type="submit" className="btn-primary w-full">Ajouter la pièce</button>
    </form>
  );
}
