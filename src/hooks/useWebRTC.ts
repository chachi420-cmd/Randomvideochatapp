import { useEffect, useRef, useState, useCallback } from 'react';
import { logger } from '../utils/debug';

export interface UseWebRTCOptions {
  userId: string;
  partnerId: string | null;
  onDisconnect?: () => void;
}

export function useWebRTC({ userId, partnerId, onDisconnect }: UseWebRTCOptions) {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [connectionState, setConnectionState] = useState<RTCPeerConnectionState>('new');
  
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // ICE servers configuration
  const iceServers = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
    ],
  };

  // Get user media (camera and microphone)
  const getUserMedia = useCallback(async () => {
    try {
      logger.webrtc('Requesting camera and microphone access');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: true,
      });
      
      logger.webrtc('Got media stream', { 
        videoTracks: stream.getVideoTracks().length,
        audioTracks: stream.getAudioTracks().length 
      });
      setLocalStream(stream);
      return stream;
    } catch (error) {
      logger.error('Error accessing media devices', error);
      // Try audio only as fallback
      try {
        logger.webrtc('Trying audio-only fallback');
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        setLocalStream(stream);
        return stream;
      } catch (audioError) {
        logger.error('Error accessing audio', audioError);
        return null;
      }
    }
  }, []);

  // Create peer connection
  const createPeerConnection = useCallback(async (stream: MediaStream) => {
    const pc = new RTCPeerConnection(iceServers);
    peerConnectionRef.current = pc;

    // Add local stream tracks
    stream.getTracks().forEach((track) => {
      pc.addTrack(track, stream);
    });

    // Handle remote stream
    pc.ontrack = (event) => {
      console.log('Received remote track:', event.track.kind);
      setRemoteStream(event.streams[0]);
    };

    // Handle ICE candidates
    pc.onicecandidate = async (event) => {
      if (event.candidate && partnerId) {
        // Send ICE candidate to partner via signaling server
        await sendSignal({
          from: userId,
          to: partnerId,
          type: 'ice-candidate',
          data: event.candidate,
        });
      }
    };

    // Monitor connection state
    pc.onconnectionstatechange = () => {
      console.log('Connection state:', pc.connectionState);
      setConnectionState(pc.connectionState);
      
      if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
        onDisconnect?.();
      }
    };

    return pc;
  }, [userId, partnerId, onDisconnect]);

  // Send signaling data
  const sendSignal = async (signal: any) => {
    try {
      const response = await fetch(
        `https://${(window as any).SUPABASE_PROJECT_ID}.supabase.co/functions/v1/make-server-1c03ffb9/signal`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${(window as any).SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify(signal),
        }
      );

      if (!response.ok) {
        console.error('Failed to send signal:', await response.text());
      }
    } catch (error) {
      console.error('Error sending signal:', error);
    }
  };

  // Poll for incoming signals
  const pollSignals = useCallback(async () => {
    try {
      const response = await fetch(
        `https://${(window as any).SUPABASE_PROJECT_ID}.supabase.co/functions/v1/make-server-1c03ffb9/get-signals`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${(window as any).SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({ userId }),
        }
      );

      if (!response.ok) return;

      const { signals } = await response.json();
      
      for (const signal of signals) {
        await handleSignal(signal);
      }
    } catch (error) {
      console.error('Error polling signals:', error);
    }
  }, [userId]);

  // Handle incoming signals
  const handleSignal = async (signal: any) => {
    const pc = peerConnectionRef.current;
    if (!pc) return;

    try {
      switch (signal.type) {
        case 'offer':
          await pc.setRemoteDescription(new RTCSessionDescription(signal.data));
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          await sendSignal({
            from: userId,
            to: signal.from,
            type: 'answer',
            data: answer,
          });
          break;

        case 'answer':
          await pc.setRemoteDescription(new RTCSessionDescription(signal.data));
          break;

        case 'ice-candidate':
          await pc.addIceCandidate(new RTCIceCandidate(signal.data));
          break;
      }
    } catch (error) {
      console.error('Error handling signal:', error);
    }
  };

  // Initialize WebRTC connection
  const initializeConnection = useCallback(async (isInitiator: boolean) => {
    const stream = await getUserMedia();
    if (!stream || !partnerId) return;

    const pc = await createPeerConnection(stream);

    // Start polling for signals
    pollingIntervalRef.current = setInterval(pollSignals, 1000);

    // If initiator, create and send offer
    if (isInitiator) {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      await sendSignal({
        from: userId,
        to: partnerId,
        type: 'offer',
        data: offer,
      });
    }
  }, [getUserMedia, createPeerConnection, partnerId, pollSignals, userId]);

  // Toggle audio
  const toggleAudio = useCallback(() => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioEnabled(audioTrack.enabled);
      }
    }
  }, [localStream]);

  // Toggle video
  const toggleVideo = useCallback(() => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoEnabled(videoTrack.enabled);
      }
    }
  }, [localStream]);

  // Cleanup
  const cleanup = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }

    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }

    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
    }

    setLocalStream(null);
    setRemoteStream(null);
  }, [localStream]);

  // Initialize when partner is found
  useEffect(() => {
    if (partnerId) {
      // Determine if this user is the initiator (comparing user IDs)
      const isInitiator = userId < partnerId;
      initializeConnection(isInitiator);
    }

    return cleanup;
  }, [partnerId]);

  return {
    localStream,
    remoteStream,
    isAudioEnabled,
    isVideoEnabled,
    connectionState,
    toggleAudio,
    toggleVideo,
    cleanup,
  };
}