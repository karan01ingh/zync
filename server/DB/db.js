import mongoose from "mongoose";
// import { configDotenv } from "dotenv";
import dotenv from "dotenv"
dotenv.config();
export  const connectDB=async ()=>{
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("DATABASE CONNECTED SUCCESFULLL:");
    } catch (error) {
        console.log("ERROR IN CONNECTING DB:",error);
    }
}
