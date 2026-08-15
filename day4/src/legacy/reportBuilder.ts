import * as taskRepo from '../repo/taskRepo';
import * as userService from '../services/userService';
import { Task } from '../repo/taskRepo';
import { isOverdue } from '../util/dates';
import { sumCosts } from '../util/money';

export interface ReportOptions {
  generatedAt?: Date;
  statusFilter?: string;
  includeZeroCost?: boolean;
}

function filterTasks(tasks: Task[], statusFilter?: string, includeZeroCost = true): Task[] {
  return tasks.filter((t) => {
    if (statusFilter && t.status !== statusFilter) return false;
    if (!includeZeroCost && t.cost <= 0) return false;
    return true;
  });
}

function statusBreakdown(tasks: Task[]): { open: number; in_progress: number; done: number } {
  return {
    open: tasks.filter((t) => t.status === 'open').length,
    in_progress: tasks.filter((t) => t.status === 'in_progress').length,
    done: tasks.filter((t) => t.status === 'done').length,
  };
}

function overdueTitles(tasks: Task[], generatedAt: Date): { count: number; titles: string[] } {
  const overdue = tasks.filter((t) => t.status !== 'done' && isOverdue(t.dueDate, generatedAt));
  return { count: overdue.length, titles: overdue.map((t) => t.title) };
}

function costLabel(cost: number): string {
  if (cost === 0) return 'free';
  if (cost < 1) return `$${cost.toFixed(2)} (small)`;
  if (cost < 100) return `$${cost.toFixed(2)}`;
  return `$${cost.toFixed(2)} (large)`;
}

function statusLabel(status: Task['status']): string {
  if (status === 'open') return '[OPEN]';
  if (status === 'in_progress') return '[IN PROGRESS]';
  if (status === 'done') return '[DONE]';
  return '[UNKNOWN]';
}

function buildPerUserSection(tasks: Task[], generatedAt: Date): string[] {
  const lines: string[] = [];
  lines.push('-----------------------------------------');
  lines.push('PER-USER BREAKDOWN');
  lines.push('-----------------------------------------');

  const userIds = Array.from(new Set(tasks.map((t) => t.userId)));

  for (const uid of userIds) {
    // NOTE: still looks up the user per iteration rather than batching —
    // preserved as-is; see Day 6 solution for the N+1 fix.
    const user = userService.getById(uid);
    const userName = user ? user.name : 'Unknown';
    const userTasks = tasks.filter((t) => t.userId === uid);
    const breakdown = statusBreakdown(userTasks);
    const overdue = overdueTitles(userTasks, generatedAt);
    const cost = sumCosts(userTasks.map((t) => t.cost));

    lines.push('');
    lines.push(`User: ${userName} (${uid})`);
    lines.push(`  tasks: ${userTasks.length}`);
    lines.push(`  open: ${breakdown.open}, in_progress: ${breakdown.in_progress}, done: ${breakdown.done}`);
    lines.push(`  overdue: ${overdue.count}`);
    lines.push(`  cost: $${cost.toFixed(2)}`);
    lines.push('  task list:');
    for (const t of userTasks) {
      const overdueFlag = t.status !== 'done' && isOverdue(t.dueDate, generatedAt) ? ' (OVERDUE)' : '';
      lines.push(`    - ${statusLabel(t.status)}${overdueFlag} ${t.title} -- ${costLabel(t.cost)}`);
    }
  }

  return lines;
}

function buildTaskDetailSection(tasks: Task[], generatedAt: Date): string[] {
  const lines: string[] = [];
  lines.push('');
  lines.push('-----------------------------------------');
  lines.push('TASK DETAIL (WITH OWNER LOOKUP)');
  lines.push('-----------------------------------------');

  for (const t of tasks) {
    // NOTE: this calls userService.getById() once per task — this is the
    // reportBuilder N+1 (see instructor defect map). Left intact on purpose;
    // fixed in the Day 6 solution.
    const owner = userService.getById(t.userId);
    const ownerName = owner ? owner.name : 'Unknown';
    const ownerEmail = owner ? owner.email : 'unknown@taskflow.dev';

    lines.push('');
    lines.push(`Task ${t.id}: ${t.title}`);
    lines.push(`  owner: ${ownerName} <${ownerEmail}>`);
    lines.push(`  status: ${t.status}`);
    lines.push(`  due: ${t.dueDate}`);

    if (t.status !== 'done') {
      lines.push(isOverdue(t.dueDate, generatedAt) ? '  ** OVERDUE **' : '  on track');
    } else {
      lines.push('  completed');
    }

    if (t.description) {
      lines.push(`  desc: ${t.description.length > 40 ? `${t.description.substring(0, 40)}...` : t.description}`);
    } else {
      lines.push('  desc: (none)');
    }

    lines.push(t.cost === 0 ? '  cost: free' : `  cost: $${t.cost.toFixed(2)}`);
  }

  return lines;
}

function buildCostBucketsSection(tasks: Task[]): string[] {
  const lines: string[] = [];
  lines.push('');
  lines.push('-----------------------------------------');
  lines.push('COST BUCKETS');
  lines.push('-----------------------------------------');

  const buckets = { free: 0, small: 0, mid: 0, large: 0 };
  for (const t of tasks) {
    if (t.cost === 0) buckets.free += 1;
    else if (t.cost < 1) buckets.small += 1;
    else if (t.cost < 100) buckets.mid += 1;
    else buckets.large += 1;
  }

  lines.push(`  free: ${buckets.free}`);
  lines.push(`  small (<$1): ${buckets.small}`);
  lines.push(`  mid ($1-$100): ${buckets.mid}`);
  lines.push(`  large (>$100): ${buckets.large}`);

  return lines;
}

export function buildReport(options?: ReportOptions): string {
  const generatedAt = options?.generatedAt ?? new Date();
  const statusFilter = options?.statusFilter;
  const includeZeroCost = options?.includeZeroCost ?? true;

  const allTasks = taskRepo.listTasks();
  const filteredTasks = filterTasks(allTasks, statusFilter, includeZeroCost);
  const breakdown = statusBreakdown(filteredTasks);
  const overdue = overdueTitles(filteredTasks, generatedAt);
  const totalCost = sumCosts(filteredTasks.map((t) => t.cost));

  const lines: string[] = [];
  lines.push('=========================================');
  lines.push('           TASKFLOW STATUS REPORT');
  lines.push('=========================================');
  lines.push(`Generated: ${generatedAt.toISOString()}`);
  lines.push('');
  lines.push(`Total tasks in scope: ${filteredTasks.length}`);
  lines.push('');
  lines.push('Status breakdown:');
  lines.push(`  open: ${breakdown.open}`);
  lines.push(`  in_progress: ${breakdown.in_progress}`);
  lines.push(`  done: ${breakdown.done}`);
  lines.push('');
  lines.push(`Overdue tasks: ${overdue.count}`);
  if (overdue.count > 0) {
    lines.push(`  titles: ${overdue.titles.join(', ')}`);
  }
  lines.push('');
  lines.push(`Total cost across scope: $${totalCost.toFixed(2)}`);
  lines.push('');
  lines.push(...buildPerUserSection(filteredTasks, generatedAt));
  lines.push(...buildTaskDetailSection(filteredTasks, generatedAt));
  lines.push(...buildCostBucketsSection(filteredTasks));
  lines.push('');
  lines.push('=========================================');
  lines.push('END OF REPORT');
  lines.push('=========================================');

  return lines.join('\n');
}
