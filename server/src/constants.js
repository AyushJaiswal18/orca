export const corsOptions = {
  origin: process.env.CORS_ORIGIN,
  credentials: true,
};

export const jsonOptions = {
  limit: "16kb",
};

export const urlEncodedOptions = {
  extended: true,
  limit: "16kb",
};

export const razorpayCredentials = {
  keyId: process.env.RAZORPAY_KEY_ID,
  keySecret: process.env.RAZORPAY_KEY_SECRET,
};

export const backendUrl = process.env.BACKEND_URL;

export const cookieName = process.env.COOKIE_NAME;

export const serverName = process.env.SERVER_NAME;

