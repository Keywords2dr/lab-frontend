import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { BarChart4, RotateCcw, ChevronLeft, ChevronRight } from "lucide-react";
import api from "../../../services/api";
import "./TeacherReport.css";

import StatsCards from "./components/StatsCards/StatsCards";
import ReportFilters from "./components/ReportFilters/ReportFilters";
import TicketList from "./components/TicketList/TicketList";
import TicketDetailModal from "./components/TicketDetailModal/TicketDetailModal";

const ITEMS_PER_PAGE = 5;

const TeacherReport = () => {
  const [tickets, setTickets] = useState([]);
  const [filteredTickets, setFilteredTickets] = useState([]);
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const formatDateTime = (dateData) => {
    if (!dateData) return null;
    if (Array.isArray(dateData)) {
      const [y, m, d, h, min] = dateData;
      return new Date(y, m - 1, d, h, min).toISOString();
    }
    return dateData;
  };

  const fetchTickets = async () => {
    setIsLoading(true);
    try {
      const response = await api.get("/rent/history");
      const formattedList = response.data.map((t) => ({
        ...t,
        borrowDate: formatDateTime(t.borrowDate),
        expectedReturnDate: formatDateTime(t.expectedReturnDate),
      }));
      setTickets(formattedList);
    } catch (error) {
      console.error(error);
      Swal.fire("Lỗi", "Không thể tải lịch sử mượn trả.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  useEffect(() => {
    let result = tickets;
    if (filterStatus !== "ALL") {
      result = tickets.filter((t) => t.status === filterStatus);
    }
    setFilteredTickets(result);
    setCurrentPage(1);
  }, [filterStatus, tickets]);

  const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
  const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
  const currentTickets = filteredTickets.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(filteredTickets.length / ITEMS_PER_PAGE);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleViewDetail = async (ticketShort) => {
    try {
      const res = await api.get(`/rent/${ticketShort.ticketId}`);
      const data = res.data; 

      const normalizedTicket = {
        ...data,

        roomName: data.roomName,
        borrowerName: data.borrowerName,

        borrowDate: formatDateTime(data.borrowDate),
        expectedReturnDate: formatDateTime(data.expectedReturnDate),

        details: data.details
          ? data.details.map((d) => ({
              itemId: d.item ? d.item.itemId : d.itemId,
              itemName: d.item ? d.item.name : d.itemName,
              quantityBorrowed: d.quantityBorrowed,
              returnStatus: d.returnStatus,
            }))
          : [],
      };

      setSelectedTicket(normalizedTicket);
    } catch (error) {
      console.error("Lỗi tải chi tiết:", error);
      Swal.fire("Lỗi", "Không thể tải thông tin chi tiết.", "error");
    }
  };

  // 3. Xử lý trả đồ
  const handleReturn = async (payload) => {
    try {
      await api.post("/rent/return", payload);
      Swal.fire({
        title: "Thành công!",
        text: "Đã cập nhật trả đồ thành công.",
        icon: "success",
        confirmButtonColor: "#4f46e5",
      });
      setSelectedTicket(null);
      fetchTickets();
    } catch (error) {
      console.error(error);
      const errorMsg = error.response?.data?.message || "Có lỗi xảy ra.";
      Swal.fire({ icon: "error", title: "Thất bại", text: errorMsg });
    }
  };

  return (
    <div className="teacher-report-container">
      <div className="report-header">
        <h2>
          <BarChart4 color="var(--primary-color)" size={28} /> Báo cáo mượn trả
        </h2>
        <button
          className="btn-refresh"
          onClick={fetchTickets}
          disabled={isLoading}
        >
          <RotateCcw size={16} className={isLoading ? "spin-anim" : ""} />
          {isLoading ? "Đang tải..." : "Làm mới"}
        </button>
      </div>

      <StatsCards tickets={tickets} />

      <ReportFilters
        currentFilter={filterStatus}
        onFilterChange={setFilterStatus}
      />

      <TicketList tickets={currentTickets} onTicketClick={handleViewDetail} />

      {/* Phân trang */}
      {filteredTickets.length > ITEMS_PER_PAGE && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "16px",
            marginTop: "20px",
            padding: "10px",
          }}
        >
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            style={{
              padding: "8px 12px",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              background: currentPage === 1 ? "#f3f4f6" : "white",
              cursor: currentPage === 1 ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
            }}
          >
            <ChevronLeft size={20} /> Trước
          </button>

          <span style={{ fontWeight: 600, color: "#374151" }}>
            Trang {currentPage} / {totalPages}
          </span>

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            style={{
              padding: "8px 12px",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              background: currentPage === totalPages ? "#f3f4f6" : "white",
              cursor: currentPage === totalPages ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
            }}
          >
            Sau <ChevronRight size={20} />
          </button>
        </div>
      )}

      {selectedTicket && (
        <TicketDetailModal
          ticket={selectedTicket}
          onClose={() => setSelectedTicket(null)}
          onSubmitReturn={handleReturn}
        />
      )}
    </div>
  );
};

export default TeacherReport;
