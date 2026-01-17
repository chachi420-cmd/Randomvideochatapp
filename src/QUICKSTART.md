# 🚀 NexusChat - Quick Start Guide

## 🎯 Test in 60 Seconds

### Step 1: Open Two Browsers
- Browser 1: Chrome
- Browser 2: Firefox (or Chrome Incognito)

### Step 2: Start Chatting
**In BOTH browsers:**
1. Click the big purple **"Start Chatting Now"** button
2. Grant camera/microphone permissions when prompted
3. Wait 2-5 seconds for matching

### Step 3: You're Connected! 🎉
- See your video in bottom-right corner
- See partner's video in main area
- Use controls to mute/unmute, turn camera on/off
- Click "Next" to find someone new

---

## 🎨 What You'll See

### Landing Page
- Purple/pink gradient theme
- Interest input field (optional)
- "Start Chatting Now" button

### Waiting Screen
- "Finding someone..." indicator
- Animated spinner
- Your video preview starts

### Chat Screen
- Large partner video area
- Small "you" video (bottom-right)
- Control bar at bottom:
  - 🎤 Mute/unmute
  - 🎥 Camera on/off
  - 💬 Text chat
  - ⏭️ Next button
  - 🚩 Report button

---

## 💡 Pro Tips

### Better Matching
1. Add interests before starting (e.g., "gaming", "music")
2. Use the same interests in both browsers
3. The system prioritizes shared interests

### If Camera Doesn't Work
1. Check browser permissions (top-right of address bar)
2. Make sure you're on HTTPS
3. Try refreshing the page
4. Use different browsers for each instance

### Testing Features
- **Interest Matching**: Add "test" interest on both browsers
- **Text Chat**: Click 💬 button on desktop
- **Controls**: Try muting and camera toggle
- **Next Button**: Disconnect and find new match

---

## 🔍 Debugging

### Open Browser Console
**Chrome/Firefox:** Press `F12` or `Cmd+Option+I` (Mac)

### Look for Logs
```
[Matchmaking] Joining queue with interests
[Matchmaking] Join queue response
[WebRTC] Requesting camera access
[WebRTC] Got media stream
```

### Demo Controls
- Click the 🧪 icon (bottom-left)
- View testing tips
- Check debug info

---

## ❓ Common Questions

**Q: Can I match with myself?**
A: No, you need two separate browsers/devices.

**Q: How long does matching take?**
A: Usually 1-3 seconds once both users click start.

**Q: Can I test without camera?**
A: Yes, but you'll get an error. Audio-only fallback is supported.

**Q: Does it work on mobile?**
A: Yes! Open on your phone's browser.

**Q: Are conversations recorded?**
A: No, it's peer-to-peer. Nothing is stored.

---

## 🎓 For Developers

### Check Server Health
```bash
Open browser console and run:
await fetch('https://[project-id].supabase.co/functions/v1/make-server-1c03ffb9/health')
```

### View Waiting Users
```bash
await fetch('https://[project-id].supabase.co/functions/v1/make-server-1c03ffb9/waiting-users')
```

### Debug Mode
Type in console:
```javascript
window.nexusDebug.logger.info('Testing debug tools')
```

---

## 🐛 Troubleshooting

### "Failed to join matchmaking"
- ✅ Check internet connection
- ✅ Refresh the page
- ✅ Check browser console for errors

### "Camera/Mic permission denied"
- ✅ Click lock icon in address bar
- ✅ Allow camera and microphone
- ✅ Refresh and try again

### "Can't connect to partner"
- ✅ Both users need to grant permissions
- ✅ Wait 10-15 seconds for WebRTC
- ✅ Check firewall settings
- ✅ Try again with "Next" button

### Video not showing
- ✅ Make sure camera is not in use by another app
- ✅ Check if partner granted permissions
- ✅ Look for connection status indicator

---

## 📚 More Info

- **Full Documentation**: See `README.md`
- **Testing Guide**: See `TESTING.md`
- **Implementation Details**: See `IMPLEMENTATION.md`

---

**Happy chatting! 🎉**

---

*Built with React, WebRTC, and Supabase*
*Inspired by Omegle and OmeTV*
