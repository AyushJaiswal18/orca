import mongoose from "mongoose";
import { Services } from "../src/models/services.modal.js";
import config from "../src/constants.js";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGO_DB_URI}/${config.db_name}`
    );
    console.log(`MongoDB Connected : ${connectionInstance.connection.host}`);
    return true;
  } catch (error) {
    console.log("MongoDB error : ", error);
    process.exit(1);
  }
};

const addKasmWebspacesService = async () => {
  try {
    // Connect to database
    await connectDB();

    // Check if KasmWebspaces service already exists
    const existingService = await Services.findOne({
      name: "KasmWebspaces",
    });

    if (existingService) {
      console.log("KasmWebspaces service already exists in the database.");
      console.log("Service details:", existingService);
      await mongoose.connection.close();
      process.exit(0);
    }

    // Create new KasmWebspaces service
    const kasmService = new Services({
      name: "KasmWebspaces",
      description:
        "KasmWebspaces - Secure browser and application streaming platform. Access isolated browser environments and applications from anywhere.",
      cost: 10, // Cost in credits - adjust as needed
      isNewlyAdded: true,
      img: "", // Optional: Add image URL if available
    });

    await kasmService.save();
    console.log("KasmWebspaces service added successfully!");
    console.log("Service details:", kasmService);

    // Close database connection
    await mongoose.connection.close();
    console.log("Database connection closed.");
    process.exit(0);
  } catch (error) {
    console.error("Error adding KasmWebspaces service:", error);
    await mongoose.connection.close();
    process.exit(1);
  }
};

// Run the script
addKasmWebspacesService();

