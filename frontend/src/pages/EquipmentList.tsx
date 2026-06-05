import { useState } from 'react';
import { useApi } from '../hooks/useApi';
import { api } from '../services/api';
import { Equipment } from '../types';
import { LoadingSpinner, Modal, StatusBadge } from '../components/ui/Common';
import { Plus, Search, Wrench, MapPin, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function EquipmentList() {
  const { data: equipment, loading, refetch } = useApi<Equipment[]>(() => api.equipment.list());
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', category: '', description: '', location: '', technical_sheet: '' });
  const navigate = useNavigate();

  const filtered = equipment?.filter(e =>
    e.name.toLowerCase().includes(search.toLowerCase()) ||
    e.category.toLowerCase().includes(search.toLowerCase()) ||
    e.location?.toLowerCase().includes(search.toLowerCase())
  ) || [];

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    try {
      await api.equipment.create(form);
      setShowModal(false);
      setForm({ name: '', category: '', description: '', location: '', technical_sheet: '' });
      refetch();
    } catch (err: any) {
      alert(err.message);
    }
  }

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Équipements</h1>
          <p className="text-sm text-slate-400 mt-1">Gestion du parc industriel</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary">
          <Plus className="w-4 h-4" /> Ajouter
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <input
          type="text"
          placeholder="Rechercher un équipement..."
          className="input pl-10"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map(eq => (
          <div
            key={eq.id}
            onClick={() => navigate(`/equipment/${eq.id}`)}
            className="card cursor-pointer hover:border-brand-600/50 transition-colors group"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="p-2 rounded-lg bg-brand-600/20">
                <Wrench className="w-5 h-5 text-brand-400" />
              </div>
              <StatusBadge status={eq.status} labels={{ active: 'Actif', maintenance: 'Maintenance', retired: 'Retiré' }} />
            </div>
            <h3 className="text-base font-semibold text-white group-hover:text-brand-400 transition-colors">{eq.name}</h3>
            <p className="text-sm text-slate-400 mt-1">{eq.category}</p>
            {eq.location && (
              <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
                <MapPin className="w-3 h-3" /> {eq.location}
              </p>
            )}
            <div className="mt-3 flex items-center gap-2">
              <Heart className="w-3.5 h-3.5 text-red-400" />
              <div className="flex-1 h-1.5 rounded-full bg-slate-700 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    eq.health_score > 70 ? 'bg-green-500' : eq.health_score > 40 ? 'bg-amber-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${eq.health_score}%` }}
                />
              </div>
              <span className="text-xs font-medium text-slate-400">{eq.health_score}%</span>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-20">
          <Wrench className="w-12 h-12 text-slate-700 mx-auto mb-3" />
          <p className="text-slate-400">Aucun équipement trouvé</p>
        </div>
      )}

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Nouvel équipement">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="label">Nom *</label>
            <input className="input" required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          </div>
          <div>
            <label className="label">Catégorie *</label>
            <input className="input" required value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea className="input" rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
          </div>
          <div>
            <label className="label">Localisation</label>
            <input className="input" value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} />
          </div>
          <div>
            <label className="label">Fiche technique</label>
            <input className="input" value={form.technical_sheet} onChange={e => setForm(f => ({ ...f, technical_sheet: e.target.value }))} />
          </div>
          <button type="submit" className="btn-primary w-full">Ajouter</button>
        </form>
      </Modal>
    </div>
  );
}
