import React from "react";
import {
  User,
  Home,
  Phone,
  Mail,
  BookOpen,
  Award,
  Activity,
} from "lucide-react";
import "./ProfileDetails.css";

const ProfileDetails = ({ profile, isEditing, formData, onInputChange }) => {
  return (
    <div className="profile-details-grid">
      <div className="detail-group">
        <h3>
          <User size={18} /> Thông tin cá nhân
        </h3>

        <div className="detail-item">
          <label>
            <User size={14} style={{ marginRight: 6 }} /> Họ và tên
          </label>
          {isEditing ? (
            <input
              className="edit-input"
              value={formData.fullName}
              onChange={(e) => onInputChange("fullName", e.target.value)}
              placeholder="Nhập họ tên..."
            />
          ) : (
            <p>{profile.fullName || "Chưa cập nhật"}</p>
          )}
        </div>

        <div className="detail-item">
          <label>
            <Phone size={14} style={{ marginRight: 6 }} /> Số điện thoại
          </label>
          {isEditing ? (
            <input
              className="edit-input"
              value={formData.phoneNumber}
              onChange={(e) => onInputChange("phoneNumber", e.target.value)}
              placeholder="Nhập số điện thoại..."
            />
          ) : (
            <p>{profile.phoneNumber || "Chưa cập nhật"}</p>
          )}
        </div>

        <div className="detail-item">
          <label>
            <Mail size={14} style={{ marginRight: 6 }} /> Email liên hệ
          </label>
          <p>{profile.email || "Chưa cập nhật"}</p>
        </div>
      </div>

      <div className="detail-group">
        <h3>
          <Home size={18} /> Đơn vị công tác
        </h3>
        <div className="detail-item">
          <label>
            <Award size={14} style={{ marginRight: 6 }} /> Khoa
          </label>
          <p>{profile.faculty || "Chưa cập nhật"}</p>
        </div>
        <div className="detail-item">
          <label>
            <BookOpen size={14} style={{ marginRight: 6 }} /> Bộ môn
          </label>
          <p>{profile.department || "Chưa cập nhật"}</p>
        </div>
        <div className="detail-item">
          <label>
            <Activity size={14} style={{ marginRight: 6 }} /> Trạng thái
          </label>
          <p className="status-online">Đang hoạt động</p>
        </div>
      </div>
    </div>
  );
};

export default ProfileDetails;
