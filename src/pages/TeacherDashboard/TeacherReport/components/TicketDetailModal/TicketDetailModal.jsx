import React, { useState } from "react";
import {
  X,
  Calendar,
  MapPin,
  Package,
  CheckCircle2,
  User,
  FileText,
  Hash,
  ClipboardList,
  AlertCircle,
  Box,
} from "lucide-react";
import "./TicketDetailModal.css";

const TicketDetailModal = ({ ticket, onClose, onSubmitReturn }) => {
  const [returnData, setReturnData] = useState(() => {
    const initialData = {};
    if (ticket && Array.isArray(ticket.details)) {
      ticket.details.forEach((item) => {
        initialData[item.itemId] = {
          quantityReturned: item.quantityBorrowed,
          condition: "GOOD",
          note: "",
        };
      });
    }
    return initialData;
  });

  const handleInputChange = (itemId, field, value) => {
    setReturnData((prev) => ({
      ...prev,
      [itemId]: { ...prev[itemId], [field]: value },
    }));
  };

  const handleSubmit = () => {
    const payload = {
      ticketId: ticket.ticketId,
      generalNote: "Giáo viên xác nhận trả đồ qua hệ thống",
      items: ticket.details.map((detail) => ({
        itemId: detail.itemId,
        quantityReturned: Number(
          returnData[detail.itemId]?.quantityReturned || 0
        ),
        condition: returnData[detail.itemId]?.condition || "GOOD",
        note: returnData[detail.itemId]?.note || "",
      })),
    };
    onSubmitReturn(payload);
  };

  if (!ticket) return null;
  const isReturnable = ticket.status === "APPROVED";
  const iconColor = "#6b7280";

  return (
    <div className="modal-overlay">
      <div
        className="modal-content-custom"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="modal-header">
          <h3>
            <FileText size={20} color="var(--primary-color)" />
            Phiếu mượn #{ticket.ticketId}
          </h3>
          <button className="btn-close" onClick={onClose} title="Đóng">
            <X size={24} color={iconColor} />
          </button>
        </div>

        {/* Body */}
        <div className="modal-body">
          {/* Thông tin chung */}
          <div className="info-grid">
            <div className="info-item">
              <label>Phòng thí nghiệm</label>
              <p>
                <MapPin size={16} color={iconColor} /> {ticket.roomName}
              </p>
            </div>
            <div className="info-item">
              <label>Ngày mượn</label>
              <p>
                <Calendar size={16} color={iconColor} />{" "}
                {new Date(ticket.borrowDate).toLocaleString("vi-VN")}
              </p>
            </div>
            <div className="info-item">
              <label>Người mượn</label>
              <p>
                <User size={16} color={iconColor} />{" "}
                {ticket.borrowerName || "Sinh viên"}
              </p>
            </div>
            <div className="info-item">
              <label>Trạng thái</label>
              <p
                style={{
                  color: isReturnable ? "var(--status-approved)" : iconColor,
                }}
              >
                {isReturnable ? "Đang cần trả đồ" : ticket.status}
              </p>
            </div>
          </div>

          <h4 className="section-title">
            <Package size={18} /> Danh sách vật tư cần trả
          </h4>

          {/* Danh sách thẻ (Card List) */}
          <div className="form-list-container">
            {ticket.details && ticket.details.length > 0 ? (
              ticket.details.map((detail) => (
                <div key={detail.itemId} className="item-card">
                  {/* Header của thẻ */}
                  <div className="item-card-header">
                    <div className="item-name">
                      <Box
                        size={20}
                        className="text-gray-400"
                        color="#6b7280"
                      />
                      {detail.itemName}
                    </div>
                    <div className="borrowed-badge">
                      Mượn: {detail.quantityBorrowed}
                    </div>
                  </div>

                  {isReturnable ? (
                    <div className="item-form-grid">
                      {/* Cột 1: Số lượng trả */}
                      <div>
                        <label className="input-label">SL Trả thực tế</label>
                        <div className="input-group">
                          <Hash size={16} className="input-icon" />
                          <input
                            type="number"
                            min="0"
                            max={detail.quantityBorrowed}
                            className="form-input"
                            value={
                              returnData[detail.itemId]?.quantityReturned || 0
                            }
                            onChange={(e) =>
                              handleInputChange(
                                detail.itemId,
                                "quantityReturned",
                                e.target.value
                              )
                            }
                          />
                        </div>
                      </div>

                      {/* Cột 2: Tình trạng & Ghi chú */}
                      <div className="condition-section">
                        <div>
                          <label className="input-label">
                            Tình trạng vật tư
                          </label>
                          <div className="input-group">
                            <ClipboardList size={16} className="input-icon" />
                            <select
                              className="form-select"
                              value={
                                returnData[detail.itemId]?.condition || "GOOD"
                              }
                              onChange={(e) =>
                                handleInputChange(
                                  detail.itemId,
                                  "condition",
                                  e.target.value
                                )
                              }
                            >
                              <option value="GOOD">✅ Tốt / Trả đủ</option>
                              <option value="CONSUMED">
                                🧪 Dùng hết (Hóa chất)
                              </option>
                              <option value="BROKEN">🔨 Hư hỏng</option>
                              <option value="LOST">🚫 Làm mất</option>
                            </select>
                          </div>
                        </div>

                        {returnData[detail.itemId]?.condition !== "GOOD" && (
                          <div className="note-input-wrapper">
                            <AlertCircle size={16} className="note-icon" />
                            <input
                              className="note-input"
                              placeholder="Ghi chú chi tiết lỗi hoặc mất..."
                              value={returnData[detail.itemId]?.note || ""}
                              onChange={(e) =>
                                handleInputChange(
                                  detail.itemId,
                                  "note",
                                  e.target.value
                                )
                              }
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        background: "#f9fafb",
                        padding: "12px",
                        borderRadius: "8px",
                        border: "1px solid #e5e7eb",
                      }}
                    >
                      <span
                        style={{
                          color: "#6b7280",
                          fontSize: "0.9rem",
                          fontWeight: 500,
                        }}
                      >
                        Trạng thái trả:
                      </span>
                      <span
                        style={{
                          background: "#e5e7eb",
                          color: "#374151",
                          padding: "4px 10px",
                          borderRadius: "20px",
                          fontSize: "0.85rem",
                          fontWeight: 600,
                        }}
                      >
                        {detail.returnStatus || "N/A"}
                      </span>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p
                style={{
                  textAlign: "center",
                  color: "#6b7280",
                  padding: "20px",
                }}
              >
                Không có vật tư nào trong phiếu này.
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button className="btn-refresh" onClick={onClose}>
            Đóng
          </button>
          {isReturnable && (
            <button className="btn-primary" onClick={handleSubmit}>
              <CheckCircle2 size={18} /> Xác nhận Trả
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TicketDetailModal;
