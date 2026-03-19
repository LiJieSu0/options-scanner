"use client";

import { useState, useEffect } from "react";
import { Star, TrendingUp, TrendingDown } from "lucide-react";
import { StockInfo } from "@/types";
import SearchBar from "./SearchBar";
import Favorites from "./Favorites";

interface HeaderProps {
  onSearch: (symbol: string) => void;
  currentSymbol: string;
  stockInfo: StockInfo | null;
  isLoading: boolean;
  favorites: string[];
  onToggleFavorite: (symbol: string) => void;
}

export default function Header({
  onSearch,
  currentSymbol,
  stockInfo,
  isLoading,
  favorites,
  onToggleFavorite,
}: HeaderProps) {
  const [showFavorites, setShowFavorites] = useState(false);

  const isPositive = stockInfo && stockInfo.change >= 0;

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold text-text-primary">Options Scanner</h1>
          </div>

          <div className="flex-1 flex flex-col md:flex-row items-start md:items-center gap-4">
            <SearchBar onSearch={onSearch} isLoading={isLoading} />

            <div className="flex items-center gap-3">
              {stockInfo && (
                <div className="hidden md:flex items-center gap-4 bg-card rounded-xl px-4 py-2 border border-border">
                  <div>
                    <span className="text-text-secondary text-sm">Current</span>
                    <p className="text-text-primary font-semibold text-lg">
                      ${stockInfo.currentPrice.toFixed(2)}
                    </p>
                  </div>
                  <div className={`flex items-center gap-1 ${isPositive ? "text-success" : "text-danger"}`}>
                    {isPositive ? (
                      <TrendingUp className="w-4 h-4" />
                    ) : (
                      <TrendingDown className="w-4 h-4" />
                    )}
                    <span className="font-medium">
                      {isPositive ? "+" : ""}
                      {stockInfo.change.toFixed(2)} ({stockInfo.changePercent.toFixed(2)}%)
                    </span>
                  </div>
                </div>
              )}

              {currentSymbol && (
                <button
                  onClick={() => onToggleFavorite(currentSymbol)}
                  className={`p-2 rounded-lg border transition-colors ${
                    favorites.includes(currentSymbol)
                      ? "bg-primary/20 border-primary text-primary"
                      : "bg-card border-border text-text-secondary hover:text-primary"
                  }`}
                >
                  <Star className={`w-5 h-5 ${favorites.includes(currentSymbol) ? "fill-current" : ""}`} />
                </button>
              )}

              <button
                onClick={() => setShowFavorites(!showFavorites)}
                className="md:hidden p-2 bg-card border border-border rounded-lg text-text-secondary"
              >
                <Star className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {showFavorites && (
          <div className="mt-4 md:hidden">
            <Favorites
              favorites={favorites}
              onSelect={onSearch}
              onToggleFavorite={onToggleFavorite}
            />
          </div>
        )}

        {stockInfo && (
          <div className="md:hidden mt-4 flex items-center gap-4 bg-card rounded-xl px-4 py-2 border border-border">
            <div>
              <span className="text-text-secondary text-sm">Current</span>
              <p className="text-text-primary font-semibold">${stockInfo.currentPrice.toFixed(2)}</p>
            </div>
            <div className={`flex items-center gap-1 ${isPositive ? "text-success" : "text-danger"}`}>
              {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              <span className="font-medium">
                {isPositive ? "+" : ""}
                {stockInfo.change.toFixed(2)} ({stockInfo.changePercent.toFixed(2)}%)
              </span>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
