export interface OptionData {
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

export interface OptionChain {
  calls: OptionData[];
  puts: OptionData[];
  underlyingPrice: number;
  symbol: string;
  expirationDates: string[];
}

export interface StockInfo {
  symbol: string;
  currentPrice: number;
  change: number;
  changePercent: number;
  previousClose: number;
}

export interface Filters {
  strikeMin: number;
  strikeMax: number;
  expiration: string;
  premiumMin: number;
  premiumMax: number;
  ivMin: number;
  ivMax: number;
  showOTM: boolean;
  showITM: boolean;
}
