import connectDB from "./db/index.js";
import app from "./app.js";
import dotenv from "dotenv";
import { createServer } from "http";
import { serverName } from "./constants.js";
import { runJobScheduler } from "./crons/subscriptionUpdate.js";
import "./queue/mailWorker.js"

const PORT = process.env.PORT || 8080;

dotenv.config({
  path: ".env",
});

connectDB()
  .then(() => {
    const server = createServer(app);
    runJobScheduler();
    server.listen(PORT, () => {
      console.log(`${serverName} Server is running on ${PORT}`);
    });
  })
  .catch((err) => {
    console.log("MongoDB error : ", err);
  });
