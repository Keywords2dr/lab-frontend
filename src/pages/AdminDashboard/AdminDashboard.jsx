import React from "react";
import { useNavigate } from "react-router-dom";
import "./AdminDashboard.css";

const AdminDashboard = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className="admin-container">
      {/* Sidebar Tối */}
      <aside className="admin-sidebar">
        <div className="admin-brand">🛡️ LabLab ADMIN</div>
        <div className="admin-menu-item active">📊 Tổng quan hệ thống</div>
        <div className="admin-menu-item">✅ Duyệt phiếu mượn</div>
        <div className="admin-menu-item">🧪 Quản lý Hóa chất</div>
        <div className="admin-menu-item">🔬 Quản lý Thiết bị</div>
        <div className="admin-menu-item">👥 Quản lý Người dùng</div>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        <div className="admin-header">
          <h2>Quản Trị Hệ Thống</h2>
          <button onClick={handleLogout} className="btn-admin-logout">
            Đăng xuất
          </button>
        </div>

        {/* Thống kê toàn trường */}
        <div className="admin-stats">
          <div className="stat-box">
            <h3>15</h3>
            <p>Yêu cầu chờ duyệt</p>
          </div>
          <div className="stat-box">
            <h3 style={{ color: "red" }}>3</h3>
            <p>Hóa chất sắp hết</p>
          </div>
          <div className="stat-box">
            <h3>120</h3>
            <p>Tổng thiết bị</p>
          </div>
          <div className="stat-box">
            <h3>8</h3>
            <p>Giảng viên hoạt động</p>
          </div>
        </div>

        {/* Bảng Duyệt Yêu Cầu */}
        <div
          style={{ background: "white", padding: "20px", borderRadius: "8px" }}
        >
          <h3>📋 Yêu cầu cần xử lý</h3>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              marginTop: "15px",
            }}
          >
            <thead style={{ background: "#f1f5f9" }}>
              <tr>
                <th style={{ padding: "10px", textAlign: "left" }}>
                  Người mượn
                </th>
                <th style={{ padding: "10px", textAlign: "left" }}>Phòng</th>
                <th style={{ padding: "10px", textAlign: "left" }}>Vật tư</th>
                <th style={{ padding: "10px", textAlign: "left" }}>
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ padding: "10px", borderBottom: "1px solid #eee" }}>
                  GV. Trần Thị Hóa
                </td>
                <td>Phòng 101</td>
                <td>Axit H2SO4 (500ml)</td>
                <td>
                  <button className="btn-approve">Duyệt</button>
                  <button className="btn-reject">Từ chối</button>
                </td>
              </tr>
              <tr>
                <td style={{ padding: "10px", borderBottom: "1px solid #eee" }}>
                  GV. Lê Vật Lý
                </td>
                <td>Phòng 205</td>
                <td>Máy đo quang phổ</td>
                <td>
                  <button className="btn-approve">Duyệt</button>
                  <button className="btn-reject">Từ chối</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
