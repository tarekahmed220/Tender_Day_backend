import dotenv from "dotenv";
import mongoose from "mongoose";
dotenv.config();

const uri = process.env.MONGO_URI;

export const dbConnect = () => {
  if (!uri) {
    console.error("MONGO_URI is not defined");
    return;
  }

  mongoose
    .connect(uri, { dbName: "TendersDay_Live" })
    .then(() => console.log("Connected to MongoDB"))
    .catch((e) => console.error("Connection error", e));
};
