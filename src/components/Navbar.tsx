import { motion } from 'motion/react';
import { Video, Shield, Info } from 'lucide-react';
import { Button } from './ui/button';

interface NavbarProps {
  onStartChat?: () => void;
  showStartButton?: boolean;
}

export function Navbar({ onStartChat, showStartButton = true }: NavbarProps) {
  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="sticky top-0 z-50 border-b border-border/40 backdrop-blur-xl bg-background/80"
    >
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="flex items-center gap-2 cursor-pointer"
        >
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg blur-sm opacity-75" />
            <div className="relative bg-gradient-to-r from-purple-600 to-pink-600 p-2 rounded-lg">
              <Video className="w-5 h-5 text-white" />
            </div>
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            NexusChat
          </span>
        </motion.div>

        {/* Navigation Links */}
        <div className="flex items-center gap-6">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="hidden md:flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <Info className="w-4 h-4" />
            How it works
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="hidden md:flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <Shield className="w-4 h-4" />
            Safety
          </motion.button>

          {showStartButton && onStartChat && (
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                onClick={onStartChat}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0 shadow-lg shadow-purple-500/25"
              >
                <Video className="w-4 h-4 mr-2" />
                Start Chat
              </Button>
            </motion.div>
          )}
        </div>
      </div>
    </motion.nav>
  );
}
