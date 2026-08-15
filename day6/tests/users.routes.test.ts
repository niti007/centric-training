import request from 'supertest';
import { createApp } from '../src/index';

describe('users routes', () => {
  const app = createApp();

  it('lists users', async () => {
    const res = await request(app).get('/users');
    expect(res.status).toBe(200);
    expect(res.body.items.length).toBeGreaterThan(0);
  });

  it('creates a user', async () => {
    const res = await request(app).post('/users').send({ name: 'Test User', email: 'test@taskflow.dev' });
    expect(res.status).toBe(201);
    expect(res.body.name).toBe('Test User');
  });

  it('returns 404 for unknown user', async () => {
    const res = await request(app).get('/users/nope');
    expect(res.status).toBe(404);
  });
});
