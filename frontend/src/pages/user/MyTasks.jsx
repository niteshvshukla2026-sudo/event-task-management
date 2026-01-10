import React, { useEffect, useState } from "react";
import API from "../../services/api";

/* ================= STYLES (SINGLE FILE) ================= */

const styles = {
  page: {
    minHeight: "100vh",
    padding: "24px",
    background: "#fff5f5",
    fontFamily: "Inter, system-ui, Arial",
  },
  header: {
    marginBottom: "24px",
  },
  logo: {
    fontSize: "28px",
    fontWeight: "700",
    color: "#e53935",
  },
  subtitle: {
    color: "#6b7280",
    marginTop: "4px",
  },
  userName: {
    marginTop: "10px",
    fontSize: "16px",
    fontWeight: "600",
  },
  card: {
    background: "white",
    padding: "18px",
    borderRadius: "14px",
    marginBottom: "16px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
  },
  event: {
    fontSize: "14px",
    color: "#e53935",
    marginBottom: "6px",
    fontWeight: "600",
  },
  taskTitle: {
    fontSize: "18px",
    fontWeight: "600",
  },
  desc: {
    color: "#4b5563",
    marginTop: "6px",
  },
  status: {
    marginTop: "10px",
    fontWeight: "600",
  },
  btnRow: {
    display: "flex",
    gap: "10px",
    marginTop: "12px",
  },
  btn: {
    padding: "8px 14px",
    borderRadius: "8px",
    border: "none",
    cursor: "pointer",
    fontSize: "13px",
  },
  pending: {
    background: "#fde68a",
  },
  completed: {
    background: "#22c55e",
    color: "white",
  },
  empty: {
    marginTop: "40px",
    textAlign: "center",
    color: "#6b7280",
  },
};

/* ================= COMPONENT ================= */

const UserDashboard = () => {
  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    loadUserAndTasks();
  }, []);

  const loadUserAndTasks = async () => {
    try {
      const [userRes, taskRes] = await Promise.all([
        API.get("/users/me"),
        API.get("/tasks/my"),
      ]);

      setUser(userRes.data);
      setTasks(taskRes.data);
    } catch (err) {
      setError("Failed to load user data");
    }
  };

  // 🔒 Once COMPLETED, cannot go back to PENDING
  const markCompleted = async (taskId) => {
    try {
      await API.patch(`/tasks/${taskId}/status`, {
        status: "COMPLETED",
      });
      loadUserAndTasks();
    } catch {
      alert("Failed to update task status");
    }
  };

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.logo}>triptadka</div>
        <div style={styles.subtitle}>User Dashboard</div>

        {user && (
          <div style={styles.userName}>
            👋 Welcome, <span style={{ color: "#e53935" }}>{user.name}</span>
          </div>
        )}
      </div>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {/* TASKS */}
      {tasks.length === 0 && (
        <div style={styles.empty}>🎉 No tasks assigned yet</div>
      )}

      {tasks.map((task) => (
        <div key={task._id} style={styles.card}>
          <div style={styles.event}>
            📍 Event: {task.eventId?.title || "N/A"}
          </div>

          <div style={styles.taskTitle}>{task.title}</div>

          <div style={styles.desc}>{task.description}</div>

          <div style={styles.status}>
            Status:{" "}
            {task.status === "COMPLETED" ? "✅ Completed" : "⏳ Pending"}
          </div>

          {task.status === "PENDING" && (
            <div style={styles.btnRow}>
              <button
                style={{ ...styles.btn, ...styles.completed }}
                onClick={() => markCompleted(task._id)}
              >
                Mark Completed
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default UserDashboard;
