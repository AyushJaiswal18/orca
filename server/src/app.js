import express from "express";
import cors from "cors";
import { URLSearchParams } from "url";
import { corsOptions, jsonOptions, urlEncodedOptions } from "./constants.js";

const app = express();

app.use(cors(corsOptions));

// Store raw body for SNS webhooks before other parsers
// SNS sends data as form-encoded (application/x-www-form-urlencoded or text/plain)
app.use("/api/v1/containers/updates", express.raw({ type: ["text/plain", "application/x-www-form-urlencoded"] }), (req, res, next) => {
  // Store raw body for SNS parsing
  req.rawBody = req.body;
  // Parse as form-encoded for SNS
  if (Buffer.isBuffer(req.body)) {
    try {
      const bodyString = req.body.toString();
      // Parse form-encoded data
      const params = new URLSearchParams(bodyString);
      req.body = {};
      for (const [key, value] of params.entries()) {
        req.body[key] = value;
      }
    } catch (error) {
      console.error("Error parsing SNS raw body:", error);
    }
  }
  next();
});

app.use(express.json(jsonOptions));
app.use(express.urlencoded(urlEncodedOptions));
app.use(express.static("public"));

app.use("/health", (req, res) => {
  return res.status(200).json({ message: "Healthy Orca Server!" });
});

//Route Settings
import userRouter from "./routes/user.routes.js";
import containerRouter from "./routes/container.routes.js";
import serviceRouter from "./routes/services.routes.js";
app.use("/api/v1/users", userRouter);
app.use("/api/v1/containers", containerRouter);
app.use("/api/v1/services", serviceRouter);

export default app;
