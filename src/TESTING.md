# NexusChat - Testing Guide

## Overview

NexusChat is a modern random video/text chat application inspired by Omegle and OmeTV. This guide explains how to test the application in the Figma Make environment.

## Quick Start

### To Test the Matching System (Easiest)
1. Open the app in **two different browsers** (e.g., Chrome and Firefox)
2. In both browsers, click "Start Chatting Now"
3. Optionally add the same interest (e.g., "gaming") on both
4. Watch as the system automatically matches you together!
5. Grant camera/microphone permissions when prompted

### Expected Behavior
- **Landing Page**: You'll see a purple/pink gradient interface with interest input
- **Waiting State**: After clicking start, you'll see "Finding someone..."
- **Matched State**: When matched, you'll see "Connected with Stranger_XXXX"
- **Chat Interface**: Video areas, controls, and text chat panel

## Architecture

### Backend (Supabase Edge Functions)
- **Matchmaking System**: Interest-based matching with fallback to random matching
- **WebRTC Signaling**: Peer-to-peer connection establishment via offer/answer exchange
- **Real-time Messaging**: Text chat support alongside video
- **Session Management**: User queue management and connection tracking

### Frontend
- **Landing Page**: Interest selection and onboarding
- **Chat Interface**: Video display, controls, and text chat
- **WebRTC Integration**: Camera/microphone access and peer connections

## Testing in Figma Make Preview

### Important Limitations

The Figma Make preview environment has some limitations for testing WebRTC:

1. **Camera/Microphone Access**: May be blocked by browser security policies
2. **Multiple Tabs**: Opening multiple tabs from the same browser may not work due to device access conflicts
3. **WebRTC Connections**: Require HTTPS and proper permissions

### Recommended Testing Approach

#### Option 1: Test with Multiple Devices/Browsers
1. Open the app in two different browsers (Chrome and Firefox)
2. Or use one desktop and one mobile device
3. Grant camera/microphone permissions when prompted
4. Enter the same interests on both devices to ensure matching

#### Option 2: Test UI/UX Flow
1. Test the landing page and interest selection
2. Observe the "Finding someone..." state
3. Check the chat interface controls and layout
4. Test text chat functionality

#### Option 3: Use Incognito Windows
1. Open two incognito/private windows
2. Navigate to the app in both
3. This sometimes allows separate device access

### Testing Checklist

#### Landing Page
- [ ] Interest input works
- [ ] Can add/remove interests
- [ ] Popular interests are clickable
- [ ] "Start Chatting" button triggers matchmaking
- [ ] Animations are smooth

#### Matching System
- [ ] Shows "Finding someone..." indicator
- [ ] Polls server for matches
- [ ] Successfully connects when partner found
- [ ] Displays partner username

#### Chat Interface
- [ ] Video areas render properly
- [ ] Local video shows in PiP (picture-in-picture)
- [ ] Controls are accessible
- [ ] Mute/unmute audio works
- [ ] Enable/disable video works
- [ ] Text chat panel toggles
- [ ] "Next" button disconnects and finds new partner
- [ ] Interest tags display correctly

#### WebRTC (if devices/permissions available)
- [ ] Camera permission prompt appears
- [ ] Microphone permission prompt appears
- [ ] Local video stream displays
- [ ] Remote video stream displays (when connected)
- [ ] Audio transmission works
- [ ] Connection state indicators update

## Server Endpoints

### `/join-queue`
Adds user to matchmaking queue with interests
```json
POST {
  "userId": "user_123",
  "interests": ["gaming", "music"]
}
```

### `/check-match`
Polls for match status
```json
POST {
  "userId": "user_123"
}
```

### `/signal`
Sends WebRTC signaling data
```json
POST {
  "from": "user_123",
  "to": "user_456",
  "type": "offer",
  "data": {...}
}
```

### `/disconnect`
Disconnects from current chat
```json
POST {
  "userId": "user_123"
}
```

### `/send-message`
Sends text message to partner
```json
POST {
  "userId": "user_123",
  "message": "Hello!"
}
```

## Known Issues & Future Enhancements

### Current Limitations
- No persistent user sessions (anonymous only)
- Basic signaling via polling (WebSocket would be better)
- Limited moderation features
- No connection quality indicators

### Planned Features
- Google OAuth integration
- User profiles and history
- Advanced moderation and reporting
- Better connection quality monitoring
- Mobile app versions
- Group chat support

## Development Notes

### Interest Matching Algorithm
The backend calculates interest overlap between waiting users:
- Finds user with most matching interests
- Falls back to first available user if no matches
- Case-insensitive matching

### WebRTC Flow
1. User A joins queue
2. User B joins queue and matches with A
3. Both users create RTCPeerConnection
4. User with lower ID creates offer
5. Signaling exchanged via server polling
6. Direct peer-to-peer connection established
7. Media streams exchanged

### Data Storage (KV Store)
- `waiting:{userId}` - Users in matchmaking queue
- `user-connection:{userId}` - Active connection info
- `connection:{id}` - Connection details
- `signal:{userId}:{timestamp}` - WebRTC signals
- `message:{userId}:{timestamp}` - Text messages

## Support

For issues or questions about the implementation, check:
- Browser console for errors
- Network tab for API calls
- Supabase logs for backend errors