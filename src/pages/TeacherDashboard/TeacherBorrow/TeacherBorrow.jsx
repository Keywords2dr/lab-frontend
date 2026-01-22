import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import SockJS from "sockjs-client";
import Stomp from "stompjs";
import api from "../../../services/api";
import "./TeacherBorrow.css";
import InventorySection from "./components/InventorySection/InventorySection";
import BookingForm from "./components/BookingForm/BookingForm";
import LiveMonitor from "./components/LiveMonitor/LiveMonitor";
import UserHistory from "./components/UserHistory/UserHistory";

const TeacherBorrow = () => {
  const [inventory, setInventory] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [basket, setBasket] = useState([]);
  const [loading, setLoading] = useState(true);
  const [liveLogs, setLiveLogs] = useState([]);
  const [refreshHistoryTrigger, setRefreshHistoryTrigger] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [itemRes, roomRes, logRes] = await Promise.all([
          api.get("/items", { params: { fetchStock: true } }),
          api.get("/rooms/booking-available"),
          api.get("/rent/recent-activity"),
        ]);

        setInventory(itemRes.data);
        setRooms(roomRes.data);

        const activeLogs = logRes.data.filter((log) =>
          ["PENDING", "APPROVED"].includes(log.status),
        );
        setLiveLogs(activeLogs);
      } catch (error) {
        console.error(error);
        Swal.fire("Lỗi", "Không thể tải dữ liệu kho hoặc phòng!", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [refreshHistoryTrigger]);

  useEffect(() => {
    let stompClient = null;

    const connectWebSocket = () => {
      try {
        const socket = new SockJS("http://localhost:8080/springmvc/ws");
        stompClient = Stomp.over(socket);
        stompClient.debug = null;

        stompClient.connect(
          {},
          () => {
            stompClient.subscribe("/topic/rent-updates", (message) => {
              if (message.body) {
                try {
                  const newLog = JSON.parse(message.body);

                  setLiveLogs((prevLogs) => {
                    if (
                      [
                        "RETURNED",
                        "RETURNED_WITH_ISSUES",
                        "REJECTED",
                        "CANCELLED",
                      ].includes(newLog.status)
                    ) {
                      return prevLogs.filter(
                        (t) => t.ticketId !== newLog.ticketId,
                      );
                    }

                    const index = prevLogs.findIndex(
                      (log) => log.ticketId === newLog.ticketId,
                    );

                    if (index !== -1) {
                      const updatedLogs = [...prevLogs];
                      updatedLogs[index] = newLog;
                      return updatedLogs;
                    } else {
                      return [newLog, ...prevLogs].slice(0, 10);
                    }
                  });

                  setRefreshHistoryTrigger((prev) => prev + 1);
                } catch (e) {
                  console.error(e);
                }
              }
            });
          },
          (error) => {
            console.error(error);
          },
        );
      } catch (err) {
        console.error(err);
      }
    };

    connectWebSocket();

    return () => {
      if (stompClient && stompClient.connected) {
        stompClient.disconnect();
      }
    };
  }, []);

  const handleToggleBasket = (item) => {
    setBasket((prev) => {
      const exists = prev.find((i) => i.id === item.itemId);
      if (exists) {
        return prev.filter((i) => i.id !== item.itemId);
      } else {
        return [
          ...prev,
          {
            id: item.itemId,
            name: item.name,
            unit: item.unit,
            availableQty:
              item.availableQuantity !== undefined ? item.availableQuantity : 0,
            categoryType: item.categoryType,
            orderQty: 1,
          },
        ];
      }
    });
  };

  const clearAllBasket = () => {
    setBasket([]);
  };

  const handleCreateTicket = async (payload) => {
    try {
      Swal.fire({
        title: "Đang xử lý...",
        text: "Đang gửi yêu cầu mượn vật tư",
        didOpen: () => Swal.showLoading(),
        allowOutsideClick: false,
      });

      const response = await api.post("/rent/create", payload);

      Swal.fire({
        icon: "success",
        title: "Thành công!",
        text:
          response.data?.message || "Phiếu mượn đã được tạo và đang chờ duyệt.",
        confirmButtonColor: "#2563eb",
      });

      setBasket([]);
      const itemRes = await api.get("/items", { params: { fetchStock: true } });
      setInventory(itemRes.data);
      setRefreshHistoryTrigger((prev) => prev + 1);
    } catch (error) {
      console.error(error);

      let errorMsg = "Có lỗi xảy ra khi tạo phiếu mượn!";
      if (error.response && error.response.data) {
        const data = error.response.data;
        if (data.message) {
          errorMsg = data.message;
        } else if (typeof data === "object") {
          const firstKey = Object.keys(data)[0];
          if (firstKey && typeof data[firstKey] === "string") {
            errorMsg = data[firstKey];
          }
        }
      }

      Swal.fire({
        icon: "error",
        title: "Không thể tạo phiếu",
        text: errorMsg,
        confirmButtonColor: "#ef4444",
      });
    }
  };

  if (loading)
    return <div className="loading-spinner">Đang tải dữ liệu...</div>;

  return (
    <div className="borrow-container">
      <div className="top-section-grid">
        <InventorySection
          inventory={inventory}
          onAddToBasket={handleToggleBasket}
          basket={basket}
        />

        <BookingForm
          basket={basket}
          setBasket={setBasket}
          clearAll={clearAllBasket}
          rooms={rooms}
          onSubmit={handleCreateTicket}
        />
      </div>

      <div className="bottom-section-grid">
        <LiveMonitor logs={liveLogs} />
        <UserHistory refreshTrigger={refreshHistoryTrigger} />
      </div>
    </div>
  );
};

export default TeacherBorrow;
