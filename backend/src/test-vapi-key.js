require('dotenv').config();
const axios = require('axios');

// Get the API key from environment variables
const VAPI_API_KEY = process.env.VAPI_API_KEY;

console.log('Testing Vapi API key...');
console.log('API Key (first 5 chars):', VAPI_API_KEY.substring(0, 5) + '...');
console.log('API Key length:', VAPI_API_KEY.length);

// Function to check if the key is valid using different methods
async function testVapiKey() {
  // Try to get account information which should be a simple endpoint
  const endpoints = [
    { url: 'https://api.vapi.ai/me', name: 'Account Info' },
    { url: 'https://api.vapi.ai/assistants', name: 'Assistants List' },
    { url: 'https://api.vapi.ai/calls', name: 'Calls List' }
  ];
  
  const authMethods = [
    { 
      name: 'Bearer Token', 
      headers: { 
        'Authorization': `Bearer ${VAPI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    },
    { 
      name: 'X-API-Key', 
      headers: { 
        'x-api-key': VAPI_API_KEY,
        'Content-Type': 'application/json'
      }
    },
    { 
      name: 'Public Key as Bearer', 
      headers: { 
        'Authorization': `Bearer pk_${VAPI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    },
    { 
      name: 'Private Key as Bearer', 
      headers: { 
        'Authorization': `Bearer sk_${VAPI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    }
  ];
  
  // Test each endpoint with each auth method
  for (const endpoint of endpoints) {
    console.log(`\nTesting endpoint: ${endpoint.name} (${endpoint.url})`);
    
    for (const authMethod of authMethods) {
      try {
        console.log(`\n  Using ${authMethod.name} authentication...`);
        const response = await axios.get(endpoint.url, { headers: authMethod.headers });
        
        console.log('  SUCCESS! Status:', response.status);
        console.log('  Response preview:', JSON.stringify(response.data).substring(0, 100) + '...');
        
        // If we got here, the authentication worked!
        console.log('\n✅ AUTHENTICATION SUCCESSFUL with method:', authMethod.name);
        console.log('✅ Use these headers for your API calls:');
        console.log(JSON.stringify(authMethod.headers, null, 2));
        
        return { success: true, method: authMethod, response: response.data };
      } catch (error) {
        console.log(`  FAILED with status: ${error.response?.status || 'unknown'}`);
        console.log(`  Error: ${error.response?.data?.message || error.message}`);
      }
    }
  }
  
  console.log('\n❌ All authentication methods failed.');
  return { success: false };
}

// Run the test
testVapiKey()
  .then(result => {
    if (result.success) {
      console.log('\nSUCCESS: Found a working authentication method!');
    } else {
      console.log('\nERROR: Could not authenticate with any method. Please check your API key.');
      console.log('You may need to generate a new key from the Vapi dashboard.');
    }
  })
  .catch(err => {
    console.error('Error running tests:', err);
  });
