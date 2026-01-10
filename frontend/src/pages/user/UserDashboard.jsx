import React, { useEffect, useState } from "react";
import API from "../../services/api";

/* ================= STYLES ================= */

const styles = {
  page: {
    minHeight: "100vh",
    padding: "24px",
    background: "#fff5f5",
    fontFamily: "Inter, system-ui",
  },
  header: { marginBottom: "24px" },
  logo: { fontSize: "28px", fontWeight: "700", color: "#e53935" },
  subtitle: { color: "#6b7280" },
  userName: { marginTop: "8px", fontWeight: "600" },

  card: {
    background: "white",
    padding: "18px",
    borderRadius: "14px",
    marginBottom: "16px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
  },

  input: {
    width: "100%",
    padding: "10px",
    marginTop: "10px",
    borderRadius: "8px",
    border: "1px solid #ddd",
  },

  textarea: {
    width: "100%",
    padding: "10px",
    marginTop: "10px",
    borderRadius: "8px",
    border: "1px solid #ddd",
  },

  button: {
    marginTop: "14px",
    background: "#e53935",
    color: "white",
    border: "none",
    padding: "10px",
    borderRadius: "8px",
    cursor: "pointer",
  },

  event: { color: "#e53935", fontWeight: "600" },
  pending: { color: "orange", fontWeight: "600" },
  completed: { color: "green", fontWeight: "600" },
  error: { color: "red" },
};

/* ================= COMPONENT ================= */

const UserDashboard = () => {
  /* 🔹 EXISTING STATES (UNCHANGED) */
  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [error, setError] = useState("");

  /* 🔹 REQUIRED FOR NEW FEATURE */
  const [events, setEvents] = useState([]);
  const [teamUsers, setTeamUsers] = useState([]);

  /* 🔹 TASK ASSIGN FORM (NEW – DOES NOT AFFECT OLD FLOW) */
  const [taskForm, setTaskForm] = useState({
    title: "",
    description: "",
    eventId: "",
    assignedTo: "",
  });

  /* ================= LOAD USER + TASKS (OLD FUNCTION) ================= */

  useEffect(() => {
    loadUserAndTasks();
  }, []);

  const loadUserAndTasks = async () => {
    try {
      const [userRes, taskRes, eventRes] = await Promise.all([
        API.get("/users/me"),
        API.get("/tasks/my"),
        API.get("/events"),
      ]);

      setUser(userRes.data);
      setTasks(taskRes.data);
      setEvents(eventRes.data);
    } catch (err) {
      setError("Failed to load user dashboard");
    }
  };

  /* ================= UPDATE STATUS (OLD LOGIC – ONE WAY) ================= */

  const updateStatus = async (taskId) => {
    try {
      await API.patch(`/tasks/${taskId}/status`, {
        status: "COMPLETED",
      });
      loadUserAndTasks();
    } catch {
      alert("Failed to update task status");
    }
  };

  /* ================= 🔥 NEW: LOAD TEAM USERS BY EVENT ================= */

  const loadTeamUsers = async (eventId) => {
    if (!eventId) {
      setTeamUsers([]);
      return;
    }

    try {
      const res = await API.get(`/teams/event/${eventId}/members`);
      setTeamUsers(res.data);
    } catch {
      setTeamUsers([]);
    }
  };

  /* ================= 🔥 NEW: TEAM MEMBER ASSIGN TASK ================= */

  const createTeamTask = async () => {
    if (!taskForm.title || !taskForm.eventId || !taskForm.assignedTo) {
      alert("Please fill all fields");
      return;
    }

    try {
      await API.post("/tasks/team", taskForm);

      alert("Task assigned successfully");

      setTaskForm({
        title: "",
        description: "",
        eventId: "",
        assignedTo: "",
      });

      setTeamUsers([]);
      loadUserAndTasks();
    } catch {
      alert("Failed to assign task");
    }
  };

  /* ================= UI ================= */

  return (
    <div style={styles.page}>
      {/* HEADER */}
      <div style={styles.header}>
        <div style={styles.logo}>triptadka</div>
        <div style={styles.subtitle}>User Dashboard</div>

        {user && (
          <div style={styles.userName}>
            👋 Welcome,{" "}
            <span style={{ color: "#e53935" }}>{user.name}</span>
          </div>
        )}
      </div>

      {error && <p style={styles.error}>{error}</p>}

      {/* 🔥 NEW FEATURE: ASSIGN TASK TO TEAM MEMBER */}
      <div style={styles.card}>
        <h3>Assign Task to Team Member</h3>

        <input
          style={styles.input}
          placeholder="Task Title"
          value={taskForm.title}
          onChange={(e) =>
            setTaskForm({ ...taskForm, title: e.target.value })
          }
        />

        <textarea
          style={styles.textarea}
          placeholder="Task Description"
          value={taskForm.description}
          onChange={(e) =>
            setTaskForm({ ...taskForm, description: e.target.value })
          }
        />

        <select
          style={styles.input}
          value={taskForm.eventId}
          onChange={(e) => {
            setTaskForm({ ...taskForm, eventId: e.target.value });
            loadTeamUsers(e.target.value);
          }}
        >
          <option value="">Select Event</option>
          {events.map((e) => (
            <option key={e._id} value={e._id}>
              {e.title}
            </option>
          ))}
        </select>

        <select
          style={styles.input}
          value={taskForm.assignedTo}
          onChange={(e) =>
            setTaskForm({ ...taskForm, assignedTo: e.target.value })
          }
        >
          <option value="">Assign Team Member</option>
          {teamUsers.map((u) => (
            <option key={u._id} value={u._id}>
              {u.name}
            </option>
          ))}
        </select>

        <button style={styles.button} onClick={createTeamTask}>
          Assign Task
        </button>
      </div>

      {/* 🔹 MY TASKS (OLD FEATURE – UNCHANGED) */}
      {tasks.map((task) => (
        <div key={task._id} style={styles.card}>
          <div style={styles.event}>
            📍 Event: {task.eventId?.title || "N/A"}
          </div>

          <h3>{task.title}</h3>
          <p>{task.description}</p>

          <p>
            Status:{" "}
            {task.status === "COMPLETED" ? (
              <span style={styles.completed}>✔ Completed</span>
            ) : (
              <span style={styles.pending}>⏳ Pending</span>
            )}
          </p>

          {task.status === "PENDING" && (
            <button
              style={{ ...styles.button, background: "#22c55e" }}
              onClick={() => updateStatus(task._id)}
            >
              Mark Completed
            </button>
          )}
        </div>
      ))}
    </div>
  );
};

export default UserDashboard;
