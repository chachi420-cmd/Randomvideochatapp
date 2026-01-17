import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Settings, TestTube2, X } from 'lucide-react';
import { Button } from './ui/button';
import { Switch } from './ui/switch';

export function DemoControls() {
  const [isOpen, setIsOpen] = useState(false);
  const [demoMode, setDemoMode] = useState(false);

  return (
    <>
      {/* Floating Button */}
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1 }}
        className="fixed bottom-6 left-6 z-50"
      >
        <Button
          onClick={() => setIsOpen(!isOpen)}
          size="icon"
          variant="outline"
          className="w-12 h-12 rounded-full bg-background/80 backdrop-blur-xl border-border/50 shadow-lg"
        >
          <TestTube2 className="w-5 h-5" />
        </Button>
      </motion.div>

      {/* Controls Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: -300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -300 }}
            className="fixed bottom-24 left-6 z-50 w-80 bg-card/95 backdrop-blur-xl border border-border rounded-2xl shadow-2xl overflow-hidden"
          >
            <div className="p-4 border-b border-border/50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                <h3 className="font-semibold">Demo Controls</h3>
              </div>
              <Button
                onClick={() => setIsOpen(false)}
                size="icon"
                variant="ghost"
                className="w-6 h-6 -mr-2"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Demo Mode</p>
                  <p className="text-xs text-muted-foreground">
                    Simulate connections without WebRTC
                  </p>
                </div>
                <Switch
                  checked={demoMode}
                  onCheckedChange={setDemoMode}
                />
              </div>

              <div className="text-xs text-muted-foreground space-y-1 pt-2 border-t border-border/50">
                <p>💡 <strong>Tips for Testing:</strong></p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Open in two different browsers</li>
                  <li>Or use desktop + mobile device</li>
                  <li>Grant camera/mic permissions</li>
                  <li>Enter same interests to match</li>
                </ul>
              </div>

              <div className="text-xs text-muted-foreground pt-2 border-t border-border/50">
                <p>🔍 Check browser console for detailed logs</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
