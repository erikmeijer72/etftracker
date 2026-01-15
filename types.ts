export interface Holding {
  id: string;
  ticker: string;
  name: string;
  sector?: string;
  quantity: number;
  averagePrice: number; // Purchase price per share
  transactionFees: number; // Total fees paid for this holding
  currentPrice: number; // Current market price per share
  purchaseDate: string; // YYYY-MM-DD
  updatedAt: number;
}

export interface Funds {
  cash: number;
  assets: number;
}

export interface PortfolioSummary {
  totalInvested: number; // (qty * avgPrice) + fees
  etfValue: number; // qty * currentPrice (Pure ETF value)
  cash: number;
  assets: number;
  currentValue: number; // etfValue + cash + assets (Grand Total)
  totalFees: number;
  totalResult: number; // etfValue - totalInvested
  percentageResult: number;
}

export interface HistoryEntry {
  date: string; // YYYY-MM-DD
  timestamp: number;
  totalValue: number;
  totalInvested: number;
  breakdown?: { [holdingId: string]: number }; // Maps holding ID to total value
  prices?: { [holdingId: string]: number }; // Maps holding ID to unit price
}