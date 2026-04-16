import { useActionData, useParams } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import socket from "../socket.js";
import jsPDF from "jspdf";
import EmojiPicker from "emoji-picker-react";
import { Undo, Hand, Redo, Pencil, Eraser, Palette, Shapes, Square, Triangle, Circle, RectangleHorizontal, RectangleVertical, Box, Cuboid, Cylinder, Diamond, Star, Cone, MoveUp, MoveRight, MoveLeft, MoveDown, ZoomIn, ZoomOut, Trash, MessageCircleCheck, X, SendHorizontal, Download, FileText } from "lucide-react";
function Room() {
  // const canvasRef=useRef(null);
  const [loading, setloading] = useState(false);
  const canvasRef = useRef(null);
  const [hover, sethover] = useState(false);
  // const [typingUser, setTypingUser] = useState("");
  const downloadboard = () => {
    const canvas = canvasRef.current;

    if (!canvas) return;

    const link = document.createElement("a");
    link.download = "zync-board.png";

    link.href = canvas.toDataURL("image/png");

    link.click();
    // setloading(false);
  }
  const downloadPdfBoard = () => {
    console.log("pinted");
    setloading(true);
    setTimeout(() => {

      const canvas = canvasRef.current;
      if (!canvas) {
        return;
      }
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("landscape", "mm", "a4");
      console.log("pdf:", pdf);
      const pageWidth = pdf.internal.pageSize.width;
      const pageHeight = pdf.internal.pageSize.height;
      pdf.addImage(imgData, "PNG", 0, 0, pageWidth, pageHeight);
      pdf.save(`zync-board-pdf(${roomId})`);
      console.log("Clicked");
      setloading(false);
    }, 100);
  };
  const [isShowDeleteButton, setisShowDeleteButton] = useState(false);
  const [selectedMsgId, setSelectedMsgId] = useState(null);
  const [typingUser, setTypingUser] = useState("");
  const typingTimeout = useRef(null);
  const [showEmoji, setShowEmoji] = useState(false);
  const handleEmojiClick = (emojiData) => {
    setMessage((prev) => prev + emojiData.emoji);
  };
  const messagesEndRef = useRef(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const lastCursorSend = useRef(0);
  const [isChatOpen, setisChatOpen] = useState(false);
  const [cursors, setCursors] = useState({});
  const [history, setHistroy] = useState([]);
  const [historyIndex, sethistoryIndex] = useState(-1);
  const isResizing = useRef(false);
  const [strokes, setStrokes] = useState([]);
  const [offset, setOffset] = useState({ x: -2000, y: -2000 });
  const isDragging = useRef(false);
  const [shapes, setShapes] = useState([]);
  const handlemessagebutton = () => {
    console.log("before chatopen:", isChatOpen);
    setisChatOpen(prev => !prev);
    console.log("after chatopen:", isChatOpen);
  }
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  useEffect(() => {
    console.log("chat open:", isChatOpen);
  }, [isChatOpen]);
  const isInsideShape = (shape, x, y) => {
    if (shape.type === "circle") {
      const dx = x - shape.x;
      const dy = y - shape.y;
      return Math.sqrt(dx * dx + dy * dy) <= shape.radius;
    }

    if (shape.type === "square") {
      return (
        x >= shape.x &&
        x <= shape.x + shape.width &&
        y >= shape.y &&
        y <= shape.y + shape.height
      );
    }

    return false;
  };
  const [tool, setTool] = useState("pen");
  const shapeStart = useRef({ x: 0, y: 0 });
  const isdrawingShape = useRef(false);
  const [color, setColor] = useState("#000000");
  const [showShapes, setShowShapes] = useState(false);
  const [scale, setScale] = useState(1);
  const { roomId } = useParams();
  const drawing = useRef(false);
  const hasjoined = useRef(false);
  const prev = useRef({ x: 0, y: 0 });
  const colorInputRef = useRef(null);
  const [selectedShapeId, setSelectedShapeId] = useState(null);
  const handleDeleteMessage = () => {
    console.log("delete clicked");
  }

  // maping of tool with icon

  const getCursorIcon = (tool) => {
    if (tool === "pen") return <Pencil />;
    if (tool === "eraser") return <Eraser />;
    return <Hand />
  }
  // saving Data for history 
  const saveState = (newShapes, newStrokes) => {
    const snapshot = {
      shapes: JSON.parse(JSON.stringify(newShapes)),
      strokes: JSON.parse(JSON.stringify(newStrokes)),
    };
    setHistroy((prev) => {
      // remove redo future
      const updated = prev.slice(0, historyIndex + 1);
      return [...updated, snapshot];
    });
    sethistoryIndex((prev) => prev + 1);
  };
  //Undo Function
  const handleUndo = () => {
    console.log("clicked UNDO");
    if (historyIndex <= 0) {
      return;
    }
    const prevState = history[historyIndex - 1];
    setShapes(prevState.shapes);
    setStrokes(prevState.strokes);
    sethistoryIndex((prev) => prev - 1);
    // broadcasting to other users 
    socket.send(JSON.stringify({
      type: "SYNC_STATE",
      roomId,
      shapes: prevState.shapes,
      strokes: prevState.strokes,
    }));
  };
  // Redo Function
  const handleRedo = () => {
    console.log("Redo clicked");
    if (historyIndex >= history.length - 1) return;
    const nextState = history[historyIndex + 1];
    setShapes(nextState.shapes);
    setStrokes(nextState.strokes);
    sethistoryIndex((prev) => prev + 1);
    // broadcasting to others
    socket.send(JSON.stringify({
      type: "SYNC_STATE",
      roomId,
      shapes: nextState.shapes,
      strokes: nextState.strokes,
    }))
  };
  // delete Shape
  const deleteSelectedShape = () => {
    setTool("delete");
    if (!selectedShapeId) return;
    socket.send(JSON.stringify({
      type: "DELETE_SHAPE",
      roomId,
      shapeId: selectedShapeId,
    }));
    setShapes((prev) => {
      const updated = prev.filter((shape) => shape.id !== selectedShapeId);
      saveState(updated, strokes);
      return updated;
    });
    setSelectedShapeId(null);
  };

  // Shapes defined in category

  const shapeCategories = [
    {
      name: "2D-Shapes",
      shapes: [
        { type: "square", label: "Square", icon: <Square /> },
        { type: "circle", label: "Circle", icon: <Circle /> },
        { type: "triangle", label: "Triangle", icon: <Triangle /> },
        // { type: "rectanglehorizontal", label: "RectangleHorizontal", icon: <RectangleHorizontal /> },
        { type: "rectanglevertical", label: "RectangleVertical", icon: <RectangleVertical /> },
        { type: "diamond", label: "Diamond", icon: <Diamond /> },

      ],
    },
    {
      name: "3D-Shapes",
      shapes: [
        { type: "cube", label: "Cube", icon: <Box /> },
        { type: "cuboid", label: "cuboid", icon: <Cuboid /> },
        { type: "cylinder", label: "Cylinder", icon: <Cylinder /> },
        { type: "cone", label: "Cone", icon: <Cone /> },
      ]
    },
    {
      name: "Flowchart",
      shapes: [
        { type: "arrowright", label: "ArrowRight", icon: <MoveRight /> },
        { type: "arrowup", label: "ArrowUp", icon: <MoveUp /> },
        { type: "arrowleft", label: "ArrowLeft", icon: <MoveLeft /> },
        { type: "arrowdown", label: "ArrowDown", icon: <MoveDown /> },
      ],
    },

  ];
  // send message
  const sendMessage = () => {
    if (!message.trim()) return;
    const msgData = {
      type: "CHAT_MESSAGE",
      roomId,
      id: Date.now(),
      text: message,
      user: "Karan Singh ",
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit"
      })
    };
    setMessages((prev) => [...prev, { ...msgData, self: true }]);
    socket.send(JSON.stringify(msgData));
    setMessage("");

  };
  // delete message 
  const deleteMessage = (id) => {
    setMessages((prev) => prev.filter((msg) => msg.id !== id));

    socket.send(JSON.stringify({
      type: "DELETE_MESSAGE",
      roomId,
      id,
    }));
  };
  // DrawLine
  const drawLine = (x0, y0, x1, y1, color) => {
    const ctx = canvasRef.current.getContext("2d");
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.stroke();
  };
  // Erase
  const erase = (x, y) => {
    const ctx = canvasRef.current.getContext("2d");
    ctx.clearRect(x - 5, y - 5, 10, 10);
  };

  // HanldeWheel
  const handleWheel = (e) => {
    e.preventDefault();

    const zoomSpeed = 0.001;
    const newScale = scale - e.deltaY * zoomSpeed;

    // limit zoom
    if (newScale < 0.2 || newScale > 5) return;

    setScale(newScale);
  };

  // Draw Shapes
  const drawShape = (ctx, shape) => {
    ctx.strokeStyle = shape.color;
    ctx.lineWidth = 2;

    if (shape.type === "circle") {
      ctx.beginPath();
      ctx.arc(shape.x, shape.y, shape.radius, 0, 2 * Math.PI);
      ctx.stroke();
    }

    if (shape.type === "square") {
      ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
    }

    if (shape.type === "triangle") {
      ctx.beginPath();
      ctx.moveTo(shape.x, shape.y);
      ctx.lineTo(shape.x + shape.width, shape.y);
      ctx.lineTo(shape.x + shape.width / 2, shape.y - shape.height);
      ctx.closePath();
      ctx.stroke();
    }
    if (shape.type === "rectanglehorizontal") {
      ctx.strokeRect(shape.x, shape.y, shape.width, shape.height / 2);
    }
    if (shape.type === "rectanglevertical") {
      ctx.strokeRect(shape.x, shape.y, shape.width / 2, shape.height);
    }
    if (shape.type === "star") {
      const spikes = 5;
      const outerRadius = shape.radius;
      const innerRadius = shape.radius / 2;
      let rot = Math.PI / 2 * 3;
      let x = shape.x;
      let y = shape.y;
      const step = Math.PI / spikes;
    }
    if (shape.type === "cuboid") {
      const d = 35; // bigger depth → DIFFERENT look

      // front (rectangle feel)
      ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);

      // back shifted more
      ctx.strokeRect(shape.x + d, shape.y - d, shape.width, shape.height);

      ctx.beginPath();

      ctx.moveTo(shape.x, shape.y);
      ctx.lineTo(shape.x + d, shape.y - d);

      ctx.moveTo(shape.x + shape.width, shape.y);
      ctx.lineTo(shape.x + shape.width + d, shape.y - d);

      ctx.moveTo(shape.x, shape.y + shape.height);
      ctx.lineTo(shape.x + d, shape.y + shape.height - d);

      ctx.moveTo(shape.x + shape.width, shape.y + shape.height);
      ctx.lineTo(shape.x + shape.width + d, shape.y + shape.height - d);

      ctx.stroke();
    }
    if (shape.type === "cube") {
      const d = 20;

      // front
      ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);

      // back
      ctx.strokeRect(shape.x + d, shape.y - d, shape.width, shape.height);

      // connect edges
      ctx.beginPath();
      ctx.moveTo(shape.x, shape.y);
      ctx.lineTo(shape.x + d, shape.y - d);

      ctx.moveTo(shape.x + shape.width, shape.y);
      ctx.lineTo(shape.x + shape.width + d, shape.y - d);

      ctx.moveTo(shape.x, shape.y + shape.height);
      ctx.lineTo(shape.x + d, shape.y + shape.height - d);

      ctx.moveTo(shape.x + shape.width, shape.y + shape.height);
      ctx.lineTo(shape.x + shape.width + d, shape.y + shape.height - d);

      ctx.stroke();
    }
    if (shape.type === "cylinder") {
      // top
      ctx.beginPath();
      ctx.ellipse(shape.x, shape.y, shape.width / 2, shape.height / 4, 0, 0, 2 * Math.PI);
      ctx.stroke();

      // bottom
      ctx.beginPath();
      ctx.ellipse(shape.x, shape.y + shape.height, shape.width / 2, shape.height / 4, 0, 0, Math.PI);
      ctx.stroke();

      // sides
      ctx.beginPath();
      ctx.moveTo(shape.x - shape.width / 2, shape.y);
      ctx.lineTo(shape.x - shape.width / 2, shape.y + shape.height);

      ctx.moveTo(shape.x + shape.width / 2, shape.y);
      ctx.lineTo(shape.x + shape.width / 2, shape.y + shape.height);

      ctx.stroke();
    }
    if (shape.type === "cone") {
      ctx.beginPath();

      // base
      ctx.ellipse(shape.x, shape.y + shape.height, shape.width / 2, shape.height / 4, 0, 0, Math.PI);

      // sides
      ctx.moveTo(shape.x, shape.y);
      ctx.lineTo(shape.x - shape.width / 2, shape.y + shape.height);
      ctx.moveTo(shape.x, shape.y);
      ctx.lineTo(shape.x + shape.width / 2, shape.y + shape.height);

      ctx.stroke();
    }
    if (shape.type === "arrowright") {
      ctx.beginPath();
      ctx.moveTo(shape.x, shape.y);
      ctx.lineTo(shape.x + shape.width, shape.y);
      ctx.lineTo(shape.x + shape.width - 10, shape.y - 5);
      ctx.moveTo(shape.x + shape.width, shape.y);
      ctx.lineTo(shape.x + shape.width - 10, shape.y + 5);
      ctx.stroke();
    }
    if (shape.type === "arrowup") {
      ctx.beginPath();
      ctx.moveTo(shape.x, shape.y);
      ctx.lineTo(shape.x, shape.y - shape.height);
      ctx.lineTo(shape.x - 5, shape.y - shape.height + 10);
      ctx.moveTo(shape.x, shape.y - shape.height);
      ctx.lineTo(shape.x + 5, shape.y - shape.height + 10);
      ctx.stroke();
    }
    if (shape.type === "arrowleft") {
      ctx.beginPath();
      ctx.moveTo(shape.x, shape.y);
      ctx.lineTo(shape.x - shape.width, shape.y);
      ctx.lineTo(shape.x - shape.width + 10, shape.y - 5);
      ctx.moveTo(shape.x - shape.width, shape.y);
      ctx.lineTo(shape.x - shape.width + 10, shape.y + 5);
      ctx.stroke();
    }
    if (shape.type === "arrowdown") {
      ctx.beginPath();
      ctx.moveTo(shape.x, shape.y);
      ctx.lineTo(shape.x, shape.y + shape.height);
      ctx.lineTo(shape.x - 5, shape.y + shape.height - 10);
      ctx.moveTo(shape.x, shape.y + shape.height);
      ctx.lineTo(shape.x + 5, shape.y + shape.height - 10);
      ctx.stroke();
    }
    if (shape.type === "star") {
      const spikes = 5;
      const outerRadius = shape.radius;
      const innerRadius = shape.radius / 2;
      let rot = Math.PI / 2 * 3;
      let x = shape.x;
      let y = shape.y;
      const step = Math.PI / spikes;
    }
    console.log("selectedShapeId", selectedShapeId, "draw shape", shape.id);
    if (shape.id === selectedShapeId) {
      ctx.fillStyle = "blue";
      const hanldes = [{ x: shape.x, y: shape.y }, { x: shape.x + shape.width, y: shape.y }, { x: shape.x, y: shape.y + shape.height }, { x: shape.x + shape.width, y: shape.y + shape.height }];
      hanldes.forEach(h => {
        ctx.fillRect(h.x - 4, h.y - 4, 8, 8);
      })
    }
    else {
      ctx.strokeStyle = shape.color;
      ctx.lineWidth = 2;
      ctx.shadowBlur = 0;
    }
  };
  // useState for saving to the database after every 5 sec
  useEffect(() => {
    const interval = setInterval(() => {

      if (socket && socket.readyState === 1) {
        console.log("Sending SYNC_STATE", strokes.length); // debug
        socket.send(JSON.stringify({
          type: "SYNC_STATE",
          roomId,
          strokes,
          shapes
        }));
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [strokes, shapes, socket, roomId]);
  // Use Effect for connection
  useEffect(() => {
    const joinRoom = () => {
      if (hasjoined.current) return;
      hasjoined.current = true;

      console.log("Joining room:", roomId);
      console.log("SENDING JOIN_ROOM for roomId:", roomId);
      socket.send(
        JSON.stringify({
          type: "JOIN_ROOM",
          roomId,
        })
      );
    };

    if (socket.readyState === WebSocket.OPEN) {
      joinRoom();
    }
    else {
      socket.onopen = joinRoom;
    }

    socket.onmessage = async (event) => {
      const data = JSON.parse(event.data);
      console.log("Received type of daya:", data.type, data);
      console.log("RECEIVED:", data); // 👈 just for testing
      if (data.type === "ADD_SHAPE") {
        setShapes((prev) => [...prev, data.shape]);
      }
      if (data.type === "MOVE_SHAPE") {
        setShapes((prev) =>
          prev.map((s) =>
            s.id === data.shape.id ? { ...s, ...data.shape } : s
          )
        );
      }
      if (data.type === "ERASE") {
        const { x, y } = data;
        const eraserRadius = 20;
        setStrokes((prev) => prev.filter((stroke) => {
          const d = Math.hypot(stroke.x1 - x, stroke.y1 - y);
          return d > eraserRadius;
        }));
      }
      if (data.type === "DRAW_STROKE") {
        setStrokes((prev) => [...prev, data.stroke]);
        // 
      }
      if (data.type === "DELETE_SHAPE") {
        setShapes((prev) => prev.filter((shape) => shape.id !== data.shapeId));

      }
      if (data.type === "RESIZE_SHAPE") {
        setShapes((prev) =>
          prev.map((shape) =>
            shape.id === data.shape.id ? { ...shape, ...data.shape } : shape
          )
        );
      }
      if (data.type === "SYNC_STATE") {
        setShapes(data.shapes);
        setStrokes(data.strokes);
      }
      if (data.type === "CURSOR_MOVE") {
        console.log("hello");
        console.log("Cursor Received:", data);
        setCursors((prev) => ({
          ...prev,
          [data.userID]: { x: data.x, y: data.y, tool: data.tool, userID: data.userID },
        }));
      }
      if (data.type === "CHAT_MESSAGE") {
        setMessages((prev) => [
          ...prev,
          {
            ...data,
            self: false,
          },
        ]);
      }
      if (data.type === "DELETE_MESSAGE") {
        setMessages((prev) => prev.filter((msg) => msg.id !== data.id));
      }
      if (data.type === "TYPING") {
        console.log("setting typing user", data.user);
        setTypingUser(data.user);
      }
      if (data.type === "STOP_TYPING") {
        console.log("Stop typing in onmessage");
        setTypingUser("");
      }
      if (data.type === "INIT_STATE") {
        console.log("INIT Received", data);
        setStrokes(data.strokes || []);
        setShapes(data.shapes || []);
      }
    };
  }, [roomId]);

  // useEffect for shapes
  useEffect(() => {
    console.log("strokes  length", strokes.length);
    const ctx = canvasRef.current.getContext("2d");

    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    strokes.forEach((stroke) => {
      drawLine(stroke.x0, stroke.y0, stroke.x1, stroke.y1, stroke.color);
    });

    shapes.forEach((shape) => {
      drawShape(ctx, shape);
    });
  }, [shapes, strokes, selectedShapeId]);

  useEffect(() => {
    console.log("cursor state:", cursors);
    console.log("ischatopen", isChatOpen);
  }, [cursors]);
  // 
  console.log("tools", tool);
  console.log("CursorState:", cursors);
  return (
    <div style={{ position: "relative", height: "100vh", width: "100vw" }}>
      {/* cursor traking */}
      {Object.entries(cursors).map(([id, cursor]) => (
        <div
          key={id}
          style={{
            position: "fixed",
            left: cursor.x,
            top: cursor.y,
            display: "flex",
            flexDirection: "column",
            transform: "translate(-50%,-50%)",
            pointerEvents: "none",
            zIndex: 9999,
            justifyContent: "center",
            width: "auto",
          }}
        >
          <div style={{ paddingLeft: "20px" }}>
            {getCursorIcon(cursor.tool)}
          </div>
          <div>
            {cursor.userID}
          </div>

        </div>

      ))}
      {/* toolbar */}
      <div
        style={{
          position: "fixed",
          top: "50%",
          left: "20px",
          transform: "translateY(-50%)",
          background: "#ffffff",
          padding: "10px",
          borderRadius: "10px",
          boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
          display: "flex",
          flexDirection: "column",
          gap: "15px",
          zIndex: 10,
        }}
      >
        <>
          {/* 🎨 Palette Icon */}
          <button
            onClick={() => colorInputRef.current.click()}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
            }}
          >
            <Palette color={color} size={28} />
          </button>

          {/* Hidden Color Input */}
          <input
            ref={colorInputRef}
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            style={{ display: "none", cursor: "pointer" }}
          />
        </>
        <button
          onClick={() => setTool("pen")}
          style={{ background: tool === "pen" ? "#c9dbff" : "white", borderRadius: "8px", border: "none", padding: "6px", cursor: "pointer" }}
        >
          {tool === "pen" ? <Pencil color="#00308f" /> : <Pencil />}
        </button>

        <button
          onClick={() => setTool("eraser")}
          style={{ background: tool === "eraser" ? "#c9dbff" : "white", borderRadius: "8px", border: "none", padding: "6px", cursor: "pointer" }}
        >
          {tool === "eraser" ? <Eraser color="#00308f" /> : <Eraser />}
        </button>
        <button
          onClick={() => setShowShapes((prev) => !prev)}
          style={{ background: showShapes ? "#c9dbff" : "white", borderRadius: "8px", border: "none", padding: "6px", cursor: "pointer" }}
        >
          <Shapes />
        </button>
        <button onClick={deleteSelectedShape} style={{ background: tool === "delete" ? "#c9dbff" : "white", padding: "6px", borderRadius: "8px", border: "none", cursor: "pointer" }}>{tool === "delete" ? <Trash color="#00308f" /> : <Trash />}</button>
        <button style={{ borderRadius: "10px", cursor: "pointer" }} onClick={handleUndo}><Undo /></button>
        <button style={{ borderRadius: "10px", cursor: "pointer" }} onClick={handleRedo}><Redo /></button>
      </div>
      {/* top right function box */}
      <div style={{
        position: "fixed",
        // top: "50%",
        // left: "20px",
        transform: "translateY(-50%)",
        background: "#ffffff",
        padding: "6px",
        borderRadius: "10px",
        boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
        display: "flex",
        flexDirection: "row",
        gap: "15px",
        top: "50px",
        right: "30px",
        zIndex: 10,
      }} >
        <button onClick={downloadPdfBoard} style={{ background: hover ? "#c9dbff" : "none", border: "none", cursor: "pointer", padding: "6px", borderRadius: "8px" }}

        >
          {loading ? <div
            style={{
              width: "20px",
              height: "20px",
              border: "3px solid #ccc",
              borderTop: "3px solid #00308f",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
              transition: "all 0.2s ease"
            }}
          />

            :
            <FileText />

          }
        </button>

        <button onClick={downloadboard} style={{ background: "none", border: "none", cursor: "pointer", padding: "6px", borderRadius: "8px" }}>
          <Download />
        </button>
        <button style={{ background: "none", border: "none", cursor: "pointer", background: isChatOpen ? "#c9dbff" : "white", padding: "6px", borderRadius: "8px" }} onClick={handlemessagebutton}>
          {isChatOpen ? (
            <MessageCircleCheck color="#00308f" />
          ) : (
            <MessageCircleCheck />
          )}
        </button>

      </div>

      {/* sideBar for Shapes */}
      {showShapes && (
        <div
          style={{
            position: "fixed",
            top: "50%",
            left: "90px",
            transform: "translateY(-50%)",
            width: "200px",
            height: "600px",
            scrollbarWidth: "thin",
            overflowX: "auto",
            background: "#ffffff",
            borderRadius: "12px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            padding: "12px",
            zIndex: 100,
            cursor: "pointer",
          }}
        >
          {shapeCategories.map((category) => (
            <div key={category.name} style={{ marginBottom: "16px" }}>

              {/* Category Title */}
              <h4
                style={{
                  fontSize: "15px",
                  marginBottom: "8px",
                  color: "#000000",
                  fontFamily: "Arial, sans-serif",
                }}
              >
                {category.name}
              </h4>

              {/* Shapes Grid */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: "10px",
                }}
              >
                {category.shapes.map((shape) => (
                  <div
                    key={shape.type}
                    onClick={() => {
                      setTool(shape.type);
                      setShowShapes(false);
                    }}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: "8px",
                      borderRadius: "8px",
                      cursor: "pointer",
                      transition: "0.2s",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = "#f1f5ff")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "transparent")
                    }
                  >
                    {shape.icon}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
      {/* message box */}

      {isChatOpen && (
        <div
          style={{
            position: "fixed",
            top: "80px",
            right: '30px',
            width: "300px",
            height: "600px",
            background: "white",
            borderRadius: "10px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
            display: "flex",
            flexDirection: "column",
            zIndex: 100,
          }}
        >
          {/*header*/}
          <div style={{
            padding: "10px",
            borderBottom: "1px solid #ddd",
            display: "flex",
            justifyContent: "space-between"
          }}>
            <span style={{ paddingTop: "2px" }}>Messages</span>
            <button onClick={() => setisChatOpen(false)} style={{ border: "none", borderRadius: "10px", background: "white", cursor: "pointer" }}>< X /></button>
          </div>
          {/* messages*/}
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              overflowY: "auto",
              padding: "10px"
            }}
          >
            {/* <div > */}
            {messages.map((msg, i) => (
              <div
                key={i}
                onClick={() => setSelectedMsgId(msg.id)}
                style={{
                  // :"20px",
                  display: "flex",

                  margin: "5px 0",
                  padding: "8px",
                  borderRadius: "8px",

                  color: msg.self ? "white" : "black",
                  alignSelf: msg.self ? "flex-end" : "flex-start",
                  height: "auto"
                }}
              >
                {isShowDeleteButton === true && selectedMsgId === msg.id && msg.self && (
                  <button onClick={(e) => {
                    e.stopPropagation();
                    deleteMessage(msg.id);
                  }} style={{
                    border: "none",
                    borderRadius: "100px",
                    background: "white",
                    cursor: "pointer",
                    // opacity:,
                    transition: "0.2s",
                    // marginRight:"6px",
                    // position: "absolute",
                    // height:"25px",
                    width: "30px",
                    // height:"50px"
                    // padding:"10px"


                  }} ><X color="#ff0000" height={20} /></button>
                )}
                {/* message box */}
                <div style={{
                  background: msg.self ? "#00308f" : "#eee", margin: "5px 0",
                  padding: "8px",
                  borderRadius: "8px", cursor: "pointer"
                }} onClick={() => { setisShowDeleteButton(!isShowDeleteButton) }} >
                  {/* username */}
                  <div style={{ opacity: 0.6, fontSize: 12 }}>
                    {msg.user}
                  </div>
                  {/* message */}
                  <div >{msg.text}</div>
                  <div style={{
                    fontSize: "10px",
                    opacity: 0.6,
                    textAlign: msg.self ? "right" : "left",
                    marginTop: "2px"
                  }} >{msg.time}</div>


                </div>

              </div>
            ))}
            <div ref={messagesEndRef} />


          </div>

          {typingUser && (
            <div style={{ fontSize: "12px", padding: "5px", color: "#666" }}>
              {typingUser} is typing...
            </div>
          )}
          {/* input */}
          <div style={{
            display: "flex",
            padding: "10px",
            borderTop: "1px solid #ddd",
          }}>

            <button onClick={() => setShowEmoji(!showEmoji)} style={{ borderTopLeftRadius: "5px", borderBottomLeftRadius: "5px", borderTopRightRadius: "0px", borderBottomRightRadius: "0px" }}>😊</button>
            <input
              style={{ flex: 1, padding: "5px", borderRadius: "0px" }}
              value={message}
              onChange={(e) => {
                console.log("Sending typing");
                setMessage(e.target.value);
                if (typingTimeout.current) {
                  clearTimeout(typingTimeout.current);
                }
                socket.send(JSON.stringify({
                  type: "TYPING",
                  roomId,
                  user: "KAran Singh",
                }));
                // stop tping after delay 
                typingTimeout.current = setTimeout(() => {
                  socket.send(JSON.stringify({
                    type: "STOP_TYPING",
                    roomId,
                    user: "Karan Singh",
                  }));
                }, 1500);
              }}
              placeholder="Type message...."

            />
            <button onClick={sendMessage} style={{ cursor: "pointer", borderBottomRightRadius: "5px", borderTopRightRadius: "5px", font: "status-bar" }}><SendHorizontal /></button>
            {showEmoji && (
              <div style={{ position: "absolute", bottom: "50px", right: "2px" }}>
                <EmojiPicker onEmojiClick={handleEmojiClick} />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Canvas */}

      <div
        style={{
          position: "absolute",
          zIndex: 0,
          top: 0,
          left: 0,
          width: "5000px",
          height: "5000px",
          pointerEvents: "none",

          // 🔥 GRID MAGIC
          backgroundImage: `
      linear-gradient(to right, #f0f0f0 1px, transparent 1px),
      linear-gradient(to bottom, #f0f0f0 1px, transparent 1px)
    `,
          backgroundSize: "50px 50px",
        }}

      >

        <canvas
          ref={canvasRef}
          width={5000}
          height={5000}
          style={{
            transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
            pointerEvents: "auto",
          }}
          onMouseDown={(e) => {
            console.log("MOuse Down");
            const x = e.nativeEvent.offsetX;
            const y = e.nativeEvent.offsetY;
            // const rect=canvasRef.current.getBoundingClientRect();
            // const x=(e.clientX-rect.left-offset.x)/scale;
            // const y=(e.clientY-rect.top-offset.y)/scale;
            let resizing = false;
            const handleSize = 8;

            // PEN / ERASER
            if (tool === "pen" || tool === "eraser") {
              drawing.current = true;
              prev.current = { x, y };
              return;
            }
            // SHAPE SELECT
            const clickedShape = [...shapes].reverse().find((shape) => {
              if (shape.type === "square" || shape.type === "rectanglehorizontal" || shape.type === "rectanglevertical") {
                return (x >= shape.x && x <= shape.x + shape.width && y >= shape.y && y <= shape.y + shape.height);
              }
              if (shape.type === "circle") {
                const dx = x - shape.x;
                const dy = y - shape.y;
                return Math.sqrt(dx * dx + dy * dy) <= shape.radius;
              }
              if (shape.type === "triangle") {
                return (
                  x >= shape.x && x <= shape.x + shape.width && y <= shape.y && y >= shape.y - shape.height
                );
              }
              return false;
            });
            console.log("clickedShape", clickedShape);
            if (clickedShape) {
              const handleSize = 8;
              const handle = [
                { x: clickedShape.x, y: clickedShape.y }, { x: clickedShape.x + clickedShape.width, y: clickedShape.y }, { x: clickedShape.x, y: clickedShape.y + clickedShape.height }, { x: clickedShape.x + clickedShape.width, y: clickedShape.y + clickedShape.height }
              ];
              for (let h of handle) {
                if (
                  x >= h.x - handleSize &&
                  x <= h.x + handleSize &&
                  y >= h.y - handleSize &&
                  y <= h.y + handleSize
                ) {
                  isResizing.current = true;
                  return;
                }
              }
              // setTool("delete");
              setSelectedShapeId(clickedShape.id);
              isDragging.current = true;
              return;
            }
            console.log("no shape selected");
            setSelectedShapeId(null);
            prev.current = { x, y };
            // SHAPE CREATE
            if (tool !== "pen" && tool !== "eraser" && tool !== "delete") {
              const newShape = {
                id: Date.now(),
                type: tool,
                x,
                y,
                width: 100,
                height: 100,
                radius: 50,
                color,
              };
              setShapes((prev) => [...prev, newShape]);
              socket.send(JSON.stringify({
                type: "ADD_SHAPE",
                roomId,
                shape: newShape,
              }));

            }
            // console.log("SENDING SHAPE:", newShape);
            console.log("rooid before sending", roomId);
          }}

          onWheel={handleWheel}
          onMouseUp={() => {
            console.log("move up ");
            drawing.current = false;
            isDragging.current = false;
            isResizing.current = false;
            saveState(shapes, strokes);
          }}
          onMouseLeave={() => {
            drawing.current = false;
            isdrawingShape.current = false;
            isResizing.current = false;
          }}
          onMouseMove={(e) => {
            // console.log("mouseMove:", tool);
            const now = Date.now();
            const x = e.nativeEvent.offsetX;
            const y = e.nativeEvent.offsetY;
            const clientX = e.clientX;
            const clientY = e.clientY;
            // MOVE SHAPE
            if (isDragging.current && selectedShapeId) {
              const updatedShape = {
                id: selectedShapeId,
                x,
                y,
              };

              socket.send(JSON.stringify({
                type: "MOVE_SHAPE",
                roomId,
                shape: updatedShape,
              }));
              setShapes((prev) =>
                prev.map((shape) =>
                  shape.id === selectedShapeId
                    ? { ...shape, x, y }
                    : shape
                )
              );

              // ✅ SEND MOVE EVENT

              console.log("roomid before sending move", roomId);
              return;
            }
            // resizing 

            if (isResizing.current && selectedShapeId) {
              setShapes((prev) =>
                prev.map((shape) => {
                  if (shape.id === selectedShapeId) {
                    const updated = {
                      ...shape,
                      width: x - shape.x,
                      height: y - shape.y,
                    };
                    socket.send(JSON.stringify({
                      type: "RESIZE_SHAPE",
                      roomId,
                      shape: {
                        id: shape.id,
                        width: updated.width,
                        height: updated.height
                      }
                    }));
                    return updated;
                  }
                  return shape;
                })
              );
              return;
            }
            // PEN
            if (tool === "pen" && drawing.current) {
              const ctx = canvasRef.current.getContext("2d");
              const newStroke = {
                id: crypto.randomUUID(), // unique id for stroke
                x0: prev.current.x,
                y0: prev.current.y,
                x1: x,
                y1: y,
                color,
              };
              console.log("sending draw", newStroke);
              drawLine(newStroke.x0, newStroke.y0, newStroke.x1, newStroke.y1, newStroke.color);
              setStrokes((prev) => [...prev, newStroke]);

              // ✅ SEND STROKE
              if (socket.readyState === WebSocket.OPEN) {
                console.log("roomid before sending stroke", roomId);
                socket.send(JSON.stringify({
                  type: "DRAW_STROKE",
                  roomId,
                  stroke: newStroke,
                }));
              }

              prev.current = { x, y };
              return;
            }
            // ERASER
            if (tool === "eraser" && drawing.current) {
              const eraserRadius = 20;
              const filtered = strokes.filter((stroke) => {
                const d1 = Math.hypot(stroke.x0 - x, stroke.y0 - y);
                const d2 = Math.hypot(stroke.x1 - x, stroke.y1 - y);
                return d1 > eraserRadius && d2 > eraserRadius;
              });
              if (filtered.length === strokes.length) {
                return;
              }

              setStrokes(filtered);
              socket.send(JSON.stringify({
                type: "ERASE",
                roomId,
                x,
                y,
              }));

              return;
            }

            // cursor
            if (now - lastCursorSend.current > 50) {
              lastCursorSend.current = now;
              socket.send(JSON.stringify({
                type: "CURSOR_MOVE",
                roomId,
                x: clientX,
                y: clientY,
                tool,
                // userID,
                // optional
                // canvasX:clientX,
                // canvasY:clientY,
              }));
              console.log("Sending cursor");
            }
          }}

        />

      </div>

      {/* zooming in and zooming out  */}
      <div
        style={{
          position: "fixed",
          bottom: "20px",
          right: "20px",
          zIndex: 10,
          background: "white",
          padding: "10px",
          borderRadius: "12px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.2)",

        }}
      >
        <button onClick={() => setScale((prev) => prev + 0.1)} style={{ cursor: "pointer" }}><ZoomIn /></button>
        <button onClick={() => setScale((prev) => prev - 0.1)} style={{ cursor: "pointer" }}><ZoomOut /></button>
      </div>
      <style>
        {`
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `}
      </style>
    </div>

  );
}

export default Room;