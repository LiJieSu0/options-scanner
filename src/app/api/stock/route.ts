import { NextResponse } from "next/server";

interface StockInfo {
  symbol: string;
  currentPrice: number;
  change: number;
  changePercent: number;
  previousClose: number;
}

function generateMockStockInfo(symbol: string): StockInfo {
  const prices: Record<string, number> = {
    NVDA: 118.50,
    TSLA: 248.75,
    SOFI: 8.25,
    AAPL: 220.50,
    MSFT: 415.30,
    GOOGL: 175.80,
    AMZN: 185.60,
    META: 520.40,
    AMD: 158.20,
    INTC: 21.45,
    SPY: 542.30,
    QQQ: 456.80,
  };
  
  const currentPrice = prices[symbol.toUpperCase()] || 100 + Math.random() * 50;
  const changePercent = (Math.random() - 0.5) * 6;
  const change = currentPrice * (changePercent / 100);
  const previousClose = currentPrice - change;
  
  return {
    symbol: symbol.toUpperCase(),
    currentPrice: Math.round(currentPrice * 100) / 100,
    change: Math.round(change * 100) / 100,
    changePercent: Math.round(changePercent * 100) / 100,
    previousClose: Math.round(previousClose * 100) / 100,
  };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get("symbol")?.toUpperCase() || "";
  
  if (!symbol) {
    return NextResponse.json({ error: "Symbol is required" }, { status: 400 });
  }
  
  try {
    const stockInfo = generateMockStockInfo(symbol);
    return NextResponse.json(stockInfo);
  } catch (error) {
    console.error("Error fetching stock info:", error);
    return NextResponse.json({ error: "Failed to fetch stock info" }, { status: 500 });
  }
}
