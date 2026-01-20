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
     <div style={styles.header}>
  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
    <div>
      <div style={styles.logo}>triptadka</div>
      <div style={styles.subtitle}>Admin Dashboard</div>
    </div>
<div style={{ position: "relative", marginRight: "16px" }}>
  <div
    onClick={(e) => {
  e.stopPropagation();
  setShowNotifications(!showNotifications);
}}
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
          fontSize: "10px"
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
        borderRadius: "8px",
        zIndex: 1000,
        maxHeight: "300px",
        overflowY: "auto"
      }}
    >
      {notifications.length === 0 ? (
        <p style={{ padding: "10px" }}>No notifications</p>
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
              padding: "10px",
              borderBottom: "1px solid #eee",
              background: n.isRead ? "#f9f9f9" : "#ffe4e6",
              cursor: "pointer"
            }}
          >
            <div style={{ fontSize: "14px" }}>{n.message}</div>
            <div style={{ fontSize: "11px", color: "#666" }}>
              {formatDate(n.createdAt)}
            </div>
          </div>
        ))
      )}
    </div>
  )}
</div>

    <button
      onClick={handleLogout}
      style={{
        background: "#dc2626",
        color: "white",
        border: "none",
        padding: "8px 14px",
        borderRadius: "8px",
        cursor: "pointer",
      }}
    >
      Logout
    </button>
  </div>
</div>

<div style={styles.tabs}>
  {visibleTabs.map((t) => (
    <button
      key={t}
      style={{
        ...styles.tab,
        ...(activeTab === t ? styles.tabActive : {}),
      }}
      onMouseEnter={(e) => {
        e.target.style.transform = "translateY(-2px)";
      }}
      onMouseLeave={(e) => {
        e.target.style.transform = "translateY(0)";
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
  type="tel"
  placeholder="Mobile Number"
  maxLength={10}
  value={userForm.mobile}
  onChange={(e) =>
    setUserForm({ ...userForm, mobile: e.target.value })
  }
/>

          <input
            style={styles.input}
            type="password"
            placeholder="Password"
            value={userForm.password}
            onChange={(e) =>
              setUserForm({ ...userForm, password: e.target.value })
            }
          />
          <select
  style={styles.input}
  value={userForm.role}
  onChange={(e) =>
    setUserForm({ ...userForm, role: e.target.value })
  }
>
  <option value="USER">User</option>
  <option value="ADMIN">Admin</option>
</select>

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
      placeholder="Event Title"
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

    {/* Time will be auto captured by backend using timestamps */}
    <p style={{ fontSize: "12px", color: "#6b7280", marginTop: "6px" }}>
      📅 Event date & time will be saved automatically.
    </p>

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

    {/* Task Title */}
    <input
      style={styles.input}
      placeholder="Task Title"
      value={taskForm.title}
      onChange={(e) =>
        setTaskForm({ ...taskForm, title: e.target.value })
      }
    />

    {/* Task Description */}
    <textarea
      style={styles.textarea}
      placeholder="Task Description"
      value={taskForm.description}
      onChange={(e) =>
        setTaskForm({ ...taskForm, description: e.target.value })
      }
    />

    {/* Select Event */}
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

        // 🔥 Event ke basis pe team nikalna
const team = teams.find(
  (t) => (t.event?._id || t.event).toString() === eventId.toString()
);

if (team && team.members && team.members.length > 0) {
  setFilteredUsers(team.members);  // direct populated users
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

    {/* Assign User */}
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

    {/* Info about Time */}
    <p style={{ fontSize: "12px", color: "#6b7280", marginTop: "6px" }}>
      ⏰ Task date & time will be saved automatically.
    </p>

    {/* Create Button */}
    <button style={styles.button} onClick={createTask}>
      Create Task
    </button>
  </div>
)}



      {/* ================= EVENTS ================= */}
     {/* ================= EVENTS ================= */}
{activeTab === "Events" && (
  <>
    {/* Event Filter */}
    <select
      style={styles.input}
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
        <div key={e._id} style={styles.card}>
          <h3>{e.title}</h3>
          <p>{e.venue}</p>
          <p>{e.description}</p>
          <p>
            <strong>Created:</strong> {formatDate(e.createdAt)}
          </p>
        </div>
      ))}
  </>
)}

      {/* ================= TASKS ================= */}
      {activeTab === "Tasks" && (
        <>
         {/* 🔥 ADD THIS DROPDOWN HERE */}
    <select
      style={styles.input}
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
              <div key={t._id} style={styles.card}>
                <h3>{t.title}</h3>
                <p>{t.description}</p>

                <p>
                  <strong>Assigned To:</strong>{" "}
                  {t.assignedTo?.name || "Not Assigned"}
                </p>

                <p>
                  <strong>Status:</strong>{" "}
                  <span style={styles.badge(t.status || "PENDING")}>
                    {t.status || "PENDING"}
                  </span>
                </p>

                <p>
                  <strong>Created:</strong> {formatDate(t.createdAt)}
                </p>
              </div>
            ))}
        </>
      )}

    </div>
  );
};

export default AdminDashboard;
