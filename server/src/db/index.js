import mongoose from "mongoose";
import config from "../constants.js";

const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGO_DB_URI}/${config.db_name}`
    );
    console.log(`MongoDB Connected : ${connectionInstance.connection.host}`);
  } catch (error) {
    console.log("MongoDB error : ", error);
    process.exit(1);
  }
};

export default connectDB;
