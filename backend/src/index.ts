import express from 'express';
import cors from 'cors';
import { initDb } from './database.js';
import authRoutes from './routes/auth.js';
import equipmentRoutes from './routes/equipment.js';
import faultRoutes from './routes/faults.js';
import sparePartRoutes from './routes/spareparts.js';
import notificationRoutes from './routes/notifications.js';
import dashboardRoutes from './routes/dashboard.js';
import userRoutes from './routes/users.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

app.use('/api/auth', authRoutes);
app.use('/api/equipment', equipmentRoutes);
app.use('/api/faults', faultRoutes);
app.use('/api/spare-parts', sparePartRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/users', userRoutes);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

async function start() {
  await initDb();
  console.log('Database initialized');
  app.listen(PORT, () => {
    console.log(`MaintainX Pro API running on http://localhost:${PORT}`);
  });
}

start().catch(console.error);

export default app;
