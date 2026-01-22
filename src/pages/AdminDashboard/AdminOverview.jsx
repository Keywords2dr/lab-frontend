import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check } from "lucide-react";
import api from "../../services/api";
import "./AdminDashboard.css";

const AdminOverview = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    pendingTicketsCount: 0,
    lowStockChemicalsCount: 0,
    totalAssetsCount: 0,
    activeUsersCount: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const response = await api.get("/admin/dashboard/stats");
      setStats(response.data);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="admin-loading">Đang tải...</div>;
  }

  return (
    <div>
      {/* Thống kê toàn trường */}
      <div className="admin-stats">
        <div className="stat-box">
          <h3>{stats.pendingTicketsCount}</h3>
          <p>Yêu cầu chờ duyệt</p>
        </div>
        <div className="stat-box">
          <h3>{stats.lowStockChemicalsCount}</h3>
          <p>Hóa chất sắp hết</p>
        </div>
        <div className="stat-box">
          <h3>{stats.totalAssetsCount}</h3>
          <p>Tổng thiết bị</p>
        </div>
        <div className="stat-box">
          <h3>{stats.activeUsersCount}</h3>
          <p>Người dùng hoạt động</p>
        </div>
      </div>


      {/* Thông tin nhanh */}
      <div className="admin-form-container" style={{ marginTop: "24px" }}>
        <h3>Thông tin hệ thống</h3>
        <p style={{ margin: "8px 0", color: "#495057", lineHeight: "1.7", fontSize: "15px" }}>
          Chào mừng đến với trang quản trị LabLab. Sử dụng menu bên trái để điều hướng đến các chức năng quản lý.
        </p>
      </div>
    </div>
  );
};

export default AdminOverview;

