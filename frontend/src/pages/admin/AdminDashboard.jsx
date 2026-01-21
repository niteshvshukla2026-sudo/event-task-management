import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../services/api";

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
    background: "linear-gradient(135deg,#fff1f2,#ffe4e6,#ffffff)",
    padding: "24px",
    fontFamily: "Inter, system-ui",
  },

  header: {
    background: "white",
    padding: "20px 24px",
    borderRadius: "16px",
    marginBottom: "24px",
    boxShadow: "0 12px 30px rgba(0,0,0,.08)",
  },

  logo: {
    fontSize: "28px",
    fontWeight: "800",
    color: "#dc2626",
  },

  subtitle: {
    color: "#6b7280",
    fontSize: "13px",
  },

  tabs: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
    marginBottom: "24px",
  },

  tab: {
    padding: "10px 18px",
    borderRadius: "999px",
    border: "1px solid #fecaca",
    background: "#fff",
    color: "#dc2626",
    cursor: "pointer",
    fontWeight: "600",
    transition: "0.25s",
  },

  tabActive: {
    background: "linear-gradient(90deg,#dc2626,#b91c1c)",
    color: "white",
    border: "none",
    boxShadow: "0 8px 20px rgba(220,38,38,.35)",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
    gap: "20px",
  },

  card: {
    background: "white",
    padding: "22px",
    borderRadius: "18px",
    boxShadow: "0 15px 35px rgba(0,0,0,.08)",
    marginBottom: "20px",
  },

  statCard: {
    background: "linear-gradient(135deg,#dc2626,#ef4444)",
    color: "white",
    padding: "22px",
    borderRadius: "18px",
    boxShadow: "0 15px 35px rgba(220,38,38,.4)",
    fontSize: "18px",
    fontWeight: "700",
  },

  input: {
    width: "100%",
    padding: "14px",
    marginTop: "10px",
    borderRadius: "10px",
    border: "1px solid #e5e7eb",
    fontSize: "14px",
  },

  textarea: {
    width: "100%",
    padding: "14px",
    marginTop: "10px",
    borderRadius: "10px",
    border: "1px solid #e5e7eb",
    fontSize: "14px",
  },

  button: {
    marginTop: "16px",
    background: "linear-gradient(90deg,#dc2626,#b91c1c)",
    color: "white",
    border: "none",
    padding: "12px 20px",
    borderRadius: "30px",
    cursor: "pointer",
    fontWeight: "600",
    boxShadow: "0 8px 20px rgba(220,38,38,.35)",
  },

  badge: (status) => ({
    padding: "4px 12px",
    borderRadius: "999px",
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
const [eventFilter, setEventFilter] = useState("NEWEST"); 
const [taskFilter, setTaskFilter] = useState("OLDEST");
const [notifications, setNotifications] = useState([]);
const [showNotifications, setShowNotifications] = useState(false);



const handleLogout = () => {
  localStorage.removeItem("token");   // token delete
  navigate("/");                      // login page pe bhejo
};
const [currentUser, setCurrentUser] = useState(null);
const loadCurrentUser = async () => {
  try {
    const res = await API.get("/users/me");
    setCurrentUser(res.data);
  } catch (err) {
    console.error("Failed to load current user", err);
  }
};

const loadNotifications = async () => {
  try {
    const res = await API.get("/notifications");
    setNotifications(res.data || []);
  } catch (err) {
    console.error("Notification load error", err);
  }
};

 const visibleTabs =
    currentUser?.role === "SUPER_ADMIN"
      ? TABS
      : TABS.filter((t) => t !== "Create User");


  /* ================= FORMS ================= */

const [userForm, setUserForm] = useState({
  name: "",
  mobile: "",
  password: "",
  role: "USER",
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
        loadCurrentUser(); 
      loadAll();
       loadNotifications(); 
    }
  }, []);
const unreadCount = notifications.filter(n => !n.isRead).length;
useEffect(() => {
  const interval = setInterval(() => {
    loadNotifications();
  }, 15000);

  return () => clearInterval(interval);
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
    alert("User created");

    setUserForm({
      name: "",
      mobile: "",
      password: "",
      role: "USER",
    });

    loadAll();
    loadNotifications();   // 🔔 ADD
    setActiveTab("Overview");
  } catch (err) {
    console.error(err.response?.data);
    alert(err.response?.data?.message || "Failed to create user");
  }
};


  const createEvent = async () => {
    try {
      await API.post("/events", eventForm);
      alert("Event created");
      setEventForm({ title: "", venue: "", description: "" });
      loadAll();
      loadNotifications();   // 🔔 ADD

      setActiveTab("Events");
    } catch (err) {
      console.error(err.response?.data);
      alert(err.response?.data?.message || "Failed to create event");
    }
  };

  // 🔥 FINAL FIXED CREATE TEAM
  const createTeam = async () => {
    if (!teamForm.eventId) {
      alert("Select event");
      return;
    }
    if (teamForm.members.length === 0) {
      alert("Select at least one member");
      return;
    }

    try {
      await API.post("/teams", {
        event: teamForm.eventId,       // IMPORTANT: eventId → event
        members: teamForm.members,
      });

      alert("Team created successfully");

      setTeamForm({
        eventId: "",
        members: [],
      });

      loadAll();
      loadNotifications();   // 🔔 ADD

      setActiveTab("Overview");
    } catch (err) {
      console.error(err.response?.data);
      alert(err.response?.data?.message || "Failed to create team");
    }
  };

  // 🔥 FINAL FIXED CREATE TASK
  const createTask = async () => {
    if (!taskForm.title || !taskForm.description) {
      alert("Title & description required");
      return;
    }
    if (!taskForm.eventId) {
      alert("Select event");
      return;
    }
    if (!taskForm.assignedTo) {
      alert("Assign a user");
      return;
    }

    try {
      await API.post("/tasks", {
        ...taskForm,
        status: "PENDING",
      });

      alert("Task created successfully");

      setTaskForm({
        title: "",
        description: "",
        eventId: "",
        assignedTo: "",
      });

      setFilteredUsers([]);
      loadAll();
      loadNotifications();   // 🔔 ADD

      setActiveTab("Tasks");
    } catch (err) {
      console.error(err.response?.data);
      alert(err.response?.data?.message || "Failed to create task");
    }
  };

  /* ================= UI ================= */

  return (
  <div style={styles.page}>
    {/* ================= HEADER ================= */}
    <div style={styles.header}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        {/* LEFT : LOGO */}
        <div>
          <div style={styles.logo}>triptadka</div>
          <div style={styles.subtitle}>Admin Dashboard</div>
        </div>

        {/* RIGHT : NOTIFICATION + LOGOUT */}
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          {/* 🔔 Notification */}
          <div style={{ position: "relative" }}>
            <div
              onClick={(e) => {
                e.stopPropagation();
                setShowNotifications(!showNotifications);
              }}
              style={{
                cursor: "pointer",
                fontSize: "18px",
                background: "#fee2e2",
                padding: "10px",
                borderRadius: "50%",
                position: "relative",
                boxShadow: "0 6px 14px rgba(220,38,38,0.25)",
              }}
            >
              🔔
              {unreadCount > 0 && (
                <span
                  style={{
                    position: "absolute",
                    top: "4px",
                    right: "4px",
                    background: "#dc2626",
                    color: "white",
                    borderRadius: "50%",
                    padding: "2px 6px",
                    fontSize: "10px",
                    fontWeight: "600",
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
      top: "40px",
      right: "0",
      left: "auto",
      width: "90vw",          // 🔥 mobile friendly
      maxWidth: "320px",     // desktop pe control
      background: "white",
      boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
      borderRadius: "12px",
      zIndex: 1000,
      maxHeight: "300px",
      overflowY: "auto",
      transform: "translateX(-20%)", // 🔥 thoda andar khiska dega
    }}
  >

                {notifications.length === 0 ? (
                  <p style={{ padding: "14px", color: "#6b7280" }}>
                    No notifications
                  </p>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n._id}
                      onClick={async (e) => {
                        e.stopPropagation();
                        await API.put(`/notifications/${n._id}/read`);
                        loadNotifications();
                        setShowNotifications(false);
                      }}
                     style={{
      padding: "12px",
      borderBottom: "1px solid #f1f1f1",
      background: n.isRead ? "#fff" : "#ffe4e6",
      cursor: "pointer",
      transition: "0.2s",
    }}
                    >
                      <div style={{ fontSize: "14px", fontWeight: "500" }}>
                        {n.message}
                      </div>
                      <div style={{ fontSize: "11px", color: "#6b7280" }}>
                        {formatDate(n.createdAt)}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* LOGOUT */}
          <button
            onClick={handleLogout}
            style={{
              background: "linear-gradient(90deg,#dc2626,#b91c1c)",
              color: "white",
              border: "none",
              padding: "10px 22px",
              borderRadius: "999px",
              cursor: "pointer",
              fontWeight: "600",
              boxShadow: "0 8px 20px rgba(220,38,38,.35)",
            }}
          >
            Logout
          </button>
        </div>
      </div>
    </div>

    {/* ================= TABS ================= */}
    <div style={styles.tabs}>
      {visibleTabs.map((t) => (
        <button
          key={t}
          style={{
            ...styles.tab,
            ...(activeTab === t ? styles.tabActive : {}),
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = "translateY(-3px)";
            e.target.style.boxShadow = "0 8px 20px rgba(220,38,38,0.25)";
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = "translateY(0)";
            e.target.style.boxShadow = "none";
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
    <div style={styles.statCard}>📅 Total Events<br />{events.length}</div>
    <div style={styles.statCard}>👥 Total Users<br />{users.length}</div>
    <div style={styles.statCard}>📋 Total Tasks<br />{tasks.length}</div>
    <div style={styles.statCard}>👨‍👩‍👧‍👦 Total Teams<br />{teams.length}</div>
  </div>
)}

      {/* ================= CREATE USER ================= */}
      {activeTab === "Create User" && currentUser?.role === "SUPER_ADMIN" && (
  <div
    style={{
      ...styles.card,
      padding: "28px",
      borderRadius: "18px",
      boxShadow: "0 20px 40px rgba(220,38,38,0.15)",
      maxWidth: "900px",
      margin: "0 auto",
    }}
  >
    {/* Header */}
    <div style={{ marginBottom: "20px" }}>
      <h2
        style={{
          margin: 0,
          fontSize: "24px",
          fontWeight: "700",
          color: "#111827",
        }}
      >
        👤 Create User
      </h2>
      <p style={{ fontSize: "14px", color: "#6b7280" }}>
        Add a new user with mobile number, password and role.
      </p>
    </div>

    {/* Name */}
    <div style={{ marginBottom: "16px" }}>
      <label style={{ fontSize: "13px", color: "#374151", fontWeight: "600" }}>
        Full Name
      </label>
      <input
        style={{
          ...styles.input,
          marginTop: "6px",
          borderRadius: "12px",
          padding: "14px",
        }}
        placeholder="Enter full name"
        value={userForm.name}
        onChange={(e) =>
          setUserForm({ ...userForm, name: e.target.value })
        }
      />
    </div>

    {/* Mobile */}
    <div style={{ marginBottom: "16px" }}>
      <label style={{ fontSize: "13px", color: "#374151", fontWeight: "600" }}>
        Mobile Number
      </label>
      <input
        style={{
          ...styles.input,
          marginTop: "6px",
          borderRadius: "12px",
          padding: "14px",
        }}
        type="tel"
        maxLength={10}
        placeholder="Enter 10 digit mobile number"
        value={userForm.mobile}
        onChange={(e) =>
          setUserForm({ ...userForm, mobile: e.target.value })
        }
      />
    </div>

    {/* Password */}
    <div style={{ marginBottom: "16px" }}>
      <label style={{ fontSize: "13px", color: "#374151", fontWeight: "600" }}>
        Password
      </label>
      <input
        style={{
          ...styles.input,
          marginTop: "6px",
          borderRadius: "12px",
          padding: "14px",
        }}
        type="password"
        placeholder="Enter password"
        value={userForm.password}
        onChange={(e) =>
          setUserForm({ ...userForm, password: e.target.value })
        }
      />
    </div>

    {/* Role */}
    <div style={{ marginBottom: "20px" }}>
      <label style={{ fontSize: "13px", color: "#374151", fontWeight: "600" }}>
        Select Role
      </label>
      <select
        style={{
          ...styles.input,
          marginTop: "6px",
          borderRadius: "12px",
          padding: "14px",
        }}
        value={userForm.role}
        onChange={(e) =>
          setUserForm({ ...userForm, role: e.target.value })
        }
      >
        <option value="USER">User</option>
        <option value="ADMIN">Admin</option>
      </select>
    </div>

    {/* Info */}
    <div
      style={{
        fontSize: "13px",
        color: "#6b7280",
        background: "#fee2e2",
        padding: "10px 14px",
        borderRadius: "10px",
        marginBottom: "20px",
      }}
    >
      🔐 Password will be securely encrypted before saving.
    </div>

    {/* Create Button */}
    <button
      style={{
        background: "linear-gradient(135deg,#dc2626,#b91c1c)",
        color: "white",
        border: "none",
        padding: "14px 26px",
        borderRadius: "14px",
        cursor: "pointer",
        fontWeight: "600",
        fontSize: "15px",
        boxShadow: "0 10px 20px rgba(220,38,38,0.35)",
        transition: "0.25s",
      }}
      onMouseEnter={(e) => {
        e.target.style.transform = "translateY(-2px)";
        e.target.style.boxShadow =
          "0 14px 28px rgba(220,38,38,0.45)";
      }}
      onMouseLeave={(e) => {
        e.target.style.transform = "translateY(0)";
        e.target.style.boxShadow =
          "0 10px 20px rgba(220,38,38,0.35)";
      }}
      onClick={createUser}
    >
      ➕ Create User
    </button>
  </div>
)}


      {/* ================= CREATE EVENT ================= */}
     {activeTab === "Create Event" && (
  <div
    style={{
      ...styles.card,
      padding: "28px",
      borderRadius: "18px",
      boxShadow: "0 20px 40px rgba(220,38,38,0.15)",
      maxWidth: "900px",
      margin: "0 auto",
    }}
  >
    {/* Header */}
    <div style={{ marginBottom: "20px" }}>
      <h2
        style={{
          margin: 0,
          fontSize: "24px",
          fontWeight: "700",
          color: "#111827",
        }}
      >
        📅 Create Event
      </h2>
      <p style={{ fontSize: "14px", color: "#6b7280" }}>
        Add a new event with venue and description.
      </p>
    </div>

    {/* Event Title */}
    <div style={{ marginBottom: "16px" }}>
      <label style={{ fontSize: "13px", color: "#374151", fontWeight: "600" }}>
        Event Title
      </label>
      <input
        style={{
          ...styles.input,
          marginTop: "6px",
          borderRadius: "12px",
          padding: "14px",
        }}
        placeholder="Enter event title"
        value={eventForm.title}
        onChange={(e) =>
          setEventForm({ ...eventForm, title: e.target.value })
        }
      />
    </div>

    {/* Venue */}
    <div style={{ marginBottom: "16px" }}>
      <label style={{ fontSize: "13px", color: "#374151", fontWeight: "600" }}>
        Venue
      </label>
      <input
        style={{
          ...styles.input,
          marginTop: "6px",
          borderRadius: "12px",
          padding: "14px",
        }}
        placeholder="Enter venue"
        value={eventForm.venue}
        onChange={(e) =>
          setEventForm({ ...eventForm, venue: e.target.value })
        }
      />
    </div>

    {/* Description */}
    <div style={{ marginBottom: "16px" }}>
      <label style={{ fontSize: "13px", color: "#374151", fontWeight: "600" }}>
        Description
      </label>
      <textarea
        style={{
          ...styles.textarea,
          marginTop: "6px",
          borderRadius: "12px",
          padding: "14px",
          minHeight: "100px",
        }}
        placeholder="Write event description..."
        value={eventForm.description}
        onChange={(e) =>
          setEventForm({ ...eventForm, description: e.target.value })
        }
      />
    </div>

    {/* Info */}
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
        fontSize: "13px",
        color: "#6b7280",
        background: "#fee2e2",
        padding: "10px 14px",
        borderRadius: "10px",
        marginBottom: "20px",
      }}
    >
      📅 Event date & time will be saved automatically.
    </div>

    {/* Create Button */}
    <button
      style={{
        background: "linear-gradient(135deg,#dc2626,#b91c1c)",
        color: "white",
        border: "none",
        padding: "14px 26px",
        borderRadius: "14px",
        cursor: "pointer",
        fontWeight: "600",
        fontSize: "15px",
        boxShadow: "0 10px 20px rgba(220,38,38,0.35)",
        transition: "0.25s",
      }}
      onMouseEnter={(e) => {
        e.target.style.transform = "translateY(-2px)";
        e.target.style.boxShadow =
          "0 14px 28px rgba(220,38,38,0.45)";
      }}
      onMouseLeave={(e) => {
        e.target.style.transform = "translateY(0)";
        e.target.style.boxShadow =
          "0 10px 20px rgba(220,38,38,0.35)";
      }}
      onClick={createEvent}
    >
      ➕ Create Event
    </button>
  </div>
)}


      {/* ================= CREATE EVENT TEAM ================= */}
     {activeTab === "Create Event Team" && (
  <div
    style={{
      ...styles.card,
      padding: "28px",
      borderRadius: "18px",
      boxShadow: "0 20px 40px rgba(220,38,38,0.15)",
      maxWidth: "900px",
      margin: "0 auto",
    }}
  >
    {/* Header */}
    <div style={{ marginBottom: "20px" }}>
      <h2
        style={{
          margin: 0,
          fontSize: "24px",
          fontWeight: "700",
          color: "#111827",
        }}
      >
        👥 Create Event Team
      </h2>
      <p style={{ fontSize: "14px", color: "#6b7280" }}>
        Select an event and choose members to form its team.
      </p>
    </div>

    {/* Select Event */}
    <div style={{ marginBottom: "18px" }}>
      <label style={{ fontSize: "13px", color: "#374151", fontWeight: "600" }}>
        Select Event
      </label>
      <select
        style={{
          ...styles.input,
          marginTop: "6px",
          borderRadius: "12px",
          padding: "14px",
        }}
        value={teamForm.eventId}
        onChange={(e) =>
          setTeamForm({ ...teamForm, eventId: e.target.value, members: [] })
        }
      >
        <option value="">Select Event</option>
        {events.map((e) => (
          <option key={e._id} value={e._id}>
            {e.title}
          </option>
        ))}
      </select>
    </div>

    {/* Members */}
    <div style={{ marginBottom: "20px" }}>
      <label style={{ fontSize: "13px", color: "#374151", fontWeight: "600" }}>
        Select Team Members
      </label>

      <div
        style={{
          marginTop: "10px",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "12px",
        }}
      >
        {users.map((u) => {
          const selected = teamForm.members.includes(u._id);

          return (
            <div
              key={u._id}
              onClick={() => {
                const members = selected
                  ? teamForm.members.filter((id) => id !== u._id)
                  : [...teamForm.members, u._id];

                setTeamForm({ ...teamForm, members });
              }}
              style={{
                padding: "12px 14px",
                borderRadius: "12px",
                border: selected
                  ? "2px solid #dc2626"
                  : "1px solid #e5e7eb",
                background: selected ? "#fee2e2" : "#fff",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                boxShadow: selected
                  ? "0 6px 14px rgba(220,38,38,0.25)"
                  : "0 2px 6px rgba(0,0,0,0.05)",
                transition: "0.25s",
              }}
            >
              <span
                style={{
                  fontSize: "14px",
                  fontWeight: "600",
                  color: "#111827",
                }}
              >
                {u.name}
              </span>

              <span
                style={{
                  width: "20px",
                  height: "20px",
                  borderRadius: "50%",
                  background: selected ? "#dc2626" : "#e5e7eb",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  fontSize: "12px",
                }}
              >
                {selected ? "✓" : ""}
              </span>
            </div>
          );
        })}
      </div>
    </div>

    {/* Info */}
    <div
      style={{
        fontSize: "13px",
        color: "#6b7280",
        background: "#fee2e2",
        padding: "10px 14px",
        borderRadius: "10px",
        marginBottom: "20px",
      }}
    >
      🔔 Selected members will be assigned to this event team.
    </div>

    {/* Create Button */}
    <button
      style={{
        background: "linear-gradient(135deg,#dc2626,#b91c1c)",
        color: "white",
        border: "none",
        padding: "14px 26px",
        borderRadius: "14px",
        cursor: "pointer",
        fontWeight: "600",
        fontSize: "15px",
        boxShadow: "0 10px 20px rgba(220,38,38,0.35)",
        transition: "0.25s",
      }}
      onMouseEnter={(e) => {
        e.target.style.transform = "translateY(-2px)";
        e.target.style.boxShadow =
          "0 14px 28px rgba(220,38,38,0.45)";
      }}
      onMouseLeave={(e) => {
        e.target.style.transform = "translateY(0)";
        e.target.style.boxShadow =
          "0 10px 20px rgba(220,38,38,0.35)";
      }}
      onClick={createTeam}
    >
      🚀 Create Team
    </button>
  </div>
)}


      {/* ================= CREATE TASK ================= */}
  {activeTab === "Create Task" && (
  <div
    style={{
      ...styles.card,
      padding: "28px",
      borderRadius: "18px",
      boxShadow: "0 20px 40px rgba(220,38,38,0.15)",
      maxWidth: "900px",
      margin: "0 auto",
    }}
  >
    {/* Header */}
    <div style={{ marginBottom: "20px" }}>
      <h2
        style={{
          margin: 0,
          fontSize: "24px",
          fontWeight: "700",
          color: "#111827",
        }}
      >
        📝 Create Task
      </h2>
      <p style={{ fontSize: "14px", color: "#6b7280" }}>
        Create and assign a task to your team for a selected event.
      </p>
    </div>

    {/* Task Title */}
    <div style={{ marginBottom: "16px" }}>
      <label style={{ fontSize: "13px", color: "#374151", fontWeight: "600" }}>
        Task Title
      </label>
      <input
        style={{
          ...styles.input,
          marginTop: "6px",
          borderRadius: "12px",
          padding: "14px",
        }}
        placeholder="Enter task title"
        value={taskForm.title}
        onChange={(e) =>
          setTaskForm({ ...taskForm, title: e.target.value })
        }
      />
    </div>

    {/* Task Description */}
    <div style={{ marginBottom: "16px" }}>
      <label style={{ fontSize: "13px", color: "#374151", fontWeight: "600" }}>
        Task Description
      </label>
      <textarea
        style={{
          ...styles.textarea,
          marginTop: "6px",
          borderRadius: "12px",
          padding: "14px",
          minHeight: "90px",
        }}
        placeholder="Write task details..."
        value={taskForm.description}
        onChange={(e) =>
          setTaskForm({ ...taskForm, description: e.target.value })
        }
      />
    </div>

    {/* Select Event */}
    <div style={{ marginBottom: "16px" }}>
      <label style={{ fontSize: "13px", color: "#374151", fontWeight: "600" }}>
        Select Event
      </label>
      <select
        style={{
          ...styles.input,
          marginTop: "6px",
          borderRadius: "12px",
          padding: "14px",
        }}
        value={taskForm.eventId}
        onChange={(e) => {
          const eventId = e.target.value;

          setTaskForm({
            ...taskForm,
            eventId,
            assignedTo: "",
          });

          const team = teams.find(
            (t) => (t.event?._id || t.event).toString() === eventId.toString()
          );

          if (team && team.members && team.members.length > 0) {
            setFilteredUsers(team.members);
          } else {
            setFilteredUsers([]);
          }
        }}
      >
        <option value="">Select Event</option>
        {events.map((e) => (
          <option key={e._id} value={e._id}>
            {e.title}
          </option>
        ))}
      </select>
    </div>

    {/* Assign User */}
    <div style={{ marginBottom: "16px" }}>
      <label style={{ fontSize: "13px", color: "#374151", fontWeight: "600" }}>
        Assign User
      </label>
      <select
        style={{
          ...styles.input,
          marginTop: "6px",
          borderRadius: "12px",
          padding: "14px",
          background: taskForm.eventId ? "#fff" : "#f3f4f6",
          cursor: taskForm.eventId ? "pointer" : "not-allowed",
        }}
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
    </div>

    {/* Info */}
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
        fontSize: "13px",
        color: "#6b7280",
        background: "#fee2e2",
        padding: "10px 14px",
        borderRadius: "10px",
        marginBottom: "20px",
      }}
    >
      ⏰ Task date & time will be saved automatically.
    </div>

    {/* Create Button */}
    <button
      style={{
        background: "linear-gradient(135deg,#dc2626,#b91c1c)",
        color: "white",
        border: "none",
        padding: "14px 26px",
        borderRadius: "14px",
        cursor: "pointer",
        fontWeight: "600",
        fontSize: "15px",
        boxShadow: "0 10px 20px rgba(220,38,38,0.35)",
        transition: "0.25s",
      }}
      onMouseEnter={(e) => {
        e.target.style.transform = "translateY(-2px)";
        e.target.style.boxShadow =
          "0 14px 28px rgba(220,38,38,0.45)";
      }}
      onMouseLeave={(e) => {
        e.target.style.transform = "translateY(0)";
        e.target.style.boxShadow =
          "0 10px 20px rgba(220,38,38,0.35)";
      }}
      onClick={createTask}
    >
      ➕ Create Task
    </button>
  </div>
)}



      {/* ================= EVENTS ================= */}
     {/* ================= EVENTS ================= */}
{activeTab === "Events" && (
  <>
    {/* 🔽 Event Filter */}
    <select
      style={{
        ...styles.input,
        maxWidth: "260px",
        marginBottom: "20px",
        borderRadius: "12px",
        boxShadow: "0 6px 14px rgba(0,0,0,0.08)",
      }}
      value={eventFilter}
      onChange={(e) => setEventFilter(e.target.value)}
    >
      <option value="NEWEST">Newest to Oldest</option>
      <option value="OLDEST">Oldest to Newest</option>
    </select>

    {[...events]
      .sort((a, b) =>
        eventFilter === "NEWEST"
          ? new Date(b.createdAt) - new Date(a.createdAt)
          : new Date(a.createdAt) - new Date(b.createdAt)
      )
      .map((e) => (
        <div
          key={e._id}
          style={{
            ...styles.card,
            display: "flex",
            gap: "16px",
            alignItems: "flex-start",
            borderLeft: "6px solid #dc2626",
            transition: "0.25s",
            cursor: "pointer",
          }}
          onMouseEnter={(el) => {
            el.currentTarget.style.transform = "translateY(-4px)";
            el.currentTarget.style.boxShadow =
              "0 20px 40px rgba(220,38,38,0.25)";
          }}
          onMouseLeave={(el) => {
            el.currentTarget.style.transform = "translateY(0)";
            el.currentTarget.style.boxShadow =
              "0 10px 25px rgba(0,0,0,0.08)";
          }}
        >
          {/* 📅 EVENT ICON (Same for all events) */}
          <div
            style={{
              background: "linear-gradient(135deg,#dc2626,#b91c1c)",
              color: "white",
              width: "52px",
              height: "52px",
              borderRadius: "14px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "24px",
              boxShadow: "0 6px 14px rgba(220,38,38,.4)",
              flexShrink: 0,
            }}
          >
            📅
          </div>

          {/* 📄 EVENT CONTENT */}
          <div style={{ flex: 1 }}>
            <h3
              style={{
                margin: 0,
                fontSize: "18px",
                fontWeight: "700",
                color: "#111827",
              }}
            >
              {e.title}
            </h3>

            <p
              style={{
                margin: "4px 0",
                color: "#6b7280",
                fontSize: "14px",
                display: "flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              📍 {e.venue}
            </p>

            <p
              style={{
                margin: "8px 0",
                fontSize: "14px",
                color: "#374151",
                lineHeight: "1.5",
              }}
            >
              {e.description}
            </p>

            {/* 🏷 Created Badge */}
            <div
              style={{
                display: "inline-block",
                marginTop: "8px",
                padding: "6px 14px",
                background: "#fee2e2",
                color: "#b91c1c",
                borderRadius: "999px",
                fontSize: "12px",
                fontWeight: "600",
              }}
            >
              Created: {formatDate(e.createdAt)}
            </div>
          </div>
        </div>
      ))}
  </>
)}

      {/* ================= TASKS ================= */}
     {/* ================= TASKS ================= */}
{activeTab === "Tasks" && (
  <>
    {/* 🔽 Task Filter */}
    <select
      style={{
        ...styles.input,
        maxWidth: "260px",
        marginBottom: "20px",
        borderRadius: "12px",
        boxShadow: "0 6px 14px rgba(0,0,0,0.08)",
      }}
      value={taskFilter}
      onChange={(e) => setTaskFilter(e.target.value)}
    >
      <option value="OLDEST">Oldest to Newest</option>
      <option value="NEWEST">Newest to Oldest</option>
      <option value="PENDING">Pending</option>
      <option value="COMPLETED">Completed</option>
    </select>

    {[...tasks]
      .filter((t) => {
        if (taskFilter === "PENDING") return t.status === "PENDING";
        if (taskFilter === "COMPLETED") return t.status === "COMPLETED";
        return true;
      })
      .sort((a, b) => {
        if (taskFilter === "NEWEST")
          return new Date(b.createdAt) - new Date(a.createdAt);
        return new Date(a.createdAt) - new Date(b.createdAt);
      })
      .map((t) => (
        <div
          key={t._id}
          style={{
            ...styles.card,
            display: "flex",
            gap: "16px",
            alignItems: "flex-start",
            borderLeft: "6px solid #dc2626",
            transition: "0.25s",
            cursor: "pointer",
          }}
          onMouseEnter={(el) => {
            el.currentTarget.style.transform = "translateY(-4px)";
            el.currentTarget.style.boxShadow =
              "0 20px 40px rgba(220,38,38,0.25)";
          }}
          onMouseLeave={(el) => {
            el.currentTarget.style.transform = "translateY(0)";
            el.currentTarget.style.boxShadow =
              "0 10px 25px rgba(0,0,0,0.08)";
          }}
        >
          {/* 📝 TASK ICON */}
          <div
            style={{
              background: "linear-gradient(135deg,#dc2626,#b91c1c)",
              color: "white",
              width: "52px",
              height: "52px",
              borderRadius: "14px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "24px",
              boxShadow: "0 6px 14px rgba(220,38,38,.4)",
              flexShrink: 0,
            }}
          >
            📝
          </div>

          {/* 📄 TASK CONTENT */}
          <div style={{ flex: 1 }}>
            {/* Title */}
            <h3
              style={{
                margin: 0,
                fontSize: "18px",
                fontWeight: "700",
                color: "#111827",
              }}
            >
              {t.title}
            </h3>

            {/* Description */}
            <p
              style={{
                margin: "6px 0",
                fontSize: "14px",
                color: "#374151",
                lineHeight: "1.5",
              }}
            >
              {t.description}
            </p>

            {/* Assigned */}
            <p
              style={{
                margin: "4px 0",
                fontSize: "13px",
                color: "#6b7280",
              }}
            >
              👤 <strong>Assigned:</strong>{" "}
              {t.assignedTo?.name || "Not Assigned"}
            </p>

            {/* Status + Date */}
            <div
              style={{
                display: "flex",
                gap: "10px",
                flexWrap: "wrap",
                marginTop: "8px",
                alignItems: "center",
              }}
            >
              {/* Status Badge */}
              <span
                style={{
                  padding: "6px 14px",
                  borderRadius: "999px",
                  fontSize: "12px",
                  fontWeight: "600",
                  color: "white",
                  background:
                    t.status === "COMPLETED"
                      ? "#16a34a"
                      : t.status === "IN_PROGRESS"
                      ? "#f59e0b"
                      : "#dc2626",
                }}
              >
                {t.status || "PENDING"}
              </span>

              {/* Created Badge */}
              <span
                style={{
                  padding: "6px 14px",
                  borderRadius: "999px",
                  fontSize: "12px",
                  fontWeight: "600",
                  background: "#fee2e2",
                  color: "#b91c1c",
                }}
              >
                ⏰ {formatDate(t.createdAt)}
              </span>
            </div>
          </div>
        </div>
      ))}
  </>
)}

    </div>
  );
};

export default AdminDashboard;
