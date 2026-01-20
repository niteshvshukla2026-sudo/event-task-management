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
    background: "linear-gradient(135deg,#fff5f5,#ffe4e6)",
    fontFamily: "Inter, system-ui",
  },

  header: {
    background: "white",
    padding: "18px 24px",
    borderRadius: "16px",
    boxShadow: "0 15px 40px rgba(220,38,38,0.12)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "24px",
  },

  logo: {
    fontSize: "26px",
    fontWeight: "800",
    color: "#dc2626",
  },

  subtitle: {
    fontSize: "13px",
    color: "#6b7280",
  },

  userName: {
    marginTop: "6px",
    fontSize: "15px",
    fontWeight: "600",
  },

  card: {
    background: "white",
    padding: "22px",
    borderRadius: "18px",
    marginBottom: "20px",
    boxShadow: "0 12px 30px rgba(0,0,0,0.08)",
    borderLeft: "6px solid #dc2626",
    transition: "0.25s",
  },

  sectionTitle: {
    fontSize: "20px",
    fontWeight: "700",
    color: "#dc2626",
    marginBottom: "14px",
  },

  filter: {
    width: "100%",
    padding: "14px",
    borderRadius: "12px",
    border: "1px solid #e5e7eb",
    marginBottom: "14px",
    fontSize: "14px",
    outline: "none",
  },

  btn: {
    padding: "12px 20px",
    borderRadius: "12px",
    border: "none",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "600",
    transition: "0.25s",
  },

  assignBtn: {
    background: "linear-gradient(135deg,#dc2626,#b91c1c)",
    color: "white",
    boxShadow: "0 8px 20px rgba(220,38,38,0.35)",
  },

  completed: {
    background: "linear-gradient(135deg,#16a34a,#22c55e)",
    color: "white",
    boxShadow: "0 8px 20px rgba(34,197,94,0.35)",
  },

  event: {
    fontSize: "13px",
    color: "#dc2626",
    fontWeight: "600",
    marginBottom: "6px",
  },

  taskTitle: {
    fontSize: "18px",
    fontWeight: "700",
    marginBottom: "4px",
  },

  desc: {
    color: "#4b5563",
    fontSize: "14px",
  },

  statusChip: (status) => ({
    display: "inline-block",
    padding: "4px 12px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "600",
    background:
      status === "COMPLETED" ? "#dcfce7" : "#fee2e2",
    color:
      status === "COMPLETED" ? "#166534" : "#991b1b",
    marginTop: "6px",
  }),

  date: {
    marginTop: "6px",
    fontSize: "12px",
    color: "#6b7280",
  },

  empty: {
    marginTop: "40px",
    textAlign: "center",
    color: "#6b7280",
    fontSize: "16px",
  },
};


/* ================= COMPONENT ================= */

const UserDashboard = () => {
  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [taskFilter, setTaskFilter] = useState("OLDEST");
  const [error, setError] = useState("");
const [notifications, setNotifications] = useState([]);
const [showNotifications, setShowNotifications] = useState(false);

  const navigate = useNavigate();

const logout = () => {
  localStorage.removeItem("token");
  navigate("/login", { replace: true });
};

const loadNotifications = async () => {
  try {
    const res = await API.get("/notifications");
    setNotifications(res.data || []);
  } catch (err) {
    console.error("Failed to load notifications", err);
  }
};

  // For Assign Task Form
  const [events, setEvents] = useState([]);
  const [members, setMembers] = useState([]);
  const [eventId, setEventId] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
const logout = () => {
  localStorage.removeItem("token");
  window.location.href = "/"; 
    // navigate nahi, direct reload
};



  loadUserAndTasks();
  loadMyEvents();
   loadNotifications(); 
}, []);
useEffect(() => {
  const interval = setInterval(() => {
    loadNotifications();
  }, 15000); // har 15 sec me refresh

  return () => clearInterval(interval);
}, []);

const unreadCount = notifications.filter(n => !n.isRead).length;

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
       loadNotifications(); 
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Error assigning task");
    }
  };

  // 🔒 Once COMPLETED, cannot go back to PENDING
 const markCompleted = async (taskId) => {
  const remarks = prompt("Please enter remarks before completing the task:");

  if (!remarks || remarks.trim() === "") {
    alert("Remarks are required to complete the task");
    return;
  }

  try {
    await API.patch(`/tasks/${taskId}/status`, {
      status: "COMPLETED",
      description: remarks,
    });
    loadUserAndTasks();
     loadNotifications(); 
  } catch (err) {
    console.error(err);
    alert(err.response?.data?.message || "Failed to update task status");
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
        👋 Welcome, <span style={{ color: "#e53935" }}>{user.name}</span>
      </div>
    )}
  </div>

  <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
    {/* 🔔 Notification Bell */}
    <div style={{ position: "relative" }}>
      <div
        onClick={() => setShowNotifications(!showNotifications)}
        style={{ cursor: "pointer", fontSize: "22px", position: "relative" }}
      >
        🔔
        {unreadCount > 0 && (
          <span
            style={{
              position: "absolute",
              top: "-6px",
              right: "-8px",
              background: "red",
              color: "white",
              borderRadius: "50%",
              padding: "2px 6px",
              fontSize: "10px",
            }}
          >
            {unreadCount}
          </span>
        )}
      </div>

      {showNotifications && (
        <div
          style={{
            position: "absolute",
            right: 0,
            top: "30px",
            width: "300px",
            background: "white",
            boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
            borderRadius: "10px",
            zIndex: 999,
            maxHeight: "300px",
            overflowY: "auto",
          }}
        >
          {notifications.length === 0 ? (
            <p style={{ padding: "10px" }}>No notifications</p>
          ) : (
            notifications.map((n) => (
              <div
                key={n._id}
                onClick={async () => {
                  await API.put(`/notifications/${n._id}/read`);
                  loadNotifications();
                }}
                style={{
                  padding: "10px",
                  borderBottom: "1px solid #eee",
                  background: n.isRead ? "#fff" : "#ffe4e6",
                  cursor: "pointer",
                }}
              >
                <div style={{ fontSize: "14px" }}>{n.message}</div>
                <div style={{ fontSize: "11px", color: "#777" }}>
                  {formatDate(n.createdAt)}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>

    {/* Logout */}
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
</div>



      {error && <p style={{ color: "red" }}>{error}</p>}

      {/* ================= ASSIGN TASK SECTION ================= */}
      <div style={styles.card}>
  <div style={styles.sectionTitle}>📝 Assign New Task</div>

  <form onSubmit={assignTask}>
    <select style={styles.filter} value={eventId} onChange={handleEventChange} required>
      <option value="">Select Event</option>
      {events.map(e => (
        <option key={e._id} value={e._id}>{e.title}</option>
      ))}
    </select>

    <select
      style={styles.filter}
      value={assignedTo}
      onChange={(e) => setAssignedTo(e.target.value)}
      disabled={!eventId}
      required
    >
      <option value="">Assign To Team Member</option>
      {members.map(m => (
        <option key={m._id} value={m._id}>{m.name}</option>
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

    <button type="submit" style={{ ...styles.btn, ...styles.assignBtn }}>
      ➕ Assign Task
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

           <div style={styles.statusChip(task.status)}>
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
