// src/pages/Login/Login.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import "./Login.css";

const Login = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await api.post("/auth/login", {
        username,
        password,
      });
      const data = response.data;

      if (data.success && data.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", username);
        localStorage.setItem("role", data.role);

        if (data.role === "ROLE_ADMIN") {
          navigate("/admin");
        } else if (data.role === "ROLE_TEACHER") {
          navigate("/teacher");
        } else {
          navigate("/teacher");
        }
      } else {
        setError(data.message || "Đăng nhập thất bại!");
      }
    } catch (err) {
      console.error(err);
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError("Không thể kết nối đến máy chủ.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="logo-area">🧪</div>
        <h2 className="school-name">TRƯỜNG ĐẠI HỌC QUY NHƠN</h2>
        <span className="portal-name">
          Cổng thông tin Quản lý Phòng Thí Nghiệm
        </span>

        <form onSubmit={handleLogin}>
          {error && <div className="error-msg">{error}</div>}

          <div className="form-group">
            <input
              type="text"
              className="form-input"
              placeholder="Mã giảng viên"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <input
              type="password"
              className="form-input"
              placeholder="Mật khẩu"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn-login" disabled={isLoading}>
            {isLoading ? "Đang kiểm tra..." : "Đăng nhập"}
          </button>

          <button type="button" className="btn-login btn-gmail">
            Đăng nhập bằng Gmail
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
