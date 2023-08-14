import { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { ADMIN_ROUTES, STUDENT_ROUTES, TEACHER_ROUTES } from "./Routes";
import Login from "./pages/Login";
import Page404 from "./pages/Page404";
import AdminDashboard from "./Dashboards/Admin/AdminDashboard";
import StudentDashboard from "./Dashboards/Student/StudentDashboard";
import TeacherDashboard from "./Dashboards/Teacher/TeacherDashboard";

import "./App.css";

function App() {
  const { input, auth } = useSelector((state) => state.login);

  useEffect(() => {
    const profile = {
      userType: input.loginAs,
    };

    let links = [];
    if (profile.userType === "Admin") {
      links = ADMIN_ROUTES;
    } else if (profile.userType === "Teacher") {
      links = TEACHER_ROUTES;
    } else if (profile.userType === "Student") {
      links = STUDENT_ROUTES;
    }

    let dashboard;

    if (auth && auth.uid && profile.userType === "Admin") {
      dashboard = <AdminDashboard links={links} />;
    } else if (auth && auth.uid && profile.userType === "Teacher") {
      dashboard = <TeacherDashboard links={links} />;
    } else if (auth && auth.uid && profile.userType === "Student") {
      dashboard = <StudentDashboard links={links} />;
    }

    setDashboard(dashboard);
  }, [auth, auth.uid, input]);

  const [dashboard, setDashboard] = useState(null);

  return (
    <div>
      {/* {auth && !auth.uid ? "" : <Navbar links={links} />} */}

      <Routes>
        <Route
          path="/*"
          element={auth && !auth.uid ? <Navigate to="/login" /> : dashboard}
        />
        <Route
          path="/login"
          element={auth && auth.uid ? <Navigate to="/" /> : <Login />}
        />

        <Route path="/404" element={<Page404 />} />
        <Route path="*" element={<h1>Page Not Found!</h1>} />
      </Routes>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        // pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      {/* Same as */}
      <ToastContainer />
    </div>
  );
}

export default App;
