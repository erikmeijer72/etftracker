import React, { useMemo } from 'react';
import { X, Receipt } from 'lucide-react';
import { Holding } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  holdings: Holding[];
}

const TransactionsModal: React.FC<Props> = ({ isOpen, onClose, holdings }) => {
  if (!isOpen) return null;

  // Sort holdings by purchase date (newest first)
  const sortedHoldings = useMemo(() => {
    return [...holdings].sort((a, b) => 
      new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime()
    );
  }, [holdings]);

  const totalFees = holdings.reduce((sum, h) => sum + h.transactionFees, 0);
  const totalInvested = holdings.reduce((sum, h) => sum + (h.quantity * h.averagePrice) + h.transactionFees, 0);

  // Formatter for footer totals (with currency symbol)
  const formatEuro = (val: number) => 
    new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(val);

  // Formatter for table values (compact, no symbol)
  const formatNumber = (val: number) => 
    new Intl.NumberFormat('nl-NL', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(val);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    // Compact date format: 01-01-24
    return new Date(dateStr).toLocaleDateString('nl-NL', { day: '2-digit', month: '2-digit', year: '2-digit' });
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-4xl border border-slate-200 shadow-2xl flex flex-col max-h-[90vh] animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-100 p-2 rounded-lg">
                <Receipt className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
                <h2 className="text-lg font-bold text-slate-900">Transacties</h2>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-800 transition p-2 hover:bg-slate-100 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Table Container */}
        <div className="flex-1 overflow-auto bg-slate-50">
          <table className="w-full text-left border-collapse">
            <thead className="bg-white sticky top-0 shadow-sm z-10">
              <tr>
                <th className="py-2 px-3 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">Datum</th>
                <th className="py-2 px-3 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">ETF</th>
                <th className="py-2 px-3 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100 text-right">#</th>
                <th className="py-2 px-3 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100 text-right">Prijs</th>
                <th className="py-2 px-3 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100 text-right">Kosten</th>
                <th className="py-2 px-3 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100 text-right">Totaal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {sortedHoldings.length === 0 ? (
                <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400 text-sm">
                        Nog geen transacties gevonden.
                    </td>
                </tr>
              ) : (
                sortedHoldings.map(h => {
                    const lineTotal = (h.quantity * h.averagePrice) + h.transactionFees;
                    return (
                        <tr key={h.id} className="bg-white hover:bg-slate-50 transition-colors">
                            <td className="py-2 px-3 text-xs sm:text-sm text-slate-600 whitespace-nowrap font-medium">
                                {formatDate(h.purchaseDate)}
                            </td>
                            <td className="py-2 px-3 text-xs sm:text-sm text-slate-900 font-bold max-w-[150px] truncate">
                                {h.ticker}
                            </td>
                            <td className="py-2 px-3 text-xs sm:text-sm text-slate-700 text-right tabular-nums">
                                {h.quantity}
                            </td>
                            <td className="py-2 px-3 text-xs sm:text-sm text-slate-700 text-right tabular-nums">
                                {formatNumber(h.averagePrice)}
                            </td>
                            <td className="py-2 px-3 text-xs sm:text-sm text-red-600/80 text-right tabular-nums">
                                {h.transactionFees > 0 ? formatNumber(h.transactionFees) : '-'}
                            </td>
                            <td className="py-2 px-3 text-xs sm:text-sm text-slate-900 font-bold text-right tabular-nums">
                                {formatNumber(lineTotal)}
                            </td>
                        </tr>
                    );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Totals */}
        <div className="bg-white border-t border-slate-200 p-4 shrink-0 grid grid-cols-2 gap-4 sm:flex sm:justify-end sm:gap-8">
            <div className="text-right">
                <p className="text-[10px] sm:text-xs text-slate-500 uppercase font-bold">Totaal Kosten</p>
                <p className="text-base sm:text-lg font-mono font-medium text-red-600">{formatEuro(totalFees)}</p>
            </div>
            <div className="text-right">
                <p className="text-[10px] sm:text-xs text-slate-500 uppercase font-bold">Totaal Geïnvesteerd</p>
                <p className="text-base sm:text-lg font-mono font-bold text-slate-900">{formatEuro(totalInvested)}</p>
            </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionsModal;