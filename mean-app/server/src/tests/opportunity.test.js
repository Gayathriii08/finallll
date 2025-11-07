// tests/opportunity.test.js
import request from 'supertest';
import mongoose from 'mongoose';
import app from '../app.js';          
import Opportunity from '../models/Opportunity.js'; 

describe('Opportunity API Tests', () => {

  // Connect to test DB
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URI_TEST || 'mongodb://127.0.0.1:27017/wastezero');
  });

  // Clean up after each test
  afterEach(async () => {
    await Opportunity.deleteMany({});
  });

  // Disconnect after all tests
  afterAll(async () => {
    await mongoose.connection.close();
  });

  // TC_01 
  it('should return all opportunities', async () => {
    // Seed mock data
    await Opportunity.create([
      { title: 'Frontend Developer', duration: '3 months', skills: 'Angular', description: 'Develop UI components' },
      { title: 'Backend Engineer', duration: '6 months', skills: 'Node.js, MongoDB', description: 'Build APIs' }
    ]);

    const res = await request(app).get('/api/opportunities');

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(2);
    expect(res.body[0]).toHaveProperty('title', 'Frontend Developer');
  });

  //  TC_02 
  it('should return an opportunity by ID', async () => {
    const newOpp = await Opportunity.create({
      title: 'Data Analyst',
      duration: '4 months',
      skills: 'Python, Excel',
      description: 'Analyze datasets'
    });

    const res = await request(app).get(`/api/opportunities/${newOpp._id}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('_id', newOpp._id.toString());
    expect(res.body).toHaveProperty('title', 'Data Analyst');
  });
});
