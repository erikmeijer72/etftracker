import React, { useState, useEffect } from 'react';
import { PortfolioSummary } from '../types';
import { Wallet, TrendingUp, TrendingDown, PiggyBank, Edit2, RotateCcw } from 'lucide-react';

interface Props {
  summary: PortfolioSummary;
  onUpdateManualTotal: (value: number | null) => void;
}

const SummaryCards: React.FC<Props> = ({ summary, onUpdateManualTotal }) => {
  const isProfit = summary.totalResult >= 0;
  const [isEditingTotal, setIsEditingTotal] = useState(false);
  const [manualInput, setManualInput] = useState('');

  useEffect(() => {
    if (summary.isManualTotal) {
      setManualInput(summary.currentValue.toString());
    } else {
        setManualInput('');
    }
  }, [summary.isManualTotal, summary.currentValue]);

  const formatEuro = (val: number) => 
    new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(val);
    
  const formatEuroPrecise = (val: number) => 
    new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(val);

  const handleSaveManual = () => {
    const val = parseFloat(manualInput);
    if (!isNaN(val)) {
        onUpdateManualTotal(val);
    }
    setIsEditingTotal(false);
  };

  const handleResetManual = () => {
    onUpdateManualTotal(null);
    setManualInput('');
    setIsEditingTotal(false);
  };

  // Common card styles
  const cardClass = "bg-white p-3 sm:p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between h-full";
  const iconBgClass = "p-1.5 sm:p-2 rounded-lg";
  const labelClass = "text-slate-500 text-[10px] sm:text-xs font-medium uppercase tracking-wide";
  const valueClass = "text-lg sm:text-2xl font-bold text-slate-900 leading-tight";

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 mb-4 sm:mb-8">
      {/* Current Value (Editable) */}
      <div className={`${cardClass} relative group col-span-2 sm:col-span-1`}>
        <div className="flex items-center justify-between mb-1 sm:mb-2">
          <h3 className={labelClass}>
             {summary.isManualTotal ? 'Totaal (Handmatig)' : 'Waarde'}
          </h3>
          <div className={`${iconBgClass} bg-blue-50`}>
            <Wallet className="w-4 h-4 sm:w-6 sm:h-6 text-[#0099CC]" />
          </div>
        </div>

        {isEditingTotal ? (
            <div className="flex flex-col gap-2">
                <input 
                    type="number" 
                    value={manualInput}
                    onChange={(e) => setManualInput(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded px-2 py-1 text-slate-900 focus:ring-2 focus:ring-[#0099CC] outline-none text-base font-bold"
                    placeholder="Totaal..."
                    autoFocus
                />
                <div className="flex gap-1">
                    <button onClick={handleSaveManual} className="flex-1 bg-[#0099CC] text-white text-[10px] py-1 rounded">
                        Ok
                    </button>
                     <button onClick={handleResetManual} className="flex-1 bg-slate-200 text-slate-600 text-[10px] py-1 rounded">
                        Reset
                    </button>
                </div>
            </div>
        ) : (
            <div>
                <div className="flex items-center gap-2">
                    <p className={valueClass}>{formatEuroPrecise(summary.currentValue)}</p>
                    <button 
                        onClick={() => setIsEditingTotal(true)}
                        className="p-1 rounded bg-slate-100 text-slate-500 hover:text-slate-900 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition"
                    >
                        <Edit2 className="w-3 h-3" />
                    </button>
                </div>
                {summary.isManualTotal ? (
                    <div className="mt-1 text-[10px] text-slate-400 flex items-center justify-between">
                        <span>Som: {formatEuro(summary.calculatedValue)}</span>
                    </div>
                ) : (
                   <p className="text-[10px] text-slate-400 mt-0.5">Som van posities</p>
                )}
            </div>
        )}
      </div>

      {/* Invested */}
      <div className={cardClass}>
        <div className="flex items-center justify-between mb-1 sm:mb-2">
          <h3 className={labelClass}>Inleg</h3>
          <div className={`${iconBgClass} bg-indigo-50`}>
            <PiggyBank className="w-4 h-4 sm:w-6 sm:h-6 text-indigo-500" />
          </div>
        </div>
        <div>
            <p className={valueClass}>{formatEuro(summary.totalInvested)}</p>
            <p className="text-[10px] text-slate-400 mt-0.5">Kosten: {formatEuro(summary.totalFees)}</p>
        </div>
      </div>

      {/* Result Absolute */}
      <div className={cardClass}>
        <div className="flex items-center justify-between mb-1 sm:mb-2">
          <h3 className={labelClass}>Resultaat</h3>
          <div className={`${iconBgClass} ${isProfit ? 'bg-emerald-50' : 'bg-red-50'}`}>
            {isProfit ? (
              <TrendingUp className="w-4 h-4 sm:w-6 sm:h-6 text-emerald-600" />
            ) : (
              <TrendingDown className="w-4 h-4 sm:w-6 sm:h-6 text-red-600" />
            )}
          </div>
        </div>
        <p className={`text-lg sm:text-2xl font-bold ${isProfit ? 'text-emerald-600' : 'text-red-600'}`}>
          {isProfit ? '+' : ''}{formatEuro(summary.totalResult)}
        </p>
      </div>

      {/* Result Percentage */}
      <div className={cardClass}>
        <div className="flex items-center justify-between mb-1 sm:mb-2">
          <h3 className={labelClass}>Rendement</h3>
          <div className={`${iconBgClass} ${isProfit ? 'bg-emerald-50' : 'bg-red-50'}`}>
             {isProfit ? (
              <TrendingUp className="w-4 h-4 sm:w-6 sm:h-6 text-emerald-600" />
            ) : (
              <TrendingDown className="w-4 h-4 sm:w-6 sm:h-6 text-red-600" />
            )}
          </div>
        </div>
        <p className={`text-lg sm:text-2xl font-bold ${isProfit ? 'text-emerald-600' : 'text-red-600'}`}>
          {isProfit ? '+' : ''}{summary.percentageResult.toFixed(1)}%
        </p>
      </div>
    </div>
  );
};

export default SummaryCards;