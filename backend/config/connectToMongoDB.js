import mongoose from "mongoose";

const connectToMongoDB = () => {
  // Database connection
  try {
    mongoose.connect(process.env.MONGO_URI);

    const connection = mongoose.connection;
    connection.on("open", () => {
      console.log("MongoDB connected!!");
    });
  } catch (error) {
    console.log("Failed to connect to MongoDB", error);
  }
};

export default connectToMongoDB;
