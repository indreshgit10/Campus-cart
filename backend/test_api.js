async function testAPI() {
  const API_URL = 'http://localhost:5000/api';
  
  try {
    console.log('--- Testing User Registration ---');
    const regRes = await fetch(`${API_URL}/users/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test User',
        email: `test${Date.now()}@example.com`,
        password: 'password123'
      })
    });
    const regData = await regRes.json();
    if (!regRes.ok) throw new Error(regData.message || 'Registration failed');
    
    const token = regData.token;
    console.log('Registration Success:', regData.email);

    console.log('\n--- Testing Product Creation ---');
    const prodRes = await fetch(`${API_URL}/products`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        name: 'Test Product',
        price: 100,
        description: 'Test Description',
        image: 'test.jpg',
        category: 'Electronics'
      })
    });
    const prodData = await prodRes.json();
    if (!prodRes.ok) throw new Error(prodData.message || 'Product creation failed');
    console.log('Product Creation Success:', prodData.name);

    console.log('\n--- Testing Get Products ---');
    const getRes = await fetch(`${API_URL}/products`);
    const getData = await getRes.json();
    if (!getRes.ok) throw new Error(getData.message || 'Get products failed');
    console.log('Get Products Success, count:', getData.length);

    console.log('\n--- API Verification PASSED ---');
  } catch (error) {
    console.error('\n--- API Verification FAILED ---');
    console.error(error.message);
  }
}

testAPI();
