import React from "react";
import { Save, X } from "lucide-react";
import "./ProfileActions.css";

const ProfileActions = ({ isEditing, onEdit, onSave, onCancel }) => {
  return (
    <div className="profile-footer">
      {isEditing ? (
        <>
          <button className="btn-save" onClick={onSave}>
            <Save size={18} /> Lưu thay đổi
          </button>
          <button className="btn-cancel" onClick={onCancel}>
            <X size={18} /> Hủy
          </button>
        </>
      ) : (
        <button className="btn-edit-main" onClick={onEdit}>
          Cập nhật thông tin
        </button>
      )}
    </div>
  );
};

export default ProfileActions;
