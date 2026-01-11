import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { Holding } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (holding: Omit<Holding, 'id' | 'updatedAt'> | Holding) => void;
  initialData?: Holding | null;
}

const AddHoldingModal: React.FC<Props> = ({ isOpen, onClose, onSave, initialData }) => {
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');
  const [fees, setFees] = useState('0');

  useEffect(() => {
    if (isOpen && initialData) {
      setName(initialData.name);
      setQuantity(initialData.quantity.toString());
      setPrice(initialData.averagePrice.toString());
      setFees(initialData.transactionFees.toString());
    } else if (isOpen) {
      // Reset for new entry
      setName('');
      setQuantity('');
      setPrice('');
      setFees('0');
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Ensure fees are treated as absolute/positive numbers even if user types negative
    const feesValue = Math.abs(Number(fees));
    const avgPrice = Number(price);

    // Use existing ticker if editing, otherwise generate one from the name
    let ticker = initialData?.ticker || '';
    if (!ticker) {
      // Generate pseudo-ticker from name (first word or first few chars)
      const cleanName = name.trim().toUpperCase();
      // Simple heuristic: take first word, remove non-alphanumeric, max 8 chars
      const firstWord = cleanName.split(' ')[0].replace(/[^A-Z0-9]/g, '');
      ticker = firstWord.substring(0, 8) || 'ETF';
    }

    const holdingData = {
      ticker: ticker,
      name: name,
      quantity: Number(quantity),
      averagePrice: avgPrice,
      transactionFees: feesValue,
      // If updating, keep the existing current price. If new, default to buy price.
      currentPrice: initialData ? initialData.currentPrice : avgPrice,
    };

    if (initialData) {
      onSave({ ...initialData, ...holdingData, updatedAt: Date.now() });
    } else {
      onSave(holdingData);
    }
    
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md border border-slate-200 shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="p-6 border-b border-slate-200 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-slate-900">
            {initialData ? 'ETF Aanpassen' : 'Nieuwe ETF Toevoegen'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-800 transition">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-600">Naam ETF</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-4 py-2 text-slate-900 focus:ring-2 focus:ring-[#0099CC] outline-none"
              placeholder="bv. Vanguard FTSE All-World"
              required
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-600">Aantal</label>
              <input 
                type="number" 
                step="any"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-4 py-2 text-slate-900 focus:ring-2 focus:ring-[#0099CC] outline-none"
                placeholder="0"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-600">Aankoopprijs (€)</label>
              <input 
                type="number" 
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-4 py-2 text-slate-900 focus:ring-2 focus:ring-[#0099CC] outline-none"
                placeholder="0.00"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-600">Transactiekosten (€)</label>
            <input 
              type="number" 
              step="0.01"
              value={fees}
              onChange={(e) => setFees(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-4 py-2 text-slate-900 focus:ring-2 focus:ring-[#0099CC] outline-none"
              placeholder="0.00"
            />
            <p className="text-xs text-slate-400">Voer in als positief bedrag.</p>
          </div>

          <button 
            type="submit"
            className="w-full bg-[#0099CC] hover:bg-[#0088b6] text-white font-medium py-3 rounded-lg mt-6 transition shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2"
          >
            <Save className="w-5 h-5" />
            {initialData ? 'Opslaan' : 'Toevoegen'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddHoldingModal;