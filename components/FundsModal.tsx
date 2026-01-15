import React, { useState, useEffect } from 'react';
import { X, Save, Wallet, Banknote, Clock } from 'lucide-react';
import { Funds } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  funds: Funds;
  onSave: (newFunds: Funds) => void;
}

const FundsModal: React.FC<Props> = ({ isOpen, onClose, funds, onSave }) => {
  const [cash, setCash] = useState('');
  const [assets, setAssets] = useState('');

  useEffect(() => {
    if (isOpen) {
      setCash(funds.cash === 0 ? '' : funds.cash.toString());
      setAssets(funds.assets === 0 ? '' : funds.assets.toString());
    }
  }, [isOpen, funds]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      cash: Number(cash) || 0,
      assets: Number(assets) || 0
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md border border-slate-200 shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="p-6 border-b border-slate-200 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-100 p-2 rounded-lg">
                <Wallet className="w-5 h-5 text-emerald-600" />
            </div>
            <h2 className="text-xl font-semibold text-slate-900">
                Geld & Claims
            </h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-800 transition">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                <Banknote className="w-4 h-4 text-slate-500" /> Vrij Cash Geld
            </label>
            <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">€</span>
                <input 
                type="number" 
                step="0.01"
                value={cash}
                onChange={(e) => setCash(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-8 pr-4 py-3 text-slate-900 focus:ring-2 focus:ring-[#0099CC] outline-none text-lg font-medium"
                placeholder="0.00"
                autoFocus
                />
            </div>
            <p className="text-xs text-slate-500">Geld dat je bezit maar (nog) niet in ETF's hebt belegd.</p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-500" /> Nog te ontvangen
            </label>
            <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">€</span>
                <input 
                type="number" 
                step="0.01"
                value={assets}
                onChange={(e) => setAssets(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-8 pr-4 py-3 text-slate-900 focus:ring-2 focus:ring-[#0099CC] outline-none text-lg font-medium"
                placeholder="0.00"
                />
            </div>
            <p className="text-xs text-slate-500">Compensaties of vergoedingen die nog niet zijn uitbetaald.</p>
          </div>

          <button 
            type="submit"
            className="w-full bg-[#0099CC] hover:bg-[#0088b6] text-white font-medium py-3 rounded-lg mt-4 transition shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2"
          >
            <Save className="w-5 h-5" />
            Opslaan
          </button>
        </form>
      </div>
    </div>
  );
};

export default FundsModal;