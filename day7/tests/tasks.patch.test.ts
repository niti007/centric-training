import request from 'supertest';
import { createApp } from '../src/index';

describe('PATCH /tasks/:id ownership', () => {
  const app = createApp();

  it('rejects updates from a user who does not own the task', async () => {
    // t1 is owned by u1. Authenticate as u2 and try to edit it.
    const res = await request(app)
      .patch('/tasks/t1')
      .set('Authorization', 'Bearer token-u2')
      .send({ title: 'Hijacked title' });
    expect(res.status).toBe(403);
  });

  it('allows the owner to update their own task', async () => {
    const res = await request(app)
      .patch('/tasks/t1')
      .set('Authorization', 'Bearer token-u1')
      .send({ title: 'Updated by owner' });
    expect(res.status).toBe(200);
    expect(res.body.title).toBe('Updated by owner');
  });
});
