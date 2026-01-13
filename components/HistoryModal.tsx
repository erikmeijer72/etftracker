import React, { useState } from 'react';
import { X, Save, Trash2, Calendar, Plus } from 'lucide-react';
import { HistoryEntry } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  history: HistoryEntry[];
  onAdd: (date: string, value: number) => void;
  onDelete: (date: string) => void;
}

const HistoryModal: React.FC<Props> = ({ isOpen, onClose, history, onAdd, onDelete }) => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [value, setValue] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(value);
    if (!isNaN(val)) {
      onAdd(date, val);
      setValue('');
    }
  };

  const sortedHistory = [...history].sort((a, b) => b.timestamp - a.timestamp);

  const formatEuro = (val: number) => 
    new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(val);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg border border-slate-200 shadow-2xl flex flex-col max-h-[85vh]">
        <div className="p-4 sm:p-6 border-b border-slate-200 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-2 rounded-lg">
                <Calendar className="w-5 h-5 text-[#0099CC]" />
            </div>
            <h2 className="text-xl font-semibold text-slate-900">Portfolio Historie</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-800 transition">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* Add Entry Form */}
          <form onSubmit={handleSubmit} className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4">
            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                <Plus className="w-4 h-4" /> Punt toevoegen
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-500">Datum</label>
                <input 
                  type="date" 
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#0099CC] outline-none"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-500">Totale Waarde (€)</label>
                <input 
                  type="number" 
                  step="0.01"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#0099CC] outline-none"
                  placeholder="0.00"
                  required
                />
              </div>
            </div>
            <button 
              type="submit"
              className="w-full bg-[#0099CC] text-white text-sm font-bold py-2 rounded-lg hover:bg-[#0088b6] transition"
            >
              Toevoegen / Bijwerken
            </button>
          </form>

          {/* List of points */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Bestaande Datapunten</h3>
            {sortedHistory.length === 0 ? (
                <p className="text-center py-8 text-slate-400 text-sm">Nog geen historische data ingevoerd.</p>
            ) : (
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                    {sortedHistory.map(point => (
                        <div key={point.date} className="flex items-center justify-between p-3 bg-white hover:bg-slate-50 transition">
                            <div>
                                <p className="text-sm font-bold text-slate-900">{new Date(point.date).toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                                <p className="text-xs text-slate-500">{formatEuro(point.totalValue)}</p>
                            </div>
                            <button 
                                onClick={() => onDelete(point.date)}
                                className="p-2 text-slate-300 hover:text-red-500 transition"
                                title="Verwijderen"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                </div>
            )}
          </div>
        </div>

        <div className="p-4 border-t border-slate-200 shrink-0">
          <button 
            onClick={onClose}
            className="w-full bg-slate-100 text-slate-700 font-bold py-2.5 rounded-lg hover:bg-slate-200 transition"
          >
            Sluiten
          </button>
        </div>
      </div>
    </div>
  );
};

export default HistoryModal;