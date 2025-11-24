import connectDB from "./db/index.js";
import app from "./app.js";
import { pollAllContainerStatuses } from "./utils/pollTaskStatus.js";
import dotenv from "dotenv";

const PORT = process.env.PORT || 8080;

// Polling interval in milliseconds (default: 30 seconds)
const POLL_INTERVAL = parseInt(process.env.POLL_INTERVAL || "30000", 10);

dotenv.config({
  path: ".env",
});

connectDB()
  .then(() => {
    app.listen(PORT, () => {
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
  })
  .catch((err) => {
    console.log("MongoDB error : ", err);
  });
