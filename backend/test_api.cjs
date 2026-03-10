const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

async function testAPI() {
  try {
    console.log('--- Testing User Registration ---');
    const regRes = await axios.post(`${API_URL}/users/register`, {
      name: 'Test User',
      email: `test${Date.now()}@example.com`,
      password: 'password123'
    });
    const token = regRes.data.token;
    console.log('Registration Success:', regRes.data.email);

    console.log('\n--- Testing Product Creation ---');
    const prodRes = await axios.post(`${API_URL}/products`, {
      name: 'Test Product',
      price: 100,
      description: 'Test Description',
      image: 'test.jpg',
      category: 'Electronics'
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('Product Creation Success:', prodRes.data.name);

    console.log('\n--- Testing Get Products ---');
    const getRes = await axios.get(`${API_URL}/products`);
    console.log('Get Products Success, count:', getRes.data.length);

    console.log('\n--- API Verification PASSED ---');
  } catch (error) {
    console.error('\n--- API Verification FAILED ---');
    console.error(error.response?.data || error.message);
  }
}

testAPI();
