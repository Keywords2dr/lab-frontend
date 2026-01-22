import React, { useState, useEffect, useRef } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import {
  FlaskConical,
  Search,
  X,
  Bell,
  Check,
  User,
  LogOut,
  LayoutDashboard,
  FileCheck,
  Beaker,
  Cpu,
  Users,
} from "lucide-react";
import AdminOverview from "./AdminOverview";
import AdminRentTickets from "./AdminRentTickets";
import AdminChemicals from "./AdminChemicals";
import AdminDevices from "./AdminDevices";
import AdminUsers from "./AdminUsers";
import api from "../../services/api";
import "./AdminDashboard.css";

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [avatarUrl, setAvatarUrl] = useState(
    localStorage.getItem("user_avatar")
  );
  const [currentUser, setCurrentUser] = useState(
    localStorage.getItem("user") || "Admin"
  );

  const [imgError, setImgError] = useState(false);
  const [showNotiMenu, setShowNotiMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [quickSearchValue, setQuickSearchValue] = useState("");
  const [pendingTicketsCount, setPendingTicketsCount] = useState(0);
  const menuRef = useRef(null);
  const searchInputRef = useRef(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const response = await api.get("/users/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.data) {
          if (response.data.avatar) {
            setAvatarUrl(response.data.avatar);
            localStorage.setItem("user_avatar", response.data.avatar);
            setImgError(false);
          }
          if (response.data.fullName) {
            setCurrentUser(response.data.fullName);
            localStorage.setItem("user", response.data.fullName);
          }
        }
      } catch (err) {
        console.error("Lỗi tải header:", err);
      }
    };

    fetchUserProfile();
    fetchPendingTicketsCount();

    const handleUserUpdate = () => {
      setAvatarUrl(localStorage.getItem("user_avatar"));
      setCurrentUser(localStorage.getItem("user") || "Admin");
      setImgError(false);
    };

    window.addEventListener("user_update", handleUserUpdate);

    // Fetch pending tickets count mỗi 30 giây
    const interval = setInterval(() => {
      fetchPendingTicketsCount();
    }, 30000);

    return () => {
      window.removeEventListener("user_update", handleUserUpdate);
      clearInterval(interval);
    };
  }, []);

  const fetchPendingTicketsCount = async () => {
    try {
      const response = await api.get("/admin/dashboard/stats");
      if (response.data && response.data.pendingTicketsCount !== undefined) {
        setPendingTicketsCount(response.data.pendingTicketsCount);
      }
    } catch (error) {
      console.error("Error fetching pending tickets count:", error);
    }
  };

  const handleQuickSearch = (e) => {
    if (e.key === "Enter" && quickSearchValue.trim() !== "") {
      // Có thể navigate đến trang tìm kiếm hoặc xử lý tìm kiếm
      setQuickSearchValue("");
      setIsSearchOpen(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const toggleNoti = () => {
    setShowNotiMenu(!showNotiMenu);
    setShowUserMenu(false);
    setIsSearchOpen(false);
  };

  const toggleUser = () => {
    setShowUserMenu(!showUserMenu);
    setShowNotiMenu(false);
    setIsSearchOpen(false);
  };

  const toggleSearch = () => {
    if (!isSearchOpen) {
      setIsSearchOpen(true);
      setTimeout(() => searchInputRef.current?.focus(), 100);
      setShowNotiMenu(false);
      setShowUserMenu(false);
    } else {
      setIsSearchOpen(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowNotiMenu(false);
        setShowUserMenu(false);
        if (!event.target.closest(".search-wrapper")) {
          setIsSearchOpen(false);
        }
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + "/");
  };

  return (
    <div className="admin-container">
      <header className="admin-navbar">
        <div className="admin-nav-brand" onClick={() => navigate("/admin/overview")}>
          <FlaskConical size={28} strokeWidth={2.5} color="#1a73e8" />
          <h1>LabLab Admin</h1>
        </div>

        <nav className="admin-nav-menu">
          <div
            className={`admin-nav-item ${isActive("/admin/overview") ? "active" : ""}`}
            onClick={() => navigate("/admin/overview")}
          >
            <LayoutDashboard size={18} style={{ marginRight: "6px" }} />
            Tổng quan
          </div>
          <div
            className={`admin-nav-item ${isActive("/admin/tickets") ? "active" : ""}`}
            onClick={() => navigate("/admin/tickets")}
          >
            <FileCheck size={18} style={{ marginRight: "6px" }} />
            Duyệt phiếu
          </div>
          <div
            className={`admin-nav-item ${isActive("/admin/chemicals") ? "active" : ""}`}
            onClick={() => navigate("/admin/chemicals")}
          >
            <Beaker size={18} style={{ marginRight: "6px" }} />
            Hóa chất
          </div>
          <div
            className={`admin-nav-item ${isActive("/admin/devices") ? "active" : ""}`}
            onClick={() => navigate("/admin/devices")}
          >
            <Cpu size={18} style={{ marginRight: "6px" }} />
            Thiết bị
          </div>
          <div
            className={`admin-nav-item ${isActive("/admin/users") ? "active" : ""}`}
            onClick={() => navigate("/admin/users")}
          >
            <Users size={18} style={{ marginRight: "6px" }} />
            Người dùng
          </div>
        </nav>

        <div className="admin-nav-actions" ref={menuRef}>
          <div className={`search-wrapper ${isSearchOpen ? "open" : ""}`}>
            <div className="search-input-slide">
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Tìm kiếm nhanh..."
                value={quickSearchValue}
                onChange={(e) => setQuickSearchValue(e.target.value)}
                onKeyDown={handleQuickSearch}
              />
            </div>
            <button
              className="icon-btn search-btn-trigger"
              onClick={toggleSearch}
            >
              {isSearchOpen ? (
                <X size={22} color="#333" strokeWidth={2} />
              ) : (
                <Search size={22} color="#333" strokeWidth={2} />
              )}
            </button>
          </div>

          <div style={{ position: "relative" }}>
            <button
              className={`icon-btn ${showNotiMenu ? "active" : ""}`}
              onClick={toggleNoti}
            >
              <Bell size={22} color="#333" strokeWidth={2} />
              {pendingTicketsCount > 0 && (
                <span 
                  className="badge-dot"
                  style={{
                    position: "absolute",
                    top: "-2px",
                    right: "-2px",
                    backgroundColor: "#d32f2f",
                    color: "white",
                    borderRadius: "10px",
                    minWidth: "18px",
                    height: "18px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "11px",
                    fontWeight: "bold",
                    padding: "0 5px",
                    border: "2px solid white"
                  }}
                >
                  {pendingTicketsCount > 99 ? "99+" : pendingTicketsCount}
                </span>
              )}
            </button>
            {showNotiMenu && (
              <div className="dropdown-menu">
                <div className="dropdown-header">Thông báo</div>
                {pendingTicketsCount > 0 ? (
                  <>
                    <div 
                      className="dropdown-item"
                      onClick={() => {
                        navigate("/admin/tickets");
                        setShowNotiMenu(false);
                      }}
                      style={{ cursor: "pointer" }}
                    >
                      <div className="noti-content">
                        <span className="noti-text">
                          <Check size={14} color="green" /> 
                          {pendingTicketsCount === 1 
                            ? "Có 1 phiếu mượn mới cần duyệt."
                            : `Có ${pendingTicketsCount} phiếu mượn mới cần duyệt.`}
                        </span>
                      </div>
                    </div>
                    <div
                      className="dropdown-item"
                      onClick={() => {
                        navigate("/admin/tickets");
                        setShowNotiMenu(false);
                      }}
                      style={{
                        justifyContent: "center",
                        color: "#1a73e8",
                        fontWeight: "bold",
                        cursor: "pointer"
                      }}
                    >
                      Xem tất cả
                    </div>
                  </>
                ) : (
                  <div className="dropdown-item">
                    <div className="noti-content">
                      <span className="noti-text" style={{ color: "#666" }}>
                        Không có thông báo mới
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div style={{ position: "relative" }}>
            <div
              className={`user-avatar ${showUserMenu ? "active" : ""}`}
              onClick={toggleUser}
              style={{
                overflow: "hidden",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {avatarUrl && !imgError ? (
                <img
                  src={`http://localhost:8080/springmvc/avatars/${avatarUrl}`}
                  alt="User"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  onError={() => setImgError(true)}
                />
              ) : (
                <User size={24} strokeWidth={2} color="#ffffff" />
              )}
            </div>

            {showUserMenu && (
              <div className="dropdown-menu">
                <div className="dropdown-header">Tài khoản: {currentUser}</div>
                <div
                  className="dropdown-item"
                  onClick={handleLogout}
                  style={{ color: "#d93025" }}
                >
                  <LogOut size={18} /> Đăng xuất
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="admin-main">
        <Routes>
          <Route index element={<AdminOverview />} />
          <Route path="overview" element={<AdminOverview />} />
          <Route path="tickets" element={<AdminRentTickets />} />
          <Route path="chemicals" element={<AdminChemicals />} />
          <Route path="devices" element={<AdminDevices />} />
          <Route path="users" element={<AdminUsers />} />
        </Routes>
      </main>
    </div>
  );
};

export default AdminLayout;

