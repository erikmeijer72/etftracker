import React, { useState, useMemo } from 'react';
import { X, TrendingUp, Filter } from 'lucide-react';
import { HistoryEntry, Holding } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  history: HistoryEntry[];
  holdings: Holding[];
}

const PriceHistoryModal: React.FC<Props> = ({ isOpen, onClose, history, holdings }) => {
  // Get unique tickers
  const uniqueTickers = useMemo(() => {
    return Array.from(new Set(holdings.map(h => h.ticker))).sort();
  }, [holdings]);

  const [selectedTicker, setSelectedTicker] = useState<string>(uniqueTickers[0] || '');

  // Update selected ticker if it becomes empty but we have tickers
  React.useEffect(() => {
    if (!selectedTicker && uniqueTickers.length > 0) {
      setSelectedTicker(uniqueTickers[0]);
    }
  }, [uniqueTickers, selectedTicker]);

  if (!isOpen) return null;

  // Calculate total quantity for the selected ticker to derive 'Price' from 'Value'
  const totalQuantity = holdings
    .filter(h => h.ticker === selectedTicker)
    .reduce((sum, h) => sum + h.quantity, 0);

  // Filter history entries that have data for this ticker
  const tickerHistory = history
    .filter(entry => entry.breakdown && entry.breakdown[selectedTicker] !== undefined)
    .sort((a, b) => b.timestamp - a.timestamp); // Newest first

  const formatEuro = (val: number) => 
    new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(val);
  
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('nl-NL', { day: '2-digit', month: 'short', year: '2-digit' });
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-4xl border border-slate-200 shadow-2xl flex flex-col max-h-[90vh] animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-100 p-2 rounded-lg">
                <TrendingUp className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
                <h2 className="text-lg font-bold text-slate-900">Koershistorie</h2>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-800 transition p-2 hover:bg-slate-100 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Ticker Selector (Horizontal Scroll) */}
        <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex gap-2 overflow-x-auto no-scrollbar">
            {uniqueTickers.length === 0 ? (
                 <span className="text-sm text-slate-400 italic">Geen ETF's beschikbaar</span>
            ) : (
                uniqueTickers.map(ticker => (
                    <button
                        key={ticker}
                        onClick={() => setSelectedTicker(ticker)}
                        className={`
                            px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all border
                            ${selectedTicker === ticker 
                                ? 'bg-[#0099CC] text-white border-[#0099CC] shadow-md shadow-blue-500/20' 
                                : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-100'
                            }
                        `}
                    >
                        {ticker}
                    </button>
                ))
            )}
        </div>

        {/* Table Container */}
        <div className="flex-1 overflow-auto bg-white">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 sticky top-0 shadow-sm z-10">
              <tr>
                <th className="py-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">Datum</th>
                <th className="py-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200 text-right">
                    Koers
                </th>
                <th className="py-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200 text-right">Positie Waarde</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {tickerHistory.length === 0 ? (
                <tr>
                    <td colSpan={3} className="py-12 text-center">
                        <div className="flex flex-col items-center justify-center text-slate-400">
                            <Filter className="w-8 h-8 mb-2 opacity-50" />
                            <p className="text-sm">Geen koersdata gevonden voor {selectedTicker}.</p>
                        </div>
                    </td>
                </tr>
              ) : (
                tickerHistory.map(entry => {
                    const value = entry.breakdown![selectedTicker];
                    
                    // PREFERRED: Use explicitly stored price if available
                    let displayPrice = 0;
                    if (entry.prices && entry.prices[selectedTicker] !== undefined) {
                        displayPrice = entry.prices[selectedTicker];
                    } else {
                        // FALLBACK: Calculate based on current quantity (legacy data support)
                        displayPrice = totalQuantity > 0 ? value / totalQuantity : 0;
                    }

                    return (
                        <tr key={entry.date} className="hover:bg-slate-50 transition-colors">
                            <td className="py-3 px-4 text-sm text-slate-600 font-medium">
                                {formatDate(entry.date)}
                            </td>
                            <td className="py-3 px-4 text-sm text-slate-900 font-bold text-right tabular-nums">
                                {formatEuro(displayPrice)}
                            </td>
                            <td className="py-3 px-4 text-sm text-slate-500 text-right tabular-nums font-mono">
                                {formatEuro(value)}
                            </td>
                        </tr>
                    );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PriceHistoryModal;