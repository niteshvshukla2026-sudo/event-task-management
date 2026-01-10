import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../services/api";

/* ================= STYLES ================= */

const styles = {
  page: {
    minHeight: "100vh",
    background: "#fff5f5",
    padding: "24px",
    fontFamily: "Inter, system-ui",
  },
  header: {
    marginBottom: "20px",
  },
  logo: {
    fontSize: "28px",
    fontWeight: "700",
    color: "#e53935",
  },
  subtitle: {
    color: "#6b7280",
  },
  tabs: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
    marginBottom: "24px",
  },
  tab: {
    padding: "8px 16px",
    borderRadius: "20px",
    border: "1px solid #e53935",
    background: "white",
    cursor: "pointer",
  },
  tabActive: {
    background: "#e53935",
    color: "white",
  },
  card: {
    background: "white",
    padding: "20px",
    borderRadius: "14px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
    marginBottom: "20px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px,1fr))",
    gap: "16px",
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
    padding: "12px",
    borderRadius: "8px",
    cursor: "pointer",
  },
  error: {
    color: "red",
    marginBottom: "10px",
  },
  badge: (status) => ({
    padding: "4px 12px",
    borderRadius: "14px",
    fontSize: "12px",
    color: "white",
    background:
      status === "DONE"
        ? "#16a34a"
        : status === "IN_PROGRESS"
        ? "#f59e0b"
        : "#dc2626",
  }),
};

/* ================= CONSTANTS ================= */

const TABS = [
  "Overview",
  "Create User",
  "Create Event",
  "Create Event Team",
  "Create Task",
  "Events",
  "Tasks",
];

/* ================= COMPONENT ================= */

const AdminDashboard = () => {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("Overview");
  const [events, setEvents] = useState([]);
  const [users, setUsers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [teams, setTeams] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [error, setError] = useState("");

  /* ================= FORMS ================= */

  const [userForm, setUserForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [eventForm, setEventForm] = useState({
    title: "",
    venue: "",
    description: "",
  });

  const [teamForm, setTeamForm] = useState({
    eventId: "",
    members: [],
  });

  const [taskForm, setTaskForm] = useState({
    title: "",
    description: "",
    eventId: "",
    assignedTo: "",
  });

  /* ================= AUTH + LOAD ================= */

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
    } else {
      loadAll();
    }
  }, []);

  const loadAll = async () => {
    try {
      setError("");

      const [e, u, t, tm] = await Promise.all([
        API.get("/events"),
        API.get("/users"),
        API.get("/tasks"),
        API.get("/teams"),
      ]);

      setEvents(e.data || []);
      setUsers(u.data || []);
      setTasks(t.data || []);
      setTeams(tm.data || []);
    } catch (err) {
      console.error(err);
      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
      } else {
        setError("Failed to load admin data");
      }
    }
  };

  /* ================= CREATE ACTIONS ================= */

  const createUser = async () => {
    try {
      await API.post("/users", userForm);
      setUserForm({ name: "", email: "", password: "" });
      loadAll();
      setActiveTab("Overview");
    } catch {
      alert("Failed to create user");
    }
  };

  const createEvent = async () => {
    try {
      await API.post("/events", eventForm);
      setEventForm({ title: "", venue: "", description: "" });
      loadAll();
      setActiveTab("Events");
    } catch {
      alert("Failed to create event");
    }
  };

  const createTeam = async () => {
    try {
      await API.post("/teams", teamForm);
      setTeamForm({ eventId: "", members: [] });
      loadAll();
      setActiveTab("Overview");
    } catch {
      alert("Failed to create team");
    }
  };

  const createTask = async () => {
    try {
      await API.post("/tasks", { ...taskForm, status: "PENDING" });
      setTaskForm({
        title: "",
        description: "",
        eventId: "",
        assignedTo: "",
      });
      setFilteredUsers([]);
      loadAll();
      setActiveTab("Tasks");
    } catch {
      alert("Failed to create task");
    }
  };

  /* ================= UI ================= */

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div style={styles.logo}>triptadka</div>
        <div style={styles.subtitle}>Admin Dashboard</div>
      </div>

      <div style={styles.tabs}>
        {TABS.map((t) => (
          <button
            key={t}
            style={{
              ...styles.tab,
              ...(activeTab === t ? styles.tabActive : {}),
            }}
            onClick={() => setActiveTab(t)}
          >
            {t}
          </button>
        ))}
      </div>

      {error && <div style={styles.error}>{error}</div>}

      {/* ================= OVERVIEW ================= */}
      {activeTab === "Overview" && (
        <div style={styles.grid}>
          <div style={styles.card}>Total Events: {events.length}</div>
          <div style={styles.card}>Total Users: {users.length}</div>
          <div style={styles.card}>Total Tasks: {tasks.length}</div>
        </div>
      )}

      {/* ================= CREATE USER ================= */}
      {activeTab === "Create User" && (
        <div style={styles.card}>
          <h2>Create User</h2>
          <input
            style={styles.input}
            placeholder="Name"
            value={userForm.name}
            onChange={(e) =>
              setUserForm({ ...userForm, name: e.target.value })
            }
          />
          <input
            style={styles.input}
            placeholder="Email"
            value={userForm.email}
            onChange={(e) =>
              setUserForm({ ...userForm, email: e.target.value })
            }
          />
          <input
            style={styles.input}
            placeholder="Password"
            type="password"
            value={userForm.password}
            onChange={(e) =>
              setUserForm({ ...userForm, password: e.target.value })
            }
          />
          <button style={styles.button} onClick={createUser}>
            Create User
          </button>
        </div>
      )}

      {/* ================= CREATE EVENT ================= */}
      {activeTab === "Create Event" && (
        <div style={styles.card}>
          <h2>Create Event</h2>
          <input
            style={styles.input}
            placeholder="Event Name"
            value={eventForm.title}
            onChange={(e) =>
              setEventForm({ ...eventForm, title: e.target.value })
            }
          />
          <input
            style={styles.input}
            placeholder="Venue"
            value={eventForm.venue}
            onChange={(e) =>
              setEventForm({ ...eventForm, venue: e.target.value })
            }
          />
          <textarea
            style={styles.textarea}
            placeholder="Description"
            value={eventForm.description}
            onChange={(e) =>
              setEventForm({ ...eventForm, description: e.target.value })
            }
          />
          <button style={styles.button} onClick={createEvent}>
            Create Event
          </button>
        </div>
      )}

      {/* ================= CREATE EVENT TEAM ================= */}
      {activeTab === "Create Event Team" && (
        <div style={styles.card}>
          <h2>Create Event Team</h2>

          <select
            style={styles.input}
            value={teamForm.eventId}
            onChange={(e) =>
              setTeamForm({ ...teamForm, eventId: e.target.value })
            }
          >
            <option value="">Select Event</option>
            {events.map((e) => (
              <option key={e._id} value={e._id}>
                {e.title}
              </option>
            ))}
          </select>

          {users.map((u) => (
            <div key={u._id}>
              <input
                type="checkbox"
                checked={teamForm.members.includes(u._id)}
                onChange={() => {
                  const members = teamForm.members.includes(u._id)
                    ? teamForm.members.filter((id) => id !== u._id)
                    : [...teamForm.members, u._id];

                  setTeamForm({ ...teamForm, members });
                }}
              />{" "}
              {u.name}
            </div>
          ))}

          <button style={styles.button} onClick={createTeam}>
            Create Team
          </button>
        </div>
      )}

      {/* ================= CREATE TASK ================= */}
      {activeTab === "Create Task" && (
        <div style={styles.card}>
          <h2>Create Task</h2>

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
              const eventId = e.target.value;

              setTaskForm({
                ...taskForm,
                eventId,
                assignedTo: "",
              });

              // 🔥 FIXED PART (NO WHITE SCREEN)
              const team = teams.find((t) => t.eventId === eventId);
              setFilteredUsers(team && team.members ? team.members : []);
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
            disabled={!taskForm.eventId}
            onChange={(e) =>
              setTaskForm({ ...taskForm, assignedTo: e.target.value })
            }
          >
            <option value="">Assign User</option>
            {filteredUsers.map((u) => (
              <option key={u._id} value={u._id}>
                {u.name}
              </option>
            ))}
          </select>

          <button style={styles.button} onClick={createTask}>
            Create Task
          </button>
        </div>
      )}

      {/* ================= EVENTS ================= */}
      {activeTab === "Events" &&
        events.map((e) => (
          <div key={e._id} style={styles.card}>
            <h3>{e.title}</h3>
            <p>{e.venue}</p>
            <p>{e.description}</p>
          </div>
        ))}

      {/* ================= TASKS ================= */}
      {activeTab === "Tasks" &&
        tasks.map((t) => (
          <div key={t._id} style={styles.card}>
            <h3>{t.title}</h3>
            <p>{t.description}</p>
            <p>
              <strong>Assigned To:</strong>{" "}
              {t.assignedTo && t.assignedTo.name
                ? t.assignedTo.name
                : "Not Assigned"}
            </p>
            <p>
              <strong>Status:</strong>{" "}
              <span style={styles.badge(t.status || "PENDING")}>
                {t.status || "PENDING"}
              </span>
            </p>
          </div>
        ))}
    </div>
  );
};

export default AdminDashboard;
