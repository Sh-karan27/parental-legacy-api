import mongoose from "mongoose";

// Cached across invocations so warm serverless instances reuse the connection
// instead of opening a new one per request.
let cachedConnection = null;

const connectDB = () => {
  if (cachedConnection) {
    return cachedConnection;
  }

  cachedConnection = mongoose
    .connect(`${process.env.MONGODB_URL}/${process.env.DB_NAME}`)
    .then((connectionInstance) => {
      console.log(
        `\n MongoDB connected !! DB HOST: ${connectionInstance.connection.host}`
      );
      return connectionInstance;
    })
    .catch((error) => {
      cachedConnection = null;
      throw error;
    });

  return cachedConnection;
};

export default connectDB;
