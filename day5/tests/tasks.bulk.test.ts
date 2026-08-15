import request from 'supertest';
import { createApp } from '../src/index';

const AUTH_U1 = { Authorization: 'Bearer token-u1' };

describe('POST /tasks/bulk', () => {
  const app = createApp();

  it('creates multiple tasks in one call', async () => {
    const res = await request(app)
      .post('/tasks/bulk')
      .set(AUTH_U1)
      .send({
        tasks: [
          { title: 'Bulk task A', dueDate: new Date().toISOString(), cost: 1 },
          { title: 'Bulk task B', dueDate: new Date().toISOString() },
        ],
      });
    expect(res.status).toBe(201);
    expect(res.body.items).toHaveLength(2);
    expect(res.body.items[0].userId).toBe('u1');
  });

  it('rejects the whole batch if any item is invalid', async () => {
    const res = await request(app)
      .post('/tasks/bulk')
      .set(AUTH_U1)
      .send({
        tasks: [
          { title: 'Valid', dueDate: new Date().toISOString() },
          { dueDate: new Date().toISOString() },
        ],
      });
    expect(res.status).toBe(400);
    expect(res.body.error.details.failures[0].index).toBe(1);
  });

  it('rejects an empty tasks array', async () => {
    const res = await request(app).post('/tasks/bulk').set(AUTH_U1).send({ tasks: [] });
    expect(res.status).toBe(400);
  });
});
