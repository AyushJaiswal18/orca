import express from "express";
import cors from "cors";
import { corsOptions, jsonOptions, urlEncodedOptions } from "./constants.js";

const app = express();

app.use(cors(corsOptions));

// For other endpoints and fallback
app.use(express.urlencoded({ ...urlEncodedOptions, extended: true }));
app.use(express.json(jsonOptions));
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
