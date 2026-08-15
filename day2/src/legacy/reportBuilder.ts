import * as taskRepo from '../repo/taskRepo';
import * as userService from '../services/userService';
import { isOverdue } from '../util/dates';
import { sumCosts } from '../util/money';

export function buildReport(options?: { generatedAt?: Date; statusFilter?: string; includeZeroCost?: boolean }): string {
  const generatedAt = options?.generatedAt ?? new Date();
  const statusFilter = options?.statusFilter;
  const includeZeroCost = options?.includeZeroCost ?? true;

  const allTasks = taskRepo.listTasks();

  const lines: string[] = [];
  lines.push('=========================================');
  lines.push('           TASKFLOW STATUS REPORT');
  lines.push('=========================================');
  lines.push('Generated: ' + generatedAt.toISOString());
  lines.push('');

  const filteredTasks = [];
  for (let i = 0; i < allTasks.length; i++) {
    const t = allTasks[i];
    if (statusFilter) {
      if (t.status === statusFilter) {
        if (!includeZeroCost) {
          if (t.cost > 0) {
            filteredTasks.push(t);
          }
        } else {
          filteredTasks.push(t);
        }
      }
    } else {
      if (!includeZeroCost) {
        if (t.cost > 0) {
          filteredTasks.push(t);
        }
      } else {
        filteredTasks.push(t);
      }
    }
  }

  lines.push('Total tasks in scope: ' + filteredTasks.length);
  lines.push('');

  let openCount = 0;
  let inProgressCount = 0;
  let doneCount = 0;
  for (let i = 0; i < filteredTasks.length; i++) {
    if (filteredTasks[i].status === 'open') {
      openCount = openCount + 1;
    } else if (filteredTasks[i].status === 'in_progress') {
      inProgressCount = inProgressCount + 1;
    } else if (filteredTasks[i].status === 'done') {
      doneCount = doneCount + 1;
    }
  }

  lines.push('Status breakdown:');
  lines.push('  open: ' + openCount);
  lines.push('  in_progress: ' + inProgressCount);
  lines.push('  done: ' + doneCount);
  lines.push('');

  let overdueCount = 0;
  let overdueTitles = '';
  for (let i = 0; i < filteredTasks.length; i++) {
    const t = filteredTasks[i];
    if (t.status !== 'done') {
      if (isOverdue(t.dueDate, generatedAt)) {
        overdueCount = overdueCount + 1;
        if (overdueTitles.length > 0) {
          overdueTitles = overdueTitles + ', ' + t.title;
        } else {
          overdueTitles = t.title;
        }
      }
    }
  }

  lines.push('Overdue tasks: ' + overdueCount);
  if (overdueCount > 0) {
    lines.push('  titles: ' + overdueTitles);
  }
  lines.push('');

  const allCosts: number[] = [];
  for (let i = 0; i < filteredTasks.length; i++) {
    allCosts.push(filteredTasks[i].cost);
  }
  const totalCost = sumCosts(allCosts);
  lines.push('Total cost across scope: $' + totalCost.toFixed(2));
  lines.push('');

  lines.push('-----------------------------------------');
  lines.push('PER-USER BREAKDOWN');
  lines.push('-----------------------------------------');

  const userIds: string[] = [];
  for (let i = 0; i < filteredTasks.length; i++) {
    const uid = filteredTasks[i].userId;
    let found = false;
    for (let j = 0; j < userIds.length; j++) {
      if (userIds[j] === uid) {
        found = true;
        break;
      }
    }
    if (!found) {
      userIds.push(uid);
    }
  }

  for (let i = 0; i < userIds.length; i++) {
    const uid = userIds[i];
    const user = userService.getById(uid);
    let userName = 'Unknown';
    if (user) {
      userName = user.name;
    }

    lines.push('');
    lines.push('User: ' + userName + ' (' + uid + ')');

    let userTaskCount = 0;
    let userOpenCount = 0;
    let userInProgressCount = 0;
    let userDoneCount = 0;
    let userOverdueCount = 0;
    const userCosts: number[] = [];

    for (let j = 0; j < filteredTasks.length; j++) {
      const t = filteredTasks[j];
      if (t.userId === uid) {
        userTaskCount = userTaskCount + 1;
        if (t.status === 'open') {
          userOpenCount = userOpenCount + 1;
        } else if (t.status === 'in_progress') {
          userInProgressCount = userInProgressCount + 1;
        } else if (t.status === 'done') {
          userDoneCount = userDoneCount + 1;
        }
        if (t.status !== 'done' && isOverdue(t.dueDate, generatedAt)) {
          userOverdueCount = userOverdueCount + 1;
        }
        userCosts.push(t.cost);
      }
    }

    lines.push('  tasks: ' + userTaskCount);
    lines.push('  open: ' + userOpenCount + ', in_progress: ' + userInProgressCount + ', done: ' + userDoneCount);
    lines.push('  overdue: ' + userOverdueCount);
    lines.push('  cost: $' + sumCosts(userCosts).toFixed(2));

    lines.push('  task list:');
    for (let j = 0; j < filteredTasks.length; j++) {
      const t = filteredTasks[j];
      if (t.userId === uid) {
        let statusLabel = '';
        if (t.status === 'open') {
          statusLabel = '[OPEN]';
        } else if (t.status === 'in_progress') {
          statusLabel = '[IN PROGRESS]';
        } else if (t.status === 'done') {
          statusLabel = '[DONE]';
        } else {
          statusLabel = '[UNKNOWN]';
        }

        let overdueLabel = '';
        if (t.status !== 'done' && isOverdue(t.dueDate, generatedAt)) {
          overdueLabel = ' (OVERDUE)';
        }

        let costLabel = '';
        if (t.cost === 0) {
          costLabel = 'free';
        } else if (t.cost < 1) {
          costLabel = '$' + t.cost.toFixed(2) + ' (small)';
        } else if (t.cost < 100) {
          costLabel = '$' + t.cost.toFixed(2);
        } else {
          costLabel = '$' + t.cost.toFixed(2) + ' (large)';
        }

        lines.push('    - ' + statusLabel + overdueLabel + ' ' + t.title + ' -- ' + costLabel);
      }
    }
  }

  lines.push('');
  lines.push('-----------------------------------------');
  lines.push('TASK DETAIL (WITH OWNER LOOKUP)');
  lines.push('-----------------------------------------');

  for (let i = 0; i < filteredTasks.length; i++) {
    const t = filteredTasks[i];
    const owner = userService.getById(t.userId);
    let ownerName = 'Unknown';
    let ownerEmail = 'unknown@taskflow.dev';
    if (owner) {
      ownerName = owner.name;
      ownerEmail = owner.email;
    }

    lines.push('');
    lines.push('Task ' + t.id + ': ' + t.title);
    lines.push('  owner: ' + ownerName + ' <' + ownerEmail + '>');
    lines.push('  status: ' + t.status);
    lines.push('  due: ' + t.dueDate);

    if (t.status !== 'done') {
      if (isOverdue(t.dueDate, generatedAt)) {
        lines.push('  ** OVERDUE **');
      } else {
        lines.push('  on track');
      }
    } else {
      lines.push('  completed');
    }

    if (t.description) {
      if (t.description.length > 40) {
        lines.push('  desc: ' + t.description.substring(0, 40) + '...');
      } else {
        lines.push('  desc: ' + t.description);
      }
    } else {
      lines.push('  desc: (none)');
    }

    if (t.cost === 0) {
      lines.push('  cost: free');
    } else {
      lines.push('  cost: $' + t.cost.toFixed(2));
    }
  }

  lines.push('');
  lines.push('-----------------------------------------');
  lines.push('COST BUCKETS');
  lines.push('-----------------------------------------');

  let freeCount = 0;
  let smallCount = 0;
  let midCount = 0;
  let largeCount = 0;

  for (let i = 0; i < filteredTasks.length; i++) {
    const cost = filteredTasks[i].cost;
    if (cost === 0) {
      freeCount = freeCount + 1;
    } else if (cost < 1) {
      smallCount = smallCount + 1;
    } else if (cost < 100) {
      midCount = midCount + 1;
    } else {
      largeCount = largeCount + 1;
    }
  }

  lines.push('  free: ' + freeCount);
  lines.push('  small (<$1): ' + smallCount);
  lines.push('  mid ($1-$100): ' + midCount);
  lines.push('  large (>$100): ' + largeCount);

  lines.push('');
  lines.push('=========================================');
  lines.push('END OF REPORT');
  lines.push('=========================================');

  return lines.join('\n');
}
