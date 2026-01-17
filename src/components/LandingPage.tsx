import { useState } from 'react';
import { motion } from 'motion/react';
import { Video, MessageSquare, Sparkles, X } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';

interface LandingPageProps {
  onStartChat: (interests: string[]) => void;
}

export function LandingPage({ onStartChat }: LandingPageProps) {
  const [interests, setInterests] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState('');

  const popularInterests = [
    'Music', 'Gaming', 'Movies', 'Sports', 'Art', 'Technology',
    'Travel', 'Cooking', 'Photography', 'Fitness'
  ];

  const handleAddInterest = (interest: string) => {
    const trimmed = interest.trim();
    if (trimmed && !interests.includes(trimmed) && interests.length < 5) {
      setInterests([...interests, trimmed]);
      setInputValue('');
    }
  };

  const handleRemoveInterest = (interest: string) => {
    setInterests(interests.filter(i => i !== interest));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddInterest(inputValue);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="max-w-2xl w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="inline-block mb-4"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl blur-xl opacity-50" />
              <div className="relative bg-gradient-to-r from-purple-600 to-pink-600 p-4 rounded-2xl">
                <Video className="w-12 h-12 text-white" />
              </div>
            </div>
          </motion.div>

          <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 bg-clip-text text-transparent">
            Meet Random People
          </h1>
          <p className="text-xl text-muted-foreground mb-2">
            Connect instantly with strangers who share your interests
          </p>
          <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Video className="w-4 h-4" />
              <span>Video Chat</span>
            </div>
            <div className="flex items-center gap-1">
              <MessageSquare className="w-4 h-4" />
              <span>Text Chat</span>
            </div>
            <div className="flex items-center gap-1">
              <Sparkles className="w-4 h-4" />
              <span>AI Matching</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-2xl p-8 shadow-2xl"
        >
          <div className="mb-6">
            <label className="text-sm font-medium mb-3 block">
              Add your interests <span className="text-muted-foreground">(optional, max 5)</span>
            </label>
            <div className="flex gap-2">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="e.g., music, gaming, travel..."
                className="flex-1 bg-background/50 border-border/50"
                maxLength={20}
                disabled={interests.length >= 5}
              />
              <Button
                onClick={() => handleAddInterest(inputValue)}
                disabled={!inputValue.trim() || interests.length >= 5}
                variant="outline"
                className="border-border/50"
              >
                Add
              </Button>
            </div>
          </div>

          {interests.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mb-6"
            >
              <div className="flex flex-wrap gap-2">
                {interests.map((interest, index) => (
                  <motion.div
                    key={interest}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Badge
                      variant="secondary"
                      className="pl-3 pr-2 py-1.5 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20"
                    >
                      {interest}
                      <button
                        onClick={() => handleRemoveInterest(interest)}
                        className="ml-2 hover:text-foreground transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          <div className="mb-6">
            <p className="text-sm text-muted-foreground mb-3">Popular interests:</p>
            <div className="flex flex-wrap gap-2">
              {popularInterests
                .filter(pi => !interests.includes(pi))
                .slice(0, 8)
                .map((interest) => (
                  <motion.button
                    key={interest}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleAddInterest(interest)}
                    disabled={interests.length >= 5}
                    className="text-xs px-3 py-1.5 rounded-full bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors border border-border/50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {interest}
                  </motion.button>
                ))}
            </div>
          </div>

          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              onClick={() => onStartChat(interests)}
              size="lg"
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-lg py-6 shadow-lg shadow-purple-500/25 border-0"
            >
              <Video className="w-5 h-5 mr-2" />
              Start Chatting Now
            </Button>
          </motion.div>

          <p className="text-xs text-center text-muted-foreground mt-4">
            By continuing, you agree to our terms and community guidelines
          </p>
        </motion.div>
      </div>
    </div>
  );
}
