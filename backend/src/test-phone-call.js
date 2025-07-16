require('dotenv').config();
const axios = require('axios');

const VAPI_API_KEY = process.env.VAPI_API_KEY;

// Test phone number - replace with your number in E.164 format
const TEST_PHONE_NUMBER = "+12223334444"; // Make sure this is in correct international format

async function testPhoneCall() {
  try {
    console.log(`Testing call to ${TEST_PHONE_NUMBER}`);
    
    // 1. Create a simple assistant
    console.log('Creating test assistant...');
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
            content: "You are a test assistant making a phone call to verify connectivity."
          }
        ],
        tools: [
          {
            type: "endCall"
          }
        ]
      },
      voice: {
        provider: "11labs",
        voiceId: "21m00Tcm4TlvDq8ikWAM" // Rachel voice
      },
      voicemailMessage: "This is a test call from the AI Caller application. Please disregard.",
      firstMessage: "Hello, this is a test call from the AI Caller application. If you can hear this, the call connection is working.",
      endCallMessage: "Thank you for your time. This test call is now complete.",
      endCallFunctionEnabled: true,
      recordingEnabled: false
    };
    
    const assistantResponse = await axios.post(
      'https://api.vapi.ai/assistant',
      assistantData,
      {
        headers: {
          'Authorization': `Bearer ${VAPI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    const assistantId = assistantResponse.data.id;
    console.log('Test assistant created with ID:', assistantId);
    
    // 2. Get available phone numbers
    console.log('Getting available phone numbers...');
    const phoneNumbersResponse = await axios.get(
      'https://api.vapi.ai/phone-number',
      {
        headers: {
          'Authorization': `Bearer ${VAPI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    if (!phoneNumbersResponse.data || phoneNumbersResponse.data.length === 0) {
      throw new Error('No phone numbers available');
    }
    
    // Use the first available phone number
    const phoneNumberId = phoneNumbersResponse.data[0].id;
    console.log(`Using phone number ID: ${phoneNumberId} (${phoneNumbersResponse.data[0].number})`);
    
    // 3. Make the test call
    console.log('Making test call...');
    const callData = {
      phoneNumberId: phoneNumberId,
      assistantId: assistantId,
      customer: {
        number: TEST_PHONE_NUMBER
      }
    };
    
    const callResponse = await axios.post(
      'https://api.vapi.ai/call',
      callData,
      {
        headers: {
          'Authorization': `Bearer ${VAPI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    const callId = callResponse.data.id;
    console.log('Test call initiated with ID:', callId);
    console.log('Call data:', JSON.stringify(callResponse.data, null, 2));
    
    // 4. Wait a few seconds and check call status
    console.log('Waiting 10 seconds to check call status...');
    await new Promise(resolve => setTimeout(resolve, 10000));
    
    const statusResponse = await axios.get(
      `https://api.vapi.ai/call/${callId}`,
      {
        headers: {
          'Authorization': `Bearer ${VAPI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('Call status after 10 seconds:', JSON.stringify(statusResponse.data, null, 2));
    
  } catch (error) {
    console.error('Error in test:', error.response?.data || error.message);
  }
}

testPhoneCall();
