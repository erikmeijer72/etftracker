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
    <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6 transition hover:border-[#0099CC] hover:shadow-md group">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        
        {/* Info Section */}
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <span className="bg-slate-100 text-slate-800 border border-slate-200 text-xs font-bold px-2 py-1 rounded">
              {holding.ticker}
            </span>
            <h3 className="text-lg font-semibold text-slate-900">{holding.name}</h3>
          </div>
          <p className="text-slate-500 text-sm mt-1">
            {holding.quantity} stuks @ {formatEuro(holding.averagePrice)}
            <span className="text-slate-300 mx-2">•</span>
            Kosten: {formatEuro(holding.transactionFees)}
          </p>
        </div>

        {/* Value & Result Section */}
        <div className="flex flex-col sm:items-end gap-1 w-full sm:w-auto">
          <div className="flex items-center gap-4 justify-between sm:justify-end w-full">
            <div className="text-right">
              <span className="text-slate-500 text-xs uppercase tracking-wider block">Huidige Koers</span>
              <span className="text-xl font-bold text-slate-900 block mt-1">{formatEuro(holding.currentPrice)}</span>
            </div>
            
            <div className="text-right min-w-[100px]">
              <span className="text-slate-500 text-xs uppercase tracking-wider block">Totaal Resultaat</span>
              <div className={`text-xl font-bold flex items-center justify-end gap-1 ${isProfit ? 'text-emerald-600' : 'text-red-600'}`}>
                {isProfit ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                {formatEuro(result)}
              </div>
              <span className={`text-xs ${isProfit ? 'text-emerald-600' : 'text-red-600'}`}>
                {isProfit ? '+' : ''}{percentage.toFixed(2)}%
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 sm:ml-4">
            <button 
                onClick={() => onEdit(holding)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-600 p-2 rounded-lg transition border border-slate-200"
                title="Aanpassen"
            >
                <Edit2 className="w-4 h-4" />
            </button>
            <button 
                onClick={() => onDelete(holding.id)}
                className="bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-600 p-2 rounded-lg transition border border-slate-200 hover:border-red-200"
                title="Verwijderen"
            >
                <Trash2 className="w-4 h-4" />
            </button>
        </div>
      </div>
    </div>
  );
};

export default ETFRow;