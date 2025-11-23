import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGO_DB_URI}/${process.env.MONGO_DB_NAME}`
    );
    console.log(`MongoDB Connected : ${connectionInstance.connection.host}`);
  } catch (error) {
    console.log("MongoDB error : ", error);
    process.exit(1);
  }
};

export default connectDB;
