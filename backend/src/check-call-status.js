require('dotenv').config();
const axios = require('axios');

const VAPI_API_KEY = process.env.VAPI_API_KEY;
const callId = process.argv[2]; // Get call ID from command line argument

if (!callId) {
  console.error('Please provide a call ID as a command line argument');
  process.exit(1);
}

async function checkCallStatus() {
  try {
    console.log(`Checking status for call ID: ${callId}`);
    
    const response = await axios.get(
      `https://api.vapi.ai/call/${callId}`,
      {
        headers: {
          'Authorization': `Bearer ${VAPI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('Call status:', JSON.stringify(response.data, null, 2));
    
    // Check if the call has any errors
    if (response.data.error) {
      console.error('Call has error:', response.data.error);
    }
    
    // Check the call status
    console.log('Current call status:', response.data.status);
    
  } catch (error) {
    console.error('Error checking call status:', error.response?.data || error.message);
  }
}

checkCallStatus();
