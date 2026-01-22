import React, { useEffect, useState, useRef } from "react";
import api from "../../services/api";
import "./AdminDashboard.css";

const AdminChemicals = () => {
  const [chemicals, setChemicals] = useState([]);
  const [allChemicals, setAllChemicals] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingChemical, setEditingChemical] = useState(null);

  const formRef = useRef(null);
  const searchTimeoutRef = useRef(null);

  const [formData, setFormData] = useState({
    itemCode: "",
    name: "",
    unit: "",
    currentQuantity: "",
    formula: "",
    supplier: "",
    packaging: "",
    storageLocation: "",
    originalPrice: "",
  });

  useEffect(() => {
    fetchChemicals();
    fetchWarehouses();
  }, []);

  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    searchTimeoutRef.current = setTimeout(() => {
      performSearch();
    }, 300);
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchKeyword]);

  const fetchChemicals = async () => {
    try {
      setLoading(true);
      const response = await api.get("/admin/chemicals");
      setAllChemicals(response.data);
      setChemicals(response.data);
    } catch (error) {
      console.error("Lỗi khi tải danh sách hóa chất:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchWarehouses = async () => {
    try {
      const response = await api.get("/admin/warehouses");
      setWarehouses(response.data);
    } catch (error) {
      console.error("Lỗi khi tải danh sách kho:", error);
    }
  };

  const performSearch = () => {
    if (!searchKeyword.trim()) {
      setChemicals(allChemicals);
      return;
    }
    const keyword = searchKeyword.toLowerCase().trim();
    const filtered = allChemicals.filter((chemical) => {
      return (
        chemical.name?.toLowerCase().includes(keyword) ||
        chemical.itemCode?.toLowerCase().includes(keyword) ||
        chemical.formula?.toLowerCase().includes(keyword) ||
        chemical.supplier?.toLowerCase().includes(keyword) ||
        chemical.storageLocation?.toLowerCase().includes(keyword)
      );
    });
    setChemicals(filtered);
  };

  const handleCreate = () => {
    setEditingChemical(null);
    setFormData({
      itemCode: "",
      name: "",
      unit: "",
      currentQuantity: "",
      formula: "",
      supplier: "",
      packaging: "",
      storageLocation: warehouses.length > 0 ? warehouses[0].roomName : "",
      originalPrice: "",
    });
    setShowForm(true);
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  const handleEdit = (chemical) => {
    setEditingChemical(chemical);
    setFormData({
      itemCode: chemical.itemCode,
      name: chemical.name,
      unit: chemical.unit || "",
      currentQuantity: chemical.currentQuantity || "",
      formula: chemical.formula || "",
      supplier: chemical.supplier || "",
      packaging: chemical.packaging || "",
      storageLocation: chemical.storageLocation || "",
      originalPrice: chemical.originalPrice || "",
    });
    setShowForm(true);
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        currentQuantity: parseFloat(formData.currentQuantity) || 0,
        originalPrice: parseFloat(formData.originalPrice) || 0,
      };

      if (editingChemical) {
        await api.put(`/admin/chemicals/${editingChemical.itemId}`, payload);
        alert("Cập nhật thành công!");
      } else {
        await api.post("/admin/chemicals", payload);
        alert("Thêm mới thành công!");
      }
      setShowForm(false);
      fetchChemicals();
    } catch (error) {
      console.error("Lỗi submit form:", error);
      let msg = "Lỗi hệ thống!";
      if (error.response?.data) {
        msg = error.response.data.message || error.response.data.error || msg;
      }
      alert(msg);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa hóa chất này?")) return;
    try {
      await api.delete(`/admin/chemicals/${id}`);
      alert("Xóa thành công!");
      fetchChemicals();
    } catch (error) {
      console.error("Lỗi khi xóa hóa chất:", error);
      let msg = "Lỗi khi xóa!";
      if (error.response?.data) {
        msg = error.response.data.message || error.response.data.error || msg;
      }
      alert(msg);
    }
  };

  const handleExport = async () => {
    try {
      const response = await api.get("/admin/export/chemicals", {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "hoa-chat.xlsx");
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Lỗi xuất file:", error);
      alert("Lỗi xuất file!");
    }
  };

  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const data = new FormData();
    data.append("file", file);
    try {
      await api.post("/admin/import/chemicals", data);
      alert("Import thành công!");
      fetchChemicals();
    } catch (error) {
      console.error("Lỗi import file:", error);
      alert("Lỗi import!");
    } finally {
      e.target.value = "";
    }
  };

  if (loading) return <div className="admin-loading">Đang tải...</div>;

  return (
    <div className="admin-chemicals-page">
      <div className="admin-search-bar" style={{ marginBottom: "24px" }}>
        <input
          type="text"
          className="admin-search-input"
          placeholder="Tìm kiếm hóa chất..."
          value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}
        />
        <div style={{ display: "flex", gap: "8px" }}>
          <button className="admin-button" onClick={handleExport}>
            Xuất Excel
          </button>
          <label className="admin-button" style={{ cursor: "pointer" }}>
            Nhập Excel
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleImport}
              style={{ display: "none" }}
            />
          </label>
          <button
            className="admin-button admin-button-primary"
            onClick={handleCreate}
          >
            Thêm hóa chất
          </button>
        </div>
      </div>

      <div ref={formRef}>
        {showForm && (
          <div className="admin-form-container">
            <h3>{editingChemical ? "Sửa hóa chất" : "Thêm hóa chất mới"}</h3>
            <form onSubmit={handleSubmit}>
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
                  placeholder="Mã"
                  value={formData.itemCode}
                  onChange={(e) =>
                    setFormData({ ...formData, itemCode: e.target.value })
                  }
                  required
                />
                <input
                  type="text"
                  className="admin-input"
                  placeholder="Tên"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
                <input
                  type="text"
                  className="admin-input"
                  placeholder="Công thức"
                  value={formData.formula}
                  onChange={(e) =>
                    setFormData({ ...formData, formula: e.target.value })
                  }
                />
                <input
                  type="text"
                  className="admin-input"
                  placeholder="Đơn vị"
                  value={formData.unit}
                  onChange={(e) =>
                    setFormData({ ...formData, unit: e.target.value })
                  }
                />
                <input
                  type="number"
                  className="admin-input"
                  placeholder="Số lượng"
                  value={formData.currentQuantity}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      currentQuantity: e.target.value,
                    })
                  }
                />
                <input
                  type="text"
                  className="admin-input"
                  placeholder="NCC"
                  value={formData.supplier}
                  onChange={(e) =>
                    setFormData({ ...formData, supplier: e.target.value })
                  }
                />
                <input
                  type="text"
                  className="admin-input"
                  placeholder="Bao bì"
                  value={formData.packaging}
                  onChange={(e) =>
                    setFormData({ ...formData, packaging: e.target.value })
                  }
                />
                <select
                  className="admin-input"
                  value={formData.storageLocation}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      storageLocation: e.target.value,
                    })
                  }
                  required
                >
                  <option value="">-- Chọn kho lưu trữ --</option>
                  {warehouses.map((w) => (
                    <option key={w.roomName} value={w.roomName}>
                      {w.roomName}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  className="admin-input"
                  placeholder="Giá gốc"
                  value={formData.originalPrice}
                  onChange={(e) =>
                    setFormData({ ...formData, originalPrice: e.target.value })
                  }
                />
              </div>
              <div style={{ display: "flex", gap: "12px" }}>
                <button
                  type="submit"
                  className="admin-button admin-button-primary"
                >
                  {editingChemical ? "Cập nhật" : "Tạo mới"}
                </button>
                <button
                  type="button"
                  className="admin-button"
                  onClick={() => setShowForm(false)}
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      <div className="admin-table-container">
        <table
          className="admin-table"
          style={{ width: "100%", tableLayout: "fixed" }}
        >
          <thead>
            <tr>
              <th style={{ width: "100px" }}>Mã</th>
              <th style={{ width: "250px" }}>Tên hóa chất</th>
              <th style={{ width: "100px", textAlign: "center" }}>Số lượng</th>
              <th style={{ width: "80px", textAlign: "center" }}>Đơn vị</th>
              <th style={{ width: "120px", textAlign: "center" }}>Vị trí</th>
              <th style={{ width: "150px", textAlign: "center" }}>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {chemicals.map((chemical) => (
              <tr key={chemical.itemId}>
                <td style={{ wordBreak: "break-all" }}>{chemical.itemCode}</td>
                <td style={{ fontWeight: "500" }}>{chemical.name}</td>
                <td
                  style={{
                    textAlign: "center",
                    fontWeight: "bold",
                    color: "#2c3e50",
                  }}
                >
                  {chemical.currentQuantity || 0}
                </td>
                <td style={{ textAlign: "center", color: "#7f8c8d" }}>
                  {chemical.unit || "N/A"}
                </td>
                <td style={{ textAlign: "center" }}>
                  <span
                    style={{
                      background: "#f0f2f5",
                      padding: "4px 8px",
                      borderRadius: "4px",
                      fontSize: "0.9rem",
                    }}
                  >
                    {chemical.storageLocation || "N/A"}
                  </span>
                </td>
                <td>
                  <div
                    style={{
                      display: "flex",
                      gap: "6px",
                      justifyContent: "center",
                    }}
                  >
                    <button
                      className="admin-button"
                      onClick={() => handleEdit(chemical)}
                      style={{
                        padding: "6px 12px",
                        fontSize: "0.85rem",
                        minWidth: "60px",
                      }}
                    >
                      Sửa
                    </button>
                    <button
                      className="admin-button admin-button-danger"
                      onClick={() => handleDelete(chemical.itemId)}
                      style={{
                        padding: "6px 12px",
                        fontSize: "0.85rem",
                        minWidth: "60px",
                      }}
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
    </div>
  );
};

export default AdminChemicals;
