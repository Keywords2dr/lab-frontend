import React, { useEffect, useState } from "react";
import api from "../../services/api";
import "./AdminDashboard.css";

const AdminRentTickets = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("PENDING");

  useEffect(() => {
    fetchTickets();
  }, [filter]);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const response = await api.get(
        `/admin/tickets${filter ? `?status=${filter}` : ""}`,
      );
      setTickets(response.data);
    } catch (error) {
      console.error("Error fetching tickets:", error);
      let errorMessage = "Không thể tải danh sách phiếu mượn!";
      if (error.response && error.response.data) {
        errorMessage =
          error.response.data.message ||
          error.response.data.error ||
          errorMessage;
      }
      alert(errorMessage);
      setTickets([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (ticketId, newStatus) => {
    const actionText = newStatus === "APPROVED" ? "duyệt" : "từ chối";
    if (!window.confirm(`Bạn có chắc muốn ${actionText} phiếu mượn này?`)) {
      return;
    }

    try {
      await api.post(`/rent/review/${ticketId}/${newStatus}`);
      alert(
        newStatus === "APPROVED"
          ? "Đã duyệt phiếu thành công!"
          : "Đã từ chối phiếu!",
      );
      fetchTickets();
    } catch (error) {
      console.error("Error updating ticket status:", error);
      let errorMessage = `Không thể ${actionText} phiếu mượn!`;
      if (error.response && error.response.data) {
        errorMessage =
          error.response.data.message ||
          error.response.data.error ||
          errorMessage;
      }
      alert(errorMessage);
    }
  };

  if (loading) {
    return <div className="admin-loading">Đang tải dữ liệu...</div>;
  }

  return (
    <div className="admin-tickets-container">
      <div className="admin-search-bar">
        <button
          className={`admin-button ${filter === "PENDING" ? "admin-button-primary" : ""}`}
          onClick={() => setFilter("PENDING")}
        >
          Chờ duyệt
        </button>
        <button
          className={`admin-button ${filter === "APPROVED" ? "admin-button-primary" : ""}`}
          onClick={() => setFilter("APPROVED")}
        >
          Đã duyệt
        </button>
        <button
          className={`admin-button ${filter === "REJECTED" ? "admin-button-primary" : ""}`}
          onClick={() => setFilter("REJECTED")}
        >
          Đã từ chối
        </button>
        <button
          className={`admin-button ${filter === "" ? "admin-button-primary" : ""}`}
          onClick={() => setFilter("")}
        >
          Tất cả
        </button>
      </div>

      <div className="admin-table-container">
        <div className="admin-section-header">
          <h3>Danh sách phiếu mượn</h3>
        </div>
        {tickets.length === 0 ? (
          <div className="admin-empty">
            <p>Không tìm thấy phiếu mượn nào.</p>
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Người mượn</th>
                <th>Phòng Lab</th>
                <th>Vật tư mượn</th>
                <th>Ngày tạo</th>
                <th>Trạng thái</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {tickets.map((ticket) => (
                <tr key={ticket.ticketId}>
                  <td style={{ fontWeight: "600" }}>
                    {ticket.borrowerName || "N/A"}
                  </td>
                  <td>{ticket.roomName || "N/A"}</td>
                  <td>
                    <div className="item-summary-text">
                      {ticket.itemSummary || "Không có chi tiết"}
                    </div>
                  </td>
                  <td>
                    {ticket.createdDate
                      ? new Date(ticket.createdDate).toLocaleString("vi-VN")
                      : "N/A"}
                  </td>
                  <td>
                    <span
                      className={`admin-badge ${
                        ticket.status === "APPROVED"
                          ? "admin-badge-success"
                          : ticket.status === "REJECTED"
                            ? "admin-badge-error"
                            : "admin-badge-warning"
                      }`}
                    >
                      {ticket.status === "APPROVED"
                        ? "Đã duyệt"
                        : ticket.status === "REJECTED"
                          ? "Đã từ chối"
                          : "Chờ duyệt"}
                    </span>
                  </td>
                  <td>
                    {ticket.status === "PENDING" ? (
                      <div className="admin-actions-cell">
                        <button
                          className="btn-approve"
                          onClick={() =>
                            handleUpdateStatus(ticket.ticketId, "APPROVED")
                          }
                        >
                          Duyệt
                        </button>
                        <button
                          className="btn-reject"
                          onClick={() =>
                            handleUpdateStatus(ticket.ticketId, "REJECTED")
                          }
                        >
                          Từ chối
                        </button>
                      </div>
                    ) : (
                      <span style={{ color: "#888", fontSize: "0.9rem" }}>
                        N/A
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AdminRentTickets;
