import { Router, Response } from 'express';
import * as taskService from '../services/taskService';
import { requireAuth, AuthedRequest } from './auth';
import { formatDueIn } from '../util/dates';
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

/**
 * GET /tasks
 * List tasks, optionally filtered by userId/status, paginated via
 * `page`/`size` query params.
 */
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

/**
 * GET /tasks/:id
 * Fetch a single task. 404 if it doesn't exist, 403 if it isn't owned by
 * the authenticated user.
 */
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

/**
 * GET /tasks/:id/summary
 * Lightweight projection of a task: { id, title, dueIn }.
 */
router.get('/:id/summary', (req: AuthedRequest, res: Response) => {
  const task = taskService.getById(req.params.id);
  if (!task) {
    res.status(404).json(errorEnvelope('NOT_FOUND', 'Task not found'));
    return;
  }
  if (task.userId !== req.userId) {
    res.status(403).json(errorEnvelope('FORBIDDEN', 'Not your task'));
    return;
  }
  res.json({
    id: task.id,
    title: task.title,
    dueIn: formatDueIn(task.dueDate),
  });
});

/**
 * POST /tasks
 * Create a task owned by the authenticated user.
 */
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

/**
 * POST /tasks/bulk
 * Create multiple tasks in one request, all owned by the authenticated
 * user. Body: `{ tasks: Array<{ title, description?, dueDate, cost? }> }`.
 * Validates every item before creating any of them: if one item is
 * invalid, the whole batch is rejected (no partial creation) and the
 * response lists every validation failure by index.
 */
router.post('/bulk', (req: AuthedRequest, res: Response) => {
  const items = req.body?.tasks;
  if (!Array.isArray(items) || items.length === 0) {
    res.status(400).json(errorEnvelope('INVALID_FIELD', 'tasks must be a non-empty array'));
    return;
  }

  const validated: Array<{ title: string; description: string; dueDate: string; cost: number }> = [];
  const failures: Array<{ index: number; code: string; message: string }> = [];

  items.forEach((item, index) => {
    try {
      const title = requireString(item?.title, 'title');
      const description = optionalString(item?.description, 'description') ?? '';
      const dueDate = requireISODate(item?.dueDate, 'dueDate');
      const cost = optionalNumber(item?.cost, 'cost') ?? 0;
      validated.push({ title, description, dueDate, cost });
    } catch (err) {
      if (err instanceof ValidationError) {
        failures.push({ index, code: err.code, message: err.message });
      } else {
        throw err;
      }
    }
  });

  if (failures.length > 0) {
    res.status(400).json(errorEnvelope('INVALID_FIELD', 'One or more tasks failed validation', { failures }));
    return;
  }

  const created = validated.map((v) =>
    taskService.create({
      userId: req.userId as string,
      title: v.title,
      description: v.description,
      dueDate: v.dueDate,
      cost: v.cost,
    }),
  );

  res.status(201).json({ items: created });
});

/**
 * PATCH /tasks/:id
 * Update fields on a task. Note: authenticates but (still) does not check
 * ownership — see instructor defect map #4, fixed in the Day 6 solution.
 */
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

/**
 * POST /tasks/:id/complete
 * Mark a task done. Ownership-checked.
 */
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

/**
 * DELETE /tasks/:id
 * Delete a task. Ownership-checked.
 */
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
