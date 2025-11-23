import winston from "winston";
import LokiTransport from "winston-loki";

const logger = winston.createLogger({
  transports: [
    new LokiTransport({
      host: process.env.LOKI_URL,
      labels: { job: process.env.LOKI_JOB },
      json: true,
      interval: 5,
      gracefulShutdown: true,
      replaceTimestamp: true,
    }),
  ],
});

export { logger }; 