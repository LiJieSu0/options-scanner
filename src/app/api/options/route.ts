import { NextResponse } from "next/server";

interface Option {
  strike: number;
  bid: number;
  ask: number;
  lastPrice: number;
  volume: number;
  openInterest: number;
  impliedVolatility: number;
  inTheMoney: boolean;
  expiration: string;
}

interface OptionChain {
  calls: Option[];
  puts: Option[];
  underlyingPrice: number;
  symbol: string;
  expirationDates: string[];
}

interface StockInfo {
  symbol: string;
  currentPrice: number;
  change: number;
  changePercent: number;
  previousClose: number;
}

function generateMockOptionChain(symbol: string): OptionChain {
  const basePrice = symbol === "NVDA" ? 118.50 : symbol === "TSLA" ? 248.75 : symbol === "SOFI" ? 8.25 : 100;
  const strikePrices = [];
  
  for (let i = -10; i <= 10; i++) {
    strikePrices.push(Math.round((basePrice + i * 2.5) * 100) / 100);
  }
  
  const expirationDates = ["2024-09-20", "2024-09-27", "2024-10-04", "2024-10-18", "2024-11-15"];
  
  const calls: Option[] = strikePrices.map((strike) => {
    const distFromCurrent = Math.abs(strike - basePrice);
    const baseIV = 0.25 + (distFromCurrent / basePrice) * 0.3;
    const spread = (basePrice - strike) * 0.15;
    const basePrice2 = Math.max(0.01, basePrice - strike + spread);
    const mid = basePrice2;
    const baseVolume = Math.floor(1000 + Math.random() * 5000);
    const volume = distFromCurrent < 15 ? baseVolume * 2 : baseVolume;
    
    return {
      strike,
      bid: Math.round((mid - 0.05) * 100) / 100,
      ask: Math.round((mid + 0.05) * 100) / 100,
      lastPrice: Math.round(mid * 100) / 100,
      volume: Math.floor(volume * (0.8 + Math.random() * 0.4)),
      openInterest: Math.floor(volume * (2 + Math.random() * 3)),
      impliedVolatility: Math.round(baseIV * 10000) / 10000,
      inTheMoney: strike < basePrice,
      expiration: expirationDates[0],
    };
  });
  
  const puts: Option[] = strikePrices.map((strike) => {
    const distFromCurrent = Math.abs(strike - basePrice);
    const baseIV = 0.25 + (distFromCurrent / basePrice) * 0.3;
    const spread = (strike - basePrice) * 0.15;
    const basePrice2 = Math.max(0.01, strike - basePrice + spread);
    const mid = basePrice2;
    const baseVolume = Math.floor(1000 + Math.random() * 5000);
    const volume = distFromCurrent < 15 ? baseVolume * 2 : baseVolume;
    
    return {
      strike,
      bid: Math.round((mid - 0.05) * 100) / 100,
      ask: Math.round((mid + 0.05) * 100) / 100,
      lastPrice: Math.round(mid * 100) / 100,
      volume: Math.floor(volume * (0.8 + Math.random() * 0.4)),
      openInterest: Math.floor(volume * (2 + Math.random() * 3)),
      impliedVolatility: Math.round(baseIV * 10000) / 10000,
      inTheMoney: strike > basePrice,
      expiration: expirationDates[0],
    };
  });
  
  return {
    calls,
    puts,
    underlyingPrice: basePrice,
    symbol,
    expirationDates,
  };
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
  };
  
  const currentPrice = prices[symbol] || 100 + Math.random() * 50;
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
  const symbol = searchParams.get("symbol")?.toUpperCase() || "NVDA";
  const type = searchParams.get("type") || "all";
  
  try {
    if (type === "stock" || type === "all") {
      const stockInfo = generateMockStockInfo(symbol);
      if (type === "stock") {
        return NextResponse.json(stockInfo);
      }
      return NextResponse.json({
        stock: stockInfo,
        options: generateMockOptionChain(symbol),
      });
    }
    
    if (type === "options") {
      return NextResponse.json(generateMockOptionChain(symbol));
    }
    
    return NextResponse.json({ error: "Invalid type parameter" }, { status: 400 });
  } catch (error) {
    console.error("Error fetching data:", error);
    return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
  }
}
