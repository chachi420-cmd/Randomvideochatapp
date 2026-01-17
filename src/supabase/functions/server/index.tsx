import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";

const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-1c03ffb9/health", (c) => {
  return c.json({ status: "ok" });
});

// Types
interface WaitingUser {
  userId: string;
  username: string;
  interests: string[];
  timestamp: number;
  socketId?: string;
}

interface ActiveConnection {
  user1Id: string;
  user2Id: string;
  timestamp: number;
}

interface SignalMessage {
  from: string;
  to: string;
  type: "offer" | "answer" | "ice-candidate";
  data: any;
}

// Helper functions
function generateUsername(): string {
  return `Stranger_${Math.floor(Math.random() * 10000)}`;
}

function calculateInterestMatch(interests1: string[], interests2: string[]): number {
  const set1 = new Set(interests1.map(i => i.toLowerCase()));
  const set2 = new Set(interests2.map(i => i.toLowerCase()));
  const intersection = [...set1].filter(i => set2.has(i));
  return intersection.length;
}

async function findBestMatch(currentUser: WaitingUser): Promise<WaitingUser | null> {
  try {
    // Get all waiting users
    const waitingUsers = await kv.getByPrefix<WaitingUser>("waiting:");
    
    // Filter out current user
    const availableUsers = waitingUsers.filter(u => u.userId !== currentUser.userId);
    
    if (availableUsers.length === 0) {
      return null;
    }
    
    // Find best match based on interests
    let bestMatch = availableUsers[0];
    let bestScore = calculateInterestMatch(currentUser.interests, availableUsers[0].interests);
    
    for (const user of availableUsers) {
      const score = calculateInterestMatch(currentUser.interests, user.interests);
      if (score > bestScore) {
        bestScore = score;
        bestMatch = user;
      }
    }
    
    return bestMatch;
  } catch (error) {
    console.error("Error finding best match:", error);
    return null;
  }
}

// Join matchmaking queue
app.post("/make-server-1c03ffb9/join-queue", async (c) => {
  try {
    const { userId, interests = [] } = await c.req.json();
    
    if (!userId) {
      return c.json({ error: "userId is required" }, 400);
    }
    
    const username = generateUsername();
    const waitingUser: WaitingUser = {
      userId,
      username,
      interests: interests || [],
      timestamp: Date.now(),
    };
    
    // Add to waiting queue
    await kv.set(`waiting:${userId}`, waitingUser);
    
    // Try to find a match
    const match = await findBestMatch(waitingUser);
    
    if (match) {
      // Remove both users from waiting queue
      await kv.del(`waiting:${userId}`);
      await kv.del(`waiting:${match.userId}`);
      
      // Create active connection
      const connectionId = `${userId}_${match.userId}`;
      const connection: ActiveConnection = {
        user1Id: userId,
        user2Id: match.userId,
        timestamp: Date.now(),
      };
      
      await kv.set(`connection:${connectionId}`, connection);
      await kv.set(`user-connection:${userId}`, { partnerId: match.userId, connectionId });
      await kv.set(`user-connection:${match.userId}`, { partnerId: userId, connectionId });
      
      return c.json({
        matched: true,
        partner: {
          userId: match.userId,
          username: match.username,
        },
        yourUsername: username,
      });
    }
    
    // No match found, user stays in queue
    return c.json({
      matched: false,
      waiting: true,
      yourUsername: username,
    });
  } catch (error) {
    console.error("Error joining queue:", error);
    return c.json({ error: "Failed to join queue" }, 500);
  }
});

// Check for match (polling endpoint)
app.post("/make-server-1c03ffb9/check-match", async (c) => {
  try {
    const { userId } = await c.req.json();
    
    if (!userId) {
      return c.json({ error: "userId is required" }, 400);
    }
    
    // Check if user has an active connection
    const userConnection = await kv.get(`user-connection:${userId}`);
    
    if (userConnection) {
      const partnerData = await kv.get(`waiting:${userConnection.partnerId}`) || 
                         await kv.get(`user:${userConnection.partnerId}`);
      
      return c.json({
        matched: true,
        partner: {
          userId: userConnection.partnerId,
          username: partnerData?.username || generateUsername(),
        },
      });
    }
    
    // Still waiting
    return c.json({ matched: false, waiting: true });
  } catch (error) {
    console.error("Error checking match:", error);
    return c.json({ error: "Failed to check match" }, 500);
  }
});

// WebRTC signaling
app.post("/make-server-1c03ffb9/signal", async (c) => {
  try {
    const signal: SignalMessage = await c.req.json();
    
    if (!signal.from || !signal.to || !signal.type) {
      return c.json({ error: "Invalid signal data" }, 400);
    }
    
    // Store signal for recipient to retrieve
    const signalKey = `signal:${signal.to}:${Date.now()}`;
    await kv.set(signalKey, signal, 60); // TTL of 60 seconds
    
    return c.json({ success: true });
  } catch (error) {
    console.error("Error handling signal:", error);
    return c.json({ error: "Failed to send signal" }, 500);
  }
});

// Get pending signals
app.post("/make-server-1c03ffb9/get-signals", async (c) => {
  try {
    const { userId } = await c.req.json();
    
    if (!userId) {
      return c.json({ error: "userId is required" }, 400);
    }
    
    // Get all signals for this user
    const signals = await kv.getByPrefix<SignalMessage>(`signal:${userId}:`);
    
    // Delete retrieved signals
    for (const signal of signals) {
      const keys = await kv.getByPrefix(`signal:${userId}:`);
      for (const key of keys) {
        await kv.del(`signal:${userId}:${key}`);
      }
    }
    
    return c.json({ signals });
  } catch (error) {
    console.error("Error getting signals:", error);
    return c.json({ error: "Failed to get signals" }, 500);
  }
});

// Disconnect from chat
app.post("/make-server-1c03ffb9/disconnect", async (c) => {
  try {
    const { userId } = await c.req.json();
    
    if (!userId) {
      return c.json({ error: "userId is required" }, 400);
    }
    
    // Get user's connection
    const userConnection = await kv.get(`user-connection:${userId}`);
    
    if (userConnection) {
      // Clean up connection data
      await kv.del(`user-connection:${userId}`);
      await kv.del(`user-connection:${userConnection.partnerId}`);
      await kv.del(`connection:${userConnection.connectionId}`);
    }
    
    // Remove from waiting queue if present
    await kv.del(`waiting:${userId}`);
    
    return c.json({ success: true });
  } catch (error) {
    console.error("Error disconnecting:", error);
    return c.json({ error: "Failed to disconnect" }, 500);
  }
});

// Send text message
app.post("/make-server-1c03ffb9/send-message", async (c) => {
  try {
    const { userId, message } = await c.req.json();
    
    if (!userId || !message) {
      return c.json({ error: "userId and message are required" }, 400);
    }
    
    // Get partner
    const userConnection = await kv.get(`user-connection:${userId}`);
    
    if (!userConnection) {
      return c.json({ error: "Not connected to anyone" }, 400);
    }
    
    // Store message for partner
    const messageKey = `message:${userConnection.partnerId}:${Date.now()}`;
    await kv.set(messageKey, { from: userId, message, timestamp: Date.now() }, 300);
    
    return c.json({ success: true });
  } catch (error) {
    console.error("Error sending message:", error);
    return c.json({ error: "Failed to send message" }, 500);
  }
});

// Get text messages
app.post("/make-server-1c03ffb9/get-messages", async (c) => {
  try {
    const { userId } = await c.req.json();
    
    if (!userId) {
      return c.json({ error: "userId is required" }, 400);
    }
    
    // Get all messages for this user
    const messages = await kv.getByPrefix(`message:${userId}:`);
    
    // Delete retrieved messages
    const messageKeys = await kv.getByPrefix(`message:${userId}:`);
    for (const msg of messageKeys) {
      // Extract timestamp from key to delete
      const keys = Object.keys(msg);
      for (const key of keys) {
        if (key.startsWith(`message:${userId}:`)) {
          await kv.del(key);
        }
      }
    }
    
    return c.json({ messages: messages || [] });
  } catch (error) {
    console.error("Error getting messages:", error);
    return c.json({ error: "Failed to get messages" }, 500);
  }
});

// Get waiting users (for debugging)
app.get("/make-server-1c03ffb9/waiting-users", async (c) => {
  try {
    const waitingUsers = await kv.getByPrefix("waiting:");
    return c.json({ count: waitingUsers.length, users: waitingUsers });
  } catch (error) {
    console.error("Error getting waiting users:", error);
    return c.json({ error: "Failed to get waiting users" }, 500);
  }
});

Deno.serve(app.fetch);