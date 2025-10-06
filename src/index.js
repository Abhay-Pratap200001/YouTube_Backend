import dotenv from "dotenv";
dotenv.config({path: './.env'});
import { connectDB } from "./db/dbConnect.js";
import { app } from "./app.js";


const PORT = process.env.PORT || 2000;

connectDB()
  .then(() => {
    const server = app.listen(PORT, () => {
      console.log(`✅ Server running at http://localhost:${PORT}`);
    });

    // server error handling
    server.on("error", (error) => {
      console.error("❌ Server Error:", error);
      process.exit(1); // Exit the app if server fails
    });
  })
  .catch((error) => {
    console.error("❌ MongoDB Connection Failed:", error);
    process.exit(1); // Exit app if DB connection fails
  });
