import React, { useState, useEffect, useRef } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  FlaskConical,
  Search,
  X,
  Bell,
  Check,
  User,
  Settings,
  LogOut,
} from "lucide-react";
import api from "../../../services/api";
import "./TeacherLayout.css";

const TeacherLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [avatarUrl, setAvatarUrl] = useState(
    localStorage.getItem("user_avatar")
  );
  const [currentUser, setCurrentUser] = useState(
    localStorage.getItem("user") || "GV"
  );

  const [imgError, setImgError] = useState(false);

  const [showNotiMenu, setShowNotiMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [quickSearchValue, setQuickSearchValue] = useState("");
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

    const handleUserUpdate = () => {
      setAvatarUrl(localStorage.getItem("user_avatar"));
      setCurrentUser(localStorage.getItem("user") || "GV");

      setImgError(false);
    };

    window.addEventListener("user_update", handleUserUpdate);

    return () => {
      window.removeEventListener("user_update", handleUserUpdate);
    };
  }, []);

  const handleQuickSearch = (e) => {
    if (e.key === "Enter" && quickSearchValue.trim() !== "") {
      navigate(
        `/teacher/wiki?keyword=${encodeURIComponent(quickSearchValue.trim())}`
      );
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

  const isActive = (path) => (location.pathname.includes(path) ? "active" : "");

  return (
    <div className="teacher-container">
      <header className="navbar">
        <div className="nav-brand" onClick={() => navigate("/teacher/home")}>
          <FlaskConical size={28} strokeWidth={2.5} color="#1a73e8" />
          <h1>LabLab</h1>
        </div>

        <nav className="nav-menu">
          <div
            className={`nav-item ${isActive("home")}`}
            onClick={() => navigate("/teacher/home")}
          >
            Trang chủ
          </div>
          <div
            className={`nav-item ${isActive("wiki")}`}
            onClick={() => navigate("/teacher/wiki")}
          >
            Wiki
          </div>
          <div
            className={`nav-item ${isActive("borrow")}`}
            onClick={() => navigate("/teacher/borrow")}
          >
            Mượn thiết bị
          </div>
          <div
            className={`nav-item ${isActive("report")}`}
            onClick={() => navigate("/teacher/report")}
          >
            Báo cáo
          </div>
        </nav>

        <div className="nav-actions" ref={menuRef}>
          <div className={`search-wrapper ${isSearchOpen ? "open" : ""}`}>
            <div className="search-input-slide">
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Tra cứu nhanh hóa chất..."
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
              <span className="badge-dot"></span>
            </button>
            {showNotiMenu && (
              <div className="dropdown-menu">
                <div className="dropdown-header">Thông báo mới</div>
                <div className="dropdown-item">
                  <div className="noti-content">
                    <span
                      className="noti-text"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "5px",
                      }}
                    >
                      <Check size={14} color="green" /> Phiếu #REQ-088 đã được
                      duyệt.
                    </span>
                    <span className="noti-time">2 phút trước</span>
                  </div>
                </div>
                <div
                  className="dropdown-item"
                  style={{
                    justifyContent: "center",
                    color: "#1a73e8",
                    fontWeight: "bold",
                  }}
                >
                  Xem tất cả
                </div>
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
                  onClick={() => {
                    navigate("/teacher/profile");
                    setShowUserMenu(false);
                  }}
                >
                  <User size={18} /> Hồ sơ cá nhân
                </div>
                <div
                  className="dropdown-item"
                  onClick={() => navigate("/teacher/settings")}
                >
                  <Settings size={18} /> Cài đặt
                </div>
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
      <main className="container-max">
        <Outlet />
      </main>
    </div>
  );
};

export default TeacherLayout;
