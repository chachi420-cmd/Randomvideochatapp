import { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { LandingPage } from './components/LandingPage';
import { ChatInterface } from './components/ChatInterface';
import { DemoControls } from './components/DemoControls';
import { Toaster, toast } from 'sonner@2.0.3';
import { projectId, publicAnonKey } from './utils/supabase/info';
import { logger } from './utils/debug';

// Make Supabase config available globally for hooks
if (typeof window !== 'undefined') {
  (window as any).SUPABASE_PROJECT_ID = projectId;
  (window as any).SUPABASE_ANON_KEY = publicAnonKey;
}

type AppState = 'landing' | 'waiting' | 'chatting';

interface Partner {
  userId: string;
  username: string;
}

function generateUserId(): string {
  return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export default function App() {
  const [appState, setAppState] = useState<AppState>('landing');
  const [userId] = useState(generateUserId());
  const [username, setUsername] = useState('');
  const [interests, setInterests] = useState<string[]>([]);
  const [partner, setPartner] = useState<Partner | null>(null);
  const [matchCheckInterval, setMatchCheckInterval] = useState<NodeJS.Timeout | null>(null);

  // Join matchmaking queue
  const joinQueue = async (selectedInterests: string[]) => {
    try {
      setInterests(selectedInterests);
      setAppState('waiting');
      
      logger.matchmaking('Joining queue with interests', selectedInterests);
      toast.loading('Finding someone to chat with...', { id: 'matching' });

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-1c03ffb9/join-queue`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({
            userId,
            interests: selectedInterests,
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        logger.error('Failed to join queue', errorText);
        throw new Error('Failed to join queue');
      }

      const data = await response.json();
      logger.matchmaking('Join queue response', data);
      setUsername(data.yourUsername);

      if (data.matched && data.partner) {
        // Immediate match found
        logger.matchmaking('Immediate match found', data.partner);
        toast.success(`Connected with ${data.partner.username}!`, { id: 'matching' });
        setPartner(data.partner);
        setAppState('chatting');
      } else {
        // Start polling for match
        logger.matchmaking('Waiting for match, starting polling');
        toast.loading('Waiting for someone to join...', { id: 'matching' });
        startMatchPolling();
      }
    } catch (error) {
      logger.error('Error joining queue', error);
      toast.error('Failed to join matchmaking. Please try again.', { id: 'matching' });
      setAppState('landing');
    }
  };

  // Poll for match
  const startMatchPolling = useCallback(() => {
    const interval = setInterval(async () => {
      try {
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-1c03ffb9/check-match`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${publicAnonKey}`,
            },
            body: JSON.stringify({ userId }),
          }
        );

        if (!response.ok) return;

        const data = await response.json();

        if (data.matched && data.partner) {
          toast.success(`Connected with ${data.partner.username}!`, { id: 'matching' });
          setPartner(data.partner);
          setAppState('chatting');
          clearInterval(interval);
        }
      } catch (error) {
        console.error('Error checking match:', error);
      }
    }, 2000); // Poll every 2 seconds

    setMatchCheckInterval(interval);
  }, [userId]);

  // Disconnect from current chat
  const disconnect = async () => {
    try {
      await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-1c03ffb9/disconnect`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({ userId }),
        }
      );
    } catch (error) {
      console.error('Error disconnecting:', error);
    }

    if (matchCheckInterval) {
      clearInterval(matchCheckInterval);
      setMatchCheckInterval(null);
    }

    setPartner(null);
  };

  // Handle "Next" button
  const handleNext = async () => {
    toast.loading('Finding next person...', { id: 'matching' });
    await disconnect();
    
    // Small delay before rejoining
    setTimeout(() => {
      joinQueue(interests);
    }, 500);
  };

  // Handle disconnect from partner
  const handleDisconnect = () => {
    toast.info('Partner disconnected');
    disconnect();
    setAppState('landing');
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (matchCheckInterval) {
        clearInterval(matchCheckInterval);
      }
      disconnect();
    };
  }, [matchCheckInterval]);

  // Cleanup interval when match is found
  useEffect(() => {
    if (appState === 'chatting' && matchCheckInterval) {
      clearInterval(matchCheckInterval);
      setMatchCheckInterval(null);
    }
  }, [appState, matchCheckInterval]);

  return (
    <div className="dark min-h-screen bg-background text-foreground">
      <Toaster position="top-center" richColors />
      <DemoControls />
      
      {appState === 'landing' && (
        <>
          <Navbar onStartChat={() => {}} showStartButton={false} />
          <LandingPage onStartChat={joinQueue} />
        </>
      )}

      {(appState === 'waiting' || appState === 'chatting') && (
        <ChatInterface
          userId={userId}
          username={username}
          partner={partner}
          interests={interests}
          status={appState === 'waiting' ? 'waiting' : 'connected'}
          onNext={handleNext}
          onDisconnect={handleDisconnect}
        />
      )}
    </div>
  );
}