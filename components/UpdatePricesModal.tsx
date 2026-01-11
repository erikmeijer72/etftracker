import React, { useState, useEffect } from 'react';
import { X, Save, TrendingUp } from 'lucide-react';
import { Holding } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  holdings: Holding[];
  onSave: (updates: { id: string; price: number }[]) => void;
}

const UpdatePricesModal: React.FC<Props> = ({ isOpen, onClose, holdings, onSave }) => {
  const [prices, setPrices] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (isOpen) {
      const initialPrices: { [key: string]: string } = {};
      holdings.forEach(h => {
        initialPrices[h.id] = h.currentPrice.toString();
      });
      setPrices(initialPrices);
    }
  }, [isOpen, holdings]);

  if (!isOpen) return null;

  const handlePriceChange = (id: string, value: string) => {
    setPrices(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updates = Object.entries(prices).map(([id, priceStr]) => ({
      id,
      price: parseFloat(priceStr as string) || 0
    }));
    onSave(updates);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl border border-slate-200 shadow-2xl flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-slate-200 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-100 p-2 rounded-lg">
                <TrendingUp className="w-5 h-5 text-emerald-600" />
            </div>
            <h2 className="text-xl font-semibold text-slate-900">Actuele Koersen Updaten</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-800 transition">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="overflow-y-auto p-6 space-y-4 flex-1">
            {holdings.length === 0 ? (
                <p className="text-slate-500 text-center py-4">Geen ETF's om te updaten.</p>
            ) : (
                <div className="grid gap-4">
                    {holdings.map(holding => (
                        <div key={holding.id} className="flex items-center justify-between bg-slate-50 p-4 rounded-xl border border-slate-200">
                            <div className="flex-1 pr-4">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="font-bold text-slate-900">{holding.ticker}</span>
                                    <span className="text-xs text-slate-600 bg-white border border-slate-200 px-2 py-0.5 rounded">
                                        {holding.quantity} stuks
                                    </span>
                                </div>
                                <div className="text-sm text-slate-500 truncate">{holding.name}</div>
                            </div>
                            
                            <div className="flex flex-col items-end gap-1">
                                <label className="text-xs text-slate-500 uppercase font-semibold">Prijs per stuk (€)</label>
                                <input 
                                    type="number" 
                                    step="0.01"
                                    value={prices[holding.id] || ''}
                                    onChange={(e) => handlePriceChange(holding.id, e.target.value)}
                                    className="w-32 bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 text-right focus:ring-2 focus:ring-[#0099CC] outline-none font-mono"
                                    placeholder="0.00"
                                />
                            </div>
                        </div>
                    ))}
                </div>
            )}
          </div>

          <div className="p-6 border-t border-slate-200 bg-slate-50 shrink-0">
            <button 
                type="submit"
                className="w-full bg-[#0099CC] hover:bg-[#0088b6] text-white font-medium py-3 rounded-lg transition shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2"
            >
                <Save className="w-5 h-5" />
                Alle Koersen Opslaan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdatePricesModal;