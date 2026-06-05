import { Router, Request, Response } from 'express';
import { queryAll, queryOne, execute } from '../database.js';
import { v4 as uuid } from 'uuid';

const router = Router();

router.get('/', (_req: Request, res: Response) => {
  const faults = queryAll(`
    SELECT f.*, e.name as equipment_name, e.category as equipment_category
    FROM faults f LEFT JOIN equipment e ON f.equipment_id = e.id
    ORDER BY f.created_at DESC
  `);
  res.json(faults);
});

router.get('/:id', (req: Request, res: Response) => {
  const fault = queryOne(`
    SELECT f.*, e.name as equipment_name, e.category as equipment_category
    FROM faults f LEFT JOIN equipment e ON f.equipment_id = e.id
    WHERE f.id = ?
  `, [req.params.id]);
  if (!fault) return res.status(404).json({ error: 'Fault not found' });

  const comments = queryAll(
    'SELECT fc.*, u.name as user_name FROM fault_comments fc LEFT JOIN users u ON fc.user_id = u.id WHERE fc.fault_id = ? ORDER BY fc.created_at ASC',
    [req.params.id]
  );
  const parts = queryAll('SELECT * FROM spare_parts WHERE fault_id = ?', [req.params.id]);

  res.json({ ...fault as any, comments, spare_parts: parts });
});

router.post('/', (req: Request, res: Response) => {
  const { equipment_id, title, description, priority, images, reported_by } = req.body;
  if (!equipment_id || !title || !description) return res.status(400).json({ error: 'equipment_id, title, description required' });

  const id = uuid();
  execute(
    'INSERT INTO faults (id, equipment_id, title, description, priority, images, reported_by) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [id, equipment_id, title, description, priority || 'medium', JSON.stringify(images || []), reported_by || null]
  );

  execute("UPDATE equipment SET status = 'maintenance', updated_at = datetime('now') WHERE id = ?", [equipment_id]);

  execute(
    'INSERT INTO activities (id, type, message, related_id, related_type, user_id) VALUES (?, ?, ?, ?, ?, ?)',
    [uuid(), 'fault_created', `Nouvelle panne signalée : ${title}`, id, 'fault', reported_by || null]
  );

  const fault = queryOne(
    'SELECT f.*, e.name as equipment_name FROM faults f LEFT JOIN equipment e ON f.equipment_id = e.id WHERE f.id = ?',
    [id]
  );
  res.status(201).json(fault);
});

router.patch('/:id/status', (req: Request, res: Response) => {
  const { status, user_id } = req.body;
  const validStatuses = ['submitted', 'analysis', 'inspection', 'validation', 'manufacturing', 'delivery', 'closed'];
  if (!validStatuses.includes(status)) return res.status(400).json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });

  const existing = queryOne('SELECT * FROM faults WHERE id = ?', [req.params.id]) as any;
  if (!existing) return res.status(404).json({ error: 'Fault not found' });

  execute("UPDATE faults SET status = ?, updated_at = datetime('now') WHERE id = ?", [status, req.params.id]);

  const statusLabels: Record<string, string> = {
    submitted: 'Soumis', analysis: 'Analyse', inspection: 'Inspection',
    validation: 'Validation', manufacturing: 'Fabrication', delivery: 'Livraison', closed: 'Clôturé'
  };

  execute(
    'INSERT INTO activities (id, type, message, related_id, related_type, user_id) VALUES (?, ?, ?, ?, ?, ?)',
    [uuid(), 'status_change', `Panne "${existing.title}" passée à "${statusLabels[status]}"`, req.params.id, 'fault', user_id || null]
  );

  if (status === 'closed') {
    execute("UPDATE equipment SET status = 'active', updated_at = datetime('now') WHERE id = ?", [existing.equipment_id]);
  }

  const fault = queryOne(
    'SELECT f.*, e.name as equipment_name FROM faults f LEFT JOIN equipment e ON f.equipment_id = e.id WHERE f.id = ?',
    [req.params.id]
  );
  res.json(fault);
});

router.post('/:id/comments', (req: Request, res: Response) => {
  const { user_id, content } = req.body;
  if (!content) return res.status(400).json({ error: 'Content required' });

  const id = uuid();
  execute(
    'INSERT INTO fault_comments (id, fault_id, user_id, content) VALUES (?, ?, ?, ?)',
    [id, req.params.id, user_id || null, content]
  );

  const comment = queryOne(
    'SELECT fc.*, u.name as user_name FROM fault_comments fc LEFT JOIN users u ON fc.user_id = u.id WHERE fc.id = ?',
    [id]
  );
  res.status(201).json(comment);
});

export default router;
