import React, { useState, useEffect, useMemo } from 'react';
import { Plus, BarChart3, LayoutDashboard, RefreshCw } from 'lucide-react';
import { Holding, PortfolioSummary } from './types';
import SummaryCards from './components/SummaryCards';
import AddHoldingModal from './components/AddHoldingModal';
import UpdatePricesModal from './components/UpdatePricesModal';
import ETFRow from './components/ETFRow';

const App: React.FC = () => {
  // Initialize holdings state
  const [holdings, setHoldings] = useState<Holding[]>(() => {
    const saved = localStorage.getItem('etf_portfolio');
    return saved ? JSON.parse(saved) : [];
  });

  // Initialize manual total value state
  const [manualTotalValue, setManualTotalValue] = useState<number | null>(() => {
      const saved = localStorage.getItem('etf_portfolio_manual_total');
      return saved ? JSON.parse(saved) : null;
  });
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPricesModalOpen, setIsPricesModalOpen] = useState(false);
  const [editingHolding, setEditingHolding] = useState<Holding | null>(null);

  // Persist to local storage
  useEffect(() => {
    localStorage.setItem('etf_portfolio', JSON.stringify(holdings));
  }, [holdings]);

  useEffect(() => {
    if (manualTotalValue === null) {
        localStorage.removeItem('etf_portfolio_manual_total');
    } else {
        localStorage.setItem('etf_portfolio_manual_total', JSON.stringify(manualTotalValue));
    }
  }, [manualTotalValue]);

  const saveHolding = (holdingData: Omit<Holding, 'id' | 'updatedAt'> | Holding) => {
    if ('id' in holdingData) {
        // Update existing
        setHoldings(prev => prev.map(h => h.id === holdingData.id ? holdingData as Holding : h));
    } else {
        // Create new
        const newHolding: Holding = {
            ...holdingData,
            id: crypto.randomUUID(),
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
      {/* Navbar */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              {/* Used a specific blue closer to the example */}
              <div className="bg-[#0099CC] p-2 rounded-lg">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900">Mijn ETF Portfolio</h1>
            </div>
            <div className="text-xs text-slate-500 font-mono hidden sm:block bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
              {holdings.length} Posities
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Welcome / Stats */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-slate-800">
            <LayoutDashboard className="w-6 h-6 text-[#0099CC]" />
            Overzicht
          </h2>
          <SummaryCards 
            summary={summary} 
            onUpdateManualTotal={setManualTotalValue} 
          />
        </div>

        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
          <h2 className="text-xl font-bold text-slate-800">Mijn ETFs</h2>
          <div className="flex gap-3 w-full sm:w-auto">
            <button 
                onClick={() => setIsPricesModalOpen(true)}
                className="flex-1 sm:flex-none bg-white hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg font-medium transition flex items-center justify-center gap-2 border border-slate-300 shadow-sm"
            >
                <RefreshCw className="w-5 h-5 text-slate-500" />
                <span>Koersen Updaten</span>
            </button>
            <button 
                onClick={() => setIsModalOpen(true)}
                className="flex-1 sm:flex-none bg-[#0099CC] hover:bg-[#0088b6] text-white px-4 py-2 rounded-lg font-medium transition flex items-center justify-center gap-2 shadow-md shadow-blue-500/20"
            >
                <Plus className="w-5 h-5" />
                <span>Nieuwe ETF</span>
            </button>
          </div>
        </div>

        {/* List of Holdings */}
        <div className="space-y-4">
          {holdings.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-slate-300 border-dashed">
              <div className="bg-slate-50 inline-block p-4 rounded-full mb-4 border border-slate-100">
                <BarChart3 className="w-10 h-10 text-slate-400" />
              </div>
              <h3 className="text-lg font-medium text-slate-700">Nog geen ETFs toegevoegd</h3>
              <p className="text-slate-500 mt-2 max-w-md mx-auto">
                Begin met het toevoegen van je eerste ETF positie om je portfolio op te bouwen en rendementen te volgen.
              </p>
              <button 
                onClick={() => setIsModalOpen(true)}
                className="mt-6 text-[#0099CC] hover:text-[#0088b6] font-medium hover:underline"
              >
                + Voeg je eerste ETF toe
              </button>
            </div>
          ) : (
            holdings.map(holding => (
              <ETFRow 
                key={holding.id} 
                holding={holding} 
                onEdit={handleEditHolding}
                onDelete={deleteHolding}
              />
            ))
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