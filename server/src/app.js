import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import asyncHandler from "./utils/asyncHandler.js";
import {
  corsOptions,
  jsonOptions,
  serverName,
  urlEncodedOptions,
} from "./constants.js";
import { prometheusMetricsMiddleware } from "./middlewares/metrics.middleware.js";
import { metricsHandler } from "./utils/metrics.js";

const app = express();

app.use(cookieParser());
app.use(cors(corsOptions));
app.use(express.json(jsonOptions));
app.use(express.urlencoded(urlEncodedOptions));
app.use(express.static("public"));
app.use(prometheusMetricsMiddleware);

//Route Settings
import userRouter from "./routes/user.routes.js";

app.use("/api/v1/users", userRouter);

app.get(
  "/api/v1/health",
  asyncHandler(async (req, res) => {
    res
      .status(200)
      .json({ message: `${serverName} is Running...`, success: true });
  })
);

//prometheus metrics endpoint
app.get("/metrics", metricsHandler);

export default app;
