import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import EquipmentList from './pages/EquipmentList';
import EquipmentDetail from './pages/EquipmentDetail';
import KanbanBoard from './pages/KanbanBoard';
import FaultDetail from './pages/FaultDetail';
import SpareParts from './pages/SpareParts';
import Notifications from './pages/Notifications';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/equipment" element={<EquipmentList />} />
          <Route path="/equipment/:id" element={<EquipmentDetail />} />
          <Route path="/kanban" element={<KanbanBoard />} />
          <Route path="/faults/:id" element={<FaultDetail />} />
          <Route path="/spare-parts" element={<SpareParts />} />
          <Route path="/notifications" element={<Notifications />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
