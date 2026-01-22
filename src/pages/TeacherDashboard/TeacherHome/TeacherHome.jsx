// src/pages/TeacherDashboard/TeacherHome.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Clock,
  FlaskConical,
  Calendar,
  CheckCircle2,
  Plus,
  BookOpen,
  AlertTriangle,
} from "lucide-react";
import "./TeacherHome.css";

const TeacherHome = () => {
  const navigate = useNavigate();
  const user = localStorage.getItem("user") || "GV";

  return (
    <>
      <div className="hero-section">
        <div className="hero-text">
          <h2>Xin chào, Giảng viên {user}! 👋</h2>
          <p>Chúc thầy/cô một ngày làm việc hiệu quả.</p>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon bg-orange">
            <Clock size={24} />
          </div>
          <div className="stat-info">
            <h3>02</h3>
            <p>Phiếu chờ duyệt</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon bg-blue">
            <FlaskConical size={24} />
          </div>
          <div className="stat-info">
            <h3>05</h3>
            <p>Đang mượn</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon bg-purple">
            <Calendar size={24} />
          </div>
          <div className="stat-info">
            <h3>22/12</h3>
            <p>Hạn trả sắp tới</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon bg-green">
            <CheckCircle2 size={24} />
          </div>
          <div className="stat-info">
            <h3>12</h3>
            <p>Đã hoàn thành</p>
          </div>
        </div>
      </div>

      <div className="dashboard-layout">
        <div className="section-card">
          <div className="section-header">
            <h3>📝 Phiếu mượn gần đây</h3>
            <span
              className="view-all"
              onClick={() => navigate("/teacher/report")}
            >
              Xem tất cả →
            </span>
          </div>
          <table className="custom-table">
            <thead>
              <tr>
                <th>Mã phiếu</th>
                <th>Bài thí nghiệm</th>
                <th>Ngày tạo</th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>#REQ-089</td>
                <td>Bài 5: Oxi hóa khử</td>
                <td>23/12/2025</td>
                <td>
                  <span className="badge badge-pending">Chờ duyệt</span>
                </td>
              </tr>
              <tr>
                <td>#REQ-088</td>
                <td>Bài 2: Điều chế Clo</td>
                <td>20/12/2025</td>
                <td>
                  <span className="badge badge-active">Đang mượn</span>
                </td>
              </tr>
              <tr>
                <td>#REQ-085</td>
                <td>Tổng hợp hữu cơ</td>
                <td>15/12/2025</td>
                <td>
                  <span className="badge badge-done">Đã trả</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="quick-actions">
          <div
            className="action-card-modern style-blue"
            onClick={() => navigate("/teacher/borrow")}
          >
            <div className="action-icon-box">
              <Plus size={24} />
            </div>
            <div className="action-content">
              <h4>Tạo phiếu mượn</h4>
              <p>Đăng ký thiết bị mới</p>
            </div>
            <div className="action-arrow">➜</div>
          </div>
          <div
            className="action-card-modern style-purple"
            onClick={() => navigate("/teacher/wiki")}
          >
            <div className="action-icon-box">
              <BookOpen size={24} />
            </div>
            <div className="action-content">
              <h4>Tra cứu Wiki</h4>
              <p>Xem tồn kho & vị trí</p>
            </div>
            <div className="action-arrow">➜</div>
          </div>
          <div
            className="action-card-modern style-orange"
            onClick={() => navigate("/teacher/report")}
          >
            <div className="action-icon-box">
              <AlertTriangle size={24} />
            </div>
            <div className="action-content">
              <h4>Báo cáo sự cố</h4>
              <p>Hỏng hóc hoặc mất mát</p>
            </div>
            <div className="action-arrow">➜</div>
          </div>
        </div>
      </div>
    </>
  );
};

export default TeacherHome;
