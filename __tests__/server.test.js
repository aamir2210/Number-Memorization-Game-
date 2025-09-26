const request = require('supertest');
const app = require('../server');

describe('Backend API Tests', () => {
  it('GET /leaderboard should return an array', async () => {
    const res = await request(app).get('/leaderboard');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('POST /submit should accept valid data', async () => {
    const res = await request(app)
      .post('/submit')
      .send({ username: 'TestUser', score: 15 });
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Score submitted');
  });

  it('POST /submit should reject invalid data', async () => {
    const res = await request(app)
      .post('/submit')
      .send({ username: 123, score: 'NaN' });
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe('Invalid submission');
  });
});
