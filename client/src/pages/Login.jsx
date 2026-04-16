import { useState } from "react"
import { useNavigate } from "react-router-dom";
import img1 from "../assets/img1.jpg";
// import img2 from "../assets/img2.jpg";
export default function Login() {
  const [alert, setAlert] = useState(null);
  const [loading, setloading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const handleLogin = async () => {
    setloading(true);
    try {

      const res = await fetch("https://zync-yna7.onrender.com/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password })
      }
      );
      const data = await res.json();
      console.log("Login response:", data);
      if (res.ok) {
        console.log(data.message);
        localStorage.setItem("token", data.token);
        setloading(false);
        setAlert({ type: "success", message: "Login successfull" });
        setTimeout(() => {
          navigate("/");
        }, 2000);
        // navigate("/");
        setTimeout(() => {
          setAlert(null);
        }, 2000);
      }
      else {
        setloading(false);
        console.log(data.message);
        setAlert({ type: "error", message: data.message });
        setTimeout(() => {
          setAlert(null);
        }, 2000);
        // alert("Error in Logiing In ");
      }
    } catch (error) {
      setloading(false);
      console.log("Error in logging in:", error);
    }
  };
  return <div style={{
    position: "fixed",
    backgroundImage: `url(${img1})`,
    minHeight: "100vh",
    width: "100%", backgroundSize: "cover",
    backgroundPosition: "center",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "0px",
    margin: "0px",
  }}>

    <form onSubmit={(e) => {
      e.preventDefault();
      handleLogin();
    }}>
      {/* <div></div> */}
      <div
        style={{
          height: "500px",
          width: "400px",
          //   background: "#EBEEF2",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center", // center content inside box
          gap: "10px",
          padding: "20px",
          borderRadius: "12px",
          background: "rgba(255, 255, 255, 0.08)", // transparent
          backdropFilter: "blur(12px)",          // 🔥 key part
          WebkitBackdropFilter: "blur(12px)",
          boxShadow: "0 8px 30px rgba(0, 0, 0, 0.2)",
        }}
      >
        <h2 style={{ fontSize: "40px", fontWeight: "600" }}>Login</h2>

        <div style={{ display: "flex", flexDirection: "column", width: "100%", gap: "10px", boxSizing: "border-box" }}>
          <input
            type="Email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ height: "40px", borderRadius: "10px", paddingLeft: "6px" }}
          />

          <input
            required
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ height: "40px", borderRadius: "10px", paddingLeft: "6px" }}
          />
        </div>
        {loading ?
          <div style={{
            height: "40px", width: "100%", borderRadius: "10px", background: "#00308f", border: "none", boxSizing: "border-box",
            margin: "30px", display: "flex", justifyContent: "center", alignItems: "center"
          }}>
            <div
              style={{
                width: "20px",
                height: "20px",
                border: "3px solid #ccc",
                borderTop: "3px solid #00308f",
                borderRadius: "50%",
                animation: "spin 1s linear infinite",
                transition: "all 0.2s ease",
              }}

            />
          </div>

          :
          <button
            type="submit"
            style={{
              height: "40px",
              width: "100%",
              borderRadius: "10px",
              background: "#00308f",
              color: "white",
              border: "none",
              cursor: "pointer",
              boxSizing: "border-box",
              margin: "30px",
              font: "30px"
            }}
          >
            Login
          </button>
        }

        <p
          onClick={() => navigate("/signup")}
          style={{ cursor: "pointer", color: "blue" }}
        >
          <span style={{ color: "black" }}>Don’t have an account?</span>Signup
        </p>
        {alert && (
          <div
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "8px",
              marginBottom: "10px",
              textAlign: "center",
              fontSize: "14px",
              fontWeight: "500",
              color: alert.type === "success" ? "green" : "red",
              background:
                alert.type === "success"
                  ? "rgba(0,255,0,0.1)"
                  : "rgba(255,0,0,0.1)"
            }}
          >
            {alert.message}
          </div>
        )}
      </div>

      <style>
        {`
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `}
      </style>

    </form>

  </div>
}