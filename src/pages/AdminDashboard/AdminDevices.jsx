import React, { useEffect, useState, useRef } from "react";
import api from "../../services/api";
import "./AdminDashboard.css";

const AdminDevices = () => {
  const [assets, setAssets] = useState([]);
  const [allAssets, setAllAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingAsset, setEditingAsset] = useState(null);
  const [formData, setFormData] = useState({
    itemCode: "",
    name: "",
    unit: "",
    yearInUse: "",
    statusDetail: "",
    supplier: "",
    storageLocation: "",
    originalPrice: "",
    accountingQuantity: "",
    inventoryQuantity: "",
    residualValue: "",
  });
  const searchTimeoutRef = useRef(null);

  useEffect(() => {
    fetchAssets();
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

  const fetchAssets = async () => {
    try {
      setLoading(true);
      const response = await api.get("/admin/assets");
      setAllAssets(response.data);
      setAssets(response.data);
    } catch (error) {
      console.error("Error fetching assets:", error);
    } finally {
      setLoading(false);
    }
  };

  const performSearch = () => {
    if (!searchKeyword.trim()) {
      setAssets(allAssets);
      return;
    }
    const keyword = searchKeyword.toLowerCase().trim();
    const filtered = allAssets.filter((asset) => {
      return (
        asset.name?.toLowerCase().includes(keyword) ||
        asset.itemCode?.toLowerCase().includes(keyword) ||
        asset.statusDetail?.toLowerCase().includes(keyword) ||
        asset.supplier?.toLowerCase().includes(keyword) ||
        asset.storageLocation?.toLowerCase().includes(keyword)
      );
    });
    setAssets(filtered);
  };

  const handleCreate = () => {
    setEditingAsset(null);
    setFormData({
      itemCode: "",
      name: "",
      unit: "",
      yearInUse: "",
      statusDetail: "",
      supplier: "",
      storageLocation: "",
      originalPrice: "",
      accountingQuantity: "",
      inventoryQuantity: "",
      residualValue: "",
    });
    setShowForm(true);
  };

  const handleEdit = (asset) => {
    setEditingAsset(asset);
    setFormData({
      itemCode: asset.itemCode,
      name: asset.name,
      unit: asset.unit || "",
      yearInUse: asset.yearInUse || "",
      statusDetail: asset.statusDetail || "",
      supplier: asset.supplier || "",
      storageLocation: asset.storageLocation || "",
      originalPrice: asset.originalPrice || "",
      accountingQuantity: asset.accountingQuantity || "",
      inventoryQuantity: asset.inventoryQuantity || "",
      residualValue: asset.residualValue || "",
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        originalPrice: parseFloat(formData.originalPrice) || 0,
        accountingQuantity: parseInt(formData.accountingQuantity) || 0,
        inventoryQuantity: parseInt(formData.inventoryQuantity) || 0,
        residualValue: parseFloat(formData.residualValue) || 0,
        yearInUse: parseInt(formData.yearInUse) || null,
      };

      if (editingAsset) {
        await api.put(`/admin/assets/${editingAsset.itemId}`, payload);
        alert("Cập nhật thiết bị thành công!");
      } else {
        await api.post("/admin/assets", payload);
        alert("Tạo thiết bị thành công!");
      }
      setShowForm(false);
      fetchAssets();
    } catch (error) {
      console.error("Error saving asset:", error);
      let errorMessage = "Có lỗi xảy ra!";
      if (error.response?.data) {
        errorMessage =
          error.response.data.message ||
          error.response.data.error ||
          errorMessage;
      }
      alert(errorMessage);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa thiết bị này?")) return;
    try {
      await api.delete(`/admin/assets/${id}`);
      alert("Xóa thiết bị thành công!");
      fetchAssets();
    } catch (error) {
      console.error("Error deleting asset:", error);
      alert("Có lỗi xảy ra khi xóa thiết bị!");
    }
  };

  const handleExport = async () => {
    try {
      const response = await api.get("/admin/export/assets", {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `danh-sach-thiet-bi-${new Date().getTime()}.xlsx`,
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      alert("Xuất file Excel thành công!");
    } catch (error) {
      console.error("Error exporting:", error);
      alert("Có lỗi xảy ra khi xuất file!");
    }
  };

  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.name.endsWith(".xlsx") && !file.name.endsWith(".xls")) {
      alert("Vui lòng chọn file Excel!");
      return;
    }
    const data = new FormData();
    data.append("file", file);
    try {
      await api.post("/admin/import/assets", data);
      alert("Import thành công!");
      fetchAssets();
    } catch (error) {
      console.error("Error importing:", error);
      alert("Có lỗi xảy ra khi import file!");
    } finally {
      e.target.value = "";
    }
  };

  if (loading) return <div className="admin-loading">Đang tải...</div>;

  return (
    <div className="admin-devices-page">
      <div className="admin-search-bar" style={{ marginBottom: "24px" }}>
        <input
          type="text"
          className="admin-search-input"
          placeholder="Tìm kiếm thiết bị..."
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
            Thêm thiết bị
          </button>
        </div>
      </div>

      {showForm && (
        <div className="admin-form-container">
          <h3>{editingAsset ? "Sửa thiết bị" : "Thêm thiết bị mới"}</h3>
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
                placeholder="Đơn vị"
                value={formData.unit}
                onChange={(e) =>
                  setFormData({ ...formData, unit: e.target.value })
                }
              />
              <input
                type="number"
                className="admin-input"
                placeholder="Năm sử dùng"
                value={formData.yearInUse}
                onChange={(e) =>
                  setFormData({ ...formData, yearInUse: e.target.value })
                }
              />
              <input
                type="text"
                className="admin-input"
                placeholder="Trạng thái"
                value={formData.statusDetail}
                onChange={(e) =>
                  setFormData({ ...formData, statusDetail: e.target.value })
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
                placeholder="Vị trí"
                value={formData.storageLocation}
                onChange={(e) =>
                  setFormData({ ...formData, storageLocation: e.target.value })
                }
              />
              <input
                type="number"
                className="admin-input"
                placeholder="Giá gốc"
                value={formData.originalPrice}
                onChange={(e) =>
                  setFormData({ ...formData, originalPrice: e.target.value })
                }
              />
              <input
                type="number"
                className="admin-input"
                placeholder="SL kế toán"
                value={formData.accountingQuantity}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    accountingQuantity: e.target.value,
                  })
                }
              />
              <input
                type="number"
                className="admin-input"
                placeholder="SL tồn kho"
                value={formData.inventoryQuantity}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    inventoryQuantity: e.target.value,
                  })
                }
              />
              <input
                type="number"
                className="admin-input"
                placeholder="Giá trị còn lại"
                value={formData.residualValue}
                onChange={(e) =>
                  setFormData({ ...formData, residualValue: e.target.value })
                }
              />
            </div>
            <div style={{ display: "flex", gap: "12px" }}>
              <button
                type="submit"
                className="admin-button admin-button-primary"
              >
                {editingAsset ? "Cập nhật" : "Tạo mới"}
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

      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Mã</th>
              <th>Tên</th>
              <th>Trạng thái</th>
              <th>Số lượng</th>
              <th>Vị trí</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {assets.map((asset) => (
              <tr key={asset.itemId}>
                <td>{asset.itemCode}</td>
                <td>{asset.name}</td>
                <td>{asset.statusDetail || "N/A"}</td>
                <td>
                  KT: {asset.accountingQuantity || 0} | TK:{" "}
                  {asset.inventoryQuantity || 0}
                </td>
                <td>{asset.storageLocation || "N/A"}</td>
                <td>
                  <button
                    className="admin-button"
                    onClick={() => handleEdit(asset)}
                    style={{ marginRight: "8px" }}
                  >
                    Sửa
                  </button>
                  <button
                    className="admin-button admin-button-danger"
                    onClick={() => handleDelete(asset.itemId)}
                  >
                    Xóa
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminDevices;
