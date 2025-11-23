import mongoose, { Schema } from "mongoose";

const serviceSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Service name is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Service description is required"],
      trim: true,
    },
    isNewlyAdded: {
      type: Boolean,
      default: true,
    },
    img: {
      type: String,
    },
    cost: {
      type: Number,
      default: 10,
    },
  },
  { timestamps: true }
);

export const Services = mongoose.model("Services", serviceSchema);
