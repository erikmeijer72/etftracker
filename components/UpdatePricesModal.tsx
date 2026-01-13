import React, { useState, useMemo, useRef, useEffect } from 'react';
import { X, Save, TrendingUp, ChevronLeft, Calendar, Search, CheckCircle2 } from 'lucide-react';
import { Holding } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  holdings: Holding[];
  onUpdatePrice: (id: string, price: number, date: string) => void;
}

const UpdatePricesModal: React.FC<Props> = ({ isOpen, onClose, holdings, onUpdatePrice }) => {
  const [selectedHolding, setSelectedHolding] = useState<Holding | null>(null);
  const [price, setPrice] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  
  const priceInputRef = useRef<HTMLInputElement>(null);

  // Filter holdings based on search
  const filteredHoldings = useMemo(() => {
    return holdings.filter(h => 
      h.ticker.toLowerCase().includes(searchTerm.toLowerCase()) || 
      h.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [holdings, searchTerm]);

  // Focus price input when an ETF is selected
  useEffect(() => {
    if (selectedHolding && priceInputRef.current) {
        priceInputRef.current.focus();
    }
  }, [selectedHolding]);

  if (!isOpen) return null;

  const handleSelect = (holding: Holding) => {
    setSelectedHolding(holding);
    setPrice(holding.currentPrice.toString());
    setShowSuccess(false);
  };

  const handleBack = () => {
    setSelectedHolding(null);
    setPrice('');
    setShowSuccess(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedHolding && price) {
      onUpdatePrice(selectedHolding.id, parseFloat(price), date);
      setShowSuccess(true);
      
      // Auto-hide success after 3 seconds
      setTimeout(() => setShowSuccess(false), 3000);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md border border-slate-200 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex justify-between items-center shrink-0 bg-white">
          <div className="flex items-center gap-3">
            {selectedHolding ? (
                <button 
                  onClick={handleBack} 
                  className="p-2 hover:bg-slate-100 rounded-full transition text-slate-500"
                  aria-label="Terug naar selectie"
                >
                    <ChevronLeft className="w-5 h-5" />
                </button>
            ) : (
                <div className="bg-emerald-100 p-2 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-emerald-600" />
                </div>
            )}
            <div>
                <h2 className="text-lg font-bold text-slate-900 leading-tight">
                    {selectedHolding ? selectedHolding.ticker : 'Koers aanpassen'}
                </h2>
                {!selectedHolding && <p className="text-xs text-slate-500">Kies een ETF uit je portfolio</p>}
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-800 transition p-2">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto bg-slate-50/30">
            {!selectedHolding ? (
                /* STAP 1: SELECTEER ETF */
                <div className="p-4 space-y-4">
                    {holdings.length > 5 && (
                        <div className="relative">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input 
                                type="text"
                                placeholder="Zoek op naam of ticker..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#0099CC] outline-none"
                            />
                        </div>
                    )}

                    <div className="grid grid-cols-1 gap-2">
                        {holdings.length === 0 ? (
                            <div className="text-center py-12">
                                <p className="text-slate-400 text-sm">Geen ETF's gevonden in je portfolio.</p>
                            </div>
                        ) : filteredHoldings.length === 0 ? (
                            <p className="text-center py-8 text-slate-400 text-sm">Geen resultaten voor "{searchTerm}"</p>
                        ) : (
                            filteredHoldings.map(h => (
                                <button 
                                    key={h.id}
                                    onClick={() => handleSelect(h)}
                                    className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-xl hover:border-[#0099CC] hover:shadow-md transition-all text-left group"
                                >
                                    <div className="min-w-0">
                                        <div className="font-bold text-slate-900 flex items-center gap-2">
                                            {h.ticker}
                                            <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-normal">
                                                €{h.currentPrice.toFixed(2)}
                                            </span>
                                        </div>
                                        <div className="text-xs text-slate-500 truncate">{h.name}</div>
                                    </div>
                                    <div className="shrink-0 ml-4">
                                        <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-blue-50 group-hover:text-[#0099CC] transition-colors">
                                            <ChevronLeft className="w-4 h-4 rotate-180" />
                                        </div>
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                </div>
            ) : (
                /* STAP 2: VOER DATUM EN PRIJS IN */
                <div className="p-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {showSuccess && (
                            <div className="bg-emerald-50 border border-emerald-100 text-emerald-700 px-4 py-3 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                                <CheckCircle2 className="w-5 h-5 shrink-0" />
                                <span className="text-sm font-medium">Koers succesvol opgeslagen!</span>
                            </div>
                        )}

                        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Positie details</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-[10px] text-slate-500 uppercase">Aantal</p>
                                    <p className="text-sm font-bold text-slate-900">{selectedHolding.quantity} stuks</p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-slate-500 uppercase">GAK</p>
                                    <p className="text-sm font-bold text-slate-900">€{selectedHolding.averagePrice.toFixed(2)}</p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2 px-1">
                                    <Calendar className="w-3.5 h-3.5" /> Datum van koers
                                </label>
                                <input 
                                    type="date" 
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:ring-2 focus:ring-[#0099CC] outline-none shadow-sm"
                                    required
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-500 uppercase px-1">Koers op die datum (€)</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">€</span>
                                    <input 
                                        ref={priceInputRef}
                                        type="number" 
                                        step="0.0001"
                                        value={price}
                                        onChange={(e) => setPrice(e.target.value)}
                                        className="w-full bg-white border border-slate-200 rounded-xl pl-8 pr-4 py-4 text-slate-900 focus:ring-2 focus:ring-[#0099CC] outline-none font-mono text-xl shadow-sm"
                                        placeholder="0,00"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="pt-2">
                            <button 
                                type="submit"
                                className="w-full bg-[#0099CC] hover:bg-[#0088b6] text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 active:scale-[0.98]"
                            >
                                <Save className="w-5 h-5" />
                                Koers Opslaan
                            </button>
                            
                            <button 
                                type="button"
                                onClick={handleBack}
                                className="w-full mt-3 text-slate-500 text-sm font-medium py-2 hover:text-slate-800 transition-colors"
                            >
                                Andere ETF kiezen
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default UpdatePricesModal;