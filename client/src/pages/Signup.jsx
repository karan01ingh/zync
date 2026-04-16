import React, { useState } from "react"
import img1 from "../assets/img1.jpg";
import { useNavigate } from "react-router-dom";
export default function Signup() {
    const [alert, setAlert] = useState(null);
    const [loading, setloading] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [username, setUsername] = useState("");
    const navigate = useNavigate();
    const handleSignup = async () => {
        setloading(true);
        console.log("username", username);
        console.log("password", password);
        console.log("email", email);
        console.log("cliekced suignup");
        try {
            const res = await fetch("http://localhost:3000/signup", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    // "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    email, password, name: username,
                }
                )
            });
            const data = await res.json();
            if (res.ok) {
                console.log("Scueecfully logied in:");
                localStorage.setItem("token",data.token);
                setloading(false);
                setAlert({ type: "success", message: "SignUp successfull" });
                setTimeout(() => {
                    setAlert(null);
                }, 2000);
                setTimeout(() => {
                    navigate("/");
                }, 2000);
            }
            else {
                setloading(false);
                setAlert({ type: "error", message: "Error in signup" });
                setTimeout(() => {
                    setAlert(null);
                }, 2000);
            }
        } catch (error) {
            setloading(false);
            console.log("Error in signup:", error);

        }
    }
    return <div style={{
        backgroundImage: `url(${img1})`, height: "100vh",
        width: "100%", backgroundSize: "cover",
        backgroundPosition: "center",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "0px",
        margin: "0px",
        position:"fixed",
    }}>

        <form onSubmit={(e) => {
            e.preventDefault();
            handleSignup();
        }}>
            <div
                style={{
                    height: "500px",
                    width: "400px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center", // center content inside box
                    gap: "10px",
                    padding: "20px",
                    borderRadius: "12px",
                    background: "rgba(255,265,265, 0.2)", // transparent
                    backdropFilter: "blur(12px)",          // 🔥 key part
                    WebkitBackdropFilter: "blur(12px)",
                    boxShadow: "0 8px 30px rgba(0, 0, 0, 0.2)",
                }}
            >


                <h2 style={{ fontSize: "40px", fontWeight: "600" }}>Signup</h2>

                <div style={{ display: "flex", flexDirection: "column", width: "100%", gap: "10px", boxSizing: "border-box" }}>
                    <input
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        style={{ height: "40px", borderRadius: "10px", paddingLeft: "6px" }}
                        required
                    />

                    <input
                        placeholder="Email"
                        type="Email"
                        value={email}
                        required
                        onChange={(e) => setEmail(e.target.value)}
                        style={{ height: "40px", borderRadius: "10px", paddingLeft: "6px" }}
                    />

                    <input
                        type="password"
                        required
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
                    }}
                    >
                        <div
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
                    </div>

                    :
                    <button
                        type="submit"
                        // onClick={handleSignup}
                        style={{
                            height: "40px",
                            width: "100%",
                            borderRadius: "10px",
                            background: "#00308f",
                            color: "white",
                            border: "none",
                            cursor: "pointer",
                            boxSizing: "border-box",
                            marginTop: "30px"
                        }}
                    >
                        SingUp
                    </button>
                }



                <p
                    onClick={() => navigate("/login")}
                    style={{ cursor: "pointer", color: "blue" }}
                >
                    <span style={{ color: "black" }}>Already have an account?</span>Login
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
                <style>
                    {`
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `}
                </style>
            </div>
        </form>
    </div>
    // </div>
}