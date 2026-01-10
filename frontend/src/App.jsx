import React from "react";
import { Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import AdminDashboard from "./pages/admin/AdminDashboard";
import MyTasks from "./pages/user/MyTasks";

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/tasks" element={<MyTasks />} />
    </Routes>
  );
};

export default App;
