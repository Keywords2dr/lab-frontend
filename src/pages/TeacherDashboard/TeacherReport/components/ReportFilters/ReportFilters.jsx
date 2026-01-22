import React from "react";
import {
  Layers,
  Clock,
  TestTube2,
  CheckCircle2,
  AlertOctagon,
} from "lucide-react";
import "./ReportFilters.css";

const FILTERS = [
  { id: "ALL", label: "Tất cả", icon: Layers },
  { id: "PENDING", label: "Chờ duyệt", icon: Clock },
  { id: "APPROVED", label: "Đang mượn", icon: TestTube2 },
  { id: "RETURNED", label: "Đã trả", icon: CheckCircle2 },
  { id: "RETURNED_WITH_ISSUES", label: "Có sự cố", icon: AlertOctagon },
];

const ReportFilters = ({ currentFilter, onFilterChange }) => {
  return (
    <div className="filter-tabs">
      {FILTERS.map((f) => {
        const Icon = f.icon;
        return (
          <button
            key={f.id}
            className={`filter-tab ${currentFilter === f.id ? "active" : ""}`}
            onClick={() => onFilterChange(f.id)}
          >
            <Icon size={16} strokeWidth={2.5} />
            {f.label}
          </button>
        );
      })}
    </div>
  );
};

export default ReportFilters;
