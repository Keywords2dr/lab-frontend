import React, { useState, useEffect, useRef } from "react";
import { Check, AlertCircle } from "lucide-react";
import Swal from "sweetalert2";
import api from "../../../services/api";
import "./TeacherProfile.css";

import ProfileHeader from "./components/ProfileHeader";
import ProfileDetails from "./components/ProfileDetails";
import ProfileActions from "./components/ProfileActions";

// Cấu hình Toast nhẹ nhàng
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

const TeacherProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    phoneNumber: "",
    email: "",
  });

  const [previewUrl, setPreviewUrl] = useState(null);
  const [base64Image, setBase64Image] = useState(null);
  const [imgError, setImgError] = useState(false);

  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    setImgError(false);
  }, [profile?.avatar, previewUrl]);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      const response = await api.get("/users/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProfile(response.data);

      if (response.data.avatar)
        localStorage.setItem("user_avatar", response.data.avatar);
      if (response.data.fullName)
        localStorage.setItem("user", response.data.fullName);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setPreviewUrl(URL.createObjectURL(file));
      const reader = new FileReader();
      reader.onloadend = () => setBase64Image(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleEditClick = () => {
    setFormData({
      fullName: profile.fullName || "",
      phoneNumber: profile.phoneNumber || "",
      email: profile.email || "",
    });
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setPreviewUrl(null);
    setBase64Image(null);
    setImgError(false);
  };

  const handleSave = async () => {
    if (!formData.fullName.trim()) {
      Toast.fire({ icon: "info", title: "Họ tên không được để trống!" });
      return;
    }

    if (!formData.phoneNumber.trim()) {
      Toast.fire({ icon: "info", title: "Số điện thoại không được để trống!" });
      return;
    }

    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(formData.phoneNumber.trim())) {
      Toast.fire({
        icon: "warning",
        title: "Số điện thoại phải bao gồm đúng 10 chữ số!",
      });
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const payload = {
        fullName: formData.fullName.trim(),
        phoneNumber: formData.phoneNumber.trim(),
        email: formData.email.trim(),
        avatar: base64Image || null,
      };

      const response = await api.patch("/users/profile", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setProfile(response.data);

      if (response.data.avatar)
        localStorage.setItem("user_avatar", response.data.avatar);
      if (response.data.fullName)
        localStorage.setItem("user", response.data.fullName);

      window.dispatchEvent(new Event("user_update"));

      setIsEditing(false);
      setPreviewUrl(null);
      setBase64Image(null);

      Toast.fire({
        icon: "success",
        title: "Thông tin hồ sơ đã được cập nhật.",
      });
    } catch (err) {
      console.error("Lỗi:", err);
      Toast.fire({
        icon: "error",
        title: "Không thể cập nhật hồ sơ. Vui lòng thử lại.",
      });
    }
  };

  const getAvatarContent = () => {
    if (previewUrl) return previewUrl;
    if (profile?.avatar && !imgError) {
      return `http://localhost:8080/springmvc/avatars/${
        profile.avatar
      }?t=${Date.now()}`;
    }
    return null;
  };

  if (loading) return <div className="loading-state">Đang tải...</div>;
  if (!profile) return null;

  return (
    <div className="profile-container">

      <div className="profile-card">
        <div className="profile-banner"></div>

        <ProfileHeader
          profile={profile}
          isEditing={isEditing}
          formData={formData}
          avatarSrc={getAvatarContent()}
          onImageError={() => setImgError(true)}
          fileInputRef={fileInputRef}
          onFileChange={handleFileChange}
          onCameraClick={() => fileInputRef.current.click()}
        />

        <ProfileDetails
          profile={profile}
          isEditing={isEditing}
          formData={formData}
          onInputChange={handleInputChange}
        />

        <ProfileActions
          isEditing={isEditing}
          onEdit={handleEditClick}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      </div>
    </div>
  );
};

export default TeacherProfile;
