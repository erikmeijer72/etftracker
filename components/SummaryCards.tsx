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

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {/* Current Value (Editable) */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative group">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-slate-500 text-sm font-medium">
             {summary.isManualTotal ? 'Totale Waarde (Handmatig)' : 'Totale Waarde (Berekend)'}
          </h3>
          <div className="p-2 bg-blue-50 rounded-lg">
            <Wallet className="w-6 h-6 text-[#0099CC]" />
          </div>
        </div>

        {isEditingTotal ? (
            <div className="flex flex-col gap-2">
                <input 
                    type="number" 
                    value={manualInput}
                    onChange={(e) => setManualInput(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 text-slate-900 focus:ring-2 focus:ring-[#0099CC] outline-none text-lg font-bold"
                    placeholder="Totale waarde..."
                    autoFocus
                />
                <div className="flex gap-2">
                    <button onClick={handleSaveManual} className="flex-1 bg-[#0099CC] hover:bg-[#0088b6] text-white text-xs py-1 rounded">
                        Opslaan
                    </button>
                     <button onClick={handleResetManual} className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-600 text-xs py-1 rounded" title="Gebruik som van posities">
                        Reset
                    </button>
                </div>
            </div>
        ) : (
            <div>
                <div className="flex items-center gap-2">
                    <p className="text-3xl font-bold text-slate-900">{formatEuro(summary.currentValue)}</p>
                    <button 
                        onClick={() => setIsEditingTotal(true)}
                        className="p-1.5 rounded-lg bg-slate-100 text-slate-500 hover:text-slate-900 hover:bg-slate-200 transition opacity-0 group-hover:opacity-100 focus:opacity-100"
                        title="Waarde aanpassen"
                    >
                        <Edit2 className="w-4 h-4" />
                    </button>
                </div>
                {summary.isManualTotal && (
                    <div className="mt-2 text-xs text-slate-500 flex items-center justify-between">
                        <span>Som posities: {formatEuro(summary.calculatedValue)}</span>
                        <button onClick={handleResetManual} className="text-[#0099CC] hover:underline flex items-center gap-1">
                             <RotateCcw className="w-3 h-3" /> Reset
                        </button>
                    </div>
                )}
                 {!summary.isManualTotal && (
                    <div className="mt-2 text-xs text-slate-500">
                        Som van individuele posities
                    </div>
                )}
            </div>
        )}
      </div>

      {/* Invested */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-slate-500 text-sm font-medium">Totaal Geïnvesteerd</h3>
          <div className="p-2 bg-indigo-50 rounded-lg">
            <PiggyBank className="w-6 h-6 text-indigo-500" />
          </div>
        </div>
        <p className="text-2xl font-bold text-slate-900">{formatEuro(summary.totalInvested)}</p>
        <p className="text-xs text-slate-500 mt-1">Incl. {formatEuro(summary.totalFees)} kosten</p>
      </div>

      {/* Result Absolute */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-slate-500 text-sm font-medium">Resultaat (€)</h3>
          <div className={`p-2 rounded-lg ${isProfit ? 'bg-emerald-50' : 'bg-red-50'}`}>
            {isProfit ? (
              <TrendingUp className="w-6 h-6 text-emerald-600" />
            ) : (
              <TrendingDown className="w-6 h-6 text-red-600" />
            )}
          </div>
        </div>
        <p className={`text-2xl font-bold ${isProfit ? 'text-emerald-600' : 'text-red-600'}`}>
          {isProfit ? '+' : ''}{formatEuro(summary.totalResult)}
        </p>
        {summary.isManualTotal && <p className="text-xs text-slate-500 mt-1">o.b.v. handmatige totaalwaarde</p>}
      </div>

      {/* Result Percentage */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-slate-500 text-sm font-medium">Rendement (%)</h3>
          <div className={`p-2 rounded-lg ${isProfit ? 'bg-emerald-50' : 'bg-red-50'}`}>
             {isProfit ? (
              <TrendingUp className="w-6 h-6 text-emerald-600" />
            ) : (
              <TrendingDown className="w-6 h-6 text-red-600" />
            )}
          </div>
        </div>
        <p className={`text-3xl font-bold ${isProfit ? 'text-emerald-600' : 'text-red-600'}`}>
          {isProfit ? '+' : ''}{summary.percentageResult.toFixed(2)}%
        </p>
      </div>
    </div>
  );
};

export default SummaryCards;