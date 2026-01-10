import React, { useState } from "react";
import API from "../services/api"; 
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        // ================= LOGIN =================
       const res = await API.post("/auth/login", {
  email,
  password,
});


        // 🔐 Save token and role
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("role", res.data.role);

        // 🔁 Role based redirect
        if (res.data.role === "ADMIN" || res.data.role === "SUPER_ADMIN") {
          navigate("/admin");
        } else {
          navigate("/tasks");
        }
      } else {
        // ================= REGISTER =================
        if (password !== confirmPassword) {
          alert("Passwords do not match");
          setLoading(false);
          return;
        }

        await axios.post("http://localhost:5000/api/auth/register", {
          name,
          email,
          password,
        });

        alert("Registration successful. Please login.");
        setIsLogin(true);
        setName("");
        setEmail("");
        setPassword("");
        setConfirmPassword("");
      }
    } catch (err) {
      alert(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        {/* Logo */}
        <h2 style={styles.title}>
          <span style={{ color: "#000" }}>trip</span>
          <span style={{ color: "#E53935" }}>tadka</span>
        </h2>

        <p style={styles.subtitle}>
          TripTadka helps you organize trips, manage event tasks, and collaborate
          with your team effortlessly.
        </p>

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div style={styles.field}>
              <label>Full Name</label>
              <input
                style={styles.input}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                required
              />
            </div>
          )}

          <div style={styles.field}>
            <label>Email</label>
            <input
              style={styles.input}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>

          <div style={styles.field}>
            <label>Password</label>
            <input
              style={styles.input}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          {!isLogin && (
            <div style={styles.field}>
              <label>Confirm Password</label>
              <input
                style={styles.input}
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
          )}

          <button style={styles.button} disabled={loading}>
            {loading ? "Please wait..." : isLogin ? "Login" : "Register"}
          </button>
        </form>

        <p style={styles.toggle}>
          {isLogin ? "New user?" : "Already have an account?"}{" "}
          <span style={styles.link} onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? "Register here" : "Login here"}
          </span>
        </p>
      </div>
    </div>
  );
};

export default Login;

/* ================= STYLES ================= */

const styles = {
  page: {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "linear-gradient(135deg, #FFEBEE, #FFFFFF)",
  },
  card: {
    background: "#FFFFFF",
    padding: "42px",
    width: "380px",
    borderRadius: "16px",
    boxShadow: "0 25px 60px rgba(0,0,0,0.15)",
    borderTop: "6px solid #E53935",
  },
  title: {
    textAlign: "center",
    marginBottom: "8px",
    fontWeight: "700",
    letterSpacing: "0.5px",
    fontSize: "28px",
  },
  subtitle: {
    textAlign: "center",
    color: "#6B7280",
    marginBottom: "28px",
    fontSize: "15px",
    lineHeight: "1.6",
  },
  field: {
    marginBottom: "16px",
    display: "flex",
    flexDirection: "column",
    fontSize: "14px",
    color: "#000000",
  },
  input: {
    marginTop: "6px",
    padding: "12px",
    borderRadius: "8px",
    border: "1px solid #E5E7EB",
    fontSize: "14px",
    outline: "none",
  },
  button: {
    width: "100%",
    padding: "13px",
    background: "#E53935",
    color: "#FFFFFF",
    border: "none",
    borderRadius: "8px",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
    marginTop: "12px",
  },
  toggle: {
    marginTop: "20px",
    textAlign: "center",
    fontSize: "14px",
    color: "#000000",
  },
  link: {
    color: "#E53935",
    fontWeight: "600",
    cursor: "pointer",
  },
};
