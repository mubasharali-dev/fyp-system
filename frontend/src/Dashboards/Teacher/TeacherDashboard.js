import React from "react";
import { Routes, Route } from "react-router-dom";
import { useSelector } from "react-redux";

import Dashboard from "./pages/Dashboard";

import Sidebar from "../../Components/Navbar/Sidebar";
import SupervisionProjects from "./pages/SupervisionProjects";
import ExaminationProjects from "./pages/ExaminationProjects";
import PersonalNotes from "./pages/PersonalNotes";
import Settings from "./pages/Settings";
import Notifications from "./pages/Notifications";

const TeacherDashboard = (props) => {
  const { input } = useSelector((state) => state.login);
  const user = {
    name: input.userName,
    id: input.user_id,
  };

  return (
    <Sidebar user={user} links={props.links}>
      <Routes>
        <Route
          path="/"
          element={<Dashboard userId={user.id} userName={user.name} />}
        />
        <Route
          path="/supervision-projects"
          element={
            <SupervisionProjects userId={user.id} userName={user.name} />
          }
        />
        <Route
          path="/examination-projects"
          element={
            <ExaminationProjects userId={user.id} userName={user.name} />
          }
        />
        <Route
          path="/notifications"
          element={<Notifications userId={user.id} userName={user.name} />}
        />
        <Route
          path="/personal-notes"
          element={<PersonalNotes userId={user.id} userName={user.name} />}
        />
        <Route
          path="/settings"
          element={<Settings userId={user.id} />}
          userName={user.name}
        />
      </Routes>
    </Sidebar>
  );
};

export default TeacherDashboard;
