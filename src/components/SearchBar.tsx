"use client";

import { Search, Star } from "lucide-react";
import { useState } from "react";

interface SearchBarProps {
  onSearch: (symbol: string) => void;
  isLoading: boolean;
}

export default function SearchBar({ onSearch, isLoading }: SearchBarProps) {
  const [symbol, setSymbol] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (symbol.trim()) {
      onSearch(symbol.trim().toUpperCase());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative w-full max-w-md">
      <input
        type="text"
        value={symbol}
        onChange={(e) => setSymbol(e.target.value.toUpperCase())}
        placeholder="Enter stock symbol (e.g., NVDA, TSLA)"
        className="w-full bg-card border border-border rounded-xl px-4 py-3 pl-12 text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
        disabled={isLoading}
      />
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
      <button
        type="submit"
        disabled={isLoading || !symbol.trim()}
        className="absolute right-2 top-1/2 -translate-y-1/2 bg-primary hover:bg-primary/80 disabled:bg-primary/50 px-4 py-1.5 rounded-lg text-white font-medium transition-colors disabled:cursor-not-allowed"
      >
        {isLoading ? "Loading..." : "Search"}
      </button>
    </form>
  );
}
