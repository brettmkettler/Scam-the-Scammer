# ScamTheScammer - AI Call Assistant

## 🎯 Project Mission

**ScamTheScammer** is an open-source AI-powered calling system designed to combat phone scammers by wasting their time with AI conversations instead of allowing them to target real people. By deploying AI assistants that can engage scammers in lengthy, realistic conversations, we aim to:

- **Protect Real People**: Divert scammers' attention away from potential victims
- **Waste Scammers' Time**: Keep fraudsters occupied with AI conversations that lead nowhere
- **Deter Scam Operations**: Make scamming less profitable by reducing their success rate
- **Community Defense**: Provide an open-source tool that anyone can deploy to help fight phone scams

This project integrates with Vapi for AI phone calls, Deepgram for live transcription, and includes real-time audio streaming capabilities to create convincing AI personas that can engage scammers effectively.

## 📞 How It Works

**This system makes outbound calls TO scammers, not incoming calls FROM scammers.** The AI assistant calls known scammer phone numbers and engages them in lengthy, realistic conversations to waste their time. The longer we can keep scammers talking to AI instead of targeting real people, the less time they have to scam actual victims.

**Note: This system currently does not receive or answer incoming calls - it only makes outbound calls to scammer numbers.**

## 🏗️ Project Structure

```
ScamTheScammer/
├── ai-caller/                    # Main AI Caller Application
│   ├── backend/                  # Node.js Express Backend
│   │   ├── src/
│   │   │   ├── server.js        # Main server with Vapi & Deepgram integration
│   │   │   └── test-phone-call.js # Testing utilities
│   │   └── package.json
│   └── frontend/                 # React Frontend
│       └── ai-caller-frontend/
│           ├── src/
│           │   ├── components/
│           │   │   ├── CallForm.js    # Call initiation form
│           │   │   ├── CallList.js    # Active calls display
│           │   │   └── CallDetails.js # Call monitoring with live transcription
│           │   └── App.js
│           └── package.json
```

## 🚀 Features

- **AI-Powered Phone Calls**: Integration with Vapi for making intelligent phone calls
- **Live Transcription**: Real-time speech-to-text using Deepgram
- **Real-Time Audio Streaming**: Monitor ongoing calls with live audio via WebSocket
- **Persona Configuration**: Configure AI assistants with custom personalities
- **Call Management**: Start, monitor, and manage multiple calls simultaneously
- **Modern UI**: React-based frontend with real-time updates

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **Git**

## 🔑 Required API Keys

You'll need to obtain API keys from the following services:

1. **Vapi**: Sign up at [vapi.ai](https://vapi.ai) for AI calling capabilities
2. **Deepgram**: Get your API key from [deepgram.com](https://deepgram.com) for transcription
3. **OpenAI**: Get your API key from [openai.com](https://openai.com) for the AI language model (currently configured for OpenAI, but can be changed in server.js)

## 📱 Setting Up Your VAPI Phone Number

**VAPI provides the phone number that your AI assistant will use to call scammers.** Here's how to set it up:

### Step 1: Create a VAPI Account
1. Go to [vapi.ai](https://vapi.ai) and sign up for an account
2. Complete the verification process
3. Navigate to your dashboard

### Step 2: Get Your API Key
1. In your VAPI dashboard, go to the **API Keys** section
2. Create a new API key and copy it
3. Save this key - you'll need it for your `.env` file

### Step 3: Configure Third-Party APIs
**Important**: You need to add your OpenAI API key to VAPI for the AI to work properly.

1. In your VAPI dashboard, navigate to **Settings** or **Integrations**
2. Look for **Third-Party APIs** or **AI Provider Settings**
3. Add your **OpenAI API Key** (the system is currently configured for OpenAI)
4. Configure any other required API integrations

**Note**: The system currently uses OpenAI's GPT-4 model, but this can be changed in the `server.js` file. If you need help configuring other AI providers, ping the developer on Discord.

### Step 4: Purchase a Phone Number
1. In your VAPI dashboard, navigate to **Phone Numbers**
2. Click **Buy Phone Number**
3. Choose your preferred area code and number
4. Complete the purchase (typically costs a few dollars per month)

### Step 5: Configure Your Phone Number
1. Once purchased, click on your phone number to configure it
2. Set up the **Assistant** that will make outbound calls to scammers
3. Configure the AI persona to sound like a potential scam victim
4. Set up realistic responses that will keep scammers engaged

### Step 6: Test Your Setup
1. Use the application to make a test call to a safe number (like your own phone)
2. Verify that the AI assistant calls out and responds appropriately
3. Make adjustments to the persona as needed

### Pro Tips for Scam Baiting:
- **Create believable personas**: Elderly person, confused about technology, etc.
- **Add realistic delays**: Make the AI seem like it's thinking or looking for information
- **Include background stories**: Family details, financial situations that scammers target
- **Use common victim responses**: "Let me get your credit card", "I'm not good with computers"

## 🎭 Configuring Your AI Persona

**The key to effective scam baiting is creating a convincing AI persona.** You'll need to customize the AI assistant's personality and fake personal information in the `backend/src/server.js` file.

### Editing the Persona Configuration

1. **Open the server file**: Navigate to `ai-caller/backend/src/server.js`
2. **Find the persona section**: Look for the `assistantData` object around line 50
3. **Customize the system message**: Update the persona details in the `content` field

### Key Areas to Customize:

#### 1. AI Provider Configuration
**The system is currently configured to use OpenAI's GPT-4 model:**
```javascript
model: {
  provider: "openai",
  model: "gpt-4",
  // ...
}
```

**To change AI providers:**
- You can modify the `provider` and `model` fields in the `assistantData` object
- Supported providers may include OpenAI, Anthropic, and others
- **Need help?** Ping the developer on Discord for assistance with other AI providers

#### 2. Basic Identity
```javascript
`You are ${persona.name || 'David Johnson'}, ${persona.description || 'an elderly retiree who is 78 years old'}.`
```
- Change the default name and description
- Consider: elderly person, confused parent, tech-illiterate individual

#### 3. Fake Personal Information
**⚠️ IMPORTANT: Use completely fake information that cannot harm real people**

```javascript
// Example fake information in the code:
- Social Security Number: 483-29-1830
- Date of birth: May 12, 1947
- Bank account number: 4281065732 at First National Bank
- Credit card number: 4929 1923 4567 8901
- Home address: 742 Maple Street, Clearwater, FL 33756
```

**Generate your own fake data:**
- Use fake SSN generators (ensure they're invalid)
- Create fictional addresses
- Use test credit card numbers (like 4111 1111 1111 1111)
- Make up bank account numbers

#### 4. Personality Traits
Customize these behavioral characteristics:
```javascript
"You are somewhat hard of hearing and sometimes ask people to repeat themselves. 
You are trusting and can be easily convinced to provide your personal information 
if someone sounds official. You are lonely and enjoy talking to people."
```

#### 5. Behavioral Instructions
```javascript
"Go along with whatever the person says and try to make them happy. 
Do not go out of character. If they ask for your information, 
you can provide it without hesitation."
```

### Persona Ideas for Maximum Effectiveness:

1. **"Confused Grandparent"**
   - Hard of hearing, asks to repeat things
   - Talks about grandchildren and family
   - Easily confused by technical terms

2. **"Lonely Retiree"**
   - Enjoys long conversations
   - Shares personal stories
   - Trusting of "official" sounding callers

3. **"Tech-Illiterate Adult"**
   - Confused by computer terminology
   - Asks for step-by-step instructions
   - Needs things explained multiple times

### Safety Reminders:
- **Never use real personal information**
- **Always use fake SSNs, addresses, and financial details**
- **Test your persona by calling the number yourself**
- **Make sure the AI stays in character throughout the conversation**

## 🛠️ Installation & Setup

### Node.js AI Caller Setup

#### 1. Clone the Repository
```bash
git clone <repository-url>
cd ScamTheScammer
```

#### 2. Backend Setup
```bash
cd ai-caller/backend
npm install
```

#### 3. Create Environment File
Create a `.env` file in the `ai-caller/backend` directory:
```env
VAPI_API_KEY=your_vapi_api_key_here
DEEPGRAM_API_KEY=your_deepgram_api_key_here
PORT=3001
```

#### 4. Frontend Setup
```bash
cd ../frontend/ai-caller-frontend
npm install
```

#### 5. Start the Application

**Terminal 1 - Backend:**
```bash
cd ai-caller/backend
npm run dev
# or for production: npm start
```

**Terminal 2 - Frontend:**
```bash
cd ai-caller/frontend/ai-caller-frontend
npm start
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001

## 🎯 Usage

### Making AI Calls to Scammers

1. **Access the Frontend**: Open http://localhost:3000 in your browser
2. **Configure Call**: Use the CallForm component to set up your call parameters:
   - **Scammer's phone number** to call (the number you want to waste time)
   - AI assistant configuration
   - Call objectives and persona
3. **Initiate Call**: Click "Start Call" to have your AI assistant call the scammer
4. **Monitor Call**: View live transcription and audio stream in the CallDetails component
5. **Manage Calls**: Use the CallList component to see all active outbound calls to scammers

**Remember**: This system makes calls TO scammer numbers, not receives calls FROM scammers.

### Key Features:

- **Real-Time Transcription**: See live speech-to-text as the conversation happens
- **Audio Streaming**: Listen to the call in real-time via WebSocket connection
- **Call Management**: Start, stop, and monitor multiple calls simultaneously
- **Persona Configuration**: Customize AI behavior and conversation style

## 🔧 Configuration

### Vapi Configuration
The application uses Vapi's API for:
- Creating AI assistants with custom personas
- Initiating phone calls
- Managing call states
- Retrieving call transcripts and audio streams

### Deepgram Integration
Deepgram provides:
- Real-time speech-to-text transcription
- High-accuracy voice recognition
- Live streaming capabilities

### WebSocket Audio Streaming
The application includes Vapi's Call Listen feature:
- Real-time audio streaming from ongoing calls
- WebSocket-based audio delivery
- Live audio playback in the browser

## 🐛 Troubleshooting

### Common Issues:

1. **404 Errors on API Calls**
   - Verify your Vapi API key is correct
   - Check that you're using the latest Vapi API endpoints
   - Ensure proper Bearer token authentication

2. **Transcription Not Working**
   - Confirm Deepgram API key is valid
   - Check network connectivity
   - Verify WebSocket connections are established

3. **Audio Streaming Issues**
   - Ensure browser supports WebSocket audio
   - Check that the listenUrl is being retrieved from Vapi
   - Verify audio permissions in browser

4. **Environment Variables**
   - Double-check all required API keys are set
   - Ensure `.env` file is in the correct directory
   - Restart servers after changing environment variables

### Debug Mode:
Enable detailed logging by setting:
```env
NODE_ENV=development
```

## 📚 API Documentation

### Backend Endpoints (Node.js):
- `POST /api/calls` - Initiate a new AI call
- `GET /api/calls` - Retrieve active calls
- `GET /api/calls/:id` - Get specific call details
- `DELETE /api/calls/:id` - End a call

### WebSocket Events:
- `call-started` - Call initiation confirmation
- `transcript-update` - Live transcription updates
- `call-ended` - Call completion notification
- `audio-stream` - Real-time audio data

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

If you encounter any issues or need help:

1. Check the troubleshooting section above
2. Review the API documentation for Vapi and Deepgram
3. Ensure all environment variables are properly configured
4. Check the console logs for detailed error messages

## 🔮 Future Enhancements

- Advanced AI persona customization
- Call scheduling and automation

---

**Note**: This application is designed for legitimate business purposes. Please ensure compliance with all applicable laws and regulations regarding automated calling and recording in your jurisdiction.
