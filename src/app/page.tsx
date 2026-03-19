"use client";

import { useState, useEffect } from "react";
import { Activity, AlertCircle } from "lucide-react";
import { OptionChain, StockInfo, Filters } from "@/types";
import { fetchStockData } from "@/lib/api";
import { useLocalStorage } from "@/lib/hooks";
import Header from "@/components/Header";
import Favorites from "@/components/Favorites";
import FilterPanel from "@/components/FilterPanel";
import OptionChainTable from "@/components/OptionChainTable";

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

export default function Home() {
  const [currentSymbol, setCurrentSymbol] = useState("");
  const [stockInfo, setStockInfo] = useState<StockInfo | null>(null);
  const [optionChain, setOptionChain] = useState<OptionChain | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [favorites, setFavorites] = useLocalStorage<string[]>("favorites", []);
  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const [showFavoritesDesktop, setShowFavoritesDesktop] = useState(true);

  useEffect(() => {
    const savedFilters = localStorage.getItem("optionFilters");
    if (savedFilters) {
      try {
        setFilters(JSON.parse(savedFilters));
      } catch (e) {
        console.error("Failed to parse saved filters");
      }
    }
  }, []);

  const handleSearch = async (symbol: string) => {
    if (!symbol.trim()) return;

    setIsLoading(true);
    setError(null);
    setCurrentSymbol(symbol);

    try {
      const data = await fetchStockData(symbol);
      setStockInfo(data.stock || null);
      setOptionChain(data.options || null);
    } catch (err) {
      setError("Failed to fetch data. Please check the symbol and try again.");
      setStockInfo(null);
      setOptionChain(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleFavorite = (symbol: string) => {
    setFavorites((prev: string[]) => {
      if (prev.includes(symbol)) {
        return prev.filter((s) => s !== symbol);
      }
      return [...prev, symbol];
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header
        onSearch={handleSearch}
        currentSymbol={currentSymbol}
        stockInfo={stockInfo}
        isLoading={isLoading}
        favorites={favorites}
        onToggleFavorite={handleToggleFavorite}
      />

      <main className="max-w-7xl mx-auto px-4 py-6">
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center gap-3 text-primary">
              <Activity className="w-6 h-6 animate-pulse" />
              <span className="text-lg">Loading options data...</span>
            </div>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-3 bg-danger/10 border border-danger/30 rounded-xl p-4 text-danger mb-6">
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
          </div>
        )}

        {!isLoading && !currentSymbol && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mb-6">
              <Activity className="w-10 h-10 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-text-primary mb-2">Welcome to Options Scanner</h2>
            <p className="text-text-secondary text-center max-w-md">
              Enter a stock symbol above to view real-time options data, including calls, puts, IV, and more.
            </p>
            <div className="flex gap-2 mt-6 flex-wrap justify-center">
              {["NVDA", "TSLA", "AAPL", "MSFT", "SPY"].map((symbol) => (
                <button
                  key={symbol}
                  onClick={() => handleSearch(symbol)}
                  className="px-4 py-2 bg-card border border-border rounded-lg text-text-primary hover:border-primary hover:text-primary transition-colors"
                >
                  {symbol}
                </button>
              ))}
            </div>
          </div>
        )}

        {!isLoading && currentSymbol && optionChain && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-1 space-y-4">
              <div className="hidden lg:block">
                {showFavoritesDesktop && (
                  <Favorites
                    favorites={favorites}
                    onSelect={handleSearch}
                    onToggleFavorite={handleToggleFavorite}
                  />
                )}
              </div>

              <FilterPanel
                filters={filters}
                onFilterChange={setFilters}
                expirationDates={optionChain.expirationDates}
                underlyingPrice={optionChain.underlyingPrice}
              />
            </div>

            <div className="lg:col-span-3">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-bold text-text-primary">
                  {currentSymbol} Option Chain
                </h2>
                <span className="text-text-secondary text-sm">
                  Spot Price: ${optionChain.underlyingPrice.toFixed(2)}
                </span>
              </div>

              <OptionChainTable
                calls={optionChain.calls}
                puts={optionChain.puts}
                filters={filters}
                underlyingPrice={optionChain.underlyingPrice}
              />
            </div>
          </div>
        )}

        {!isLoading && currentSymbol && !optionChain && !error && (
          <div className="flex flex-col items-center justify-center py-12">
            <p className="text-text-secondary">No options data available for {currentSymbol}</p>
          </div>
        )}
      </main>

      <footer className="border-t border-border py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 text-center text-text-secondary text-sm">
          <p>Options Scanner - Real-time options data visualization</p>
          <p className="mt-1">Data provided for educational purposes only</p>
        </div>
      </footer>
    </div>
  );
}
