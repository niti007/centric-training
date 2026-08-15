export interface Task {
  id: string;
  userId: string;
  title: string;
  description: string;
  status: 'open' | 'in_progress' | 'done';
  dueDate: string;
  cost: number;
  createdAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
}

const users: User[] = [
  { id: 'u1', name: 'Ada Lovelace', email: 'ada@taskflow.dev' },
  { id: 'u2', name: 'Grace Hopper', email: 'grace@taskflow.dev' },
  { id: 'u3', name: 'Alan Turing', email: 'alan@taskflow.dev' },
];

// Fixtures are anchored to a fixed reference instant (not the real current
// time) so that due dates — and anything derived from them, including the
// legacy reportBuilder's characterization snapshots — are identical on
// every run, on every machine, regardless of when tests execute.
const FIXTURE_ANCHOR = new Date('2026-06-15T12:00:00.000Z');

export function fixtureAnchor(): Date {
  return new Date(FIXTURE_ANCHOR.getTime());
}

function iso(daysFromNow: number): string {
  const d = new Date(FIXTURE_ANCHOR.getTime());
  d.setUTCDate(d.getUTCDate() + daysFromNow);
  return d.toISOString();
}

const tasks: Task[] = [
  { id: 't1', userId: 'u1', title: 'Draft proposal', description: 'Write the initial draft', status: 'open', dueDate: iso(0), cost: 0.1, createdAt: iso(-10) },
  { id: 't2', userId: 'u1', title: 'Review budget', description: 'Check Q3 budget', status: 'open', dueDate: iso(0), cost: 0.2, createdAt: iso(-9) },
  { id: 't3', userId: 'u1', title: 'Client call', description: 'Sync with client', status: 'in_progress', dueDate: iso(2), cost: 15.5, createdAt: iso(-8) },
  { id: 't4', userId: 'u1', title: 'Overdue invoice', description: 'Follow up on late invoice', status: 'open', dueDate: iso(-5), cost: 250, createdAt: iso(-20) },
  { id: 't5', userId: 'u1', title: 'Archive old docs', description: 'Cleanup shared drive', status: 'done', dueDate: iso(-30), cost: 0, createdAt: iso(-40) },
  { id: 't6', userId: 'u1', title: 'Far future planning', description: 'Roadmap for next year', status: 'open', dueDate: iso(365), cost: 1000, createdAt: iso(-1) },
  { id: 't7', userId: 'u1', title: 'Zero cost favor', description: 'Small favor for teammate', status: 'open', dueDate: iso(5), cost: 0, createdAt: iso(-2) },
  { id: 't8', userId: 'u1', title: 'Fractional cost supplies', description: 'Buy office supplies', status: 'open', dueDate: iso(3), cost: 0.3, createdAt: iso(-3) },
  { id: 't9', userId: 'u2', title: 'Design review', description: 'Review new mockups', status: 'open', dueDate: iso(1), cost: 45, createdAt: iso(-6) },
  { id: 't10', userId: 'u2', title: 'Overdue report', description: 'Send weekly report', status: 'open', dueDate: iso(-2), cost: 0, createdAt: iso(-15) },
  { id: 't11', userId: 'u2', title: 'Sprint planning', description: 'Plan next sprint', status: 'in_progress', dueDate: iso(4), cost: 0, createdAt: iso(-4) },
  { id: 't12', userId: 'u2', title: 'Fix flaky test', description: 'Investigate CI flakiness', status: 'open', dueDate: iso(1), cost: 12.75, createdAt: iso(-1) },
  { id: 't13', userId: 'u2', title: 'Onboard new hire', description: 'Prepare onboarding docs', status: 'open', dueDate: iso(7), cost: 0.1, createdAt: iso(-5) },
  { id: 't14', userId: 'u2', title: 'Update dependencies', description: 'Bump npm packages', status: 'done', dueDate: iso(-10), cost: 0, createdAt: iso(-25) },
  { id: 't15', userId: 'u2', title: 'Far future audit', description: 'Annual compliance audit', status: 'open', dueDate: iso(300), cost: 500, createdAt: iso(-2) },
  { id: 't16', userId: 'u2', title: 'Today deadline', description: 'Submit expense report', status: 'open', dueDate: iso(0), cost: 0.2, createdAt: iso(-1) },
  { id: 't17', userId: 'u3', title: 'Refactor auth module', description: 'Clean up auth code', status: 'in_progress', dueDate: iso(6), cost: 0, createdAt: iso(-7) },
  { id: 't18', userId: 'u3', title: 'Overdue security patch', description: 'Apply CVE patch', status: 'open', dueDate: iso(-1), cost: 0, createdAt: iso(-3) },
  { id: 't19', userId: 'u3', title: 'Write unit tests', description: 'Increase coverage', status: 'open', dueDate: iso(3), cost: 0, createdAt: iso(-2) },
  { id: 't20', userId: 'u3', title: 'Team offsite', description: 'Plan team offsite', status: 'open', dueDate: iso(45), cost: 3000, createdAt: iso(-10) },
  { id: 't21', userId: 'u3', title: 'Fractional supplies 2', description: 'Buy stationery', status: 'open', dueDate: iso(2), cost: 0.1, createdAt: iso(-1) },
  { id: 't22', userId: 'u3', title: 'Far future migration', description: 'Plan DB migration', status: 'open', dueDate: iso(180), cost: 800, createdAt: iso(-5) },
  { id: 't23', userId: 'u3', title: 'Today code freeze', description: 'Prep release', status: 'open', dueDate: iso(0), cost: 0, createdAt: iso(-1) },
  { id: 't24', userId: 'u3', title: 'Zero cost review', description: 'Peer code review', status: 'done', dueDate: iso(-3), cost: 0, createdAt: iso(-6) },
  { id: 't25', userId: 'u3', title: 'Overdue renewal', description: 'Renew domain', status: 'open', dueDate: iso(-15), cost: 20, createdAt: iso(-30) },
];

export function listUsers(): User[] {
  return [...users];
}

export function findUserById(id: string): User | undefined {
  return users.find((u) => u.id === id);
}

export function listTasks(): Task[] {
  return [...tasks];
}

export function findTaskById(id: string): Task | undefined {
  return tasks.find((t) => t.id === id);
}

export function insertTask(task: Task): Task {
  tasks.push(task);
  return task;
}

export function updateTask(id: string, patch: Partial<Task>): Task | undefined {
  const idx = tasks.findIndex((t) => t.id === id);
  if (idx === -1) return undefined;
  tasks[idx] = { ...tasks[idx], ...patch, id: tasks[idx].id };
  return tasks[idx];
}

export function deleteTask(id: string): boolean {
  const idx = tasks.findIndex((t) => t.id === id);
  if (idx === -1) return false;
  tasks.splice(idx, 1);
  return true;
}

export function insertUser(user: User): User {
  users.push(user);
  return user;
}

export function updateUser(id: string, patch: Partial<User>): User | undefined {
  const idx = users.findIndex((u) => u.id === id);
  if (idx === -1) return undefined;
  users[idx] = { ...users[idx], ...patch, id: users[idx].id };
  return users[idx];
}

export function deleteUser(id: string): boolean {
  const idx = users.findIndex((u) => u.id === id);
  if (idx === -1) return false;
  users.splice(idx, 1);
  return true;
}
