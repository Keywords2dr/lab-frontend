import React, { useState, useEffect, useRef } from "react";
import {
  CircleX,
  LockKeyhole,
  ShieldCheck,
  Eye,
  EyeOff,
  Check,
  Dot,
} from "lucide-react";
import Swal from "sweetalert2";
import "./ChangePasswordModal.css";
import api from "../../../../services/api";

const Toast = Swal.mixin({
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  timer: 4000,
  timerProgressBar: true,
});

const ChangePasswordModal = ({ onClose, isTwoFAEnabled = false }) => {
  const [step, setStep] = useState(isTwoFAEnabled ? 1 : 2);
  const [otp, setOtp] = useState("");
  const [oldPass, setOldPass] = useState("");
  const [showOldPass, setShowOldPass] = useState(false);
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const otpInputRef = useRef(null);

  useEffect(() => {
    if (isTwoFAEnabled && step === 1) {
      api.post("/users/send-otp").catch((err) => console.error(err));
      setTimeout(() => otpInputRef.current?.focus(), 100);
    }
  }, [isTwoFAEnabled, step]);

  const handleNextStep = () => {
    if (otp.length < 6) {
      Toast.fire({ icon: "info", title: "Vui lòng nhập đủ mã OTP" });
      return;
    }
    setStep(2);
  };

  const handleSubmit = async () => {
    if (!oldPass || newPass.length < 6 || newPass !== confirmPass) return;
    setIsLoading(true);
    try {
      await api.post("/users/change-password", {
        oldPassword: oldPass,
        newPassword: newPass,
        confirmPassword: confirmPass,
        otpCode: isTwoFAEnabled ? otp : null,
      });
      Toast.fire({ icon: "success", title: "Đã cập nhật mật khẩu mới" });
      onClose();
    } catch (error) {
      const errorMsg = error.response?.data?.error || "Lỗi cập nhật mật khẩu";
      Toast.fire({ icon: "error", title: errorMsg });
      if (
        isTwoFAEnabled &&
        (errorMsg.toLowerCase().includes("otp") ||
          errorMsg.toLowerCase().includes("hết hạn"))
      ) {
        setStep(1);
        setOtp("");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const isLengthValid = newPass.length >= 6;
  const isMatchValid = newPass === confirmPass && newPass !== "";

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "16px",
            right: "16px",
            background: "transparent",
            border: "none",
            cursor: "pointer",
            zIndex: 9999,
            padding: 0,
            display: "flex",
          }}
        >
          <CircleX size={32} color="#374151" fill="#f3f4f6" strokeWidth={1.5} />
        </button>
        <div className="modal-header">
          <div className="header-icon-badge">
            {step === 1 ? <ShieldCheck size={32} /> : <LockKeyhole size={32} />}
          </div>
          <h3 className="modal-title">
            {step === 1 ? "Xác thực bảo mật" : "Cập nhật mật khẩu"}
          </h3>
          <p className="modal-desc">
            {step === 1
              ? "Vui lòng kiểm tra Email để lấy mã OTP."
              : "Nhập mật khẩu mới cho tài khoản của bạn."}
          </p>
        </div>
        <div className="modal-body">
          {step === 1 && (
            <>
              <div className="otp-container">
                <input
                  ref={otpInputRef}
                  className="otp-real-input"
                  type="text"
                  maxLength={6}
                  value={otp}
                  onChange={(e) =>
                    setOtp(e.target.value.replace(/[^0-9]/g, ""))
                  }
                />
                <div className="otp-boxes">
                  {[...Array(6)].map((_, i) => (
                    <div
                      key={i}
                      className={`otp-char ${
                        otp.length === i ? "active" : ""
                      } ${otp[i] ? "filled" : ""}`}
                    >
                      {otp[i] || ""}
                    </div>
                  ))}
                </div>
              </div>
              <button
                className="btn-primary"
                disabled={otp.length < 6 || isLoading}
                onClick={handleNextStep}
              >
                Tiếp tục
              </button>
              <button
                className="btn-secondary"
                onClick={async () => {
                  try {
                    await api.post("/users/send-otp");
                    Toast.fire({
                      icon: "success",
                      title: "Mã mới đã được gửi",
                    });
                  } catch {
                    Toast.fire({ icon: "error", title: "Gửi mã thất bại" });
                  }
                }}
              >
                Gửi lại mã OTP
              </button>
            </>
          )}
          {step === 2 && (
            <>
              <div className="input-group">
                <input
                  type={showOldPass ? "text" : "password"}
                  className="custom-input"
                  placeholder="Mật khẩu cũ"
                  value={oldPass}
                  onChange={(e) => setOldPass(e.target.value)}
                />
                <button
                  type="button"
                  className="eye-btn"
                  onClick={() => setShowOldPass(!showOldPass)}
                >
                  {showOldPass ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              <div className="input-group">
                <input
                  type={showPass ? "text" : "password"}
                  className="custom-input"
                  placeholder="Mật khẩu mới"
                  value={newPass}
                  onChange={(e) => setNewPass(e.target.value)}
                />
                <button
                  type="button"
                  className="eye-btn"
                  onClick={() => setShowPass(!showPass)}
                >
                  {showPass ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              <div className="input-group">
                <input
                  type={showConfirm ? "text" : "password"}
                  className="custom-input"
                  placeholder="Xác nhận mật khẩu"
                  value={confirmPass}
                  onChange={(e) => setConfirmPass(e.target.value)}
                />
                <button
                  type="button"
                  className="eye-btn"
                  onClick={() => setShowConfirm(!showConfirm)}
                >
                  {showConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              <div className="validation-list">
                <div
                  className={`validation-item ${
                    isLengthValid ? "success" : ""
                  }`}
                >
                  {isLengthValid ? (
                    <Check size={14} strokeWidth={3} />
                  ) : (
                    <Dot size={14} />
                  )}
                  <span>Tối thiểu 6 ký tự</span>
                </div>
                <div
                  className={`validation-item ${isMatchValid ? "success" : ""}`}
                >
                  {isMatchValid ? (
                    <Check size={14} strokeWidth={3} />
                  ) : (
                    <Dot size={14} />
                  )}
                  <span>Mật khẩu trùng khớp</span>
                </div>
              </div>
              <button
                className="btn-primary"
                onClick={handleSubmit}
                disabled={
                  !oldPass || !isLengthValid || !isMatchValid || isLoading
                }
              >
                Lưu thay đổi
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChangePasswordModal;
