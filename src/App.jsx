import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login/Login";
import AdminLayout from "./pages/AdminDashboard/AdminLayout";
import AdminOverview from "./pages/AdminDashboard/AdminOverview";
import AdminRentTickets from "./pages/AdminDashboard/AdminRentTickets";
import AdminChemicals from "./pages/AdminDashboard/AdminChemicals";
import AdminDevices from "./pages/AdminDashboard/AdminDevices";
import AdminUsers from "./pages/AdminDashboard/AdminUsers";

import TeacherLayout from "./pages/TeacherDashboard/TeacherLayout/TeacherLayout";
import TeacherHome from "./pages/TeacherDashboard/TeacherHome/TeacherHome";
import TeacherWiki from "./pages/TeacherDashboard/TeacherWiki/TeacherWiki";
import TeacherBorrow from "./pages/TeacherDashboard/TeacherBorrow/TeacherBorrow";
import TeacherReport from "./pages/TeacherDashboard/TeacherReport/TeacherReport";
import TeacherProfile from "./pages/TeacherDashboard/TeacherProfile/TeacherProfile";
import TeacherSettings from './pages/TeacherDashboard/TeacherSettings/TeacherSettings';

const PrivateRoute = ({ children, requiredRole }) => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (!token) return <Navigate to="/login" />;
  if (requiredRole && role !== requiredRole) {
    if (role === "ROLE_TEACHER") return <Navigate to="/teacher" />;
    if (role === "ROLE_ADMIN") return <Navigate to="/admin" />;
    return <Navigate to="/login" />;
  }
  return children;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />

        {/* Route cho Giảng viên */}
        <Route
          path="/teacher"
          element={
            <PrivateRoute requiredRole="ROLE_TEACHER">
              <TeacherLayout />
            </PrivateRoute>
          }
        >
          {/* Mặc định vào trang Home */}
          <Route index element={<Navigate to="home" replace />} />

          <Route path="home" element={<TeacherHome />} />
          <Route path="wiki" element={<TeacherWiki />} />
          <Route path="borrow" element={<TeacherBorrow />} />
          <Route path="report" element={<TeacherReport />} />
          <Route path="profile" element={<TeacherProfile />} />
          <Route path="settings" element={<TeacherSettings />} />
        </Route>

        {/* Route cho Admin */}
        <Route
          path="/admin"
          element={
            <PrivateRoute requiredRole="ROLE_ADMIN">
              <AdminLayout />
            </PrivateRoute>
          }
        >
          <Route index element={<Navigate to="overview" replace />} />
          <Route path="overview" element={<AdminOverview />} />
          <Route path="tickets" element={<AdminRentTickets />} />
          <Route path="chemicals" element={<AdminChemicals />} />
          <Route path="devices" element={<AdminDevices />} />
          <Route path="users" element={<AdminUsers />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
