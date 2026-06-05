import { useState } from 'react';
import { useApi } from '../hooks/useApi';
import { api } from '../services/api';
import { SparePart } from '../types';
import { LoadingSpinner, Modal, StatusBadge } from '../components/ui/Common';
import { Package, Plus, Search, Truck } from 'lucide-react';

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Pièces détachées</h1>
          <p className="text-sm text-slate-400 mt-1">Suivi des stocks et commandes</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary">
          <Plus className="w-4 h-4" /> Ajouter
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <input
          type="text"
          placeholder="Rechercher une pièce..."
          className="input pl-10"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div className="card">
        {filtered.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-12 h-12 text-slate-700 mx-auto mb-3" />
            <p className="text-slate-400">Aucune pièce trouvée</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800">
                  <th className="text-left py-3 px-4 text-slate-400 font-medium">Pièce</th>
                  <th className="text-left py-3 px-4 text-slate-400 font-medium">Référence</th>
                  <th className="text-left py-3 px-4 text-slate-400 font-medium">Qté</th>
                  <th className="text-left py-3 px-4 text-slate-400 font-medium">Fournisseur</th>
                  <th className="text-left py-3 px-4 text-slate-400 font-medium">Panne liée</th>
                  <th className="text-left py-3 px-4 text-slate-400 font-medium">Statut</th>
                  <th className="text-right py-3 px-4 text-slate-400 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(p => (
                  <tr key={p.id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-4 text-white font-medium">{p.name}</td>
                    <td className="py-3 px-4 text-slate-400">{p.reference || '-'}</td>
                    <td className="py-3 px-4 text-slate-300">{p.quantity}</td>
                    <td className="py-3 px-4 text-slate-400">{p.supplier || '-'}</td>
                    <td className="py-3 px-4 text-slate-400">{p.fault_title || '-'}</td>
                    <td className="py-3 px-4">
                      <StatusBadge status={p.status} labels={{
                        pending: 'En attente', ordered: 'Commandé', received: 'Reçu', installed: 'Installé', cancelled: 'Annulé'
                      }} />
                    </td>
                    <td className="py-3 px-4 text-right">
                      {p.status === 'pending' && (
                        <button onClick={() => updateStatus(p.id, 'ordered')} className="btn-ghost btn-xs">
                          <Truck className="w-3 h-3" /> Commander
                        </button>
                      )}
                      {p.status === 'ordered' && (
                        <button onClick={() => updateStatus(p.id, 'received')} className="btn-ghost btn-xs">
                          Marquer reçu
                        </button>
                      )}
                      {p.status === 'received' && (
                        <button onClick={() => updateStatus(p.id, 'installed')} className="btn-ghost btn-xs">
                          Installé
                        </button>
                      )}
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
    try {
      await api.spareParts.create(form);
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
      <div>
        <label className="label">Panne associée (optionnelle)</label>
        <select className="input" value={form.fault_id} onChange={e => setForm(f => ({ ...f, fault_id: e.target.value }))}>
          <option value="">Aucune</option>
          {faults?.map((f: any) => <option key={f.id} value={f.id}>{f.title}</option>)}
        </select>
      </div>
      <button type="submit" className="btn-primary w-full">Ajouter</button>
    </form>
  );
}
