import React from "react";
import {
  Calendar,
  MapPin,
  Eye,
  Clock,
  TestTube2,
  CheckCircle2,
  AlertTriangle,
  XCircle,
} from "lucide-react";
import "./TicketList.css";

const TicketList = ({ tickets, onTicketClick }) => {
  const getStatusBadge = (status) => {
    const iconSize = 14;
    const strokeWidth = 2.5;
    switch (status) {
      case "PENDING":
        return (
          <span className="status-badge pending">
            <Clock size={iconSize} strokeWidth={strokeWidth} /> Chờ duyệt
          </span>
        );
      case "APPROVED":
        return (
          <span className="status-badge approved">
            <TestTube2 size={iconSize} strokeWidth={strokeWidth} /> Đang mượn
          </span>
        );
      case "RETURNED":
        return (
          <span className="status-badge returned">
            <CheckCircle2 size={iconSize} strokeWidth={strokeWidth} /> Đã trả
          </span>
        );
      case "RETURNED_WITH_ISSUES":
        return (
          <span className="status-badge issue">
            <AlertTriangle size={iconSize} strokeWidth={strokeWidth} /> Có vấn
            đề
          </span>
        );
      case "REJECTED":
        return (
          <span className="status-badge issue">
            <XCircle size={iconSize} strokeWidth={strokeWidth} /> Từ chối
          </span>
        );
      default:
        return <span>{status}</span>;
    }
  };

  return (
    <div className="table-card">
      <div className="table-responsive">
        <table className="custom-table">
          <thead>
            <tr>
              <th>Mã phiếu</th>
              <th>Phòng thí nghiệm</th>
              <th>Thời gian mượn</th>
              <th>Hẹn trả</th>
              <th>Trạng thái</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {tickets.length === 0 ? (
              <tr>
                <td
                  colSpan="6"
                  style={{
                    textAlign: "center",
                    padding: "40px",
                    color: "#9ca3af",
                  }}
                >
                  📭 Chưa có dữ liệu phiếu mượn nào
                </td>
              </tr>
            ) : (
              tickets.map((ticket) => (
                <tr key={ticket.ticketId}>
                  <td
                    style={{ fontWeight: "600", color: "var(--primary-color)" }}
                  >
                    #{ticket.ticketId}
                  </td>
                  <td>
                    <div className="cell-flex">
                      <MapPin size={16} className="text-muted-icon" />{" "}
                      {ticket.roomName}
                    </div>
                  </td>
                  <td>
                    <div className="cell-flex">
                      <Calendar size={16} className="text-muted-icon" />{" "}
                      {new Date(ticket.borrowDate).toLocaleDateString("vi-VN")}
                    </div>
                  </td>
                  <td>
                    {new Date(ticket.expectedReturnDate).toLocaleDateString(
                      "vi-VN"
                    )}
                  </td>
                  <td>{getStatusBadge(ticket.status)}</td>
                  <td>
                    <button
                      className="btn-detail-sm"
                      onClick={() => onTicketClick(ticket)}
                    >
                      <Eye size={14} /> Chi tiết
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TicketList;
