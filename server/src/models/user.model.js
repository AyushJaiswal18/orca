import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import mongoosePaginate from "mongoose-paginate-v2";

const userSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    firstName: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
    },
    phone: {
      type: String,
      default: "",
      trim: true,
    },
    
  },
  { timestamps: true }
);

userSchema.plugin(mongoosePaginate);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password") || !this.isNew) {
    return next();
  }
  this.password = await bcrypt.hash(this.password, 10);
  next();
});


userSchema.methods.generateAccessToken = function () {
  const x = jwt.sign({ _id: this._id }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
  });
  return x;
};

userSchema.methods.generateRefreshToken = function () {
  const x = jwt.sign({ _id: this._id }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
  });
  return x;
};

export const User = mongoose.model("User", userSchema);
