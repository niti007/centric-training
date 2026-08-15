import { Router, Request, Response } from 'express';
import * as userService from '../services/userService';
import { errorEnvelope, requireString, ValidationError } from '../util/validate';

const router = Router();

router.get('/', (_req: Request, res: Response) => {
  res.json({ items: userService.list() });
});

router.get('/:id', (req: Request, res: Response) => {
  const user = userService.getById(req.params.id);
  if (!user) {
    res.status(404).json(errorEnvelope('NOT_FOUND', 'User not found'));
    return;
  }
  res.json(user);
});

router.post('/', (req: Request, res: Response) => {
  try {
    const name = requireString(req.body?.name, 'name');
    const email = requireString(req.body?.email, 'email');
    const user = userService.create({ name, email });
    res.status(201).json(user);
  } catch (err) {
    if (err instanceof ValidationError) {
      res.status(400).json(errorEnvelope(err.code, err.message, err.details));
      return;
    }
    throw err;
  }
});

router.patch('/:id', (req: Request, res: Response) => {
  const existing = userService.getById(req.params.id);
  if (!existing) {
    res.status(404).json(errorEnvelope('NOT_FOUND', 'User not found'));
    return;
  }
  try {
    const patch: { name?: string; email?: string } = {};
    if (req.body?.name !== undefined) patch.name = requireString(req.body.name, 'name');
    if (req.body?.email !== undefined) patch.email = requireString(req.body.email, 'email');
    const updated = userService.update(req.params.id, patch);
    res.json(updated);
  } catch (err) {
    if (err instanceof ValidationError) {
      res.status(400).json(errorEnvelope(err.code, err.message, err.details));
      return;
    }
    throw err;
  }
});

router.delete('/:id', (req: Request, res: Response) => {
  const removed = userService.remove(req.params.id);
  if (!removed) {
    res.status(404).json(errorEnvelope('NOT_FOUND', 'User not found'));
    return;
  }
  res.status(204).send();
});

export default router;
