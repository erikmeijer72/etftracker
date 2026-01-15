import React, { useState } from 'react';
import { PortfolioSummary, Holding } from '../types';
import { Wallet, TrendingUp, TrendingDown, PiggyBank, X, Calculator, Banknote, Coins, Clock } from 'lucide-react';

interface Props {
  summary: PortfolioSummary;
  holdings: Holding[];
}

const SummaryCards: React.FC<Props> = ({ summary, holdings }) => {
  const isProfit = summary.totalResult >= 0;
  const [showBreakdown, setShowBreakdown] = useState(false);

  const formatEuro = (val: number) => 
    new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(val);
    
  const formatEuroPrecise = (val: number) => 
    new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(val);

  // Common card styles
  const cardClass = "bg-white p-3 sm:p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between h-full";
  const iconBgClass = "p-1.5 sm:p-2 rounded-lg";
  const labelClass = "text-slate-500 text-[10px] sm:text-xs font-medium uppercase tracking-wide";
  const valueClass = "text-lg sm:text-2xl font-bold text-slate-900 leading-tight";

  return (
    <>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 mb-4 sm:mb-8">
        {/* Current Value (Clickable for Breakdown) */}
        <div className={`${cardClass} relative group`}>
          <div className="flex items-center justify-between mb-1 sm:mb-2">
            <h3 className={labelClass}>Totale Waarde</h3>
            <button 
                onClick={() => setShowBreakdown(true)}
                className={`${iconBgClass} bg-blue-50 hover:bg-blue-100 transition cursor-pointer`}
                title="Bekijk opbouw"
            >
              <Wallet className="w-4 h-4 sm:w-6 sm:h-6 text-[#0099CC]" />
            </button>
          </div>

          <div>
            <div className="flex items-center gap-2">
                <p className={valueClass}>{formatEuroPrecise(summary.currentValue)}</p>
            </div>
            {(summary.cash > 0 || summary.assets > 0) && (
                 <p className="text-[10px] text-slate-400 mt-0.5">Incl. cash & claims</p>
            )}
          </div>
        </div>

        {/* Invested */}
        <div className={cardClass}>
          <div className="flex items-center justify-between mb-1 sm:mb-2">
            <h3 className={labelClass}>Inleg (ETFs)</h3>
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

      {/* Breakdown Modal */}
      {showBreakdown && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-sm border border-slate-200 shadow-2xl flex flex-col max-h-[80vh] animate-in fade-in zoom-in duration-200">
                <div className="p-5 border-b border-slate-100 flex justify-between items-center shrink-0">
                    <div className="flex items-center gap-2">
                        <div className="bg-blue-50 p-1.5 rounded-lg">
                            <Calculator className="w-4 h-4 text-[#0099CC]" />
                        </div>
                        <h2 className="text-lg font-bold text-slate-900">Opbouw Waarde</h2>
                    </div>
                    <button onClick={() => setShowBreakdown(false)} className="text-slate-400 hover:text-slate-800 transition">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {/* FUNDS SECTION */}
                    {(summary.cash > 0 || summary.assets > 0) && (
                        <div className="space-y-3 mb-4 border-b border-slate-100 pb-4">
                             <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">Geld & Claims</h4>
                             {summary.cash > 0 && (
                                <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-white p-1.5 rounded-full text-emerald-600">
                                            <Banknote className="w-4 h-4" />
                                        </div>
                                        <div className="font-bold text-slate-900 text-sm">Vrij Cash Geld</div>
                                    </div>
                                    <div className="text-right font-bold text-emerald-700 text-sm whitespace-nowrap">
                                        {formatEuroPrecise(summary.cash)}
                                    </div>
                                </div>
                             )}
                             {summary.assets > 0 && (
                                <div className="flex items-center justify-between p-3 bg-amber-50 rounded-xl border border-amber-100">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-white p-1.5 rounded-full text-amber-600">
                                            <Clock className="w-4 h-4" />
                                        </div>
                                        <div className="font-bold text-slate-900 text-sm">Nog te ontvangen</div>
                                    </div>
                                    <div className="text-right font-bold text-amber-700 text-sm whitespace-nowrap">
                                        {formatEuroPrecise(summary.assets)}
                                    </div>
                                </div>
                             )}
                        </div>
                    )}

                    {/* ETF SECTION */}
                    <div className="space-y-3">
                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">ETF Portefeuille</h4>
                        {holdings.length === 0 ? (
                            <p className="text-center text-slate-400 text-sm py-2">Geen posities.</p>
                        ) : (
                            holdings.map(h => {
                                const val = h.quantity * h.currentPrice;
                                return (
                                    <div key={h.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                                        <div className="min-w-0 flex-1 pr-2">
                                            <div className="font-bold text-slate-900 truncate text-sm">{h.ticker}</div>
                                            <div className="text-xs text-slate-500">
                                                {h.quantity} stuks × {formatEuro(h.currentPrice)}
                                            </div>
                                        </div>
                                        <div className="text-right font-bold text-slate-900 text-sm whitespace-nowrap">
                                            {formatEuroPrecise(val)}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                <div className="p-4 bg-slate-50 border-t border-slate-200 rounded-b-2xl flex justify-between items-center">
                    <span className="text-sm font-medium text-slate-600">Totaal</span>
                    <span className="text-lg font-bold text-[#0099CC]">{formatEuroPrecise(summary.currentValue)}</span>
                </div>
            </div>
        </div>
      )}
    </>
  );
};

export default SummaryCards;