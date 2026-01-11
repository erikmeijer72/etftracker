import React, { useState, useEffect, useMemo } from 'react';
import { Plus, BarChart3, LayoutDashboard, RefreshCw } from 'lucide-react';
import { Holding, PortfolioSummary } from './types';
import SummaryCards from './components/SummaryCards';
import AddHoldingModal from './components/AddHoldingModal';
import UpdatePricesModal from './components/UpdatePricesModal';
import ETFRow from './components/ETFRow';
import PortfolioChart from './components/PortfolioChart';

const App: React.FC = () => {
  // Initialize holdings state with error handling
  const [holdings, setHoldings] = useState<Holding[]>(() => {
    try {
      const saved = localStorage.getItem('etf_portfolio');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error("Error loading portfolio from storage:", e);
      return [];
    }
  });

  // Initialize manual total value state
  const [manualTotalValue, setManualTotalValue] = useState<number | null>(() => {
    try {
      const saved = localStorage.getItem('etf_portfolio_manual_total');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPricesModalOpen, setIsPricesModalOpen] = useState(false);
  const [editingHolding, setEditingHolding] = useState<Holding | null>(null);

  // Persist to local storage
  useEffect(() => {
    try {
      localStorage.setItem('etf_portfolio', JSON.stringify(holdings));
    } catch (e) {
      console.error("Error saving portfolio:", e);
    }
  }, [holdings]);

  useEffect(() => {
    try {
      if (manualTotalValue === null) {
          localStorage.removeItem('etf_portfolio_manual_total');
      } else {
          localStorage.setItem('etf_portfolio_manual_total', JSON.stringify(manualTotalValue));
      }
    } catch (e) {
      console.error("Error saving manual total:", e);
    }
  }, [manualTotalValue]);

  // Robust ID generator that works in non-secure contexts
  const generateId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
  };

  const saveHolding = (holdingData: Omit<Holding, 'id' | 'updatedAt'> | Holding) => {
    if ('id' in holdingData) {
        // Update existing
        setHoldings(prev => prev.map(h => h.id === holdingData.id ? holdingData as Holding : h));
    } else {
        // Create new
        const newHolding: Holding = {
            ...holdingData,
            id: generateId(),
            updatedAt: Date.now(),
        };
        setHoldings(prev => [...prev, newHolding]);
    }
    setEditingHolding(null);
  };

  const updatePrices = (updates: { id: string; price: number }[]) => {
    setHoldings(prev => prev.map(holding => {
      const update = updates.find(u => u.id === holding.id);
      if (update) {
        return { ...holding, currentPrice: update.price, updatedAt: Date.now() };
      }
      return holding;
    }));
  };

  const handleEditHolding = (holding: Holding) => {
      setEditingHolding(holding);
      setIsModalOpen(true);
  };

  const handleCloseModal = () => {
      setIsModalOpen(false);
      setEditingHolding(null);
  };

  const deleteHolding = (id: string) => {
    if(window.confirm("Weet je zeker dat je deze positie wilt verwijderen?")) {
      setHoldings(prev => prev.filter(h => h.id !== id));
    }
  };

  // Calculate summary statistics
  const summary: PortfolioSummary = useMemo(() => {
    let totalInvested = 0;
    let calculatedCurrentValue = 0;
    let totalFees = 0;

    holdings.forEach(h => {
      totalInvested += (h.quantity * h.averagePrice) + h.transactionFees;
      calculatedCurrentValue += h.quantity * h.currentPrice;
      totalFees += h.transactionFees;
    });

    const isManualTotal = manualTotalValue !== null;
    const effectiveCurrentValue = isManualTotal ? manualTotalValue : calculatedCurrentValue;
    const totalResult = effectiveCurrentValue - totalInvested;
    const percentageResult = totalInvested > 0 ? (totalResult / totalInvested) * 100 : 0;

    return {
      totalInvested,
      currentValue: effectiveCurrentValue,
      calculatedValue: calculatedCurrentValue,
      totalFees,
      totalResult,
      percentageResult,
      isManualTotal
    };
  }, [holdings, manualTotalValue]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      {/* Navbar - Reduced height */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="bg-[#0099CC] p-1.5 sm:p-2 rounded-lg">
                <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900">ETF Portfolio</h1>
            </div>
            <div className="text-xs text-slate-500 font-mono hidden sm:block bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
              {holdings.length} Posities
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content - Reduced padding */}
      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        
        {/* Welcome / Stats */}
        <div className="mb-4 sm:mb-6">
          <SummaryCards 
            summary={summary} 
            onUpdateManualTotal={setManualTotalValue} 
          />
        </div>

        {/* Actions Bar */}
        <div className="flex items-center justify-between mb-3 sm:mb-6 gap-2">
          <h2 className="text-lg sm:text-xl font-bold text-slate-800">Mijn ETF's</h2>
          <div className="flex gap-2">
            <button 
                onClick={() => setIsPricesModalOpen(true)}
                className="bg-white hover:bg-slate-50 text-slate-700 px-3 py-2 sm:px-4 rounded-lg font-medium transition flex items-center justify-center gap-2 border border-slate-300 shadow-sm text-sm"
            >
                <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5 text-slate-500" />
                <span className="hidden sm:inline">Koersen Updaten</span>
                <span className="sm:hidden">Updaten</span>
            </button>
            <button 
                onClick={() => setIsModalOpen(true)}
                className="bg-[#0099CC] hover:bg-[#0088b6] text-white px-3 py-2 sm:px-4 rounded-lg font-medium transition flex items-center justify-center gap-2 shadow-md shadow-blue-500/20 text-sm"
            >
                <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">Nieuwe ETF</span>
                <span className="sm:hidden">Toevoegen</span>
            </button>
          </div>
        </div>

        {/* List of Holdings */}
        <div className="space-y-2 sm:space-y-4">
          {holdings.length === 0 ? (
            <div className="text-center py-12 sm:py-20 bg-white rounded-xl border border-slate-300 border-dashed">
              <div className="bg-slate-50 inline-block p-3 sm:p-4 rounded-full mb-3 sm:mb-4 border border-slate-100">
                <BarChart3 className="w-8 h-8 sm:w-10 sm:h-10 text-slate-400" />
              </div>
              <h3 className="text-base sm:text-lg font-medium text-slate-700">Nog geen ETFs</h3>
              <button 
                onClick={() => setIsModalOpen(true)}
                className="mt-4 text-[#0099CC] hover:text-[#0088b6] font-medium hover:underline text-sm sm:text-base"
              >
                + Voeg je eerste ETF toe
              </button>
            </div>
          ) : (
            <>
              {holdings.map(holding => (
                <ETFRow 
                  key={holding.id} 
                  holding={holding} 
                  onEdit={handleEditHolding}
                  onDelete={deleteHolding}
                />
              ))}
              
              {/* Graph at the bottom */}
              <PortfolioChart holdings={holdings} />
            </>
          )}
        </div>
      </main>

      {/* Modals */}
      <AddHoldingModal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
        onSave={saveHolding}
        initialData={editingHolding}
      />

      <UpdatePricesModal
        isOpen={isPricesModalOpen}
        onClose={() => setIsPricesModalOpen(false)}
        holdings={holdings}
        onSave={updatePrices}
      />
    </div>
  );
};

export default App;