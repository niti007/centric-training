import { Router, Response } from 'express';
import * as taskService from '../services/taskService';
import { requireAuth, AuthedRequest } from './auth';
import {
  errorEnvelope,
  requireString,
  requireNumber,
  requireOneOf,
  requireISODate,
  optionalString,
  optionalNumber,
  ValidationError,
} from '../util/validate';

const router = Router();

router.use(requireAuth);

router.get('/', (req: AuthedRequest, res: Response) => {
  try {
    const page = req.query.page ? requireNumber(Number(req.query.page), 'page') : 1;
    const size = req.query.size ? requireNumber(Number(req.query.size), 'size') : 10;
    const userId = req.query.userId ? String(req.query.userId) : undefined;
    const result = taskService.list({ page, size, userId });
    res.json(result);
  } catch (err) {
    if (err instanceof ValidationError) {
      res.status(400).json(errorEnvelope(err.code, err.message, err.details));
      return;
    }
    throw err;
  }
});

router.get('/:id', (req: AuthedRequest, res: Response) => {
  const task = taskService.getById(req.params.id);
  if (!task) {
    res.status(404).json(errorEnvelope('NOT_FOUND', 'Task not found'));
    return;
  }
  if (task.userId !== req.userId) {
    res.status(403).json(errorEnvelope('FORBIDDEN', 'Not your task'));
    return;
  }
  res.json(task);
});

router.post('/', (req: AuthedRequest, res: Response) => {
  try {
    const title = requireString(req.body?.title, 'title');
    const description = optionalString(req.body?.description, 'description') ?? '';
    const dueDate = requireISODate(req.body?.dueDate, 'dueDate');
    const cost = optionalNumber(req.body?.cost, 'cost') ?? 0;
    const task = taskService.create({
      userId: req.userId as string,
      title,
      description,
      dueDate,
      cost,
    });
    res.status(201).json(task);
  } catch (err) {
    if (err instanceof ValidationError) {
      res.status(400).json(errorEnvelope(err.code, err.message, err.details));
      return;
    }
    throw err;
  }
});

router.patch('/:id', (req: AuthedRequest, res: Response) => {
  const existing = taskService.getById(req.params.id);
  if (!existing) {
    res.status(404).json(errorEnvelope('NOT_FOUND', 'Task not found'));
    return;
  }
  try {
    const patch: Record<string, unknown> = {};
    if (req.body?.title !== undefined) patch.title = requireString(req.body.title, 'title');
    if (req.body?.description !== undefined) patch.description = optionalString(req.body.description, 'description');
    if (req.body?.dueDate !== undefined) patch.dueDate = requireISODate(req.body.dueDate, 'dueDate');
    if (req.body?.cost !== undefined) patch.cost = requireNumber(req.body.cost, 'cost');
    if (req.body?.status !== undefined) {
      patch.status = requireOneOf(req.body.status, 'status', ['open', 'in_progress', 'done'] as const);
    }
    const updated = taskService.update(req.params.id, patch);
    res.json(updated);
  } catch (err) {
    if (err instanceof ValidationError) {
      res.status(400).json(errorEnvelope(err.code, err.message, err.details));
      return;
    }
    throw err;
  }
});

router.post('/:id/complete', (req: AuthedRequest, res: Response) => {
  const existing = taskService.getById(req.params.id);
  if (!existing) {
    res.status(404).json(errorEnvelope('NOT_FOUND', 'Task not found'));
    return;
  }
  if (existing.userId !== req.userId) {
    res.status(403).json(errorEnvelope('FORBIDDEN', 'Not your task'));
    return;
  }
  const updated = taskService.complete(req.params.id);
  res.json(updated);
});

router.delete('/:id', (req: AuthedRequest, res: Response) => {
  const existing = taskService.getById(req.params.id);
  if (!existing) {
    res.status(404).json(errorEnvelope('NOT_FOUND', 'Task not found'));
    return;
  }
  if (existing.userId !== req.userId) {
    res.status(403).json(errorEnvelope('FORBIDDEN', 'Not your task'));
    return;
  }
  taskService.remove(req.params.id);
  res.status(204).send();
});

export default router;
