import React, { useState, useEffect } from "react";
import {
  Lock,
  Bell,
  Sun,
  Moon,
  ChevronRight,
  Settings,
  ShieldCheck,
  Mail,
  RefreshCcw,
  Smartphone,
  Palette,
  Volume2,
} from "lucide-react";
import Swal from "sweetalert2";
import "./TeacherSettings.css";

import api from "../../../services/api";
import ChangePasswordModal from "./components/ChangePasswordModal";
import TwoFAModal from "./components/TwoFAModal";

const Toast = Swal.mixin({
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  timer: 4000,
  timerProgressBar: true,
  didOpen: (toast) => {
    toast.addEventListener("mouseenter", Swal.stopTimer);
    toast.addEventListener("mouseleave", Swal.resumeTimer);
  },
});

const TeacherSettings = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showPwdModal, setShowPwdModal] = useState(false);
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [twoFAMode, setTwoFAMode] = useState("SETUP");

  const [userInfo, setUserInfo] = useState({
    username: "Đang tải...",
    email: "",
    phone: "",
  });

  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [securityEmail, setSecurityEmail] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileRes, securityRes] = await Promise.all([
          api.get("/users/profile"),
          api.get("/2fa/settings"),
        ]);

        setUserInfo({
          username: profileRes.data.username || "User",
          email: profileRes.data.email || "",
          phone: profileRes.data.phoneNumber || "",
        });

        const data = securityRes.data;
        setIs2FAEnabled(data.enabledTwoFa);
        setSecurityEmail(data.maskedEmail || "");
      } catch (error) {
        console.error("Lỗi tải dữ liệu:", error);
      }
    };
    fetchData();
  }, []);

  const handleToggle2FA = async () => {
    if (!is2FAEnabled) {
      setTwoFAMode("SETUP");
      setShow2FAModal(true);
    } else {
      const result = await Swal.fire({
        title: "Xác nhận tắt",
        text: "Bạn có chắc chắn muốn tắt bảo mật 2 lớp cho tài khoản này?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#aaa",
        confirmButtonText: "Đồng ý",
        cancelButtonText: "Hủy",
      });

      if (result.isConfirmed) {
        try {
          await api.post("/2fa/disable");
          setIs2FAEnabled(false);
          setSecurityEmail("");
          Toast.fire({
            icon: "success",
            title: "Đã tắt xác thực 2 bước thành công",
          });
        } catch (error) {
          Toast.fire({
            icon: "error",
            title: error.response?.data?.error || "Không thể thực hiện yêu cầu",
          });
        }
      }
    }
  };

  return (
    <div className={`settings-container ${isDarkMode ? "dark-mode" : ""}`}>
      <div className="settings-header">
        <h2>
          <Settings
            size={28}
            style={{ marginRight: 10, verticalAlign: "middle" }}
          />{" "}
          Cài đặt hệ thống
        </h2>
        <p>Quản lý tùy chọn cá nhân và bảo mật tài khoản của bạn.</p>
      </div>

      <div className="settings-grid">
        <section className="settings-section">
          <div className="section-title">
            <ShieldCheck size={20} />
            <h3>Bảo mật & Đăng nhập</h3>
          </div>
          <div className="settings-list">
            <div
              className="settings-item"
              onClick={() => setShowPwdModal(true)}
            >
              <div className="item-info">
                <p className="item-label">
                  <Lock size={14} style={{ marginRight: 8 }} /> Đổi mật khẩu
                </p>
                <p className="item-desc">
                  Cập nhật mật khẩu định kỳ để bảo vệ tài khoản.
                </p>
              </div>
              <ChevronRight size={18} color="#999" />
            </div>

            <div
              className={`settings-item twofa-wrapper ${
                is2FAEnabled ? "expanded" : ""
              }`}
            >
              <div className="twofa-header">
                <div className="item-info">
                  <p className="item-label">
                    <Smartphone size={14} style={{ marginRight: 8 }} /> Xác thực
                    2 lớp (2FA)
                  </p>
                  <p className="item-desc">
                    {is2FAEnabled
                      ? "Tài khoản đang được bảo vệ an toàn."
                      : "Yêu cầu mã xác xác thực khi thao tác nhạy cảm."}
                  </p>
                </div>
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={is2FAEnabled}
                    onChange={handleToggle2FA}
                  />
                  <span className="slider round"></span>
                </label>
              </div>

              {is2FAEnabled && (
                <div className="linked-info-container slide-down">
                  <h4 className="info-title">
                    <Mail
                      size={16}
                      style={{ marginRight: 8, verticalAlign: "text-bottom" }}
                    />{" "}
                    Phương Thức Đã Liên Kết
                  </h4>
                  <div className="info-row">
                    <div className="info-col">
                      <span className="info-label">EMAIL NHẬN MÃ</span>
                      <span className="info-value">
                        {securityEmail || userInfo.email}
                      </span>
                    </div>
                    <button
                      className="text-btn primary"
                      onClick={() => {
                        setTwoFAMode("CHANGE_EMAIL");
                        setShow2FAModal(true);
                      }}
                    >
                      <RefreshCcw size={14} style={{ marginRight: 5 }} /> Thay
                      Đổi
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="settings-section">
          <div className="section-title">
            <Palette size={20} />
            <h3>Giao diện & Hiển thị</h3>
          </div>
          <div className="settings-list">
            <div className="settings-item no-border">
              <div className="item-info">
                <p className="item-label">
                  {isDarkMode ? (
                    <Moon size={14} style={{ marginRight: 8 }} />
                  ) : (
                    <Sun size={14} style={{ marginRight: 8 }} />
                  )}
                  Chế độ giao diện
                </p>
                <p className="item-desc">Chuyển đổi giữa Sáng và Tối.</p>
              </div>
              <button
                className={`icon-only-toggle ${isDarkMode ? "dark" : "light"}`}
                onClick={() => setIsDarkMode(!isDarkMode)}
              >
                {isDarkMode ? <Moon size={28} /> : <Sun size={28} />}
              </button>
            </div>
          </div>
        </section>

        <section className="settings-section">
          <div className="section-title">
            <Bell size={20} />
            <h3>Thông báo & Hệ thống</h3>
          </div>
          <div className="settings-list">
            <div className="settings-item">
              <div className="item-info">
                <p className="item-label">
                  <Volume2 size={14} style={{ marginRight: 8 }} /> Thông báo đẩy
                </p>
                <p className="item-desc">
                  Nhận thông báo khi yêu cầu được duyệt.
                </p>
              </div>
              <label className="switch">
                <input type="checkbox" defaultChecked />
                <span className="slider round"></span>
              </label>
            </div>
          </div>
        </section>
      </div>

      {showPwdModal && (
        <ChangePasswordModal
          onClose={() => setShowPwdModal(false)}
          isTwoFAEnabled={is2FAEnabled}
        />
      )}
      {show2FAModal && (
        <TwoFAModal
          onClose={() => setShow2FAModal(false)}
          onConfirm={() => window.location.reload()}
          mode={twoFAMode}
        />
      )}
    </div>
  );
};

export default TeacherSettings;
