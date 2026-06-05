import { useState } from 'react';
import { useApi } from '../hooks/useApi';
import { api } from '../services/api';
import { SparePart } from '../types';
import { LoadingSpinner, Modal, StatusBadge, PageHeader } from '../components/ui/Common';
import { useToast } from '../components/ui/Toast';
import { Package, Plus, Search, Truck, Eye } from 'lucide-react';

export default function SpareParts() {
  const { data: parts, loading, refetch } = useApi<SparePart[]>(() => api.spareParts.list());
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const { addToast } = useToast();

  const filtered = parts?.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.reference?.toLowerCase().includes(search.toLowerCase()) ||
    p.supplier?.toLowerCase().includes(search.toLowerCase())
  ) || [];

  async function updateStatus(id: string, status: string) {
    await api.spareParts.updateStatus(id, status);
    addToast(`Pièce mise à jour: ${status}`, 'success');
    refetch();
  }

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-8 relative"
      style={{ backgroundImage: 'url(/pictures/pieces.jpg)', backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed' }}>
      <div className="absolute inset-0 bg-black/70" />
      <div className="relative">
      <PageHeader
        title="Pièces détachées"
        description="Suivi des stocks et commandes"
        action={
          <button onClick={() => setShowModal(true)} className="btn-primary shadow-lg shadow-brand-500/20">
            <Plus className="w-5 h-5" /> Ajouter
          </button>
        }
      />

      <div className="relative group">
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-dim group-focus-within:text-brand-400 transition-colors" />
        <input type="text" placeholder="Rechercher une pièce..." className="input pl-14 text-lg py-4" value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="card-glow overflow-hidden">
        {filtered.length === 0 ? (
          <div className="text-center py-24">
            <Package className="w-16 h-16 text-dim mx-auto mb-4" />
            <p className="text-lg text-dim font-medium">Aucune pièce trouvée</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-subtle bg-card-20">
                  <th className="text-left py-5 px-6 text-sm font-bold text-muted uppercase tracking-wider">Pièce</th>
                  <th className="text-left py-5 px-6 text-sm font-bold text-muted uppercase tracking-wider">Référence</th>
                  <th className="text-left py-5 px-6 text-sm font-bold text-muted uppercase tracking-wider">Qté</th>
                  <th className="text-left py-5 px-6 text-sm font-bold text-muted uppercase tracking-wider">Fournisseur</th>
                  <th className="text-left py-5 px-6 text-sm font-bold text-muted uppercase tracking-wider">Panne</th>
                  <th className="text-left py-5 px-6 text-sm font-bold text-muted uppercase tracking-wider">Statut</th>
                  <th className="text-right py-5 px-6 text-sm font-bold text-muted uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p, i) => (
                  <tr key={p.id} className="border-b border-subtle hover:bg-card-20 transition-colors animate-fade-in" style={{ animationDelay: `${i * 40}ms` }}>
                    <td className="py-5 px-6 text-base font-semibold text-main">{p.name}</td>
                    <td className="py-5 px-6 text-base text-muted font-mono">{p.reference || '—'}</td>
                    <td className="py-5 px-6 text-base text-muted font-semibold">{p.quantity}</td>
                    <td className="py-5 px-6 text-base text-muted">{p.supplier || '—'}</td>
                    <td className="py-5 px-6 text-base text-muted max-w-[200px] truncate">{p.fault_title || '—'}</td>
                    <td className="py-5 px-6"><StatusBadge status={p.status} labels={{ pending: 'En attente', ordered: 'Commandé', received: 'Reçu', installed: 'Installé', cancelled: 'Annulé' }} /></td>
                    <td className="py-5 px-6 text-right">
                      {p.status === 'pending' && <button onClick={() => updateStatus(p.id, 'ordered')} className="btn-ghost btn-sm"><Truck className="w-4 h-4" /> Commander</button>}
                      {p.status === 'ordered' && <button onClick={() => updateStatus(p.id, 'received')} className="btn-ghost btn-sm"><Eye className="w-4 h-4" /> Marquer reçu</button>}
                      {p.status === 'received' && <button onClick={() => updateStatus(p.id, 'installed')} className="btn-ghost btn-sm"><Package className="w-4 h-4" /> Installé</button>}
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
    </div>
  );
}

function PartsForm({ onDone }: { onDone: () => void }) {
  const [form, setForm] = useState({ name: '', reference: '', quantity: 1, unit_price: 0, supplier: '', fault_id: '' });
  const { data: faults } = useApi<any[]>(() => api.faults.list());
  const { addToast } = useToast();
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try { await api.spareParts.create(form); addToast('Pièce créée avec succès', 'success'); onDone(); }
    catch (err: any) { addToast(err.message, 'error'); }
  }
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div><label className="label">Nom</label><input className="input" required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
      <div><label className="label">Référence</label><input className="input" value={form.reference} onChange={e => setForm(f => ({ ...f, reference: e.target.value }))} /></div>
      <div className="grid grid-cols-2 gap-5">
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
