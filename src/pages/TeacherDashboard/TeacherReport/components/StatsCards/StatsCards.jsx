import React from "react";
import "./StatsCards.css";

const StatsCards = ({ tickets }) => {
  return (
    <div className="stats-grid">
      <div className="stat-card">
        <span className="stat-label">Tổng phiếu</span>
        <span className="stat-value">{tickets.length}</span>
      </div>
      <div className="stat-card">
        <span className="stat-label">Đang chờ duyệt</span>
        <span className="stat-value" style={{ color: "var(--status-pending)" }}>
          {tickets.filter((t) => t.status === "PENDING").length}
        </span>
      </div>
      <div className="stat-card">
        <span className="stat-label">Đang mượn</span>
        <span
          className="stat-value"
          style={{ color: "var(--status-approved)" }}
        >
          {tickets.filter((t) => t.status === "APPROVED").length}
        </span>
      </div>
      <div className="stat-card">
        <span className="stat-label">Có sự cố</span>
        <span className="stat-value" style={{ color: "var(--status-issue)" }}>
          {tickets.filter((t) => t.status === "RETURNED_WITH_ISSUES").length}
        </span>
      </div>
    </div>
  );
};

export default StatsCards;
