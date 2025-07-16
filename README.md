# ScamTheScammer - AI Call Assistant

An AI-powered calling application that integrates with Vapi for making AI phone calls, Deepgram for live transcription, and includes real-time audio streaming capabilities. The application consists of multiple components working together to provide a comprehensive AI calling solution.

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

### Making AI Calls

1. **Access the Frontend**: Open http://localhost:3000 in your browser
2. **Configure Call**: Use the CallForm component to set up your call parameters:
   - Phone number to call
   - AI assistant configuration
   - Call objectives and persona
3. **Initiate Call**: Click "Start Call" to begin the AI-powered conversation
4. **Monitor Call**: View live transcription and audio stream in the CallDetails component
5. **Manage Calls**: Use the CallList component to see all active calls

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

- Call recording and playback
- Advanced analytics and reporting
- Multi-language support
- Integration with CRM systems
- Advanced AI persona customization
- Call scheduling and automation

---

**Note**: This application is designed for legitimate business purposes. Please ensure compliance with all applicable laws and regulations regarding automated calling and recording in your jurisdiction.
