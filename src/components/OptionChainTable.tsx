"use client";

import { ArrowUpDown } from "lucide-react";
import { OptionData, Filters } from "@/types";
import { useState } from "react";

interface OptionChainTableProps {
  calls: OptionData[];
  puts: OptionData[];
  filters: Filters;
  underlyingPrice: number;
}

type SortKey = "strike" | "bid" | "ask" | "volume" | "iv";
type SortDirection = "asc" | "desc";

export default function OptionChainTable({
  calls,
  puts,
  filters,
  underlyingPrice,
}: OptionChainTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>("strike");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [activeTab, setActiveTab] = useState<"calls" | "puts">("calls");

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDirection("asc");
    }
  };

  const filterOptions = (options: OptionData[]): OptionData[] => {
    return options.filter((opt) => {
      if (opt.strike < filters.strikeMin || opt.strike > filters.strikeMax) return false;
      if (opt.lastPrice < filters.premiumMin || opt.lastPrice > filters.premiumMax) return false;
      if (opt.impliedVolatility < filters.ivMin || opt.impliedVolatility > filters.ivMax) return false;
      if (!filters.showOTM && !opt.inTheMoney) return false;
      if (!filters.showITM && opt.inTheMoney) return false;
      if (filters.expiration && opt.expiration !== filters.expiration) return false;
      return true;
    });
  };

  const sortOptions = (options: OptionData[]): OptionData[] => {
    return [...options].sort((a, b) => {
      let aVal: number, bVal: number;
      switch (sortKey) {
        case "strike":
          aVal = a.strike;
          bVal = b.strike;
          break;
        case "bid":
          aVal = a.bid;
          bVal = b.bid;
          break;
        case "ask":
          aVal = a.ask;
          bVal = b.ask;
          break;
        case "volume":
          aVal = a.volume;
          bVal = b.volume;
          break;
        case "iv":
          aVal = a.impliedVolatility;
          bVal = b.impliedVolatility;
          break;
        default:
          return 0;
      }
      return sortDirection === "asc" ? aVal - bVal : bVal - aVal;
    });
  };

  const filteredCalls = sortOptions(filterOptions(calls));
  const filteredPuts = sortOptions(filterOptions(puts));
  const displayOptions = activeTab === "calls" ? filteredCalls : filteredPuts;

  const SortHeader = ({ label, sortKeyName }: { label: string; sortKeyName: SortKey }) => (
    <th
      className="px-3 py-3 text-left cursor-pointer hover:text-primary transition-colors"
      onClick={() => handleSort(sortKeyName)}
    >
      <div className="flex items-center gap-1">
        {label}
        <ArrowUpDown
          className={`w-3 h-3 ${sortKey === sortKeyName ? "text-primary" : "text-text-secondary"}`}
        />
      </div>
    </th>
  );

  const formatIV = (iv: number) => `${(iv * 100).toFixed(2)}%`;
  const formatVolume = (vol: number) => vol.toLocaleString();

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="flex border-b border-border">
        <button
          onClick={() => setActiveTab("calls")}
          className={`flex-1 py-3 font-semibold transition-colors ${
            activeTab === "calls"
              ? "bg-success/10 text-success border-b-2 border-success"
              : "text-text-secondary hover:text-text-primary"
          }`}
        >
          Calls ({filteredCalls.length})
        </button>
        <button
          onClick={() => setActiveTab("puts")}
          className={`flex-1 py-3 font-semibold transition-colors ${
            activeTab === "puts"
              ? "bg-danger/10 text-danger border-b-2 border-danger"
              : "text-text-secondary hover:text-text-primary"
          }`}
        >
          Puts ({filteredPuts.length})
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-background/50">
            <tr className="text-text-secondary text-sm">
              <SortHeader label="Strike" sortKeyName="strike" />
              <SortHeader label="Bid" sortKeyName="bid" />
              <SortHeader label="Ask" sortKeyName="ask" />
              <th className="px-3 py-3 text-left">Last</th>
              <th className="px-3 py-3 text-left">Mid</th>
              <SortHeader label="Volume" sortKeyName="volume" />
              <th className="px-3 py-3 text-left">OI</th>
              <SortHeader label="IV" sortKeyName="iv" />
              <th className="px-3 py-3 text-left">Type</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {displayOptions.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-3 py-8 text-center text-text-secondary">
                  No options match your filters
                </td>
              </tr>
            ) : (
              displayOptions.map((option, index) => {
                const isHighlighted =
                  activeTab === "calls"
                    ? option.strike <= underlyingPrice && option.strike >= underlyingPrice - 10
                    : option.strike >= underlyingPrice && option.strike <= underlyingPrice + 10;

                return (
                  <tr
                    key={`${option.expiration}-${option.strike}-${index}`}
                    className={`hover:bg-background/30 transition-colors ${
                      isHighlighted ? "bg-primary/5" : ""
                    }`}
                  >
                    <td className="px-3 py-3 font-mono font-medium">
                      ${option.strike.toFixed(2)}
                    </td>
                    <td className="px-3 py-3 font-mono text-success">
                      ${option.bid.toFixed(2)}
                    </td>
                    <td className="px-3 py-3 font-mono text-danger">
                      ${option.ask.toFixed(2)}
                    </td>
                    <td className="px-3 py-3 font-mono">
                      ${option.lastPrice.toFixed(2)}
                    </td>
                    <td className="px-3 py-3 font-mono text-text-primary">
                      ${((option.bid + option.ask) / 2).toFixed(2)}
                    </td>
                    <td className="px-3 py-3 font-mono text-text-secondary">
                      {formatVolume(option.volume)}
                    </td>
                    <td className="px-3 py-3 font-mono text-text-secondary">
                      {formatVolume(option.openInterest)}
                    </td>
                    <td className="px-3 py-3 font-mono">
                      <span
                        className={`${
                          option.impliedVolatility > 0.5
                            ? "text-danger"
                            : option.impliedVolatility > 0.3
                            ? "text-yellow-500"
                            : "text-success"
                        }`}
                      >
                        {formatIV(option.impliedVolatility)}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-medium ${
                          option.inTheMoney
                            ? "bg-success/20 text-success"
                            : "bg-text-secondary/20 text-text-secondary"
                        }`}
                      >
                        {option.inTheMoney ? "ITM" : "OTM"}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
