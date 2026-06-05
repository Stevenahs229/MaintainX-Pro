import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { useApi } from '../hooks/useApi';
import { api } from '../services/api';
import { Fault, FaultStatus, STATUS_LABELS, PRIORITY_LABELS } from '../types';
import { LoadingSpinner, Modal, StatusBadge, PageHeader } from '../components/ui/Common';
import { useToast } from '../components/ui/Toast';
import { Plus, Clock, Wrench, GripVertical } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const columns: FaultStatus[] = ['submitted', 'analysis', 'inspection', 'validation', 'manufacturing', 'delivery', 'closed'];

const columnGradients: Record<FaultStatus, string> = {
  submitted: 'from-blue-600/20 to-blue-950/20 border-blue-500/20',
  analysis: 'from-purple-600/20 to-purple-950/20 border-purple-500/20',
  inspection: 'from-amber-600/20 to-amber-950/20 border-amber-500/20',
  validation: 'from-cyan-600/20 to-cyan-950/20 border-cyan-500/20',
  manufacturing: 'from-orange-600/20 to-orange-950/20 border-orange-500/20',
  delivery: 'from-indigo-600/20 to-indigo-950/20 border-indigo-500/20',
  closed: 'from-green-600/20 to-green-950/20 border-green-500/20',
};

const priorityBorders: Record<string, string> = {
  critical: 'border-l-red-500',
  high: 'border-l-orange-500',
  medium: 'border-l-yellow-500',
  low: 'border-l-green-500',
};

export default function KanbanBoard() {
  const { data: faults, loading, refetch } = useApi<Fault[]>(() => api.faults.list());
  const { data: equipment } = useApi<any[]>(() => api.equipment.list());
  const [columnsData, setColumnsData] = useState<Record<string, Fault[]>>({});
  const [showModal, setShowModal] = useState(false);
  const { addToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (!faults) return;
    const grouped: Record<string, Fault[]> = {};
    for (const col of columns) grouped[col] = faults.filter(f => f.status === col);
    setColumnsData(grouped);
  }, [faults]);

  async function handleDragEnd(result: DropResult) {
    if (!result.destination || result.destination.droppableId === result.source.droppableId) return;
    const sourceCol = result.source.droppableId;
    const destCol = result.destination.droppableId as FaultStatus;
    const faultId = result.draggableId;

    const newColumns = { ...columnsData };
    const sourceItems = [...(newColumns[sourceCol] || [])];
    const destItems = [...(newColumns[destCol] || [])];
    const [moved] = sourceItems.splice(result.source.index, 1);
    if (!moved) return;
    moved.status = destCol;
    destItems.splice(result.destination.index, 0, moved);
    newColumns[sourceCol] = sourceItems;
    newColumns[destCol] = destItems;
    setColumnsData(newColumns);

    try { await api.faults.updateStatus(faultId, destCol); addToast(`Panne déplacée vers ${STATUS_LABELS[destCol]}`, 'success'); }
    catch { addToast('Erreur lors du déplacement', 'error'); refetch(); }
  }

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Tableau Kanban"
        description="Glissez-déposez les pannes pour suivre le workflow"
        action={
          <button onClick={() => setShowModal(true)} className="btn-primary shadow-lg shadow-brand-500/20">
            <Plus className="w-5 h-5" /> Nouvelle panne
          </button>
        }
      />

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex gap-6 overflow-x-auto pb-8" style={{ minHeight: 'calc(100vh - 200px)' }}>
          {columns.map(col => (
            <div key={col} className="flex-shrink-0 w-96">
              <div className={`rounded-t-2xl bg-gradient-to-b ${columnGradients[col]} border-t-2 border-x px-6 pt-5 pb-4`}>
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-main tracking-wide">{STATUS_LABELS[col]}</h3>
                  <span className="text-sm font-bold text-muted bg-card-80 rounded-full px-3.5 py-1.5 border-card">
                    {(columnsData[col] || []).length}
                  </span>
                </div>
              </div>
              <Droppable droppableId={col}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`bg-page border-x border-b border-subtle p-5 space-y-4 min-h-[200px] transition-all duration-200 ${
                      snapshot.isDraggingOver ? 'bg-brand-900/20' : ''
                    }`}
                    style={{ borderBottomLeftRadius: '1rem', borderBottomRightRadius: '1rem' }}
                  >
                    {(columnsData[col] || []).map((fault, index) => (
                      <Draggable key={fault.id} draggableId={fault.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            onClick={() => navigate(`/faults/${fault.id}`)}
                            className={`group cursor-grab active:cursor-grabbing rounded-xl border bg-card-30 backdrop-blur-sm transition-all duration-200 ${
                              snapshot.isDragging
                                ? 'shadow-2xl shadow-brand-600/30 border-brand-500/50 scale-[1.02] rotate-[1deg]'
                                : 'border-card hover:border-slate-600/50 hover:bg-card-80'
                            } ${priorityBorders[fault.priority] || 'border-l-slate-600'} border-l-4`}
                            style={{ padding: '20px' }}
                          >
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center gap-2 min-w-0 flex-1">
                                <GripVertical className="w-4 h-4 text-subtle shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                                <h4 className="text-base font-bold text-main truncate">{fault.title}</h4>
                              </div>
                              <StatusBadge status={fault.priority} labels={PRIORITY_LABELS} />
                            </div>
                            {fault.equipment_name && (
                              <p className="text-sm text-dim flex items-center gap-2 mt-2 ml-6">
                                <Wrench className="w-3.5 h-3.5" /> {fault.equipment_name}
                              </p>
                            )}
                            <div className="flex items-center justify-between mt-4 pt-3 border-t border-subtle">
                              <span className="text-xs text-subtle font-medium flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5" />
                                {new Date(fault.created_at).toLocaleDateString('fr-FR')}
                              </span>
                              <div className={`w-2 h-2 rounded-full ${fault.priority === 'critical' ? 'bg-red-500 animate-pulse' : fault.priority === 'high' ? 'bg-orange-500' : fault.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'}`} />
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                    {(columnsData[col] || []).length === 0 && (
                      <p className="text-sm text-subtle text-center py-12 font-medium">Aucune panne</p>
                    )}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Nouvelle panne">
        <FaultForm onDone={() => { setShowModal(false); refetch(); }} equipment={equipment || []} />
      </Modal>
    </div>
  );
}

function FaultForm({ onDone, equipment }: { onDone: () => void; equipment: any[] }) {
  const [form, setForm] = useState({ equipment_id: '', title: '', description: '', priority: 'medium' });
  const { addToast } = useToast();
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try { await api.faults.create(form); addToast('Panne créée avec succès', 'success'); onDone(); }
    catch (err: any) { addToast(err.message, 'error'); }
  }
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="label">Équipement</label>
        <select className="input" required value={form.equipment_id} onChange={e => setForm(f => ({ ...f, equipment_id: e.target.value }))}>
          <option value="">Sélectionner...</option>
          {equipment.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
        </select>
      </div>
      <div>
        <label className="label">Titre</label>
        <input className="input" required value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Ex: Fuite d'huile compresseur" />
      </div>
      <div>
        <label className="label">Description</label>
        <textarea className="input" rows={4} required value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Décrivez le problème..." />
      </div>
      <div>
        <label className="label">Priorité</label>
        <select className="input" value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}>
          <option value="low">Faible</option>
          <option value="medium">Moyenne</option>
          <option value="high">Haute</option>
          <option value="critical">Critique</option>
        </select>
      </div>
      <button type="submit" className="btn-primary w-full">Créer la panne</button>
    </form>
  );
}
