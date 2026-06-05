import { useState } from 'react';
import { useApi } from '../hooks/useApi';
import { api } from '../services/api';
import { Equipment } from '../types';
import { LoadingSpinner, Modal, StatusBadge, PageHeader } from '../components/ui/Common';
import { useToast } from '../components/ui/Toast';
import { QRCode } from '../components/ui/QRCode';
import { Plus, Search, Wrench, MapPin, Heart, Cpu, QrCode } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function EquipmentList() {
  const { data: equipment, loading, refetch } = useApi<Equipment[]>(() => api.equipment.list());
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', category: '', description: '', location: '', technical_sheet: '' });
  const [qrEquipment, setQrEquipment] = useState<string | null>(null);
  const { addToast } = useToast();
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
      addToast('Équipement créé avec succès', 'success');
      setShowModal(false);
      setForm({ name: '', category: '', description: '', location: '', technical_sheet: '' });
      refetch();
    } catch (err: any) { addToast(err.message, 'error'); }
  }

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Équipements"
        description="Gestion du parc industriel"
        action={
          <button onClick={() => setShowModal(true)} className="btn-primary shadow-lg shadow-brand-500/20">
            <Plus className="w-5 h-5" /> Ajouter
          </button>
        }
      />

      <div className="relative group">
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-dim group-focus-within:text-brand-400 transition-colors" />
        <input
          type="text"
          placeholder="Rechercher un équipement..."
          className="input pl-14 text-lg py-4"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filtered.map((eq, i) => (
          <div className="card-glow relative animate-slide-up group" style={{ animationDelay: `${i * 60}ms` }}>
            <button
              onClick={e => { e.stopPropagation(); setQrEquipment(qrEquipment === eq.id ? null : eq.id); }}
              className="absolute top-4 right-4 z-10 p-2 rounded-lg bg-card-80 border border-slate-700/50 text-dim hover:text-brand-400 hover:border-brand-500/30 transition-all opacity-0 group-hover:opacity-100"
            >
              <QrCode className="w-4 h-4" />
            </button>
            {qrEquipment === eq.id && (
              <div className="absolute top-14 right-4 z-20 animate-scale-in" onClick={e => e.stopPropagation()}>
                <QRCode value={`${window.location.origin}/equipment/${eq.id}`} size={120} />
              </div>
            )}
            <div onClick={() => navigate(`/equipment/${eq.id}`)} className="cursor-pointer">
              <div className="p-7">
                <div className="flex items-start justify-between mb-5">
                  <div className="p-4 rounded-xl bg-gradient-to-br from-brand-500/20 to-brand-600/10 border border-brand-500/20 shadow-lg shadow-brand-500/10">
                    <Cpu className="w-6 h-6 text-brand-400" />
                  </div>
                  <StatusBadge status={eq.status} labels={{ active: 'Actif', maintenance: 'Maintenance', retired: 'Retiré' }} />
                </div>
                <h3 className="text-lg font-bold text-main group-hover:text-brand-400 transition-colors">{eq.name}</h3>
                <p className="text-base text-muted mt-1.5 font-medium">{eq.category}</p>
                {eq.location && (
                  <p className="text-sm text-dim mt-4 flex items-center gap-2">
                    <MapPin className="w-4 h-4" /> {eq.location}
                  </p>
                )}
              </div>
              <div className="px-7 pb-7 flex items-center gap-3">
              <Heart className="w-4 h-4 text-red-400 shrink-0" />
              <div className="flex-1 h-2 rounded-full bg-card-40 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    eq.health_score > 70 ? 'bg-gradient-to-r from-green-500 to-emerald-400' : eq.health_score > 40 ? 'bg-gradient-to-r from-amber-500 to-yellow-400' : 'bg-gradient-to-r from-red-500 to-rose-400'
                  }`}
                  style={{ width: `${eq.health_score}%` }}
                />
              </div>
              <span className="text-sm font-bold text-muted">{eq.health_score}%</span>
            </div>
          </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-24">
          <Wrench className="w-14 h-14 text-dim mx-auto mb-4" />
          <p className="text-base text-dim font-medium">Aucun équipement trouvé</p>
        </div>
      )}

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Nouvel équipement">
        <form onSubmit={handleCreate} className="space-y-6">
          <div><label className="label">Nom</label><input className="input" required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
          <div><label className="label">Catégorie</label><input className="input" required value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} /></div>
          <div><label className="label">Description</label><textarea className="input" rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></div>
          <div><label className="label">Localisation</label><input className="input" value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} /></div>
          <div><label className="label">Fiche technique</label><input className="input" value={form.technical_sheet} onChange={e => setForm(f => ({ ...f, technical_sheet: e.target.value }))} /></div>
          <button type="submit" className="btn-primary w-full">Ajouter</button>
        </form>
      </Modal>
    </div>
  );
}
