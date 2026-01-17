import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import API from "../../services/api";

/* ================= HELPERS ================= */

const formatDate = (date) =>
  new Date(date).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

/* ================= STYLES ================= */

const styles = {
  page: {
    minHeight: "100vh",
    padding: "24px",
    background: "#fff5f5",
    fontFamily: "Inter, system-ui, Arial",
  },
  header: {
  marginBottom: "24px",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
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
  filter: {
    width: "100%",
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #ddd",
    marginBottom: "12px",
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
  date: {
    marginTop: "6px",
    fontSize: "12px",
    color: "#6b7280",
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
  completed: {
    background: "#22c55e",
    color: "white",
  },
  assignBtn: {
    background: "#e53935",
    color: "white",
  },
  empty: {
    marginTop: "40px",
    textAlign: "center",
    color: "#6b7280",
  },
  sectionTitle: {
    fontSize: "18px",
    fontWeight: "700",
    marginBottom: "10px",
    color: "#e53935",
  },
};

/* ================= COMPONENT ================= */

const UserDashboard = () => {
  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [taskFilter, setTaskFilter] = useState("OLDEST");
  const [error, setError] = useState("");

  const navigate = useNavigate();

const logout = () => {
  localStorage.removeItem("token");
  navigate("/login");
};

  // For Assign Task Form
  const [events, setEvents] = useState([]);
  const [members, setMembers] = useState([]);
  const [eventId, setEventId] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    loadUserAndTasks();
    loadMyEvents();
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
      console.error(err);
      setError("Failed to load user data");
    }
  };

  const loadMyEvents = async () => {
    try {
      const res = await API.get("/events/my");
      setEvents(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  // 🔥 FINAL FIXED VERSION
  const handleEventChange = async (e) => {
    const id = e.target.value;

    setEventId(id);
    setAssignedTo("");
    setMembers([]);

    if (!id) return;

    try {
      const res = await API.get(`/teams/event/${id}/members`);
      setMembers(res.data);
    } catch (err) {
      console.error("Team members load error:", err.response?.data);
      alert("Failed to load team members");
    }
  };

  const assignTask = async (e) => {
    e.preventDefault();
    try {
      await API.post("/tasks", {
        title,
        description,
        eventId,
        assignedTo,
      });
      alert("Task Assigned Successfully");

      // Reset form
      setTitle("");
      setDescription("");
      setAssignedTo("");
      setEventId("");
      setMembers([]);

      // Reload tasks
      loadUserAndTasks();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Error assigning task");
    }
  };

  // 🔒 Once COMPLETED, cannot go back to PENDING
  const markCompleted = async (taskId) => {
    try {
      await API.patch(`/tasks/${taskId}/status`, {
        status: "COMPLETED",
      });
      loadUserAndTasks();
    } catch (err) {
      console.error(err);
      alert("Failed to update task status");
    }
  };

  return (
    <div style={styles.page}>
      {/* ================= HEADER ================= */}
     <div style={styles.header}>
  <div>
    <div style={styles.logo}>triptadka</div>
    <div style={styles.subtitle}>User Dashboard</div>

    {user && (
      <div style={styles.userName}>
        👋 Welcome,{" "}
        <span style={{ color: "#e53935" }}>{user.name}</span>
      </div>
    )}
  </div>

  <button
    onClick={logout}
    style={{
      background: "#e53935",
      color: "white",
      border: "none",
      padding: "8px 14px",
      borderRadius: "8px",
      cursor: "pointer",
      fontSize: "14px",
    }}
  >
    Logout
  </button>
</div>


      {error && <p style={{ color: "red" }}>{error}</p>}

      {/* ================= ASSIGN TASK SECTION ================= */}
      <div style={styles.card}>
        <div style={styles.sectionTitle}>Assign New Task</div>

        <form onSubmit={assignTask}>
          <select
            required
            value={eventId}
            onChange={handleEventChange}
            style={styles.filter}
          >
            <option value="">Select Event</option>
            {events.map((e) => (
              <option key={e._id} value={e._id}>
                {e.title}
              </option>
            ))}
          </select>

          <select
            required
            value={assignedTo}
            onChange={(e) => setAssignedTo(e.target.value)}
            style={styles.filter}
            disabled={!eventId}
          >
            <option value="">Assign To (Team Member)</option>
            {members.map((m) => (
              <option key={m._id} value={m._id}>
                {m.name}
              </option>
            ))}
          </select>

          <input
            style={styles.filter}
            placeholder="Task Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <textarea
            style={styles.filter}
            placeholder="Task Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />

          <button
            type="submit"
            style={{ ...styles.btn, ...styles.assignBtn }}
          >
            Assign Task
          </button>
        </form>
      </div>

      {/* ================= FILTER ================= */}
      <select
        style={styles.filter}
        value={taskFilter}
        onChange={(e) => setTaskFilter(e.target.value)}
      >
        <option value="OLDEST">Oldest to Newest</option>
        <option value="NEWEST">Newest to Oldest</option>
        <option value="PENDING">Pending Only</option>
        <option value="COMPLETED">Completed Only</option>
      </select>

      {/* ================= TASK LIST ================= */}
      {[...tasks]
        .filter((t) => {
          if (taskFilter === "PENDING") return t.status === "PENDING";
          if (taskFilter === "COMPLETED") return t.status === "COMPLETED";
          return true;
        })
        .sort((a, b) => {
          if (taskFilter === "NEWEST") {
            return new Date(b.createdAt) - new Date(a.createdAt);
          }
          return new Date(a.createdAt) - new Date(b.createdAt);
        })
        .map((task) => (
          <div key={task._id} style={styles.card}>
            <div style={styles.event}>
              📍 Event: {task.eventId?.title || "N/A"}
            </div>

            <div style={styles.taskTitle}>{task.title}</div>

            <div style={styles.desc}>{task.description}</div>

            <div style={{ fontSize: "13px", color: "#6b7280", marginTop: "6px" }}>
              👤 Assigned By: {task.assignedBy?.name || "Admin"}
            </div>

            <div style={styles.status}>
              Status:{" "}
              {task.status === "COMPLETED" ? "✅ Completed" : "⏳ Pending"}
            </div>

            <div style={styles.date}>
              🕒 Created: {formatDate(task.createdAt)}
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

      {tasks.length === 0 && (
        <div style={styles.empty}>🎉 No tasks assigned yet</div>
      )}
    </div>
  );
};

export default UserDashboard;
