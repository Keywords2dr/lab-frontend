import React from "react";
import { X, Calendar, MapPin, Package, Loader } from "lucide-react";
import "./TicketDetailModal.css";

const TicketDetailModal = ({ ticket, onClose, loading }) => {
  if (!ticket && !loading) return null;

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
      default:
        return status;
    }
  };

  return (
    <div className="modal-overlay-detail" onClick={onClose}>
      <div
        className="modal-content-detail"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="detail-header">
          <h3>
            {loading ? "Đang tải..." : `📝 Chi tiết phiếu #${ticket?.ticketId}`}
          </h3>
          <button onClick={onClose} className="btn-close">
            <X />
          </button>
        </div>

        {/* Body */}
        <div className="detail-body">
          {loading ? (
            <div className="loading-box">
              <Loader className="spin" />
            </div>
          ) : (
            <>
              {/* Thông tin chung */}
              <div className="ticket-info-grid">
                <div className="info-item">
                  <MapPin size={16} color="#64748b" />
                  <div>
                    <span className="label">Phòng:</span>
                    <strong>{ticket.room?.roomName}</strong>
                  </div>
                </div>
                <div className="info-item">
                  <Calendar size={16} color="#64748b" />
                  <div>
                    <span className="label">Ngày mượn:</span>
                    <strong>{formatDate(ticket.borrowDate)}</strong>
                  </div>
                </div>
                <div className="info-item">
                  <span className="label">Trạng thái:</span>
                  <span className={`status-badge ${ticket.status}`}>
                    {translateStatus(ticket.status)}
                  </span>
                </div>
              </div>

              <hr className="divider" />

              {/* Danh sách vật tư */}
              <h4 className="section-title">
                <Package size={18} /> Danh sách vật tư
              </h4>
              <table className="detail-table">
                <thead>
                  <tr>
                    <th>Tên vật tư</th>
                    <th style={{ textAlign: "center" }}>Số lượng</th>
                    <th>Đơn vị</th>
                  </tr>
                </thead>
                <tbody>
                  {ticket.details?.map((d) => (
                    <tr key={d.detailId}>
                      <td>{d.item?.name}</td>
                      <td style={{ textAlign: "center", fontWeight: "bold" }}>
                        {d.quantityBorrowed}
                      </td>
                      <td style={{ color: "#64748b" }}>{d.item?.unit}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default TicketDetailModal;
