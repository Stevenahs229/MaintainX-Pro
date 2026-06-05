export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'technician';
  avatar?: string;
  created_at: string;
}

export interface Equipment {
  id: string;
  name: string;
  category: string;
  description?: string;
  location?: string;
  technical_sheet?: string;
  status: 'active' | 'maintenance' | 'retired';
  health_score: number;
  last_maintenance?: string;
  created_at: string;
  updated_at: string;
}

export interface Fault {
  id: string;
  equipment_id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: FaultStatus;
  images: string;
  reported_by?: string;
  assigned_to?: string;
  created_at: string;
  updated_at: string;
  equipment_name?: string;
  equipment_category?: string;
  comments?: FaultComment[];
  spare_parts?: SparePart[];
}

export type FaultStatus = 'submitted' | 'analysis' | 'inspection' | 'validation' | 'manufacturing' | 'delivery' | 'closed';

export interface FaultComment {
  id: string;
  fault_id: string;
  user_id?: string;
  user_name?: string;
  content: string;
  created_at: string;
}

export interface SparePart {
  id: string;
  fault_id?: string;
  name: string;
  reference?: string;
  quantity: number;
  unit_price: number;
  supplier?: string;
  status: 'pending' | 'ordered' | 'received' | 'installed' | 'cancelled';
  created_at: string;
  updated_at: string;
  fault_title?: string;
  equipment_name?: string;
}

export interface Activity {
  id: string;
  type: string;
  message: string;
  related_id?: string;
  related_type?: string;
  user_id?: string;
  read: number;
  created_at: string;
}

export interface DashboardData {
  totalEquipment: number;
  activeFaults: number;
  closedFaults: number;
  pendingParts: number;
  criticalFaults: number;
  avgHealth: number;
  faultsByStatus: { status: string; count: number }[];
  faultsByPriority: { priority: string; count: number }[];
  equipmentByCategory: { category: string; count: number }[];
  recentFaults: Fault[];
  statusFlow: { status: string; count: number }[];
  lowHealthEquipment: { id: string; name: string; health_score: number }[];
}

export const STATUS_LABELS: Record<FaultStatus, string> = {
  submitted: 'Soumis',
  analysis: 'Analyse',
  inspection: 'Inspection',
  validation: 'Validation',
  manufacturing: 'Fabrication',
  delivery: 'Livraison',
  closed: 'Clôturé',
};

export const PRIORITY_LABELS: Record<string, string> = {
  low: 'Faible',
  medium: 'Moyenne',
  high: 'Haute',
  critical: 'Critique',
};

export const STATUS_COLORS: Record<FaultStatus, string> = {
  submitted: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  analysis: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  inspection: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  validation: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  manufacturing: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  delivery: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
  closed: 'bg-green-500/20 text-green-400 border-green-500/30',
};
