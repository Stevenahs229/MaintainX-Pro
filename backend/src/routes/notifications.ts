import { Router, Request, Response } from 'express';
import { queryAll, queryOne, execute } from '../database.js';

const router = Router();

router.get('/', (_req: Request, res: Response) => {
  const activities = queryAll('SELECT * FROM activities ORDER BY created_at DESC LIMIT 50');
  const unread = (queryOne('SELECT COUNT(*) as count FROM activities WHERE read = 0') as any)?.count || 0;
  res.json({ activities, unread });
});

router.patch('/:id/read', (req: Request, res: Response) => {
  execute('UPDATE activities SET read = 1 WHERE id = ?', [req.params.id]);
  res.json({ message: 'Marked as read' });
});

router.post('/mark-all-read', (_req: Request, res: Response) => {
  execute('UPDATE activities SET read = 1 WHERE read = 0');
  res.json({ message: 'All marked as read' });
});

export default router;
