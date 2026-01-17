# 🎥 NexusChat - Modern Random Video Chat Platform

A futuristic, Omegle/OmeTV-inspired random video and text chat application built with React, WebRTC, and Supabase.

## ✨ Features

### Core Functionality
- 🎯 **Interest-Based Matching**: Connect with strangers who share your interests
- 🎥 **Video Chat**: Real-time peer-to-peer video streaming via WebRTC
- 💬 **Text Chat**: Built-in text messaging alongside video
- 🔄 **Quick Skip**: One-click "Next" button to find a new partner
- 👤 **Anonymous Mode**: No login required, instant connection as Stranger_XXXX

### User Experience
- 🌙 **Dark Theme**: Futuristic glassmorphic UI with purple/pink gradients
- ✨ **Smooth Animations**: Powered by Motion (Framer Motion)
- 📱 **Responsive Design**: Works on desktop and mobile
- 🎮 **Intuitive Controls**: Mute, camera toggle, text chat, and skip buttons
- 🎨 **Clean Interface**: Minimal, distraction-free design

### Technical Features
- 🔐 **WebRTC P2P**: Direct peer-to-peer connections
- 🔄 **Real-time Matching**: Server-side matchmaking algorithm
- 🎯 **Interest Scoring**: Prioritizes users with common interests
- 📊 **Connection States**: Visual feedback for connection status
- 🐛 **Debug Tools**: Built-in logging and debugging utilities

## 🏗️ Architecture

### Frontend Stack
- **React 18** with TypeScript
- **Tailwind CSS v4** for styling
- **Motion (Framer Motion)** for animations
- **shadcn/ui** component library
- **WebRTC API** for video/audio
- **Custom hooks** for WebRTC management

### Backend Stack
- **Supabase Edge Functions** (Deno runtime)
- **Hono** web framework
- **KV Store** for session management
- **REST API** for matchmaking and signaling

### Data Flow
```
User A → Join Queue → Server Matchmaking → Match Found
                          ↓
User B → Join Queue → Server Matchmaking → Match Found
                          ↓
                    WebRTC Signaling
                          ↓
                  P2P Connection Established
                          ↓
                  Video/Audio Streaming
```

## 📁 Project Structure

```
├── App.tsx                      # Main application component
├── components/
│   ├── Navbar.tsx              # Navigation header
│   ├── LandingPage.tsx         # Interest input & onboarding
│   ├── ChatInterface.tsx       # Video chat UI
│   └── DemoControls.tsx        # Testing utilities
├── hooks/
│   └── useWebRTC.ts            # WebRTC connection logic
├── utils/
│   └── debug.ts                # Logging and debugging
├── supabase/functions/server/
│   ├── index.tsx               # API endpoints
│   └── kv_store.tsx            # Database utilities
└── styles/
    └── globals.css             # Global styles & theme
```

## 🚀 Getting Started

### Prerequisites
- Modern browser with WebRTC support (Chrome, Firefox, Safari, Edge)
- Camera and microphone permissions
- Two devices/browsers for testing (can't connect to yourself)

### How to Test

#### Option 1: Two Browsers
1. Open the app in Chrome
2. Open the app in Firefox (or Chrome Incognito)
3. Enter the same interests on both
4. Click "Start Chatting Now" on both
5. Grant permissions when prompted
6. Wait for automatic matching

#### Option 2: Two Devices
1. Open on desktop computer
2. Open on mobile phone
3. Follow same steps as above

#### Option 3: With a Friend
1. Share the app URL
2. Coordinate interests to match
3. Both click start around the same time

## 🎮 Usage Guide

### Landing Page
1. **Add Interests** (optional)
   - Type interests and press Enter or click "Add"
   - Click popular interest tags for quick selection
   - Maximum 5 interests allowed

2. **Start Chatting**
   - Click the big purple "Start Chatting Now" button
   - Grant camera/microphone permissions
   - Wait for a match

### Chat Screen

#### Controls
- **🎤 Microphone**: Toggle audio on/off
- **🎥 Camera**: Toggle video on/off
- **💬 Text Chat**: Open/close text panel (desktop only)
- **⏭️ Next**: Skip to next person
- **🚩 Report**: Flag inappropriate behavior

#### Status Indicators
- **"Finding someone..."** - Searching for a match
- **"Connected with Stranger_XXXX"** - Successfully matched
- **"Reconnecting..."** - Connection issue detected

## 🔧 API Endpoints

### Matchmaking
- `POST /join-queue` - Join matchmaking with interests
- `POST /check-match` - Poll for match status
- `POST /disconnect` - Leave current chat

### WebRTC Signaling
- `POST /signal` - Send offer/answer/ICE candidate
- `POST /get-signals` - Retrieve pending signals

### Messaging
- `POST /send-message` - Send text message
- `POST /get-messages` - Get received messages

### Debug
- `GET /waiting-users` - View queue status
- `GET /health` - Server health check

## 🎯 Matching Algorithm

The server uses a smart matching algorithm:

1. **Interest Matching**
   - Calculates overlap between user interests
   - Prioritizes users with most common interests
   - Case-insensitive matching

2. **Fallback Strategy**
   - If no interest matches found, connects to first available user
   - Ensures quick connections even without shared interests

3. **Queue Management**
   - First-come, first-served within interest groups
   - Automatic cleanup of stale connections
   - Real-time availability tracking

## 🔐 Privacy & Safety

### Current Implementation
- ✅ Anonymous usernames (no personal data)
- ✅ No account creation required
- ✅ Peer-to-peer video (not stored)
- ✅ Session-based, no persistence
- ✅ Report button (UI ready)

### Production Recommendations
- 🔜 Implement actual reporting system
- 🔜 Add content moderation AI
- 🔜 Rate limiting and abuse prevention
- 🔜 Age verification system
- 🔜 Terms of service enforcement
- 🔜 GDPR/privacy compliance

## 🐛 Debugging

### Browser Console
The app logs detailed information to console:
```javascript
[NexusChat] Joining queue with interests
[Matchmaking] Join queue response
[WebRTC] Requesting camera access
[WebRTC] Got media stream
```

### Debug Tools
Click the 🧪 icon in bottom-left corner to access:
- Demo mode toggle
- Testing tips
- Connection status

### Common Issues

**Camera/Mic not working?**
- Check browser permissions
- Ensure HTTPS connection
- Try refreshing the page

**Can't find a match?**
- Open in second browser/device
- Check network/console errors
- Verify server is running

**Video not showing?**
- Check if partner granted permissions
- Wait for WebRTC connection (takes 5-10 seconds)
- Check connection state indicator

## 📊 WebRTC Connection Flow

```
1. User A creates offer
2. Sends offer to server
3. Server stores offer for User B
4. User B polls server, gets offer
5. User B creates answer
6. Sends answer to server
7. User A polls server, gets answer
8. ICE candidates exchanged
9. P2P connection established
10. Media streams flowing
```

## 🎨 Design System

### Colors
- **Purple 600**: `#9333ea` - Primary brand color
- **Pink 600**: `#db2777` - Secondary accent
- **Background**: `oklch(0.145 0 0)` - Dark theme base
- **Border**: `oklch(0.269 0 0)` - Subtle dividers

### Typography
- **Font**: System font stack
- **Weights**: 400 (normal), 500 (medium)
- **Sizes**: Responsive with CSS custom properties

### Effects
- **Glassmorphism**: backdrop-blur-xl
- **Gradients**: Purple to pink
- **Animations**: Smooth transitions with Motion

## 🚧 Future Enhancements

### Short-term (MVP+)
- [ ] Google OAuth integration
- [ ] User preferences persistence
- [ ] Connection quality indicator
- [ ] Mobile app optimization
- [ ] Better error handling

### Medium-term
- [ ] User profiles (optional)
- [ ] Chat history (session-based)
- [ ] Filter by location/language
- [ ] Screen sharing feature
- [ ] Group video chat

### Long-term
- [ ] Premium features
- [ ] AI moderation system
- [ ] Virtual backgrounds
- [ ] Gamification elements
- [ ] Mobile native apps

## 📝 Development Notes

### WebRTC Considerations
- **STUN servers**: Using Google's public STUN
- **TURN servers**: Not implemented (would need for NAT traversal)
- **Signaling**: Polling-based (WebSocket would be better)
- **Browser support**: Modern browsers only

### Performance
- **Polling intervals**: 1-2 seconds for responsive matching
- **Video quality**: Adaptive based on connection
- **Memory management**: Proper cleanup on disconnect

### Security
- **No PII collection**: Anonymous by design
- **Session-only data**: No long-term storage
- **Client-side validation**: All inputs sanitized
- **CORS enabled**: Necessary for development

## 🙏 Credits

Built with:
- [React](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [Motion](https://motion.dev)
- [Supabase](https://supabase.com)
- [shadcn/ui](https://ui.shadcn.com)
- [Lucide Icons](https://lucide.dev)

Inspired by: Omegle, OmeTV, Chatroulette

## 📄 License

This is a prototype/demo application built for educational purposes.

---

**Note**: This application is designed for prototyping and demonstration. For production use with real users, additional security measures, moderation systems, and compliance with privacy regulations would be required.
