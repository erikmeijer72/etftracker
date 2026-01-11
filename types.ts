export interface Holding {
  id: string;
  ticker: string;
  name: string;
  sector?: string;
  quantity: number;
  averagePrice: number; // Purchase price per share
  transactionFees: number; // Total fees paid for this holding
  currentPrice: number; // Current market price per share
  updatedAt: number;
}

export interface PortfolioSummary {
  totalInvested: number; // (qty * avgPrice) + fees
  currentValue: number; // qty * currentPrice OR manual value
  calculatedValue: number; // Always qty * currentPrice
  totalFees: number;
  totalResult: number; // currentValue - totalInvested
  percentageResult: number;
  isManualTotal: boolean;
}

export interface HistoryEntry {
  date: string; // YYYY-MM-DD
  timestamp: number;
  totalValue: number;
  totalInvested: number;
}