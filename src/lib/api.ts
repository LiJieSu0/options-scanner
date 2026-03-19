import { OptionChain, StockInfo, Filters } from "@/types";

interface ApiResponse {
  stock?: StockInfo;
  options?: OptionChain;
}

export async function fetchStockData(symbol: string): Promise<ApiResponse> {
  const response = await fetch(`/api/options?symbol=${symbol}&type=all`);
  if (!response.ok) {
    throw new Error("Failed to fetch stock data");
  }
  return response.json();
}

export async function fetchOptions(symbol: string, expiration?: string): Promise<OptionChain> {
  let url = `/api/options?symbol=${symbol}&type=options`;
  if (expiration) {
    url += `&expiration=${expiration}`;
  }
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Failed to fetch options");
  }
  return response.json();
}

export async function fetchStockInfo(symbol: string): Promise<StockInfo> {
  const response = await fetch(`/api/stock?symbol=${symbol}`);
  if (!response.ok) {
    throw new Error("Failed to fetch stock info");
  }
  return response.json();
}
