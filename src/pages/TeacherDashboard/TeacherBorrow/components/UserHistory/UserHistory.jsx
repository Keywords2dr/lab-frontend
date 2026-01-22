import React, { useState, useEffect, useMemo } from "react";
import {
  History,
  Maximize2,
  X,
  Loader,
  ListFilter,
  Clock,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import api from "../../../../../services/api";
import "./UserHistory.css";
import TicketDetailModal from "./TicketDetailModal";

const UserHistory = ({ refreshTrigger }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showListModal, setShowListModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState("ALL");

  const [selectedTicket, setSelectedTicket] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const fetchHistory = async () => {
    try {
      if (history.length === 0) setLoading(true);
      const response = await api.get("/rent/history");
      setHistory(response.data);
    } catch (error) {
      console.error("Lỗi tải lịch sử:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [refreshTrigger]);

  const handleViewDetail = async (ticketId) => {
    setSelectedTicket({});
    setLoadingDetail(true);
    try {
      const response = await api.get(`/rent/${ticketId}`);
      setSelectedTicket(response.data);
    } catch (error) {
      console.error("Lỗi tải chi tiết:", error);
      setSelectedTicket(null);
    } finally {
      setLoadingDetail(false);
    }
  };

  const filteredHistory = useMemo(() => {
    if (filterStatus === "ALL") return history;
    return history.filter((item) => item.status === filterStatus);
  }, [history, filterStatus]);

  const formatDate = (dateData) => {
    if (!dateData) return "";
    let date;
    if (Array.isArray(dateData)) {
      const [year, month, day, hour = 0, minute = 0] = dateData;
      date = new Date(year, month - 1, day, hour, minute);
    } else {
      date = new Date(dateData);
    }
    return date.toLocaleString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const translateStatus = (status) => {
    switch (status) {
      case "PENDING":
        return "Chờ duyệt";
      case "APPROVED":
        return "Đã duyệt";
      case "REJECTED":
        return "Từ chối";
      case "RETURNED":
        return "Đã trả";
      case "RETURNED_WITH_ISSUES":
        return "Đã trả (Có lỗi)";
      default:
        return status;
    }
  };

  const filterOptions = [
    { key: "ALL", label: "Tất cả", icon: <ListFilter size={16} /> },
    { key: "PENDING", label: "Chờ duyệt", icon: <Clock size={16} /> },
    { key: "APPROVED", label: "Đã duyệt", icon: <CheckCircle2 size={16} /> },
    { key: "REJECTED", label: "Từ chối", icon: <XCircle size={16} /> },
  ];

  return (
    <>
      <div className="dashboard-card history-container">
        <div className="card-header">
          <h3>
            <History size={20} /> Lịch Sử Của Tôi
          </h3>
          <button
            className="view-all-btn"
            onClick={() => setShowListModal(true)}
          >
            <Maximize2 size={14} /> Xem tất cả
          </button>
        </div>

        <div className="log-scroll">
          {loading ? (
            <div className="loading-state">
              <Loader className="spin" size={18} />
            </div>
          ) : history.length === 0 ? (
            <p className="empty-msg">Bạn chưa có phiếu mượn nào.</p>
          ) : (
            history.slice(0, 5).map((item) => (
              <div
                key={item.ticketId}
                className="row-log clickable"
                onClick={() => handleViewDetail(item.ticketId)}
              >
                <div className="log-info">
                  <div className="room-name">{item.roomName}</div>
                  <div className="log-time">{formatDate(item.borrowDate)}</div>
                </div>
                <div className="log-status">
                  <span className={`status-badge ${item.status}`}>
                    {translateStatus(item.status)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {showListModal && (
        <div
          className="modal-overlay-custom"
          onClick={() => setShowListModal(false)}
        >
          <div
            className="modal-content-custom"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header-custom">
              <h3>📜 Lịch sử mượn trả</h3>
              <button
                onClick={() => setShowListModal(false)}
                className="close-btn-custom"
              >
                <X size={20} />
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
                    onClick={() => setFilterStatus(option.key)}
                  >
                    {option.icon} <span>{option.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="modal-body-custom">
              <table className="full-width-table hover-table">
                <thead>
                  <tr>
                    <th>Mã</th>
                    <th>Phòng</th>
                    <th>Ngày mượn</th>
                    <th>Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredHistory.map((t) => (
                    <tr
                      key={t.ticketId}
                      onClick={() => handleViewDetail(t.ticketId)}
                      style={{ cursor: "pointer" }}
                    >
                      <td style={{ color: "#64748b" }}>#{t.ticketId}</td>
                      <td>
                        <strong>{t.roomName}</strong>
                      </td>
                      <td className="time-col">{formatDate(t.borrowDate)}</td>
                      <td>
                        <span className={`status-badge ${t.status}`}>
                          {translateStatus(t.status)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {selectedTicket && (
        <TicketDetailModal
          ticket={selectedTicket}
          loading={loadingDetail}
          onClose={() => setSelectedTicket(null)}
        />
      )}
    </>
  );
};

export default UserHistory;
