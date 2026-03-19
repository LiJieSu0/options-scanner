"use client";

import { SlidersHorizontal, X } from "lucide-react";
import { Filters } from "@/types";
import { useState, useEffect } from "react";

interface FilterPanelProps {
  filters: Filters;
  onFilterChange: (filters: Filters) => void;
  expirationDates: string[];
  underlyingPrice: number;
}

const defaultFilters: Filters = {
  strikeMin: 0,
  strikeMax: 1000,
  expiration: "",
  premiumMin: 0,
  premiumMax: 100,
  ivMin: 0,
  ivMax: 5,
  showOTM: true,
  showITM: true,
};

export default function FilterPanel({
  filters,
  onFilterChange,
  expirationDates,
  underlyingPrice,
}: FilterPanelProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [localFilters, setLocalFilters] = useState<Filters>(filters);

  useEffect(() => {
    const savedFilters = localStorage.getItem("optionFilters");
    if (savedFilters) {
      const parsed = JSON.parse(savedFilters);
      setLocalFilters(parsed);
      onFilterChange(parsed);
    }
  }, []);

  const handleChange = (key: keyof Filters, value: number | string | boolean) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
    onFilterChange(newFilters);
    localStorage.setItem("optionFilters", JSON.stringify(newFilters));
  };

  const resetFilters = () => {
    setLocalFilters(defaultFilters);
    onFilterChange(defaultFilters);
    localStorage.setItem("optionFilters", JSON.stringify(defaultFilters));
  };

  const formatExpiration = (date: string) => {
    const d = new Date(date);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-background/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-5 h-5 text-primary" />
          <h3 className="text-text-primary font-semibold">Filters</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-text-secondary text-sm">
            {localFilters.expiration ? formatExpiration(localFilters.expiration) : "All Expirations"}
          </span>
          <span className="text-text-secondary text-sm">
            {localFilters.showOTM && localFilters.showITM
              ? "All"
              : localFilters.showOTM
              ? "OTM"
              : "ITM"}
          </span>
        </div>
      </button>

      {isExpanded && (
        <div className="p-4 pt-0 space-y-4 border-t border-border">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
            <div>
              <label className="block text-text-secondary text-sm mb-2">Expiration Date</label>
              <select
                value={localFilters.expiration}
                onChange={(e) => handleChange("expiration", e.target.value)}
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">All Expirations</option>
                {expirationDates.map((date) => (
                  <option key={date} value={date}>
                    {formatExpiration(date)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-text-secondary text-sm mb-2">
                Strike Range (Current: ${underlyingPrice.toFixed(2)})
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={localFilters.strikeMin}
                  onChange={(e) => handleChange("strikeMin", parseFloat(e.target.value) || 0)}
                  placeholder="Min"
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <span className="text-text-secondary">-</span>
                <input
                  type="number"
                  value={localFilters.strikeMax}
                  onChange={(e) => handleChange("strikeMax", parseFloat(e.target.value) || 1000)}
                  placeholder="Max"
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            <div>
              <label className="block text-text-secondary text-sm mb-2">Premium Range ($)</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={localFilters.premiumMin}
                  onChange={(e) => handleChange("premiumMin", parseFloat(e.target.value) || 0)}
                  placeholder="Min"
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <span className="text-text-secondary">-</span>
                <input
                  type="number"
                  value={localFilters.premiumMax}
                  onChange={(e) => handleChange("premiumMax", parseFloat(e.target.value) || 100)}
                  placeholder="Max"
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            <div>
              <label className="block text-text-secondary text-sm mb-2">IV Range (%)</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={(localFilters.ivMin * 100).toFixed(0)}
                  onChange={(e) => handleChange("ivMin", (parseFloat(e.target.value) || 0) / 100)}
                  placeholder="Min"
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <span className="text-text-secondary">-</span>
                <input
                  type="number"
                  value={(localFilters.ivMax * 100).toFixed(0)}
                  onChange={(e) => handleChange("ivMax", (parseFloat(e.target.value) || 0) / 100)}
                  placeholder="Max"
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-text-secondary text-sm mb-2">Show Options</label>
            <div className="flex gap-2">
              <button
                onClick={() => handleChange("showOTM", !localFilters.showOTM)}
                className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
                  localFilters.showOTM
                    ? "bg-danger/20 text-danger border border-danger"
                    : "bg-background text-text-secondary border border-border"
                }`}
              >
                OTM Only
              </button>
              <button
                onClick={() => handleChange("showITM", !localFilters.showITM)}
                className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
                  localFilters.showITM
                    ? "bg-success/20 text-success border border-success"
                    : "bg-background text-text-secondary border border-border"
                }`}
              >
                ITM Only
              </button>
            </div>
          </div>

          <button
            onClick={resetFilters}
            className="w-full flex items-center justify-center gap-2 py-2 bg-background border border-border rounded-lg text-text-secondary hover:text-danger hover:border-danger transition-colors"
          >
            <X className="w-4 h-4" />
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
}
