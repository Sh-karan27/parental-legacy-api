import connectDB from "../src/db/index.js";
import { app } from "../src/app.js";

// Mongoose buffers queries until the connection resolves, so requests don't
// need to await this — but kick it off (and surface fatal errors) up front.
connectDB().catch((error) => {
  console.log("MONGODB connection FAILED", error);
});

export default app;
