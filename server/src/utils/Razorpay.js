import Razorpay from "razorpay";
import { razorpayCredentials } from "../constants.js";

const razorpay = new Razorpay({
  key_id: razorpayCredentials.keyId,
  key_secret: razorpayCredentials.keySecret,
});

export default razorpay;
