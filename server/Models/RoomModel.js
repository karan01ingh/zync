import mongoose from "mongoose";

const roomSchema = new mongoose.Schema({
  roomId: { type: String, required: true, unique: true },
  strokes: { type: Array, default: [] },
  shapes: { type: Array, default: [] },
});

export const Room = mongoose.model("Room", roomSchema);