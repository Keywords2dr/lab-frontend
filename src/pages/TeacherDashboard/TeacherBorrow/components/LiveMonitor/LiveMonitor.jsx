import React, { useState } from "react";
import {
  Radio,
  Maximize2,
  Loader,
  ListFilter,
  Clock,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import api from "../../../../../services/api";
import "./LiveMonitor.css";

const LiveMonitor = ({ logs }) => {
  const [showAllModal, setShowAllModal] = useState(false);
  const [allTickets, setAllTickets] = useState([]);
  const [loadingAll, setLoadingAll] = useState(false);
  const [filterStatus, setFilterStatus] = useState("ALL");

  const formatTime = (dateData) => {
    if (!dateData) return "Vừa xong";
    let date;
    if (Array.isArray(dateData)) {
      const [year, month, day, hour = 0, minute = 0, second = 0] = dateData;
      date = new Date(year, month - 1, day, hour, minute, second);
    } else {
      date = new Date(dateData);
    }
    return date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const translateStatus = (status) => {
    switch (status) {
      case "PENDING":
        return { text: "CHỜ DUYỆT", class: "status-pending" };
      case "APPROVED":
        return { text: "ĐANG MƯỢN", class: "status-approved" };
      case "REJECTED":
        return { text: "TỪ CHỐI", class: "status-rejected" };
      case "RETURNED":
        return { text: "ĐÃ TRẢ", class: "status-returned" };
      case "RETURNED_WITH_ISSUES":
        return { text: "CÓ SỰ CỐ", class: "status-issue" };
      default:
        return { text: status, class: "" };
    }
  };

  const getDisplayName = (name) => {
    return name || "Người dùng hệ thống";
  };

  const handleViewAll = () => {
    setShowAllModal(true);
    fetchData("ALL");
  };

  const fetchData = async (status) => {
    setLoadingAll(true);
    setFilterStatus(status);
    try {
      const response = await api.get("/rent/monitor-all", {
        params: { status: status === "ALL" ? "" : status },
      });
      let filtered = response.data;
      if (status === "ALL") {
        filtered = response.data.filter((t) =>
          ["PENDING", "APPROVED"].includes(t.status)
        );
      }
      setAllTickets(filtered);
    } catch (error) {
      console.error("Lỗi tải danh sách:", error);
    } finally {
      setLoadingAll(false);
    }
  };

  const filterOptions = [
    { key: "ALL", label: "Tất cả (Active)", icon: <ListFilter size={16} /> },
    { key: "PENDING", label: "Chờ duyệt", icon: <Clock size={16} /> },
    { key: "APPROVED", label: "Đang mượn", icon: <CheckCircle2 size={16} /> },
  ];

  return (
    <>
      <div className="dashboard-card monitor-list-wrapper">
        <div className="card-header">
          <h3>
            <Radio size={20} color="#ef4444" className="blink-icon" /> Hoạt Động
            (Live)
          </h3>
          <button
            className="view-all-btn"
            onClick={handleViewAll}
            title="Xem tất cả phòng đang mượn"
          >
            <Maximize2 size={14} /> Xem tất cả
          </button>
        </div>

        <div className="log-scroll">
          {logs && logs.length > 0 ? (
            logs.slice(0, 5).map((log) => {
              const statusInfo = translateStatus(log.status);
              return (
                <div key={log.ticketId} className="row-log">
                  <div className="log-info">
                    <div className="room-name">{log.roomName}</div>
                    <div className="teacher-name">
                      {getDisplayName(log.borrowerName)}
                    </div>
                  </div>
                  <div className="log-status">
                    <span className={`status-tag ${statusInfo.class}`}>
                      {statusInfo.text}
                    </span>
                    <div className="log-time">
                      {formatTime(log.createdDate || log.borrowDate)}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="empty-msg">Hiện chưa có phòng nào đang được mượn.</p>
          )}
        </div>
      </div>

      {showAllModal && (
        <div
          className="modal-overlay-custom"
          onClick={() => setShowAllModal(false)}
        >
          <div
            className="modal-content-custom"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header-custom">
              <h3>📋 Danh sách phòng đang hoạt động</h3>
              <button
                className="btn-close-modal"
                onClick={() => setShowAllModal(false)}
              >
                <XCircle size={24} />
              </button>
            </div>

            <div className="filter-container">
              <div className="filter-pill-bg">
                {filterOptions.map((option) => (
                  <button
                    key={option.key}
                    className={`filter-tab ${
                      filterStatus === option.key ? "active" : ""
                    }`}
                    onClick={() => fetchData(option.key)}
                  >
                    {option.icon}
                    <span>{option.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="modal-body-custom">
              {loadingAll ? (
                <div className="loading-state">
                  <Loader className="spin" /> Đang tải dữ liệu...
                </div>
              ) : allTickets.length === 0 ? (
                <div className="empty-state-modal">
                  <p>Không có dữ liệu.</p>
                </div>
              ) : (
                <table className="full-width-table">
                  <thead>
                    <tr>
                      <th>Phòng</th>
                      <th>Người mượn</th>
                      <th>Trạng thái</th>
                      <th>Thời gian</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allTickets.map((t) => {
                      const statusInfo = translateStatus(t.status);
                      return (
                        <tr key={t.ticketId}>
                          <td>
                            <strong>{t.roomName}</strong>
                          </td>
                          <td>{getDisplayName(t.borrowerName)}</td>
                          <td>
                            <span className={`status-tag ${statusInfo.class}`}>
                              {statusInfo.text}
                            </span>
                          </td>
                          <td className="time-col">
                            {formatTime(t.createdDate || t.borrowDate)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default LiveMonitor;
