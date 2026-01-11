import React from 'react';
import { Holding } from '../types';
import { Edit2, Trash2, TrendingUp, TrendingDown } from 'lucide-react';

interface Props {
  holding: Holding;
  onEdit: (holding: Holding) => void;
  onDelete: (id: string) => void;
}

const ETFRow: React.FC<Props> = ({ holding, onEdit, onDelete }) => {
  const invested = (holding.quantity * holding.averagePrice) + holding.transactionFees;
  const currentVal = holding.quantity * holding.currentPrice;
  const result = currentVal - invested;
  const percentage = invested > 0 ? (result / invested) * 100 : 0;
  const isProfit = result >= 0;

  const formatEuro = (val: number) => 
    new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(val);

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-3 sm:p-4 transition hover:border-[#0099CC] hover:shadow-sm">
      <div className="flex justify-between items-start gap-3">
        
        {/* Left Side: Ticker, Name, Quantity */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-slate-100 text-slate-700 border border-slate-200 text-[10px] sm:text-xs font-bold px-1.5 py-0.5 rounded">
              {holding.ticker}
            </span>
            <h3 className="text-sm sm:text-base font-semibold text-slate-900 truncate">{holding.name}</h3>
          </div>
          <p className="text-slate-500 text-xs sm:text-sm">
            {holding.quantity} stuks
            <span className="text-slate-300 mx-1.5">|</span>
            Avg: {formatEuro(holding.averagePrice)}
          </p>
        </div>

        {/* Right Side: Price, Result, Actions */}
        <div className="flex flex-col items-end gap-1">
          <div className="text-right">
             <span className="text-sm sm:text-base font-bold text-slate-900 block">{formatEuro(holding.currentPrice)}</span>
             <div className={`text-xs sm:text-sm font-medium flex items-center justify-end gap-0.5 ${isProfit ? 'text-emerald-600' : 'text-red-600'}`}>
                {isProfit ? '+' : ''}{formatEuro(result)}
                <span className="opacity-75 text-[10px]">({percentage.toFixed(1)}%)</span>
             </div>
          </div>
          
          <div className="flex items-center gap-1 mt-1">
            <button 
                onClick={() => onEdit(holding)}
                className="bg-slate-50 text-slate-400 hover:text-slate-700 hover:bg-slate-100 p-1.5 rounded-md transition"
            >
                <Edit2 className="w-3.5 h-3.5" />
            </button>
            <button 
                onClick={() => onDelete(holding.id)}
                className="bg-slate-50 text-slate-400 hover:text-red-600 hover:bg-red-50 p-1.5 rounded-md transition"
            >
                <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ETFRow;