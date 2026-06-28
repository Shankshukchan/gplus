import mongoose from "mongoose";

export async function connectDb() {
  const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/gplus_admin";
  await mongoose.connect(uri);
  console.log("MongoDB connected:", uri);
}

export function getDb() {
  return mongoose.connection;
}
