import { useEffect } from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { FaRegFolder } from "react-icons/fa";

export default function Dashboard() {
  const [boards, setBoards] = useState([]);
  const navigate = useNavigate();
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joinInput, setJoinInput] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [boardName, setBoardName] = useState("");
  const [generatedLink, setGeneratedLink] = useState("");

  useEffect(() => {
    const fetchBoards = async () => {
      const token = localStorage.getItem("token");
      console.log("token:",token);
      // const res = await fetch("http://localhost:3000/boards", {
      //   headers: {
      //     "Content-Type": "application/json",
      //     Authorization: `Bearer ${token}`
      //   }
      // });
      const res = await fetch("https://zync-yna7.onrender.com/boards", {
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`
  }
});
      const data = await res.json();
      console.log(data);
      if(Array.isArray(data)){
        setBoards(data);
      }
      else{
         console.log("Error:", data);
  setBoards([]); // prevent crash
      }
    };

    fetchBoards();
  }, []);

  const styles = {
    container: {
      padding: "30px",
      background: "#f5f7fb",
      minHeight: "100vh"
    },

    topBar: {
      display: "flex",
      gap: "15px",
      marginBottom: "30px"
    },

    createBtn: {
      padding: "12px 20px",
      background: "#00308f",
      color: "white",
      border: "none",
      borderRadius: "12px",
      cursor: "pointer",
      fontSize: "16px",
    },

    joinBtn: {
      padding: "12px 20px",
      background: "white",
      border: "1px solid #ccc",
      borderRadius: "12px",
      cursor: "pointer",
      fontSize: "16px"
    },

    grid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
      gap: "20px"
    },
    card: {
      background: "white",
      borderRadius: "12px",
      padding: "15px",
      boxShadow: "0 4px 15px rgba(0,0,0,0.08)",
      cursor: "pointer",
      transition: "0.2s",
      display:"flex",
      justifyContent:"space-between",
      alignItems:"center",

    },


    thumbnail: {
      height: "120px",
      background: "#eaeaea",
      borderRadius: "8px",
      marginBottom: "10px",
      fontSize: "16px",
    },

    editBtn: {
      marginTop: "10px",
      padding: "8px 12px",
      background: "#00308f",
      color: "white",
      border: "none",
      borderRadius: "8px",
      cursor: "pointer",
      fontSize: "15px",
    },

    /* 🔥 MODAL */
    overlay: {
      position: "fixed",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      background: "rgba(0,0,0,0.4)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center"
    },

    modal: {
      width: "400px",
      background: "white",
      padding: "20px",
      borderRadius: "12px",
      display: "flex",
      flexDirection: "column",
      gap: "15px"
    },

    input: {
      height: "40px",
      borderRadius: "8px",
      paddingLeft: "10px",
      border: "1px solid #ccc"
    },

    primaryBtn: {
      height: "40px",
      background: "#00308f",
      color: "white",
      border: "none",
      borderRadius: "8px",
      cursor: "pointer",

    },

    linkBox: {
      padding: "10px",
      background: "#f1f1f1",
      borderRadius: "8px",
      fontSize: "12px",
      wordBreak: "break-all"
    },

    closeBtn: {
      background: "none",
      border: "none",
      cursor: "pointer",
      color: "red"
    }
  };
  // 👉 open modal
  const handleCreate = () => {
    setShowModal(true);
  };

  // 👉 create board
  const handleGenerate = async () => {
    if (!boardName.trim()) return;

    const roomId = Math.random().toString(36).substring(2, 8);

    const token = localStorage.getItem("token");

    await fetch("https://zync-yna7.onrender.com/create-board", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        name: boardName,
        roomId
      })
    });

    const link = `${window.location.origin}/room/${roomId}`;
    setGeneratedLink(link);
  };
  // 👉 go to board
  const handleStart = () => {
    const roomId = generatedLink.split("/").pop();
    navigate(`/room/${roomId}`);
  };

  // 👉 join
  const handleJoinSubmit = () => {
    if (!joinInput.trim()) return alert("Enter link or code");

    let roomId = joinInput;

    // 🔥 If user pastes full link
    if (joinInput.includes("/room/")) {
      roomId = joinInput.split("/room/")[1];
    }

    navigate(`/room/${roomId}`);
  };

  return (
    <>
      <Navbar/>
      <div style={styles.container}>

        {/* TOP BAR */}
        <div style={styles.topBar}>
          <button onClick={handleCreate} style={styles.createBtn}>
            + Create New
          </button>

          <button onClick={() => setShowJoinModal(true)} style={styles.joinBtn}>
            + Join with Code
          </button>
        </div>

        {/* GRID */}
        <div style={styles.grid}>
          {boards.map((board) => (
            <div
              key={board._id}
              style={styles.card}
              onClick={() => navigate(`/room/${board.roomId}`)}
              onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.02)"}
onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
            >
              <div style={{text:"left"}}>
              <h3 style={{ margin:"0 0 15px 0",fontFamily:"sans-serif" }}>{board.name}</h3>
              <p style={{ margin: 0, color: "gray", fontSize: "14px"}} >{new Date(board.createdAt).toDateString()}</p>
              </div>
              <FaRegFolder  style={{ fontSize: "60px", color: "#00308f" }}/>
            </div>
          ))}
        </div>

        {/* 🔥 MODAL */}
        {showModal && (
          <div style={styles.overlay}>
            <div style={styles.modal}>

              <h2>Create Board</h2>

              <input
                placeholder="Enter board name"
                value={boardName}
                onChange={(e) => setBoardName(e.target.value)}
                style={styles.input}
              />

              {!generatedLink ? (
                <button onClick={handleGenerate} style={styles.primaryBtn}>
                  Generate Link
                </button>
              ) : (
                <>
                  <div style={styles.linkBox}>
                    {generatedLink}
                  </div>

                  <button onClick={handleStart} style={styles.primaryBtn}>
                    Start Board
                  </button>
                </>
              )}

              <button
                onClick={() => {
                  setShowModal(false);
                  setGeneratedLink("");
                  setBoardName("");
                }}
                style={styles.closeBtn}
              >
                Cancel
              </button>

            </div>
          </div>
        )}
        {showJoinModal && (
          <div style={styles.overlay}>
            <div style={styles.modal}>

              <h2>Join Board</h2>

              <input
                placeholder="Paste link or enter code"
                value={joinInput}
                onChange={(e) => setJoinInput(e.target.value)}
                style={styles.input}
              />

              <button onClick={handleJoinSubmit} style={styles.primaryBtn}>
                Join
              </button>

              <button
                onClick={() => {
                  setShowJoinModal(false);
                  setJoinInput("");
                }}
                style={styles.closeBtn}
              >
                Cancel
              </button>

            </div>
          </div>
        )}
      </div>
    </>
  );
}