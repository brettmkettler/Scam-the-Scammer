require('dotenv').config();
const axios = require('axios');

const VAPI_API_KEY = process.env.VAPI_API_KEY;

if (!VAPI_API_KEY) {
  console.error('VAPI_API_KEY is not set in the .env file');
  process.exit(1);
}

// Log API key information (safely)
console.log('API Key first 5 chars:', VAPI_API_KEY.substring(0, 5) + '...');
console.log('API Key length:', VAPI_API_KEY.length);

// Base URL for Vapi API
const VAPI_BASE_URL = 'https://api.vapi.ai';

async function testVapiAPI() {
  try {
    // Define the assistant data once to reuse in different auth attempts
    console.log('Testing Vapi API with multiple authentication methods...');
    
    // Try different authentication methods
    console.log('\n1. Testing POST /assistant endpoint with different auth methods:');
    try {
      const assistantData = {
        transcriber: {
          provider: "deepgram",
          keywords: ["Test:1"]
        },
        model: {
          provider: "openai",
          model: "gpt-4",
          messages: [
            {
              role: "system",
              content: "You are a helpful assistant making a phone call for testing purposes."
            }
          ],
          tools: [
            {
              type: "function",
              function: {
                name: "testFunction",
                description: "Used for testing function calls.",
                parameters: {
                  type: "object",
                  properties: {
                    testParam: {
                      type: "string",
                      description: "A test parameter."
                    }
                  }
                }
              }
            }
          ]
        },
        voice: {
          provider: "openai",
          voiceId: "alloy"
        },
        voicemailMessage: "Hi, this is a test call. Sorry we missed you.",
        firstMessage: "Hello, this is an AI Assistant calling for a test.",
        endCallMessage: "Thank you for your time. Goodbye!",
        endCallFunctionEnabled: true,
        recordingEnabled: false
      };
      
      // Try method 1: Bearer token in Authorization header
      console.log('Trying with Bearer token in Authorization header...');
      let assistantResponse;
      try {
        assistantResponse = await axios.post(
          `${VAPI_BASE_URL}/assistant`,
          assistantData,
          {
            headers: {
              'Authorization': `Bearer ${VAPI_API_KEY}`,
              'Content-Type': 'application/json'
            }
          }
        );
        console.log('Success with Bearer token in Authorization header!');
      } catch (error1) {
        console.log('Failed with Bearer token in Authorization header:', error1.response?.data || error1.message);
        
        // Try method 2: Just the token in Authorization header (without Bearer)
        console.log('\nTrying with just the token in Authorization header...');
        try {
          assistantResponse = await axios.post(
            `${VAPI_BASE_URL}/assistant`,
            assistantData,
            {
              headers: {
                'Authorization': VAPI_API_KEY,
                'Content-Type': 'application/json'
              }
            }
          );
          console.log('Success with just the token in Authorization header!');
        } catch (error2) {
          console.log('Failed with just the token in Authorization header:', error2.response?.data || error2.message);
          
          // Try method 3: x-api-key header
          console.log('\nTrying with x-api-key header...');
          try {
            assistantResponse = await axios.post(
              `${VAPI_BASE_URL}/assistant`,
              assistantData,
              {
                headers: {
                  'x-api-key': VAPI_API_KEY,
                  'Content-Type': 'application/json'
                }
              }
            );
            console.log('Success with x-api-key header!');
          } catch (error3) {
            console.log('Failed with x-api-key header:', error3.response?.data || error3.message);
            
            // All methods failed
            throw new Error('All authentication methods failed');
          }
        }
      }
      
      console.log('Success! Assistant created with ID:', assistantResponse.data.id);
      
      // Store the assistant ID for later use
      const assistantId = assistantResponse.data.id;
      
      // 2. Test creating/getting a phone number
      console.log('\n2. Testing GET /phone-number endpoint:');
      try {
        const phoneNumberResponse = await axios.get(
          `${VAPI_BASE_URL}/phone-number`,
          {
            headers: {
              'Authorization': `Bearer ${VAPI_API_KEY}`,
              'Content-Type': 'application/json'
            }
          }
        );
        
        console.log('Success! Phone number info:', phoneNumberResponse.data);
        
        // If we have a phone number, try to make a test call
        if (phoneNumberResponse.data && phoneNumberResponse.data.id) {
          const phoneNumberId = phoneNumberResponse.data.id;
          
          // 3. Test making a call (don't actually execute this in test)
          console.log('\n3. We have a phone number ID:', phoneNumberId);
          console.log('To make a call, you would use:');
          console.log(JSON.stringify({
            phoneNumberId: phoneNumberId,
            assistantId: assistantId,
            customer: {
              number: "+1234567890" // Replace with actual number when making real calls
            }
          }, null, 2));
        }
      } catch (error) {
        console.error('Error with phone number:', error.response?.data || error.message);
        
        // Try alternative endpoint
        console.log('\nTrying alternative GET /phone-numbers endpoint:');
        try {
          const phoneNumbersResponse = await axios.get(
            `${VAPI_BASE_URL}/phone-numbers`,
            {
              headers: {
                'Authorization': `Bearer ${VAPI_API_KEY}`,
                'Content-Type': 'application/json'
              }
            }
          );
          
          console.log('Success! Phone numbers found:', phoneNumbersResponse.data);
        } catch (altError) {
          console.error('Error with alternative phone numbers endpoint:', altError.response?.data || altError.message);
        }
      }
      
    } catch (error) {
      console.error('Error creating assistant:', error.response?.data || error.message);
    }
    
  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

testVapiAPI();
