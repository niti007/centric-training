import request from 'supertest';
import { createApp } from '../src/index';

const AUTH_U1 = { Authorization: 'Bearer token-u1' };

describe('tasks routes', () => {
  const app = createApp();

  it('rejects unauthenticated requests', async () => {
    const res = await request(app).get('/tasks');
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('UNAUTHENTICATED');
  });

  it('lists tasks for an authenticated user', async () => {
    const res = await request(app).get('/tasks').set(AUTH_U1);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.items)).toBe(true);
  });

  it('creates a task and returns it', async () => {
    const res = await request(app)
      .post('/tasks')
      .set(AUTH_U1)
      .send({ title: 'New task', dueDate: new Date().toISOString(), cost: 5 });
    expect(res.status).toBe(201);
    expect(res.body.title).toBe('New task');
    expect(res.body.userId).toBe('u1');
  });

  it('rejects task creation without a title', async () => {
    const res = await request(app)
      .post('/tasks')
      .set(AUTH_U1)
      .send({ dueDate: new Date().toISOString() });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('INVALID_FIELD');
  });

  it('returns 404 for unknown task', async () => {
    const res = await request(app).get('/tasks/does-not-exist').set(AUTH_U1);
    expect(res.status).toBe(404);
  });

  it('returns 403 when reading another users task', async () => {
    const res = await request(app).get('/tasks/t9').set(AUTH_U1);
    expect(res.status).toBe(403);
  });
});
