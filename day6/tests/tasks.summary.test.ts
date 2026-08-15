import request from 'supertest';
import { createApp } from '../src/index';

const AUTH_U1 = { Authorization: 'Bearer token-u1' };

describe('GET /tasks/:id/summary', () => {
  const app = createApp();

  it('returns id, title, dueIn for an owned task', async () => {
    const res = await request(app).get('/tasks/t1/summary').set(AUTH_U1);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('id', 't1');
    expect(res.body).toHaveProperty('title');
    expect(res.body).toHaveProperty('dueIn');
  });

  it('returns 403 for another users task', async () => {
    const res = await request(app).get('/tasks/t9/summary').set(AUTH_U1);
    expect(res.status).toBe(403);
  });

  it('returns 404 for an unknown task', async () => {
    const res = await request(app).get('/tasks/nope/summary').set(AUTH_U1);
    expect(res.status).toBe(404);
  });
});
