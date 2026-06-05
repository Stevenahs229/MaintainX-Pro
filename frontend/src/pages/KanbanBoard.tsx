import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { useApi } from '../hooks/useApi';
import { api } from '../services/api';
import { Fault, FaultStatus, STATUS_LABELS, STATUS_COLORS, PRIORITY_LABELS } from '../types';
import { LoadingSpinner, Modal, StatusBadge } from '../components/ui/Common';
import { Plus, AlertTriangle, Clock, User, Wrench } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const columns: FaultStatus[] = ['submitted', 'analysis', 'inspection', 'validation', 'manufacturing', 'delivery', 'closed'];

const columnColors: Record<FaultStatus, string> = {
  submitted: 'border-t-blue-500',
  analysis: 'border-t-purple-500',
  inspection: 'border-t-amber-500',
  validation: 'border-t-cyan-500',
  manufacturing: 'border-t-orange-500',
  delivery: 'border-t-indigo-500',
  closed: 'border-t-green-500',
};

const priorityIcon: Record<string, string> = {
  low: 'bg-green-500',
  medium: 'bg-yellow-500',
  high: 'bg-orange-500',
  critical: 'bg-red-500',
};

export default function KanbanBoard() {
  const { data: faults, loading, refetch } = useApi<Fault[]>(() => api.faults.list());
  const { data: equipment } = useApi<any[]>(() => api.equipment.list());
  const [columnsData, setColumnsData] = useState<Record<string, Fault[]>>({});
  const [showModal, setShowModal] = useState(false);
  const [updating, setUpdating] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!faults) return;
    const grouped: Record<string, Fault[]> = {};
    for (const col of columns) {
      grouped[col] = faults.filter(f => f.status === col);
    }
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

    setUpdating(true);
    try {
      await api.faults.updateStatus(faultId, destCol);
    } catch (err) {
      refetch();
    } finally {
      setUpdating(false);
    }
  }

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Tableau Kanban</h1>
          <p className="text-sm text-slate-400 mt-1">Glissez-déposez les pannes pour suivre le workflow</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary">
          <Plus className="w-4 h-4" /> Nouvelle panne
        </button>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex gap-4 overflow-x-auto pb-4" style={{ minHeight: 'calc(100vh - 200px)' }}>
          {columns.map(col => (
            <div key={col} className="flex-shrink-0 w-72">
              <div className={`rounded-t-xl border-t-2 ${columnColors[col]} bg-slate-900/80 border-x border-slate-800 pt-3 px-3`}>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-white">{STATUS_LABELS[col]}</h3>
                  <span className="text-xs text-slate-500 bg-slate-800 rounded-full px-2 py-0.5">
                    {(columnsData[col] || []).length}
                  </span>
                </div>
              </div>
              <Droppable droppableId={col}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`bg-slate-900/60 border-x border-b border-slate-800 p-3 space-y-3 min-h-[200px] transition-colors ${
                      snapshot.isDraggingOver ? 'bg-brand-900/20' : ''
                    }`}
                    style={{ borderBottomLeftRadius: '0.75rem', borderBottomRightRadius: '0.75rem' }}
                  >
                    {(columnsData[col] || []).map((fault, index) => (
                      <Draggable key={fault.id} draggableId={fault.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            onClick={() => navigate(`/faults/${fault.id}`)}
                            className={`card p-4 cursor-grab active:cursor-grabbing ${
                              snapshot.isDragging ? 'shadow-xl shadow-brand-600/20 border-brand-600/50' : ''
                            }`}
                          >
                            <div className="flex items-start justify-between mb-2">
                              <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${priorityIcon[fault.priority] || 'bg-slate-500'}`} />
                              <StatusBadge status={fault.priority} labels={PRIORITY_LABELS} />
                            </div>
                            <h4 className="text-sm font-medium text-white mb-1 line-clamp-2">{fault.title}</h4>
                            {fault.equipment_name && (
                              <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                                <Wrench className="w-3 h-3" /> {fault.equipment_name}
                              </p>
                            )}
                            <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-800">
                              <span className="text-[10px] text-slate-500 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {new Date(fault.created_at).toLocaleDateString('fr-FR')}
                              </span>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                    {(columnsData[col] || []).length === 0 && (
                      <p className="text-xs text-slate-600 text-center py-8">Aucune panne</p>
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await api.faults.create(form);
      onDone();
    } catch (err: any) {
      alert(err.message);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="label">Équipement *</label>
        <select className="input" required value={form.equipment_id} onChange={e => setForm(f => ({ ...f, equipment_id: e.target.value }))}>
          <option value="">Sélectionner...</option>
          {equipment.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
        </select>
      </div>
      <div>
        <label className="label">Titre *</label>
        <input className="input" required value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
      </div>
      <div>
        <label className="label">Description *</label>
        <textarea className="input" rows={3} required value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
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
