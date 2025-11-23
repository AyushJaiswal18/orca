import client from "prom-client";

const collectDefaultMetrics = client.collectDefaultMetrics;

collectDefaultMetrics({
  timeout: 5000,
  labels: {
    app: "MyGradway",
  },
  register: client.register,
});

// --- Custom Prometheus Metrics ---
const userRegistrationCounter = new client.Counter({
  name: "user_registration_total",
  help: "Total number of user registration attempts",
  labelNames: ["status"],
});
const userLoginCounter = new client.Counter({
  name: "user_login_total",
  help: "Total number of user login attempts",
  labelNames: ["status"],
});
const orderCreationCounter = new client.Counter({
  name: "order_creation_total",
  help: "Total number of order creation attempts",
  labelNames: ["status"],
});
const paymentVerificationCounter = new client.Counter({
  name: "payment_verification_total",
  help: "Total number of payment verification attempts",
  labelNames: ["status"],
});
const opportunityFetchCounter = new client.Counter({
  name: "opportunity_fetch_total",
  help: "Total number of opportunity fetch requests",
  labelNames: ["status"],
});
const apiRequestDuration = new client.Histogram({
  name: "api_request_duration_seconds",
  help: "API request duration in seconds",
  labelNames: ["route", "method", "status_code"],
  buckets: [0.05, 0.1, 0.2, 0.5, 1, 2, 5],
});

export const metricsHandler = async (req, res) => {
  res.setHeader("Content-Type", client.register.contentType);
  res.send(await client.register.metrics());
};

export const metrics = {
  userRegistrationCounter,
  userLoginCounter,
  orderCreationCounter,
  paymentVerificationCounter,
  opportunityFetchCounter,
  apiRequestDuration,
};

export function incUserRegistration(status = "success") {
  userRegistrationCounter.inc({ status });
}
export function incUserLogin(status = "success") {
  userLoginCounter.inc({ status });
}
export function incOrderCreation(status = "success") {
  orderCreationCounter.inc({ status });
}
export function incPaymentVerification(status = "success") {
  paymentVerificationCounter.inc({ status });
}
export function incOpportunityFetch(status = "success") {
  opportunityFetchCounter.inc({ status });
} 