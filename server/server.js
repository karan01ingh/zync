import express from 'express';
import cors from 'cors';
import { WebSocketServer } from 'ws';
import { Board } from "./Models/Board.js";
import { auth } from "./middleware/auth.js";
import http from 'http';
import setupsockets from './socket/socketHandler.js';
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv"
import {connectDB} from './DB/db.js'
import {User} from './Models/UserModel.js';
const PORT=process.env.PORT;
dotenv.config();
const app=express();
app.use(cors({
  origin:"*"
}));
app.use(express.json());
connectDB();
dotenv.config();
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    // 🔍 1. Check user exists
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        message: "User not found"
      });
    }

    // 🔐 2. Compare password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid password"
      });
    }

    // 🎟️ 3. Generate JWT
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.SECRET_KEY,
      { expiresIn: "7d" }
    );

    // ✅ 4. Send response
    res.json({
      message: "Login successful",
      token
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Server error"
    });
  }
});
app.post("/signup",async (req,res)=>{
    try {
        console.log(req.body);
        const {name,email,password}=req.body;
        const exist=await User.findOne({email});
        console.log("exist:",exist);
        if(exist){
            return res.status(401).json({message:"USer Already exists"});
        }
        const hashedpass=await bcrypt.hash(password,10);
        const user=await User.create({
            name,
            password:hashedpass,
            email
        });
        const token =jwt.sign({id:user._id,email:user.email},process.env.SECRET_KEY,{expiresIn:"7d"});
        res.json({message:"Signup sucessfull",token});
        
    } catch (error) {
        console.error(error);
    res.status(500).json({
      message: "Server error in Singup"
    });
    }
});
app.post("/create-board",auth,async (req,res)=>{
  try {
    const { name, roomId } = req.body;

    const board = await Board.create({
      name,
      roomId,
      userId: req.user.id
    });

    res.json(board);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error creating board" });
  }
});
// 🔥 GET ALL BOARDS OF USER
app.get("/boards", auth, async (req, res) => {
  try {
    console.log("all board reached");
    const boards = await Board.find({ userId: req.user.id });
    console.log("all boards:",boards);
    res.json(boards);
  } catch (err) {
    res.status(500).json({ message: "Error fetching boards" });
  }
});
const server=http.createServer(app);
const wss=new WebSocketServer({server});
setupsockets(wss);
server.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`);
});