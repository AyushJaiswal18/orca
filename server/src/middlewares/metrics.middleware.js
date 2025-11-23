import { metrics } from "../utils/metrics.js";

export function prometheusMetricsMiddleware(req, res, next) {
  let route = req.route && req.baseUrl ? req.baseUrl + req.route.path : req.originalUrl;
  const end = metrics.apiRequestDuration.startTimer({
    route,
    method: req.method,
  });
  res.on("finish", () => {
    end({ status_code: res.statusCode });
  });
  next();
} 