import { useState } from 'react';
import { useApi } from '../hooks/useApi';
import { api } from '../services/api';
import { SparePart } from '../types';
import { LoadingSpinner, Modal, StatusBadge, PageHeader } from '../components/ui/Common';
import { Package, Plus, Search, Truck, Eye } from 'lucide-react';

export default function SpareParts() {
  const { data: parts, loading, refetch } = useApi<SparePart[]>(() => api.spareParts.list());
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);

  const filtered = parts?.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.reference?.toLowerCase().includes(search.toLowerCase()) ||
    p.supplier?.toLowerCase().includes(search.toLowerCase())
  ) || [];

  async function updateStatus(id: string, status: string) {
    await api.spareParts.updateStatus(id, status);
    refetch();
  }

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pièces détachées"
        description="Suivi des stocks et commandes"
        action={
          <button onClick={() => setShowModal(true)} className="btn-primary shadow-lg shadow-brand-500/20">
            <Plus className="w-4 h-4" /> Ajouter
          </button>
        }
      />

      <div className="relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-500 group-focus-within:text-brand-400 transition-colors" />
        <input type="text" placeholder="Rechercher une pièce..." className="input pl-12" value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="card-glow overflow-hidden">
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <Package className="w-14 h-14 text-slate-700 mx-auto mb-4" />
            <p className="text-base text-slate-500 font-medium">Aucune pièce trouvée</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800/50 bg-slate-800/20">
                  <th className="text-left py-4 px-5 text-xs font-bold text-slate-400 uppercase tracking-wider">Pièce</th>
                  <th className="text-left py-4 px-5 text-xs font-bold text-slate-400 uppercase tracking-wider">Référence</th>
                  <th className="text-left py-4 px-5 text-xs font-bold text-slate-400 uppercase tracking-wider">Qté</th>
                  <th className="text-left py-4 px-5 text-xs font-bold text-slate-400 uppercase tracking-wider">Fournisseur</th>
                  <th className="text-left py-4 px-5 text-xs font-bold text-slate-400 uppercase tracking-wider">Panne</th>
                  <th className="text-left py-4 px-5 text-xs font-bold text-slate-400 uppercase tracking-wider">Statut</th>
                  <th className="text-right py-4 px-5 text-xs font-bold text-slate-400 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p, i) => (
                  <tr key={p.id} className="border-b border-slate-800/30 hover:bg-slate-800/20 transition-colors animate-fade-in" style={{ animationDelay: `${i * 40}ms` }}>
                    <td className="py-4 px-5 text-sm font-semibold text-white">{p.name}</td>
                    <td className="py-4 px-5 text-sm text-slate-400 font-mono">{p.reference || '—'}</td>
                    <td className="py-4 px-5 text-sm text-slate-300 font-semibold">{p.quantity}</td>
                    <td className="py-4 px-5 text-sm text-slate-400">{p.supplier || '—'}</td>
                    <td className="py-4 px-5 text-sm text-slate-400 max-w-[160px] truncate">{p.fault_title || '—'}</td>
                    <td className="py-4 px-5"><StatusBadge status={p.status} labels={{ pending: 'En attente', ordered: 'Commandé', received: 'Reçu', installed: 'Installé', cancelled: 'Annulé' }} /></td>
                    <td className="py-4 px-5 text-right">
                      {p.status === 'pending' && <button onClick={() => updateStatus(p.id, 'ordered')} className="btn-ghost btn-xs"><Truck className="w-3.5 h-3.5" /> Commander</button>}
                      {p.status === 'ordered' && <button onClick={() => updateStatus(p.id, 'received')} className="btn-ghost btn-xs"><Eye className="w-3.5 h-3.5" /> Marquer reçu</button>}
                      {p.status === 'received' && <button onClick={() => updateStatus(p.id, 'installed')} className="btn-ghost btn-xs"><Package className="w-3.5 h-3.5" /> Installé</button>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Nouvelle pièce détachée">
        <PartsForm onDone={() => { setShowModal(false); refetch(); }} />
      </Modal>
    </div>
  );
}

function PartsForm({ onDone }: { onDone: () => void }) {
  const [form, setForm] = useState({ name: '', reference: '', quantity: 1, unit_price: 0, supplier: '', fault_id: '' });
  const { data: faults } = useApi<any[]>(() => api.faults.list());
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try { await api.spareParts.create(form); onDone(); }
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
      <div><label className="label">Panne associée</label>
        <select className="input" value={form.fault_id} onChange={e => setForm(f => ({ ...f, fault_id: e.target.value }))}>
          <option value="">Aucune</option>
          {faults?.map((f: any) => <option key={f.id} value={f.id}>{f.title}</option>)}
        </select>
      </div>
      <button type="submit" className="btn-primary w-full">Ajouter</button>
    </form>
  );
}
