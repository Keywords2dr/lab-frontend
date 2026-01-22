import React, { useState, useMemo } from "react";
import {
  Package,
  Search,
  Plus,
  Minus,
  ChevronLeft,
  ChevronRight,
  XCircle,
} from "lucide-react";
import "./InventorySection.css";

const InventorySection = ({ inventory, onAddToBasket, basket = [] }) => {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const filtered = useMemo(() => {
    return inventory.filter(
      (item) =>
        item.name.toLowerCase().includes(search.toLowerCase()) &&
        (category === "ALL" || item.categoryType === category)
    );
  }, [inventory, search, category]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="dashboard-card inventory-wrapper">
      <div className="card-header">
        <h3>
          <Package size={20} /> Kho Vật Tư & Thiết Bị
        </h3>
        <div className="search-input-container">
          <Search size={14} className="search-icon-inside" />
          <input
            type="text"
            className="form-control search-field"
            placeholder="Tìm kiếm..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
          />
          {search && (
            <XCircle
              size={16}
              className="clear-icon"
              onClick={() => setSearch("")}
            />
          )}
        </div>
      </div>

      <div className="category-filters">
        {["ALL", "CHEMICAL", "DEVICE", "TOOL"].map((cat) => (
          <button
            key={cat}
            className={`cat-btn ${category === cat ? "active" : ""}`}
            onClick={() => {
              setCategory(cat);
              setCurrentPage(1);
            }}
          >
            {cat === "ALL"
              ? "Tất cả"
              : cat === "CHEMICAL"
              ? "Hóa chất"
              : cat === "DEVICE"
              ? "Thiết bị"
              : "Dụng cụ"}
          </button>
        ))}
      </div>

      <div className="inventory-grid-layout">
        {paginated.map((item) => {
          const isSelected = basket.some((b) => b.id === item.itemId);

          return (
            <div
              key={item.itemId}
              className={`item-card-box ${isSelected ? "selected" : ""}`}
              onClick={() => onAddToBasket(item)}
            >
              <div className="item-data">
                <h4>{item.name}</h4>
                <span>
                  Sẵn có: <strong>{item.availableQuantity ?? 0}</strong>{" "}
                  {item.unit}
                </span>
              </div>

              {isSelected ? (
                <div className="icon-check-wrapper">
                  <Minus size={16} color="white" strokeWidth={4} />
                </div>
              ) : (
                <Plus size={18} color="#2563eb" />
              )}
            </div>
          );
        })}
      </div>

      {totalPages > 1 && (
        <div className="pagination-controls">
          <button
            onClick={() => setCurrentPage((p) => p - 1)}
            disabled={currentPage === 1}
          >
            <ChevronLeft size={16} />
          </button>
          <span>
            Trang {currentPage} / {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => p + 1)}
            disabled={currentPage === totalPages}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
};

export default InventorySection;
