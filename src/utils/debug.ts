/**
 * Debug utilities for NexusChat
 */

const isDevelopment = typeof process !== 'undefined' && process.env?.NODE_ENV === 'development';

export const logger = {
  info: (message: string, data?: any) => {
    console.log(`[NexusChat] ${message}`, data !== undefined ? data : '');
  },
  
  error: (message: string, error?: any) => {
    console.error(`[NexusChat Error] ${message}`, error !== undefined ? error : '');
  },
  
  webrtc: (event: string, data?: any) => {
    console.log(`[WebRTC] ${event}`, data !== undefined ? data : '');
  },
  
  matchmaking: (status: string, data?: any) => {
    console.log(`[Matchmaking] ${status}`, data !== undefined ? data : '');
  },
};

export async function checkServerHealth(): Promise<boolean> {
  try {
    const projectId = (window as any).SUPABASE_PROJECT_ID;
    const response = await fetch(
      `https://${projectId}.supabase.co/functions/v1/make-server-1c03ffb9/health`
    );
    return response.ok;
  } catch {
    return false;
  }
}

export async function getWaitingUsers() {
  try {
    const projectId = (window as any).SUPABASE_PROJECT_ID;
    const response = await fetch(
      `https://${projectId}.supabase.co/functions/v1/make-server-1c03ffb9/waiting-users`
    );
    return await response.json();
  } catch (error) {
    logger.error('Failed to get waiting users', error);
    return null;
  }
}

// Expose debug tools globally in development
if (typeof window !== 'undefined' && isDevelopment) {
  (window as any).nexusDebug = {
    logger,
    checkServerHealth,
    getWaitingUsers,
  };
}