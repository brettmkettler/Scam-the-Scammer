const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const axios = require('axios');
const dotenv = require('dotenv');
const cors = require('cors');
const { Deepgram } = require('@deepgram/sdk');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Environment variables
const PORT = process.env.PORT || 3000;
const VAPI_API_KEY = process.env.VAPI_API_KEY;
const DEEPGRAM_API_KEY = process.env.DEEPGRAM_API_KEY;

// Initialize Deepgram
const deepgram = new Deepgram(DEEPGRAM_API_KEY);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Store active calls
const activeCalls = new Map();

// API Endpoints
app.post('/api/make-call', async (req, res) => {
  try {
    const { phoneNumber, persona } = req.body;
    
    console.log(`Making call to ${phoneNumber} with persona:`, persona);
    
    // Log API key information (safely)
    console.log('API Key first 5 chars:', VAPI_API_KEY.substring(0, 5) + '...');
    console.log('API Key length:', VAPI_API_KEY.length);
    
    // Step 1: Create a temporary assistant with the persona configuration based on Vapi's API format
    const assistantData = {
      transcriber: {
        provider: "deepgram",
        keywords: [persona.name ? `${persona.name}:1` : "Assistant:1"]
      },
      model: {
        provider: "openai",
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: `You are ${persona.name || 'David Johnson'}, ${persona.description || 'an elderly retiree who is 78 years old'}. You are making a phone call to ${phoneNumber}. 

Here is your personal information (you can be a bit aprehensive about providing this information, but can give it out if they verify their identity):
- Social Security Number: 483-29-1830
- Date of birth: May 12, 1947
- Bank account number: 4281065732 at First National Bank
- Routing number: 021000021
- Credit card number: 4929 1923 4567 8901 (Expiration: 05/26, CVV: 432)
- Home address: 742 Maple Street, Clearwater, FL 33756
- Email address: davidj1947@mailnet.com
- Password you commonly use: Sunshine1947!

You are somewhat hard of hearing and sometimes ask people to repeat themselves. You are trusting and can be easily convinced to provide your personal information if someone sounds official. You are lonely and enjoy talking to people. You are not tech-savvy and get confused by technical instructions.

Go along with whatever the person says and try to make them happy. Do not go out of character. If they ask for your information, you can provide it without hesitation.`
          }
        ],
        tools: [
          {
            type: "endCall"
          },
          {
            type: "dtmf",
            async: true
          }
        ]
      },
      voice: {
        provider: "11labs",
        voiceId: persona.voiceId || "vFLqXa8bgbofGarf6fZh" // Default to Grandma
      },
      voicemailMessage: `Hi, this is ${persona.name || ''} calling. Please call back when you have a chance.`,
      firstMessage: persona.firstMessage || `Hello, this is ${persona.name || ''}, how are you doing today?`,
      endCallMessage: "Thank you for your time. Goodbye!",
      silenceTimeoutSeconds: 300,
      endCallFunctionEnabled: false,
      maxDurationSeconds: 43200,
      recordingEnabled: true
    };
    
    console.log('Using voice provider:', assistantData.voice.provider);
    console.log('Using voice ID:', assistantData.voice.voiceId);
    
    console.log('Creating assistant with data:', JSON.stringify(assistantData, null, 2));
    
    // Create the assistant using Vapi's API
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
    console.log('Assistant created with ID:', assistantId);
    
    // Step 2: Make the outbound call using the created assistant
    // Use the specific Twilio phone number ID provided by the user
    const phoneNumberId = '87704052-1d88-4242-8dbe-c3f728fdbbaa';
    console.log(`Using specified Twilio phone number ID: ${phoneNumberId}`);
    
    // Now make the call using the phone number ID and assistant ID
    const callData = {
      phoneNumberId: phoneNumberId,
      assistantId: assistantId,
      customer: {
        number: phoneNumber
      }
      // Note: Webhook configuration is not supported in the call request
      // It needs to be configured in the Vapi dashboard instead
    };
    
    console.log('Making call with data:', JSON.stringify(callData, null, 2));
    
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
    console.log('Call initiated with ID:', callId);
    
    // Extract the monitor URLs if available
    const listenUrl = callResponse.data.monitor?.listenUrl;
    const controlUrl = callResponse.data.monitor?.controlUrl;
    
    console.log('Listen URL:', listenUrl);
    console.log('Control URL:', controlUrl);
    
    // Store the call information
    const callInfo = {
      id: callId,
      phoneNumber,
      persona,
      assistantId,
      status: 'initiated',
      transcript: [],
      createdAt: new Date().toISOString(),
      listenUrl,
      controlUrl
    };
    
    activeCalls.set(callId, callInfo);
    
    // Notify all connected clients about the new call
    io.emit('call-started', { 
      callId, 
      phoneNumber, 
      persona,
      status: 'initiated',
      listenUrl,
      controlUrl
    });
    
    // Set a timeout to check the call status after 5 seconds
    // This helps update the UI if the webhook doesn't fire immediately
    setTimeout(async () => {
      try {
        // Check call status via Vapi API
        const statusResponse = await axios.get(
          `https://api.vapi.ai/call/${callId}`,
          {
            headers: {
              'Authorization': `Bearer ${VAPI_API_KEY}`,
              'Content-Type': 'application/json'
            }
          }
        );
        
        const currentStatus = statusResponse.data.status;
        console.log(`Call ${callId} status after 5s:`, currentStatus);
        
        // Map Vapi status to our application status
        let appStatus = 'initiated';
        if (currentStatus === 'completed' || currentStatus === 'failed') {
          appStatus = 'completed';
        } else if (currentStatus === 'in-progress' || currentStatus === 'ringing') {
          appStatus = 'in-progress';
        }
        
        // Update call status in our records
        if (activeCalls.has(callId)) {
          activeCalls.get(callId).status = appStatus;
          
          // Emit status update to clients
          io.emit('call-status-update', {
            callId,
            status: appStatus
          });
        }
      } catch (err) {
        console.error('Error checking call status:', err.message);
      }
    }, 5000);
    
    res.json({ success: true, callId });
  } catch (error) {
    console.error('Error making call:', error.response?.data || error.message);
    res.status(500).json({ 
      success: false, 
      error: error.response?.data?.message || error.message,
      details: error.response?.data
    });
  }
});

// Webhook handler for call events and function calls
app.post('/api/call-webhook', async (req, res) => {
  try {
    const webhookData = req.body;
    console.log('Received webhook data:', JSON.stringify(webhookData, null, 2));
    console.log('Webhook event type:', webhookData.event);
    console.log('Active calls before processing:', Array.from(activeCalls.keys()));
    
    // Check if this is a function call
    if (webhookData.message && webhookData.message.type === 'function-call') {
      // Handle function calls from the assistant
      const functionCall = webhookData.message.functionCall;
      console.log(`Received function call: ${functionCall.name}`, functionCall.parameters);
      
      let result = "";
      
      // Handle different function types
      if (functionCall.name === 'bookAppointment') {
        // Example of handling a booking function
        const params = JSON.parse(functionCall.parameters);
        const datetime = params.datetime;
        
        // Here you would implement your actual booking logic
        // For now, we'll simulate a successful booking
        result = `The appointment was booked successfully for ${datetime}.`;
        
        // You could also simulate a failure
        // result = "The appointment time is unavailable, please try another time.";
      }
      
      // Return the result to Vapi
      return res.status(200).json({ result });
    }
    
    // Process different webhook event types
    if (webhookData.event === 'call.started') {
      // Call has started
      const callInfo = {
        ...webhookData.call,
        transcript: [],
        status: 'in-progress'
      };
      
      // Store in our Map
      activeCalls.set(webhookData.call.id, callInfo);
      
      // Emit call status update to all connected clients
      io.emit('call-status-update', { 
        callId: webhookData.call.id, 
        status: 'in-progress' 
      });
      
      // Also emit the call-started event for backward compatibility
      io.emit('call-started', { 
        callId: webhookData.call.id, 
        status: 'in-progress',
        phoneNumber: webhookData.call.customer?.number,
        persona: callInfo.persona,
        listenUrl: webhookData.call.listenUrl,
        controlUrl: webhookData.call.controlUrl
      });
    } else if (webhookData.event === 'call.ended' || webhookData.event === 'call-ended') {
      // Call has ended
      console.log('Call ended webhook received:', JSON.stringify(webhookData, null, 2));
      
      if (activeCalls.has(webhookData.call.id)) {
        // Get the call info and update its status
        const callInfo = activeCalls.get(webhookData.call.id);
        callInfo.status = 'completed';
        
        // Capture the ended reason if available
        if (webhookData.call && webhookData.call.endedReason) {
          callInfo.endedReason = webhookData.call.endedReason;
          console.log(`Call ${webhookData.call.id} ended with reason: ${webhookData.call.endedReason}`);
        } else {
          callInfo.endedReason = 'unknown';
          console.log(`Call ${webhookData.call.id} ended with unknown reason`);
        }
        
        activeCalls.set(webhookData.call.id, callInfo);
        
        // Emit call status update to all connected clients with ended reason
        io.emit('call-status-update', { 
          callId: webhookData.call.id, 
          status: 'completed',
          endedReason: callInfo.endedReason 
        });
        
        // Also emit the call-ended event with ended reason
        io.emit('call-ended', { 
          callId: webhookData.call.id, 
          status: 'completed',
          endedReason: callInfo.endedReason
        });
      }
    } else if (webhookData.event === 'transcript.updated') {
      // New transcript segment
      console.log('Received transcript.updated webhook:', JSON.stringify(webhookData, null, 2));
      
      if (activeCalls.has(webhookData.call.id)) {
        const callInfo = activeCalls.get(webhookData.call.id);
        console.log('Found active call:', webhookData.call.id);
        
        const transcriptSegment = {
          speaker: webhookData.transcript.speaker,
          text: webhookData.transcript.text,
          timestamp: new Date().toISOString()
        };
        
        console.log('Created transcript segment:', transcriptSegment);
        
        // Add the new transcript segment
        callInfo.transcript.push(transcriptSegment);
        activeCalls.set(webhookData.call.id, callInfo);
        
        // Emit the transcript update event
        console.log('Emitting transcript-updated event for call:', webhookData.call.id);
        io.emit('transcript-updated', { 
          callId: webhookData.call.id, 
          segment: transcriptSegment,
          transcript: callInfo.transcript 
        });
        
        // Also emit with the alternative event name for backward compatibility
        console.log('Emitting transcriptUpdate event for backward compatibility');
        io.emit('transcriptUpdate', { 
          callId: webhookData.call.id, 
          segment: transcriptSegment,
          transcript: callInfo.transcript 
        });
      } else {
        console.log('Call not found in activeCalls map:', webhookData.call.id);
        console.log('Current active calls:', Array.from(activeCalls.keys()));
      }
    }
    
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).json({ error: 'Failed to process webhook' });
  }
});

// Get call status and transcript
app.get('/api/call/:callId', (req, res) => {
  const { callId } = req.params;
  
  if (activeCalls.has(callId)) {
    res.json({ success: true, call: activeCalls.get(callId) });
  } else {
    res.status(404).json({ success: false, error: 'Call not found' });
  }
});

// Get all active calls
app.get('/api/calls', (req, res) => {
  try {
    const callList = Array.from(activeCalls.entries()).map(([id, data]) => ({
      id,
      ...data
    }));
    
    res.json({ success: true, calls: callList });
  } catch (error) {
    console.error('Error fetching calls:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Manual endpoint to check and update call status
app.get('/api/call/:callId/check-status', async (req, res) => {
  try {
    const { callId } = req.params;
    console.log(`Manually checking status for call ${callId}`);
    
    if (!activeCalls.has(callId)) {
      return res.status(404).json({ success: false, error: 'Call not found' });
    }
    
    // Get current call info
    const callInfo = activeCalls.get(callId);
    
    try {
      // Check call status via Vapi API
      const statusResponse = await axios.get(
        `https://api.vapi.ai/call/${callId}`,
        {
          headers: {
            'Authorization': `Bearer ${VAPI_API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log(`Status response from Vapi for call ${callId}:`, JSON.stringify(statusResponse.data, null, 2));
      
      // Update call status if needed
      if (statusResponse.data.status === 'ended') {
        callInfo.status = 'completed';
        
        // Capture the ended reason if available
        if (statusResponse.data.endedReason) {
          callInfo.endedReason = statusResponse.data.endedReason;
          console.log(`Call ${callId} ended with reason: ${statusResponse.data.endedReason}`);
        } else {
          callInfo.endedReason = 'unknown';
          console.log(`Call ${callId} ended with unknown reason`);
        }
        
        activeCalls.set(callId, callInfo);
        
        // Emit call status update to all connected clients with ended reason
        io.emit('call-status-update', { 
          callId: callId, 
          status: 'completed',
          endedReason: callInfo.endedReason 
        });
        
        // Also emit the call-ended event with ended reason
        io.emit('call-ended', { 
          callId: callId, 
          status: 'completed',
          endedReason: callInfo.endedReason
        });
      }
      
      return res.json({ 
        success: true, 
        call: callInfo,
        vapiStatus: statusResponse.data
      });
    } catch (apiError) {
      console.error(`Error checking call status with Vapi API: ${apiError.message}`);
      return res.status(500).json({ 
        success: false, 
        error: `Error checking call status: ${apiError.message}`,
        call: callInfo
      });
    }
  } catch (error) {
    console.error('Error in check-status endpoint:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get a specific call by ID
app.get('/api/call/:callId', (req, res) => {
  try {
    const { callId } = req.params;
    
    if (!activeCalls.has(callId)) {
      return res.status(404).json({ success: false, error: 'Call not found' });
    }
    
    const callData = activeCalls.get(callId);
    
    res.json({ 
      success: true, 
      call: {
        id: callId,
        ...callData
      } 
    });
  } catch (error) {
    console.error('Error fetching call details:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update persona for an active call
app.post('/api/call/:callId/persona', async (req, res) => {
  const { callId } = req.params;
  const { persona } = req.body;
  
  if (!activeCalls.has(callId)) {
    return res.status(404).json({ success: false, error: 'Call not found' });
  }
  
  try {
    const callInfo = activeCalls.get(callId);
    
    // Update assistant with new persona information
    const updateData = {
      systemPrompt: `You are ${persona.name || 'an AI Assistant'}. ${persona.description || 'You are helpful and friendly.'}. Continue your phone conversation naturally.`
    };
    
    await axios.patch(
      `https://api.vapi.ai/assistant/${callInfo.assistantId}`,
      updateData,
      {
        headers: {
          'Authorization': `Bearer ${VAPI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    // Update local storage
    callInfo.persona = persona;
    activeCalls.set(callId, callInfo);
    
    // Notify clients
    io.emit('personaUpdated', { callId, persona });
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating persona:', error.response?.data || error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  // Send list of active calls to newly connected client
  const calls = Array.from(activeCalls.entries()).map(([id, data]) => ({
    id,
    ...data
  }));
  
  socket.emit('activeCalls', calls);
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Start server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
