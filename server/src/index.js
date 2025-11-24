import connectDB from "./db/index.js";
import app from "./app.js";
import { pollAllContainerStatuses } from "./utils/pollTaskStatus.js";
import dotenv from "dotenv";
import http from "http";
import jwt from "jsonwebtoken";

const PORT = process.env.PORT || 8080;

// Polling interval in milliseconds (default: 30 seconds)
const POLL_INTERVAL = parseInt(process.env.POLL_INTERVAL || "30000", 10);

dotenv.config({
  path: ".env",
});

connectDB()
  .then(() => {
    const server = http.createServer(app);
    
    server.listen(PORT, () => {
      console.log("Orca Server is running on Port :", PORT);
      
      // Start polling for container status updates
      console.log(`\n🔄 Starting container status polling (interval: ${POLL_INTERVAL / 1000}s)`);
      
      // Poll immediately on startup
      pollAllContainerStatuses().catch((err) => {
        console.error("Error in initial poll:", err);
      });
      
      // Then poll at regular intervals
      setInterval(() => {
        pollAllContainerStatuses().catch((err) => {
          console.error("Error in scheduled poll:", err);
        });
      }, POLL_INTERVAL);
    });

    // Handle WebSocket upgrades for proxy
    server.on("upgrade", async (req, socket, head) => {
      // Only handle upgrades for proxy routes
      if (req.url && req.url.startsWith("/api/v1/containers/proxy/")) {
        try {
          // Extract taskArn from URL
          const match = req.url.match(/\/api\/v1\/containers\/proxy\/([^\/\?]+)/);
          if (!match) {
            socket.destroy();
            return;
          }

          const taskArn = match[1];
          
          // Extract auth token from headers
          const authHeader = req.headers.authorization;
          let userId = null;

          if (authHeader && authHeader.startsWith("Bearer ")) {
            const token = authHeader.substring(7);
            try {
              const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
              userId = decoded._id;
            } catch (err) {
              console.error("Invalid token in WebSocket upgrade:", err);
              socket.destroy();
              return;
            }
          } else {
            // Try to get token from query string as fallback
            const urlParts = req.url.split("?");
            if (urlParts.length > 1) {
              const params = new URLSearchParams(urlParts[1]);
              const token = params.get("token");
              if (token) {
                try {
                  const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
                  userId = decoded._id;
                } catch (err) {
                  console.error("Invalid token in WebSocket upgrade:", err);
                  socket.destroy();
                  return;
                }
              } else {
                socket.destroy();
                return;
              }
            } else {
              socket.destroy();
              return;
            }
          }

          // Import and call WebSocket proxy handler
          const { proxyContainerWebSocket } = await import("./controllers/container.controller.js");
          req.params = { taskArn };
          await proxyContainerWebSocket(req, socket, head, userId);
        } catch (err) {
          console.error("Error handling WebSocket upgrade:", err);
          socket.destroy();
        }
      } else {
        socket.destroy();
      }
    });
  })
  .catch((err) => {
    console.log("MongoDB error : ", err);
  });
