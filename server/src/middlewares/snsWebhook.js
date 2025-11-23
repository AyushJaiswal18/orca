// Middleware to parse SNS webhook requests
// SNS sends data as form-encoded (application/x-www-form-urlencoded) or text/plain

import { URLSearchParams } from "url";

export const snsWebhookParser = (req, res, next) => {
  // SNS sends data as form-encoded string
  // Check if body is already parsed by Express urlencoded middleware
  if (req.body && typeof req.body === "object" && Object.keys(req.body).length > 0) {
    // Body is already parsed, check if it's SNS format
    if (req.body.Type || req.body.SubscribeURL || req.body.Message) {
      return next();
    }
  }

  // If body is a string or Buffer, parse it as form-encoded
  if (typeof req.body === "string" || Buffer.isBuffer(req.body)) {
    try {
      const bodyString = req.body.toString();
      
      // Parse as URL-encoded form data
      const params = new URLSearchParams(bodyString);
      const parsed = {};
      
      for (const [key, value] of params.entries()) {
        parsed[key] = value;
      }

      // If we got valid SNS fields, use parsed data
      if (parsed.Type || parsed.SubscribeURL || parsed.Message) {
        req.body = parsed;
        return next();
      }
    } catch (error) {
      console.error("Error parsing SNS webhook body:", error);
    }
  }

  // If body is empty or undefined, try to parse from raw body
  if (!req.body || (typeof req.body === "object" && Object.keys(req.body).length === 0)) {
    if (req.rawBody) {
      try {
        const bodyString = req.rawBody.toString();
        const params = new URLSearchParams(bodyString);
        const parsed = {};
        
        for (const [key, value] of params.entries()) {
          parsed[key] = value;
        }
        
        if (parsed.Type || parsed.SubscribeURL || parsed.Message) {
          req.body = parsed;
          return next();
        }
      } catch (error) {
        console.error("Error parsing raw body:", error);
      }
    }
  }

  next();
};

