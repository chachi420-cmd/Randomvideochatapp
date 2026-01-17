import { motion } from 'motion/react';
import { Camera, Mic, AlertCircle } from 'lucide-react';
import { Button } from './ui/button';

interface PermissionPromptProps {
  onGrant: () => void;
  onDeny: () => void;
}

export function PermissionPrompt({ onGrant, onDeny }: PermissionPromptProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-xl">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full mx-4"
      >
        <div className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-2xl p-8 text-center shadow-2xl">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="relative inline-block mb-6"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full blur-xl opacity-50" />
            <div className="relative bg-gradient-to-r from-purple-600 to-pink-600 p-6 rounded-full">
              <Camera className="w-12 h-12 text-white" />
            </div>
          </motion.div>

          <h2 className="text-2xl font-bold mb-2">Camera & Microphone Access</h2>
          <p className="text-muted-foreground mb-6">
            NexusChat needs access to your camera and microphone for video chat.
            Your streams are peer-to-peer and not recorded.
          </p>

          <div className="space-y-3 mb-6">
            <div className="flex items-center gap-3 text-sm text-left bg-muted/30 rounded-lg p-3">
              <Camera className="w-5 h-5 text-purple-500 flex-shrink-0" />
              <span>Camera for video streaming</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-left bg-muted/30 rounded-lg p-3">
              <Mic className="w-5 h-5 text-pink-500 flex-shrink-0" />
              <span>Microphone for audio communication</span>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={onDeny}
              variant="outline"
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={onGrant}
              className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0"
            >
              Allow Access
            </Button>
          </div>

          <div className="mt-4 flex items-start gap-2 text-xs text-muted-foreground text-left bg-muted/20 rounded-lg p-3">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <p>
              If you don't see a permission prompt, check your browser settings and ensure
              camera/microphone access isn't blocked for this site.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
