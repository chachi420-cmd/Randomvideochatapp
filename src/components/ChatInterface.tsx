import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  SkipForward,
  MessageSquare,
  Send,
  Loader2,
  AlertCircle,
  Flag,
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { useWebRTC } from '../hooks/useWebRTC';

interface ChatInterfaceProps {
  userId: string;
  username: string;
  partner: {
    userId: string;
    username: string;
  } | null;
  interests: string[];
  status: 'waiting' | 'connected' | 'disconnected';
  onNext: () => void;
  onDisconnect: () => void;
}

interface Message {
  id: string;
  text: string;
  sender: 'me' | 'stranger';
  timestamp: number;
}

export function ChatInterface({
  userId,
  username,
  partner,
  interests,
  status,
  onNext,
  onDisconnect,
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [showTextChat, setShowTextChat] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  const {
    localStream,
    remoteStream,
    isAudioEnabled,
    isVideoEnabled,
    connectionState,
    toggleAudio,
    toggleVideo,
  } = useWebRTC({
    userId,
    partnerId: partner?.userId || null,
    onDisconnect,
  });

  // Set video streams
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  // Auto-scroll messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !partner) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text: inputMessage,
      sender: 'me',
      timestamp: Date.now(),
    };

    setMessages([...messages, newMessage]);
    setInputMessage('');

    // Send to server
    try {
      await fetch(
        `https://${(window as any).SUPABASE_PROJECT_ID}.supabase.co/functions/v1/make-server-1c03ffb9/send-message`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${(window as any).SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            userId,
            message: inputMessage,
          }),
        }
      );
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const renderStatusIndicator = () => {
    if (status === 'waiting') {
      return (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-4 left-1/2 -translate-x-1/2 z-20"
        >
          <div className="bg-background/95 backdrop-blur-xl border border-border rounded-full px-6 py-3 shadow-lg flex items-center gap-3">
            <Loader2 className="w-4 h-4 animate-spin text-purple-500" />
            <span className="text-sm font-medium">Finding someone awesome...</span>
          </div>
        </motion.div>
      );
    }

    if (status === 'connected' && partner) {
      return (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-4 left-1/2 -translate-x-1/2 z-20"
        >
          <div className="bg-background/95 backdrop-blur-xl border border-green-500/50 rounded-full px-6 py-3 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-sm font-medium">Connected with {partner.username}</span>
            </div>
          </div>
        </motion.div>
      );
    }

    return null;
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Status Indicator */}
      {renderStatusIndicator()}

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:flex-row gap-4 p-4 overflow-hidden">
        {/* Video Area */}
        <div className="flex-1 relative rounded-2xl overflow-hidden bg-muted/20 border border-border/50">
          {/* Remote Video */}
          <div className="relative w-full h-full">
            {status === 'waiting' ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    className="w-16 h-16 mx-auto mb-4 border-4 border-purple-500/20 border-t-purple-500 rounded-full"
                  />
                  <p className="text-muted-foreground">Searching for a match...</p>
                </div>
              </div>
            ) : (
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
            )}

            {/* Local Video (Picture-in-Picture) */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute bottom-4 right-4 w-48 h-36 rounded-xl overflow-hidden border-2 border-border shadow-2xl bg-muted"
            >
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover mirror"
              />
              {!isVideoEnabled && (
                <div className="absolute inset-0 bg-muted flex items-center justify-center">
                  <VideoOff className="w-8 h-8 text-muted-foreground" />
                </div>
              )}
            </motion.div>

            {/* Interest Tags */}
            {interests.length > 0 && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="absolute top-4 left-4 flex flex-wrap gap-2 max-w-md"
              >
                {interests.map((interest) => (
                  <Badge
                    key={interest}
                    variant="secondary"
                    className="bg-background/80 backdrop-blur-sm border-border/50"
                  >
                    {interest}
                  </Badge>
                ))}
              </motion.div>
            )}

            {/* Connection State Warning */}
            {connectionState === 'connecting' && status === 'connected' && (
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-background/95 backdrop-blur-xl rounded-lg px-6 py-3 border border-border">
                <div className="flex items-center gap-2 text-sm">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Establishing connection...</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Text Chat Sidebar */}
        <AnimatePresence>
          {showTextChat && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 384, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="hidden lg:flex flex-col bg-card/50 backdrop-blur-xl border border-border/50 rounded-2xl overflow-hidden"
            >
              <div className="p-4 border-b border-border/50">
                <h3 className="font-semibold">Text Chat</h3>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.length === 0 ? (
                  <div className="text-center text-muted-foreground text-sm mt-8">
                    <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    Start a conversation
                  </div>
                ) : (
                  messages.map((msg) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] px-4 py-2 rounded-2xl ${
                          msg.sender === 'me'
                            ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                            : 'bg-muted text-foreground'
                        }`}
                      >
                        <p className="text-sm">{msg.text}</p>
                      </div>
                    </motion.div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className="p-4 border-t border-border/50">
                <div className="flex gap-2">
                  <Input
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Type a message..."
                    className="flex-1 bg-background/50"
                    disabled={status !== 'connected'}
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!inputMessage.trim() || status !== 'connected'}
                    size="icon"
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 border-0"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Controls */}
      <div className="border-t border-border/50 bg-card/30 backdrop-blur-xl">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-center gap-3">
            {/* Audio Toggle */}
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                onClick={toggleAudio}
                variant={isAudioEnabled ? 'outline' : 'destructive'}
                size="icon"
                className="w-12 h-12 rounded-full"
              >
                {isAudioEnabled ? (
                  <Mic className="w-5 h-5" />
                ) : (
                  <MicOff className="w-5 h-5" />
                )}
              </Button>
            </motion.div>

            {/* Video Toggle */}
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                onClick={toggleVideo}
                variant={isVideoEnabled ? 'outline' : 'destructive'}
                size="icon"
                className="w-12 h-12 rounded-full"
              >
                {isVideoEnabled ? (
                  <Video className="w-5 h-5" />
                ) : (
                  <VideoOff className="w-5 h-5" />
                )}
              </Button>
            </motion.div>

            {/* Text Chat Toggle */}
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                onClick={() => setShowTextChat(!showTextChat)}
                variant={showTextChat ? 'default' : 'outline'}
                size="icon"
                className="w-12 h-12 rounded-full hidden lg:flex"
              >
                <MessageSquare className="w-5 h-5" />
              </Button>
            </motion.div>

            {/* Next Button */}
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                onClick={onNext}
                size="lg"
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0 px-8"
              >
                <SkipForward className="w-5 h-5 mr-2" />
                Next
              </Button>
            </motion.div>

            {/* Report Button */}
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="ghost"
                size="icon"
                className="w-12 h-12 rounded-full text-destructive hover:text-destructive"
              >
                <Flag className="w-5 h-5" />
              </Button>
            </motion.div>
          </div>

          <p className="text-center text-xs text-muted-foreground mt-3">
            You're chatting as <span className="font-medium">{username}</span>
          </p>
        </div>
      </div>
    </div>
  );
}
