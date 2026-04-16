import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User } from "lucide-react"
export default function Navbar({ name }) {
  const styles = {
    navbar: {
      height: "50px",
      width: "100%",
      background: "#EFEFEF",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "5px",
      boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
      // position: "fixed",
      top: 0,
      // zIndex: 100
    },

    logo: {
      fontSize: "30px",
      fontWeight: "600",
      color: "#1a1a1a",
      letterSpacing: "0.5px",
      fontFamily: "'Inter', sans-serif" // 🔥 smooth font
    },

    profileWrapper: {
      position: "relative"
    },

    avatar: {
      width: "40px",
      height: "40px",
      borderRadius: "50%",
      background: "#00308f",
      color: "white",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      cursor: "pointer",
      fontWeight: "600"
    },

    dropdown: {
      position: "absolute",
      right: 0,
      top: "50px",
      background: "white",
      borderRadius: "10px",
      boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
      padding: "10px",
      minWidth: "120px"
    },

    logoutBtn: {
      color: "red",
      width: "100%",
      padding: "8px",
      border: "none",
      background: "none",
      cursor: "pointer",
      textAlign: "left",
      borderRadius: "6px"
    }
  };
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };
  const token = localStorage.getItem("token");
  return (
    <div style={styles.navbar}>

      {/* LEFT - LOGO */}
      <div style={styles.logo} className="pl-10">
        Zync
      </div>

      {/* RIGHT - PROFILE */}
      {/* <div style={styles.profileWrapper} className="pr-10">
      </div> */}
      <div style={styles.profileWrapper} className="pr-10">
        {token ? (
          <>
            {/* PROFILE */}
            <div
              style={styles.avatar}
              onClick={() => setOpen(!open)}
            >
              <User/>
            </div>

            {open && (
              <div style={styles.dropdown}>
                <button onClick={handleLogout} style={styles.logoutBtn}>
                  Logout
                </button>
              </div>
            )}
          </>
        ) : (
          <button
            onClick={() => navigate("/login")}
            style={{
              padding: "8px 14px",
              borderRadius: "8px",
              border: "none",
              background: "#00308f",
              color: "white",
              cursor: "pointer"
            }}
          >
            Login
          </button>
        )}
      </div>

    </div>
  );
}