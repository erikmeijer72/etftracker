import React, { useState, useEffect } from 'react';
import { X, Save, Calendar } from 'lucide-react';
import { Holding } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (holding: Omit<Holding, 'id' | 'updatedAt'> | Holding, purchaseDate: string) => void;
  initialData?: Holding | null;
}

const AddHoldingModal: React.FC<Props> = ({ isOpen, onClose, onSave, initialData }) => {
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState(''); // Purchase price (GAK)
  const [currentPriceInput, setCurrentPriceInput] = useState(''); // Current market price
  const [fees, setFees] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  
  // Track if user has manually edited the current price to stop auto-sync
  const [isCurrentPriceManuallyChanged, setIsCurrentPriceManuallyChanged] = useState(false);

  useEffect(() => {
    if (isOpen && initialData) {
      setName(initialData.name);
      setQuantity(initialData.quantity.toString());
      setPrice(initialData.averagePrice.toString());
      setCurrentPriceInput(initialData.currentPrice.toString());
      // If fees are 0, leave empty to show placeholder, otherwise show value
      setFees(initialData.transactionFees === 0 ? '' : initialData.transactionFees.toString());
      setDate(initialData.purchaseDate || new Date().toISOString().split('T')[0]);
      setIsCurrentPriceManuallyChanged(true);
    } else if (isOpen) {
      setName('');
      setQuantity('');
      setPrice('');
      setCurrentPriceInput('');
      setFees('');
      setDate(new Date().toISOString().split('T')[0]);
      setIsCurrentPriceManuallyChanged(false);
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handlePurchasePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setPrice(val);
    // Auto-sync current price with purchase price if user hasn't manually touched current price
    // This is convenient for adding "just bought" items where price is the same
    if (!isCurrentPriceManuallyChanged) {
        setCurrentPriceInput(val);
    }
  };

  const handleCurrentPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentPriceInput(e.target.value);
    setIsCurrentPriceManuallyChanged(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const feesValue = Math.abs(Number(fees));
    const avgPrice = Number(price);
    const curPrice = Number(currentPriceInput);

    let ticker = initialData?.ticker || '';
    if (!ticker) {
      const cleanName = name.trim().toUpperCase();
      const firstWord = cleanName.split(' ')[0].replace(/[^A-Z0-9]/g, '');
      ticker = firstWord.substring(0, 8) || 'ETF';
    }

    const holdingData = {
      ticker: ticker,
      name: name,
      quantity: Number(quantity),
      averagePrice: avgPrice,
      transactionFees: feesValue,
      purchaseDate: date,
      currentPrice: curPrice || avgPrice, // Fallback to avgPrice if something goes wrong, but input is required
    };

    if (initialData) {
      onSave({ ...initialData, ...holdingData, updatedAt: Date.now() } as Holding, date);
    } else {
      onSave(holdingData, date);
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

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-600 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-slate-400" /> Aankoopdatum
            </label>
            <input 
              type="date" 
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-4 py-2 text-slate-900 focus:ring-2 focus:ring-[#0099CC] outline-none"
              required
            />
          </div>

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

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs sm:text-sm font-medium text-slate-600">Aankoopprijs (GAK)</label>
              <input 
                type="number" 
                step="0.01"
                value={price}
                onChange={handlePurchasePriceChange}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-4 py-2 text-slate-900 focus:ring-2 focus:ring-[#0099CC] outline-none"
                placeholder="0.00"
                required
              />
              <p className="text-[10px] text-slate-400">Prijs bij aankoop</p>
            </div>
            <div className="space-y-2">
              <label className="text-xs sm:text-sm font-bold text-[#0099CC]">Actuele Koers</label>
              <input 
                type="number" 
                step="0.01"
                value={currentPriceInput}
                onChange={handleCurrentPriceChange}
                className="w-full bg-white border border-[#0099CC]/30 rounded-lg px-4 py-2 text-slate-900 focus:ring-2 focus:ring-[#0099CC] outline-none font-medium"
                placeholder="0.00"
                required
              />
               <p className="text-[10px] text-slate-400">Huidige waarde</p>
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-100">
            <label className="text-sm font-medium text-slate-600">Transactiekosten (€)</label>
            <input 
              type="number" 
              step="0.01"
              value={fees}
              onChange={(e) => setFees(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-4 py-2 text-slate-900 focus:ring-2 focus:ring-[#0099CC] outline-none"
              placeholder="0.00"
            />
          </div>

          <button 
            type="submit"
            className="w-full bg-[#0099CC] hover:bg-[#0088b6] text-white font-medium py-3 rounded-lg mt-4 transition shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2"
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