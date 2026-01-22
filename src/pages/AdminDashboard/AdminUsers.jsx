import React, { useEffect, useState } from "react";
import api from "../../services/api";
import "./AdminDashboard.css";

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [filterRole, setFilterRole] = useState("ALL");

  const [newUser, setNewUser] = useState({
    username: "",
    password: "",
    fullName: "",
    email: "",
    role: "TEACHER",
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get("/admin/users");
      setUsers(response.data);
    } catch (error) {
      console.error(error);
      alert("Không thể tải danh sách người dùng!");
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const { username, password, fullName, email } = newUser;

    if (username.length < 3) {
      alert("Username phải có ít nhất 3 ký tự!");
      return false;
    }
    if (/\s/.test(username)) {
      alert("Username không được chứa khoảng trắng!");
      return false;
    }

    if (password.length < 6) {
      alert("Mật khẩu phải có ít nhất 6 ký tự!");
      return false;
    }

    if (fullName.trim().length === 0) {
      alert("Họ và tên không được để trống!");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert("Email không đúng định dạng!");
      return false;
    }

    return true;
  };

  const handleAddUser = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      await api.post("/admin/users", newUser);
      alert("Tạo tài khoản thành công!");
      setShowAddForm(false);
      setNewUser({
        username: "",
        password: "",
        fullName: "",
        email: "",
        role: "TEACHER",
      });
      fetchUsers();
    } catch (error) {
      const errorMsg =
        error.response?.data?.message || "Lỗi khi tạo tài khoản!";
      alert(errorMsg);
    }
  };

  const handleToggleStatus = async (userId, currentStatus, username) => {
    const action = !currentStatus ? "kích hoạt" : "vô hiệu hóa";
    if (!window.confirm(`Bạn có chắc muốn ${action} tài khoản "${username}"?`))
      return;
    try {
      await api.put(`/admin/users/${userId}/status?isActive=${!currentStatus}`);
      alert(`Thao tác thành công!`);
      fetchUsers();
    } catch (error) {
      alert("Lỗi khi cập nhật trạng thái!");
    }
  };

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return;
    try {
      await api.delete(`/admin/users/${userToDelete.userId}`);
      alert(`Đã xóa tài khoản thành công!`);
      fetchUsers();
    } catch (error) {
      console.error("Delete error:", error);
      let errorMsg = "Lỗi khi xóa tài khoản!";
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        errorMsg = error.response.data.message;
      } else {
        errorMsg =
          "Không thể xóa người dùng này do đã có lịch sử mượn/trả. Vui lòng chọn 'Vô hiệu hóa' thay vì Xóa.";
      }
      alert(errorMsg);
    } finally {
      setShowDeleteModal(false);
      setUserToDelete(null);
    }
  };

  const normalizeRole = (role) => {
    if (!role) return "";
    return role.toUpperCase();
  };

  const filteredUsers = users.filter((user) => {
    const keyword = searchKeyword.toLowerCase().trim();
    const matchesSearch =
      !keyword ||
      user.username?.toLowerCase().includes(keyword) ||
      user.fullName?.toLowerCase().includes(keyword);

    let matchesRole = false;
    const role = normalizeRole(user.role);

    if (filterRole === "ALL") {
      matchesRole = true;
    } else if (filterRole === "ADMIN") {
      matchesRole = role === "ADMIN" || role === "ROLE_ADMIN";
    } else {
      matchesRole = role === "TEACHER" || role === "ROLE_TEACHER";
    }

    return matchesSearch && matchesRole;
  });

  const getRoleDisplay = (role) => {
    const r = normalizeRole(role);
    if (r === "ADMIN" || r === "ROLE_ADMIN") return "Quản trị viên";
    if (r === "TEACHER" || r === "ROLE_TEACHER") return "Giảng viên";
    return role;
  };

  if (loading) return <div className="admin-loading">Đang tải dữ liệu...</div>;

  return (
    <div className="admin-users-container">
      <div className="admin-search-bar" style={{ marginBottom: "24px" }}>
        <input
          type="text"
          className="admin-search-input"
          placeholder="Tìm kiếm người dùng..."
          value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}
        />
        <select
          className="admin-select"
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
        >
          <option value="ALL">Tất cả vai trò</option>
          <option value="ADMIN">Quản trị viên</option>
          <option value="TEACHER">Giảng viên</option>
        </select>
        <button
          className="admin-button admin-button-primary"
          onClick={() => setShowAddForm(true)}
        >
          Thêm người dùng
        </button>
      </div>

      {showAddForm && (
        <div className="admin-form-container" style={{ marginBottom: "24px" }}>
          <h3>Tạo tài khoản mới</h3>
          <form onSubmit={handleAddUser}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "12px",
                marginBottom: "16px",
              }}
            >
              <input
                type="text"
                className="admin-input"
                placeholder="Username (tối thiểu 3 ký tự)"
                value={newUser.username}
                onChange={(e) =>
                  setNewUser({ ...newUser, username: e.target.value })
                }
              />
              <input
                type="password"
                className="admin-input"
                placeholder="Mật khẩu (tối thiểu 6 ký tự)"
                value={newUser.password}
                onChange={(e) =>
                  setNewUser({ ...newUser, password: e.target.value })
                }
              />
              <input
                type="text"
                className="admin-input"
                placeholder="Họ và tên"
                value={newUser.fullName}
                onChange={(e) =>
                  setNewUser({ ...newUser, fullName: e.target.value })
                }
              />
              <input
                type="email"
                className="admin-input"
                placeholder="Email (ví dụ: abc@domain.com)"
                value={newUser.email}
                onChange={(e) =>
                  setNewUser({ ...newUser, email: e.target.value })
                }
              />
              <select
                className="admin-input"
                value={newUser.role}
                onChange={(e) =>
                  setNewUser({ ...newUser, role: e.target.value })
                }
              >
                <option value="TEACHER">Giảng viên</option>
                <option value="ADMIN">Quản trị viên</option>
              </select>
            </div>
            <div style={{ display: "flex", gap: "12px" }}>
              <button
                type="submit"
                className="admin-button admin-button-primary"
              >
                Tạo mới
              </button>
              <button
                type="button"
                className="admin-button"
                onClick={() => setShowAddForm(false)}
              >
                Hủy
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Username</th>
              <th>Họ tên</th>
              <th>Vai trò</th>
              <th>Trạng thái</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user.userId}>
                <td>
                  <strong>{user.username}</strong>
                </td>
                <td>{user.fullName || "N/A"}</td>
                <td>
                  {getRoleDisplay(user.role) === "Quản trị viên" ? (
                    <span style={{ fontWeight: "bold", color: "#dc2626" }}>
                      Quản trị viên
                    </span>
                  ) : (
                    "Giảng viên"
                  )}
                </td>
                <td>
                  <span
                    className={`admin-badge ${
                      user.isActive
                        ? "admin-badge-success"
                        : "admin-badge-error"
                    }`}
                  >
                    {user.isActive ? "Hoạt động" : "Vô hiệu hóa"}
                  </span>
                </td>
                <td>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button
                      className="admin-button"
                      onClick={() =>
                        handleToggleStatus(
                          user.userId,
                          user.isActive,
                          user.username,
                        )
                      }
                    >
                      {user.isActive ? "Vô hiệu" : "Kích hoạt"}
                    </button>
                    <button
                      className="admin-button admin-button-danger"
                      onClick={() => {
                        setUserToDelete(user);
                        setShowDeleteModal(true);
                      }}
                      disabled={getRoleDisplay(user.role) === "Quản trị viên"}
                      title={
                        getRoleDisplay(user.role) === "Quản trị viên"
                          ? "Không thể xóa Admin"
                          : "Xóa tài khoản"
                      }
                    >
                      Xóa
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showDeleteModal && (
        <div className="admin-modal-overlay">
          <div className="admin-modal">
            <h3>Xác nhận xóa</h3>
            <p>
              Xóa tài khoản <strong>{userToDelete?.username}</strong>?
            </p>
            <p style={{ fontSize: "0.9em", color: "#666", marginTop: "8px" }}>
              Lưu ý: Nếu xóa thất bại, vui lòng chọn "Vô hiệu hóa" để bảo toàn
              dữ liệu lịch sử.
            </p>
            <div className="admin-modal-actions">
              <button
                className="admin-button"
                onClick={() => setShowDeleteModal(false)}
              >
                Hủy
              </button>
              <button
                className="admin-button admin-button-danger"
                onClick={handleDeleteConfirm}
              >
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
