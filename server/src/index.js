import connectDB from "./db/index.js";
import app from "./app.js";
import dotenv from "dotenv";

const PORT = process.env.PORT || 8080;

dotenv.config({
  path: ".env",
});

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log("Orca Server is running on Port :", PORT);
    });
  })
  .catch((err) => {
    console.log("MongoDB error : ", err);
  });
