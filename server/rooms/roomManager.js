export const rooms = {}; // { roomId: [clients] }
import {Room} from "../Models/RoomModel.js"
// new
// export const roomData={};
// 
export async function handleJoinRoom(ws, data) {
  console.log("DTAAA", data);
  const roomId = data;
  console.log("JOIN ROOM:", roomId); // 👈 debug
  if (!rooms[roomId]) {
    rooms[roomId] = [];
  }
  // new
  // if(!roomData[roomId]){
  //   roomData[roomId]={
  //     strokes:[],
  //     shapes:[],
  //   };
  // }
  // 
  rooms[roomId].push(ws);
  ws.roomId = roomId;
  // DB SAVING
  let room=await Room.findOne({roomId});
  if(!room){
    room=await Room.create({
      roomId,
      strokes:[],
      shapes:[],
    });
  }
  // new
  ws.send(JSON.stringify({
    type:"INIT_STATE",
    strokes:room.strokes,
    shapes:room.shapes,
  })
);
// console.log("SEnding Inti state:",roomData[roomId]);
  // 
}

export function handleDraw(ws, data) {
  const { roomId, drawData } = data;

  if (!rooms[roomId]) return;

  // Broadcast to everyone except sender
  rooms[roomId].forEach((client) => {
    if (client !== ws && client.readyState === 1) {
      client.send(
        JSON.stringify({
          type: "DRAW",
          drawData,
        })
      );
    }
  });
}