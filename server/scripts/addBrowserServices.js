import mongoose from "mongoose";
import { Services } from "../src/models/services.modal.js";
import config from "../src/constants.js";
import dotenv from "dotenv";

dotenv.config();

const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGO_DB_URI}/${config.db_name}`
    );
    console.log(`✓ MongoDB Connected: ${connectionInstance.connection.host}`);
    return true;
  } catch (error) {
    console.log("✗ MongoDB error:", error.message);
    process.exit(1);
  }
};

// Browser service definitions based on your AWS task definitions
const browserServices = [
  {
    name: "Chrome-Browser",
    description:
      "Chrome Browser - Access a full Chrome browser environment in the cloud. Perfect for web testing, browsing, and secure web access.",
    cost: 10, // Adjust based on your pricing
    taskDefinition: "Chrome-Browser",
    image: "kasmweb/chrome:1.14.0",
    specs: "1 CPU / 2 GB RAM",
    img: "", // You can add image URLs later
  },
  {
    name: "Vivaldi-Browser",
    description:
      "Vivaldi Browser - Access a full Vivaldi browser environment in the cloud. Feature-rich browser with advanced customization options.",
    cost: 15, // Higher cost due to more resources (2 CPU, 4GB RAM)
    taskDefinition: "Vivaldi-Browser",
    image: "kasmweb/vivaldi:1.14.0",
    specs: "2 CPU / 4 GB RAM",
    img: "", // You can add image URLs later
  },
];

const addBrowserServices = async () => {
  try {
    console.log("🚀 Adding Browser Services to Database...\n");
    console.log("=".repeat(70));

    // Connect to database
    await connectDB();

    const results = {
      added: [],
      exists: [],
      errors: [],
    };

    for (const service of browserServices) {
      try {
        // Check if service already exists
        const existingService = await Services.findOne({
          name: service.name,
        });

        if (existingService) {
          console.log(`⚠ ${service.name} already exists (ID: ${existingService._id})`);
          results.exists.push(service.name);
          continue;
        }

        // Create new service
        const newService = new Services({
          name: service.name,
          description: service.description,
          cost: service.cost,
          isNewlyAdded: true,
          img: service.img,
        });

        await newService.save();
        console.log(`✓ Added: ${service.name}`);
        console.log(`  - Task Definition: ${service.taskDefinition}`);
        console.log(`  - Image: ${service.image}`);
        console.log(`  - Specs: ${service.specs}`);
        console.log(`  - Cost: ${service.cost} credits`);
        console.log(`  - ID: ${newService._id}\n`);

        results.added.push({
          name: service.name,
          id: newService._id,
        });
      } catch (error) {
        console.error(`✗ Error adding ${service.name}:`, error.message);
        results.errors.push({
          name: service.name,
          error: error.message,
        });
      }
    }

    // Summary
    console.log("=".repeat(70));
    console.log("\n📊 Summary:\n");
    console.log(`✓ Added: ${results.added.length} service(s)`);
    console.log(`⚠ Already exists: ${results.exists.length} service(s)`);
    console.log(`✗ Errors: ${results.errors.length} service(s)\n`);

    if (results.added.length > 0) {
      console.log("Newly added services:");
      results.added.forEach((s) => {
        console.log(`  - ${s.name} (${s.id})`);
      });
    }

    if (results.exists.length > 0) {
      console.log("\nExisting services (not modified):");
      results.exists.forEach((name) => {
        console.log(`  - ${name}`);
      });
    }

    if (results.errors.length > 0) {
      console.log("\nErrors:");
      results.errors.forEach((e) => {
        console.log(`  - ${e.name}: ${e.error}`);
      });
    }

    await mongoose.connection.close();
    console.log("\n✓ Database connection closed.\n");
    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    await mongoose.connection.close();
    process.exit(1);
  }
};

addBrowserServices();

