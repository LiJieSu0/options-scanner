"use client";

import { Star, X } from "lucide-react";

interface FavoritesProps {
  favorites: string[];
  onSelect: (symbol: string) => void;
  onToggleFavorite: (symbol: string) => void;
}

export default function Favorites({ favorites, onSelect, onToggleFavorite }: FavoritesProps) {
  if (favorites.length === 0) {
    return (
      <div className="bg-card border border-border rounded-xl p-4">
        <p className="text-text-secondary text-sm">No favorite stocks yet. Search and star a stock to add it here.</p>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <h3 className="text-text-primary font-semibold mb-3 flex items-center gap-2">
        <Star className="w-4 h-4 text-primary" />
        Favorites
      </h3>
      <div className="flex flex-wrap gap-2">
        {favorites.map((symbol) => (
          <div
            key={symbol}
            className="group flex items-center gap-2 bg-background border border-border rounded-lg px-3 py-2 hover:border-primary transition-colors"
          >
            <button
              onClick={() => onSelect(symbol)}
              className="text-text-primary font-medium hover:text-primary transition-colors"
            >
              {symbol}
            </button>
            <button
              onClick={() => onToggleFavorite(symbol)}
              className="text-text-secondary hover:text-danger transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
