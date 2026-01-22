import React, { useState, useEffect, useRef } from "react";
import { CircleX, Mail, ShieldCheck, ArrowLeft } from "lucide-react";
import Swal from "sweetalert2";
import "./TwoFAModal.css";
import api from "../../../../services/api";

const Toast = Swal.mixin({
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  timer: 4000,
  timerProgressBar: true,
});

const TwoFAModal = ({ onClose, onConfirm, mode = "SETUP" }) => {
  const [step, setStep] = useState(1);
  const [inputValue, setInputValue] = useState("");
  const [otp, setOtp] = useState("");
  const [countdown, setCountdown] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const otpInputRef = useRef(null);

  useEffect(() => {
    if (step === 2 && otpInputRef.current) otpInputRef.current.focus();
  }, [step]);

  useEffect(() => {
    let timer;
    if (countdown > 0)
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleNextStep = async () => {
    if (!inputValue || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inputValue)) {
      Toast.fire({ icon: "info", title: "Vui lòng nhập Email hợp lệ" });
      return;
    }
    setIsLoading(true);
    try {
      const endpoint =
        mode === "SETUP" ? "/2fa/setup/request" : "/2fa/change-email/request";
      const payload =
        mode === "SETUP" ? { email: inputValue } : { newEmail: inputValue };
      await api.post(endpoint, payload);
      setCountdown(60);
      setStep(2);
      Toast.fire({ icon: "success", title: "Mã xác thực đã được gửi" });
    } catch (error) {
      Toast.fire({
        icon: "error",
        title: error.response?.data?.error || "Không thể gửi mã",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async () => {
    if (otp.length < 6) return;
    setIsLoading(true);
    try {
      const endpoint =
        mode === "SETUP" ? "/2fa/setup/verify" : "/2fa/change-email/verify";
      await api.post(endpoint, { email: inputValue, otpCode: otp });
      Toast.fire({ icon: "success", title: "Đã hoàn tất thiết lập bảo mật" });
      onConfirm();
      onClose();
    } catch (error) {
      Toast.fire({
        icon: "error",
        title: error.response?.data?.error || "Xác thực thất bại",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="security-modal-box">
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "15px",
            right: "15px",
            background: "transparent",
            border: "none",
            cursor: "pointer",
            display: "flex",
            zIndex: 10,
          }}
        >
          <CircleX size={32} color="#374151" fill="#f3f4f6" strokeWidth={1.5} />
        </button>
        <div className="modal-header-section">
          <div className="icon-wrapper">
            {step === 1 ? (
              <Mail size={36} color="#2563eb" />
            ) : (
              <ShieldCheck size={36} color="#2563eb" />
            )}
          </div>
          <h3 className="modal-title">
            {step === 1
              ? mode === "SETUP"
                ? "Bật Bảo Mật 2FA"
                : "Đổi Email Nhận Mã"
              : "Nhập Mã Xác Thực"}
          </h3>
          <p className="modal-subtitle">
            {step === 1 ? (
              "Nhập Email để nhận mã xác thực."
            ) : (
              <>
                Mã đã được gửi tới{" "}
                <span className="highlight-text">{inputValue}</span>
              </>
            )}
          </p>
        </div>
        <div className="modal-body">
          {step === 1 && (
            <div className="step-content">
              <div className="input-wrapper">
                <input
                  className="main-input"
                  type="email"
                  placeholder="Địa chỉ Email..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <button
                className="btn-submit"
                onClick={handleNextStep}
                disabled={isLoading}
              >
                {isLoading ? "Đang gửi..." : "Tiếp Tục"}
              </button>
            </div>
          )}
          {step === 2 && (
            <div className="step-content">
              <div className="otp-container">
                <input
                  ref={otpInputRef}
                  className="otp-real-input"
                  maxLength={6}
                  value={otp}
                  onChange={(e) =>
                    setOtp(e.target.value.replace(/[^0-9]/g, ""))
                  }
                  disabled={isLoading}
                />
                <div className="otp-visual-boxes">
                  {[...Array(6)].map((_, i) => (
                    <div
                      key={i}
                      className={`otp-box-char ${
                        otp.length === i ? "active-box" : ""
                      } ${otp[i] ? "filled-box" : ""}`}
                    >
                      {otp[i] || ""}
                    </div>
                  ))}
                </div>
              </div>
              <button
                className="btn-submit"
                onClick={handleVerify}
                disabled={otp.length < 6 || isLoading}
              >
                Xác Nhận
              </button>
              <div className="bottom-links">
                <button className="link-btn" onClick={() => setStep(1)}>
                  <ArrowLeft size={16} /> Quay lại
                </button>
                <span style={{ color: "#9ca3af" }}>
                  {countdown > 0 ? (
                    `Gửi lại sau ${countdown}s`
                  ) : (
                    <button className="link-btn" onClick={handleNextStep}>
                      Gửi lại mã
                    </button>
                  )}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TwoFAModal;
