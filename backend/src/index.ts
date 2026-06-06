import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { initDb } from './database.js';
import { seedIfEmpty } from './seed.js';
import equipmentRoutes from './routes/equipment.js';
import faultRoutes from './routes/faults.js';
import sparePartRoutes from './routes/spareparts.js';
import notificationRoutes from './routes/notifications.js';
import dashboardRoutes from './routes/dashboard.js';
import userRoutes from './routes/users.js';
import authRoutes from './routes/auth.js';
import adminRoutes from './routes/admin.js';
import { requireAuth } from './middleware/authGuard.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = Number(process.env.PORT) || 3001;
const isProd = process.env.NODE_ENV === 'production';

app.use(cors());
app.use(express.json({ limit: '50mb' }));

app.use('/api/auth', authRoutes);
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api', requireAuth);
app.use('/api/equipment', equipmentRoutes);
app.use('/api/faults', faultRoutes);
app.use('/api/spare-parts', sparePartRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);

const staticCandidates = [
  path.join(__dirname, '../../frontend/dist'),
  path.join(__dirname, '../../../frontend/dist'),
];
const staticDir = staticCandidates.find(p => fs.existsSync(path.join(p, 'index.html')));

if (staticDir) {
  app.use(express.static(staticDir, { index: false }));
  app.get(/^(?!\/api).*/, (_req, res) => {
    res.sendFile(path.join(staticDir, 'index.html'));
  });
}

async function start() {
  await initDb();
  await seedIfEmpty();
  console.log('Database initialized');
  app.listen(PORT, '0.0.0.0', () => {
    const mode = isProd ? 'production' : 'development';
    console.log(`MaintainX Pro (${mode}) → http://0.0.0.0:${PORT}`);
    if (staticDir) console.log(`Serving frontend from ${staticDir}`);
    else console.warn('Frontend dist not found — API only mode');
  });
}

start().catch(console.error);

export default app;
