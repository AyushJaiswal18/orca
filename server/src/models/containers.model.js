import mongoose, { Schema } from "mongoose";

const conatinerSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Container name is required"],
      trim: true,
    },
    service: {
      type: Schema.Types.ObjectId,
      ref: "Services",
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "Users",
    },
    taskArn: {
      type: String,
      default: "",
    },
    region: {
      type: String,
      default: "ap-south-1",
    },
    status: {
      type: String,
      enum: ["RUNNING", "STOPPED", "PROVISIONING", "DEPROVISIONING", "PENDING"],
      default: "PROVISIONING",
    },
    url: {
      type: String,
      default: "",
    },
    specs: {
      type: String,
      default: "1 CPU / 1 GB RAM",
    },
    plan: {
      type: String,
      default: "Free Plan",
    },
  },
  { timestamps: true }
);

export const Containers = mongoose.model("Containers", conatinerSchema);
