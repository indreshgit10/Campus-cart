import request from 'supertest';
import { app, httpServer } from '../server.js';
import mongoose from 'mongoose';

describe('App Connection Test', () => {
  afterAll(async () => {
    // Close DB connection and server to prevent hanging tests
    await mongoose.connection.close();
    httpServer.close();
  });

  it('should respond to the health check root path', async () => {
    const response = await request(app).get('/');
    expect(response.statusCode).toBe(200);
    expect(response.text).toContain('CampusCart API is running...');
  });
});
