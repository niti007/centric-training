import * as taskRepo from '../repo/taskRepo';
import { Task } from '../repo/taskRepo';
import { isOverdue } from '../util/dates';

export interface ListOptions {
  page: number;
  size: number;
  userId?: string;
  status?: Task['status'];
}

export interface ListResult {
  items: Task[];
  page: number;
  size: number;
  total: number;
}

export function list(options: ListOptions): ListResult {
  const { page, size, userId, status } = options;
  let items = taskRepo.listTasks();

  if (userId) {
    items = items.filter((t) => t.userId === userId);
  }
  if (status) {
    items = items.filter((t) => t.status === status);
  }

  const total = items.length;
  const start = (page - 1) * size;
  const paged = items.slice(start, start + size);

  return { items: paged, page, size, total };
}

export function getById(id: string): Task | undefined {
  return taskRepo.findTaskById(id);
}

export function create(input: {
  userId: string;
  title: string;
  description: string;
  dueDate: string;
  cost: number;
}): Task {
  const id = `t${Date.now()}${Math.floor(Math.random() * 1000)}`;
  const task: Task = {
    id,
    userId: input.userId,
    title: input.title,
    description: input.description,
    status: 'open',
    dueDate: input.dueDate,
    cost: input.cost,
    createdAt: new Date().toISOString(),
  };
  return taskRepo.insertTask(task);
}

export function update(id: string, patch: Partial<Omit<Task, 'id' | 'userId' | 'createdAt'>>): Task | undefined {
  return taskRepo.updateTask(id, patch);
}

export function complete(id: string): Task | undefined {
  return taskRepo.updateTask(id, { status: 'done' });
}

export function remove(id: string): boolean {
  return taskRepo.deleteTask(id);
}

export function overdueTasks(now: Date = new Date()): Task[] {
  return taskRepo.listTasks().filter((t) => t.status !== 'done' && isOverdue(t.dueDate, now));
}
