import { Room } from "../Models/RoomModel.js";
import { handleJoinRoom, handleDraw } from "../rooms/roomManager.js";
import { rooms} from "../rooms/roomManager.js";
export default function setupSocket(wss) {
    wss.on("connection", (ws) => {
    console.log("User connected");
    ws.id = Math.random().toString(36).substring(2, 9);
    ws.on("message", async (message) => {
  const data = JSON.parse(message);
  if (data.type === "JOIN_ROOM") {
    handleJoinRoom(ws, data.roomId); // 🔥 THIS WAS MISSING
    return;
  }
  const { roomId } = data;
  // if(!roomData[roomId]){
  //   roomData[roomId]={
  //     strokes:[],
  //     shapes:[],
  //   };
  // }

  if(data.type==="SYNC_STATE"){
    console.log("Saving DataBase",data.strokes.length);
    await Room.updateOne(
      {roomId:data.roomId},
      {strokes:data.strokes,shapes:data.shapes,});
  }
  
  // new
  
    // 
  console.log("SERVER RECEIVED:", data.type); // 👈 debug

  // 🔥 BROADCAST TO ALL USERS IN ROOM
  if (roomId && rooms[roomId]) {
    rooms[roomId].forEach((client) => {
      console.log("broadcasting:",data.type);
      if (client !== ws && client.readyState === 1) {
        client.send(JSON.stringify(
          {
          ...data,
          userID:ws.id,
        }
      ));
      }
    });
  }
});

    ws.on("close", () => {
      const roomId = ws.roomId;
      if (roomId && rooms[roomId]) {
        rooms[roomId] = rooms[roomId].filter(client => client != ws);
      }
      console.log("User disconnected");
    });
  });
}