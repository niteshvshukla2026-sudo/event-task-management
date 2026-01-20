import React, { useState } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const res = await API.post("/auth/login", {
          mobile,
          password,
        });

        localStorage.setItem("token", res.data.token);
        localStorage.setItem("role", res.data.role);

        if (res.data.role === "ADMIN" || res.data.role === "SUPER_ADMIN") {
          navigate("/admin");
        } else {
          navigate("/tasks");
        }
      } else {
        if (password !== confirmPassword) {
          alert("Passwords do not match");
          setLoading(false);
          return;
        }

        await API.post("/auth/register", {
          name,
          mobile,
          password,
        });

        alert("Registration successful. Please login.");
        setIsLogin(true);
        setName("");
        setMobile("");
        setPassword("");
        setConfirmPassword("");
      }
    } catch (err) {
      alert(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const inputFocus = (e) => {
    e.target.style.border = "1px solid #dc2626";
    e.target.style.boxShadow = "0 0 0 3px rgba(220,38,38,0.2)";
  };

  const inputBlur = (e) => {
    e.target.style.border = "1px solid #e5e7eb";
    e.target.style.boxShadow = "none";
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        {/* Logo */}
        <h2 style={styles.title}>
          <span style={{ color: "#111827" }}>trip</span>
          <span style={{ color: "#dc2626" }}>tadka</span>
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
                onFocus={inputFocus}
                onBlur={inputBlur}
              />
            </div>
          )}

          <div style={styles.field}>
            <label>Mobile Number</label>
            <input
              style={styles.input}
              type="tel"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              placeholder="10 digit mobile number"
              maxLength={10}
              required
              onFocus={inputFocus}
              onBlur={inputBlur}
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
              onFocus={inputFocus}
              onBlur={inputBlur}
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
                onFocus={inputFocus}
                onBlur={inputBlur}
              />
            </div>
          )}

          <button style={styles.button} disabled={loading}>
            {loading ? "Signing in..." : isLogin ? "Sign in" : "Create account"}
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
    minHeight: "100vh",
    width: "100%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "linear-gradient(135deg, #fff1f2, #ffffff)",
    fontFamily: "Inter, sans-serif",
    padding: "16px",
  },

  card: {
    background: "#ffffff",
    padding: "40px",
    width: "100%",
    maxWidth: "420px",
    borderRadius: "18px",
    boxShadow: "0 25px 70px rgba(0,0,0,0.08)",
    textAlign: "center",
    borderTop: "6px solid #dc2626",
  },

  title: {
    fontSize: "clamp(24px, 4vw, 30px)",
    fontWeight: "700",
    marginBottom: "6px",
  },

  subtitle: {
    color: "#6b7280",
    fontSize: "clamp(13px, 3.5vw, 14px)",
    marginBottom: "26px",
    lineHeight: "1.6",
  },

  field: {
    marginBottom: "16px",
    textAlign: "left",
    fontSize: "14px",
    color: "#111827",
  },

  input: {
    width: "100%",
    marginTop: "6px",
    padding: "14px",
    borderRadius: "10px",
    border: "1px solid #e5e7eb",
    fontSize: "14px",
    outline: "none",
    transition: "0.2s",
    boxSizing: "border-box",
  },

  button: {
    width: "100%",
    padding: "14px",
    background: "linear-gradient(90deg, #dc2626, #b91c1c)",
    color: "white",
    border: "none",
    borderRadius: "50px",
    fontSize: "clamp(14px, 3.5vw, 16px)",
    fontWeight: "600",
    cursor: "pointer",
    marginTop: "14px",
    boxShadow: "0 8px 20px rgba(220,38,38,0.35)",
  },

  toggle: {
    marginTop: "18px",
    fontSize: "clamp(12px, 3vw, 14px)",
    color: "#374151",
  },

  link: {
    color: "#dc2626",
    fontWeight: "600",
    cursor: "pointer",
  },
};
