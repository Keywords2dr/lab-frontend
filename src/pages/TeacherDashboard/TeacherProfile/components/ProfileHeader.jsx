import React from "react";
import { Shield, Camera, User } from "lucide-react";
import "./ProfileHeader.css";

const ProfileHeader = ({
  profile,
  isEditing,
  formData,
  avatarSrc,
  onFileChange,
}) => {
  return (
    <div className="profile-header-main">
      <div className="avatar-wrapper">
        {avatarSrc ? (
          <img
            src={avatarSrc}
            alt="Avatar"
            className="avatar-image"
            onError={(e) => (e.target.style.display = "none")}
          />
        ) : (
          <div className="avatar-placeholder">
            <User size={64} color="#1e40af" strokeWidth={1.5} />
          </div>
        )}

        {isEditing && (
          <>
            <input
              type="file"
              id="upload-avatar-input"
              hidden
              accept="image/*"
              onChange={onFileChange}
            />
            <label htmlFor="upload-avatar-input" className="btn-upload-icon">
              <Camera size={18} strokeWidth={2.5} />
            </label>
          </>
        )}
      </div>

      <div className="header-info">
        <h1>
          {isEditing ? formData.fullName : profile.fullName || profile.username}
        </h1>
        <div className="role-tag">
          <Shield size={14} style={{ marginRight: 5 }} />
          {profile.role ? profile.role.replace("ROLE_", "") : "N/A"}
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;
