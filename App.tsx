import React, { useState, useEffect, useMemo } from 'react';
import { Plus, BarChart3, RefreshCw, History as HistoryIcon, Receipt, TrendingUp, Download, Wallet } from 'lucide-react';
import { Holding, PortfolioSummary, HistoryEntry, Funds } from './types';
import SummaryCards from './components/SummaryCards';
import AddHoldingModal from './components/AddHoldingModal';
import UpdatePricesModal from './components/UpdatePricesModal';
import HistoryModal from './components/HistoryModal';
import TransactionsModal from './components/TransactionsModal';
import PriceHistoryModal from './components/PriceHistoryModal';
import FundsModal from './components/FundsModal';
import ETFRow from './components/ETFRow';
import PortfolioChart from './components/PortfolioChart';
import * as XLSX from 'xlsx';

const App: React.FC = () => {
  const [holdings, setHoldings] = useState<Holding[]>(() => {
    try {
      const saved = localStorage.getItem('etf_portfolio');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error("Error loading portfolio:", e);
      return [];
    }
  });

  const [funds, setFunds] = useState<Funds>(() => {
    try {
        const saved = localStorage.getItem('etf_portfolio_funds');
        return saved ? JSON.parse(saved) : { cash: 0, assets: 0 };
    } catch (e) {
        return { cash: 0, assets: 0 };
    }
  });

  const [history, setHistory] = useState<HistoryEntry[]>(() => {
    try {
      const saved = localStorage.getItem('etf_portfolio_history');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPricesModalOpen, setIsPricesModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isTransactionsModalOpen, setIsTransactionsModalOpen] = useState(false);
  const [isPriceHistoryModalOpen, setIsPriceHistoryModalOpen] = useState(false);
  const [isFundsModalOpen, setIsFundsModalOpen] = useState(false);
  const [editingHolding, setEditingHolding] = useState<Holding | null>(null);

  useEffect(() => {
    localStorage.setItem('etf_portfolio', JSON.stringify(holdings));
  }, [holdings]);

  useEffect(() => {
    localStorage.setItem('etf_portfolio_funds', JSON.stringify(funds));
  }, [funds]);

  useEffect(() => {
    localStorage.setItem('etf_portfolio_history', JSON.stringify(history));
  }, [history]);

  const generateId = () => Date.now().toString(36) + Math.random().toString(36).substring(2, 9);

  const calculateTotalInvested = (currentHoldings: Holding[]) => {
    return currentHoldings.reduce((sum, h) => sum + (h.quantity * h.averagePrice) + h.transactionFees, 0);
  };

  const calculateBreakdownAndTotal = (currentHoldings: Holding[]) => {
    const breakdown: { [ticker: string]: number } = {};
    const prices: { [ticker: string]: number } = {};
    let totalEtfValue = 0;

    currentHoldings.forEach(h => {
        const val = h.quantity * h.currentPrice;
        const key = h.ticker;
        breakdown[key] = (breakdown[key] || 0) + val;
        prices[key] = h.currentPrice;
        totalEtfValue += val;
    });

    return { totalEtfValue, breakdown, prices };
  };

  const saveFunds = (newFunds: Funds) => {
    setFunds(newFunds);
    
    // Also update today's history entry to reflect new cash balance
    const today = new Date().toISOString().split('T')[0];
    const { totalEtfValue, breakdown, prices } = calculateBreakdownAndTotal(holdings);
    const totalInvested = calculateTotalInvested(holdings);
    
    // New Total Value = ETFs + New Cash + New Assets
    const totalValue = totalEtfValue + newFunds.cash + newFunds.assets;

    setHistory(prev => {
        const filtered = prev.filter(p => p.date !== today);
        return [...filtered, {
            date: today,
            timestamp: new Date(today).getTime(),
            totalValue,
            totalInvested,
            breakdown,
            prices
        }].sort((a, b) => a.timestamp - b.timestamp);
    });
  };

  const saveHolding = (holdingData: Omit<Holding, 'id' | 'updatedAt'> | Holding, purchaseDate: string) => {
    let newHoldings: Holding[];
    
    if ('id' in holdingData) {
        newHoldings = holdings.map(h => h.id === holdingData.id ? { ...holdingData, purchaseDate } as Holding : h);
    } else {
        const newHolding: Holding = {
            ...holdingData,
            id: generateId(),
            purchaseDate,
            updatedAt: Date.now(),
        };
        newHoldings = [...holdings, newHolding];
    }
    
    setHoldings(newHoldings);
    setEditingHolding(null);

    // Update history for "Today" with the new state
    const today = new Date().toISOString().split('T')[0];
    const { totalEtfValue, breakdown: currentBreakdown, prices: currentPrices } = calculateBreakdownAndTotal(newHoldings);
    const currentTotalInvested = calculateTotalInvested(newHoldings);
    
    // Include current funds in total value
    const grandTotalValue = totalEtfValue + funds.cash + funds.assets;

    setHistory(prev => {
        // 1. Always update/add entry for TODAY
        const filtered = prev.filter(p => p.date !== today);
        const todayEntry: HistoryEntry = {
            date: today,
            timestamp: new Date(today).getTime(),
            totalValue: grandTotalValue,
            totalInvested: currentTotalInvested,
            breakdown: currentBreakdown,
            prices: currentPrices
        };
        
        let newHistory = [...filtered, todayEntry];

        // 2. If it's a new historical purchase, add the starting point if it doesn't exist
        if (purchaseDate !== today) {
             const exists = newHistory.some(p => p.date === purchaseDate);
             if (!exists) {
                 const breakdownAtPurchase: { [ticker: string]: number } = {};
                 const pricesAtPurchase: { [ticker: string]: number } = {};
                 let etfValAtPurchase = 0;
                 
                 const otherHoldings = 'id' in holdingData 
                    ? holdings.filter(h => h.id !== holdingData.id) 
                    : holdings;

                 otherHoldings.forEach(h => {
                    const val = h.quantity * h.currentPrice;
                    const key = h.ticker;
                    breakdownAtPurchase[key] = (breakdownAtPurchase[key] || 0) + val;
                    pricesAtPurchase[key] = h.currentPrice;
                    etfValAtPurchase += val;
                 });
                 
                 const newItemVal = holdingData.quantity * holdingData.averagePrice;
                 const key = holdingData.ticker;
                 breakdownAtPurchase[key] = (breakdownAtPurchase[key] || 0) + newItemVal;
                 pricesAtPurchase[key] = holdingData.averagePrice;
                 etfValAtPurchase += newItemVal;
                 
                 const estimatedInvested = calculateTotalInvested(otherHoldings) + newItemVal + holdingData.transactionFees;

                 newHistory.push({
                     date: purchaseDate,
                     timestamp: new Date(purchaseDate).getTime(),
                     totalValue: etfValAtPurchase + funds.cash + funds.assets,
                     totalInvested: estimatedInvested,
                     breakdown: breakdownAtPurchase,
                     prices: pricesAtPurchase
                 });
             }
        }

        return newHistory.sort((a, b) => a.timestamp - b.timestamp);
    });
  };

  const updateHoldingPrice = (id: string, newPrice: number, date: string) => {
    const targetHolding = holdings.find(h => h.id === id);
    if (!targetHolding) return;
    const targetTicker = targetHolding.ticker;

    const calculateEntryValues = (pricesMap: {[key:string]: number}, dateStr: string): HistoryEntry => {
         let etfValue = 0;
         let totalInvested = 0;
         const breakdown: {[key:string]: number} = {};
         
         holdings.forEach(h => {
             const p = pricesMap[h.ticker] ?? h.currentPrice;
             pricesMap[h.ticker] = p;
             
             const val = h.quantity * p;
             breakdown[h.ticker] = (breakdown[h.ticker] || 0) + val;
             etfValue += val;
             totalInvested += (h.quantity * h.averagePrice) + h.transactionFees;
         });

         return {
             date: dateStr,
             timestamp: new Date(dateStr).getTime(),
             totalValue: etfValue + funds.cash + funds.assets,
             totalInvested,
             breakdown,
             prices: pricesMap
         };
    };

    const sortedHistory = [...history].sort((a, b) => a.timestamp - b.timestamp);
    let newHistory = [...sortedHistory];
    const timestamp = new Date(date).getTime();

    let matchValue: number | undefined;
    const existingIndex = newHistory.findIndex(h => h.date === date);
    
    if (existingIndex !== -1) {
        matchValue = newHistory[existingIndex].prices?.[targetTicker];
    } else {
        const prevEntry = newHistory.filter(h => h.timestamp < timestamp).pop();
        matchValue = prevEntry?.prices?.[targetTicker];
    }

    let targetEntryIndex = existingIndex;
    
    if (targetEntryIndex === -1) {
        const prevEntry = newHistory.filter(h => h.timestamp < timestamp).pop();
        const basePrices = prevEntry ? { ...prevEntry.prices } : {};
        
        holdings.forEach(h => {
             if (basePrices[h.ticker] === undefined) basePrices[h.ticker] = h.currentPrice;
        });
        basePrices[targetTicker] = newPrice;
        
        const newEntry = calculateEntryValues(basePrices, date);
        newHistory.push(newEntry);
        newHistory.sort((a, b) => a.timestamp - b.timestamp);
        targetEntryIndex = newHistory.findIndex(h => h.date === date);
    } else {
        const basePrices = { ...(newHistory[targetEntryIndex].prices || {}) };
        holdings.forEach(h => {
             if (basePrices[h.ticker] === undefined) basePrices[h.ticker] = h.currentPrice;
        });
        basePrices[targetTicker] = newPrice;
        newHistory[targetEntryIndex] = calculateEntryValues(basePrices, date);
    }

    for (let i = targetEntryIndex + 1; i < newHistory.length; i++) {
        const entry = newHistory[i];
        const oldPrice = entry.prices?.[targetTicker];
        
        const shouldUpdate = 
            (matchValue !== undefined && oldPrice !== undefined && Math.abs(oldPrice - matchValue) < 0.001) ||
            (matchValue === undefined && (oldPrice === undefined || oldPrice === 0));

        if (shouldUpdate) {
            const newPrices = { ...(entry.prices || {}) };
            holdings.forEach(h => {
                if (newPrices[h.ticker] === undefined) newPrices[h.ticker] = h.currentPrice;
            });
            newPrices[targetTicker] = newPrice;
            newHistory[i] = calculateEntryValues(newPrices, entry.date);
        } else {
            break; 
        }
    }

    setHistory(newHistory);

    const lastEntry = newHistory[newHistory.length - 1];
    if (lastEntry && lastEntry.prices && lastEntry.prices[targetTicker] !== undefined) {
        setHoldings(prev => prev.map(h => {
            if (h.ticker === targetTicker) {
                return { ...h, currentPrice: lastEntry.prices![targetTicker], updatedAt: Date.now() };
            }
            return h;
        }));
    }
  };

  const deleteHolding = (id: string) => {
    if(window.confirm("Weet je zeker dat je deze positie wilt verwijderen?")) {
      setHoldings(prev => {
          const newHoldings = prev.filter(h => h.id !== id);
          const today = new Date().toISOString().split('T')[0];
          const { totalEtfValue, breakdown, prices } = calculateBreakdownAndTotal(newHoldings);
          const newInv = calculateTotalInvested(newHoldings);
          
          setHistory(hist => {
              const filtered = hist.filter(p => p.date !== today);
              return [...filtered, {
                  date: today,
                  timestamp: new Date(today).getTime(),
                  totalValue: totalEtfValue + funds.cash + funds.assets,
                  totalInvested: newInv,
                  breakdown,
                  prices
              }].sort((a, b) => a.timestamp - b.timestamp);
          });

          return newHoldings;
      });
    }
  };

  const addHistoryPoint = (date: string, value: number) => {
    setHistory(prev => {
      const filtered = prev.filter(p => p.date !== date);
      const newPoint: HistoryEntry = {
        date,
        timestamp: new Date(date).getTime(),
        totalValue: value,
        totalInvested: summary.totalInvested
      };
      return [...filtered, newPoint].sort((a, b) => a.timestamp - b.timestamp);
    });
  };

  const deleteHistoryPoint = (date: string) => {
    setHistory(prev => prev.filter(p => p.date !== date));
  };

  const handleExport = () => {
    const wb = XLSX.utils.book_new();

    const sortedHoldings = [...holdings].sort((a, b) => new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime());
    const transactionsData = sortedHoldings.map(h => ({
      Datum: h.purchaseDate,
      Ticker: h.ticker,
      Naam: h.name,
      Aantal: h.quantity,
      'Aankoopprijs (€)': h.averagePrice,
      'Huidige Koers (€)': h.currentPrice,
      'Kosten (€)': h.transactionFees,
      'Totaal Geïnvesteerd (€)': (h.quantity * h.averagePrice) + h.transactionFees,
      'Huidige Waarde (€)': h.quantity * h.currentPrice
    }));
    const wsTransactions = XLSX.utils.json_to_sheet(transactionsData);
    XLSX.utils.book_append_sheet(wb, wsTransactions, "Transacties");

    const allTickers = Array.from(new Set(holdings.map(h => h.ticker))).sort();
    const sortedHistory = [...history].sort((a, b) => b.timestamp - a.timestamp);
    
    const historyData = sortedHistory.map(entry => {
      const row: any = {
        Datum: entry.date,
        'Portfolio Waarde (€)': entry.totalValue,
        'Portfolio Inleg (€)': entry.totalInvested
      };
      
      allTickers.forEach(ticker => {
        const price = entry.prices ? entry.prices[ticker] : undefined;
        row[`${ticker} Koers`] = price !== undefined ? price : '';
      });
      
      return row;
    });
    const wsHistory = XLSX.utils.json_to_sheet(historyData);
    XLSX.utils.book_append_sheet(wb, wsHistory, "Koershistorie");

    const dateStr = new Date().toISOString().split('T')[0];
    XLSX.writeFile(wb, `ETF_Portfolio_Export_${dateStr}.xlsx`);
  };

  const summary: PortfolioSummary = useMemo(() => {
    const totalInvested = calculateTotalInvested(holdings);
    const { totalEtfValue } = calculateBreakdownAndTotal(holdings);
    const totalFees = holdings.reduce((sum, h) => sum + h.transactionFees, 0);

    const currentValue = totalEtfValue + funds.cash + funds.assets;
    const totalResult = totalEtfValue - totalInvested;
    const percentageResult = totalInvested > 0 ? (totalResult / totalInvested) * 100 : 0;

    return {
      totalInvested,
      etfValue: totalEtfValue,
      cash: funds.cash,
      assets: funds.assets,
      currentValue,
      totalFees,
      totalResult,
      percentageResult
    };
  }, [holdings, funds]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-3 items-center h-14 sm:h-16">
            <div className="flex justify-start">
              <div className="bg-[#0099CC] p-1.5 sm:p-2 rounded-lg shrink-0">
                <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
            </div>
            <div className="flex justify-center">
              <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 whitespace-nowrap">ETF Portfolio</h1>
            </div>
            <div className="flex justify-end">
              <button 
                onClick={handleExport}
                className="p-2 text-slate-500 hover:text-[#0099CC] hover:bg-slate-50 rounded-lg transition"
                title="Exporteer naar Excel"
              >
                <Download className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        <SummaryCards summary={summary} holdings={holdings} />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 sm:mb-6 gap-3">
          <h2 className="text-lg sm:text-xl font-bold text-slate-800">Mijn ETF's</h2>
          <div className="flex flex-wrap gap-2">
             <button 
                onClick={() => setIsTransactionsModalOpen(true)}
                className="flex-1 sm:flex-none bg-white hover:bg-slate-50 text-slate-700 px-3 py-2 rounded-lg font-medium transition flex items-center justify-center gap-2 border border-slate-300 shadow-sm text-sm"
                title="Bekijk transacties"
            >
                <Receipt className="w-4 h-4 sm:w-5 sm:h-5 text-slate-500" />
                <span className="hidden sm:inline">Transacties</span>
            </button>
            
            <button 
                onClick={() => setIsPriceHistoryModalOpen(true)}
                className="flex-1 sm:flex-none bg-white hover:bg-slate-50 text-slate-700 px-3 py-2 rounded-lg font-medium transition flex items-center justify-center gap-2 border border-slate-300 shadow-sm text-sm"
                title="Bekijk koersen"
            >
                <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-slate-500" />
                <span className="hidden sm:inline">Koersen</span>
            </button>

            <button 
                onClick={() => setIsFundsModalOpen(true)}
                className="flex-1 sm:flex-none bg-white hover:bg-slate-50 text-slate-700 px-3 py-2 rounded-lg font-medium transition flex items-center justify-center gap-2 border border-slate-300 shadow-sm text-sm"
                title="Geld & Claims beheren"
            >
                <Wallet className="w-4 h-4 sm:w-5 sm:h-5 text-slate-500" />
                <span className="inline">Kas & Claims</span>
            </button>

            <button 
                onClick={() => setIsPricesModalOpen(true)}
                className="flex-1 sm:flex-none bg-white hover:bg-slate-50 text-slate-700 px-3 py-2 rounded-lg font-medium transition flex items-center justify-center gap-2 border border-slate-300 shadow-sm text-sm"
            >
                <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5 text-slate-500" />
                <span className="hidden sm:inline">Update</span>
            </button>
            <button 
                onClick={() => setIsModalOpen(true)}
                className="flex-1 sm:flex-none bg-[#0099CC] hover:bg-[#0088b6] text-white px-3 py-2 sm:px-4 rounded-lg font-medium transition flex items-center justify-center gap-2 shadow-md shadow-blue-500/20 text-sm"
            >
                <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">Nieuw</span>
            </button>
          </div>
        </div>

        <div className="space-y-2 sm:space-y-4">
          {holdings.length === 0 ? (
            <div className="text-center py-12 sm:py-20 bg-white rounded-xl border border-slate-300 border-dashed">
              <BarChart3 className="w-10 h-10 text-slate-400 mx-auto mb-4" />
              <h3 className="text-base sm:text-lg font-medium text-slate-700">Nog geen ETFs</h3>
              <button onClick={() => setIsModalOpen(true)} className="mt-4 text-[#0099CC] font-medium">
                + Voeg je eerste ETF toe
              </button>
            </div>
          ) : (
            <>
              {holdings.map(holding => (
                <ETFRow key={holding.id} holding={holding} onEdit={(h) => { setEditingHolding(h); setIsModalOpen(true); }} onDelete={deleteHolding} />
              ))}
              
              <div className="mt-8">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-bold text-slate-800">Waardeontwikkeling</h3>
                  <button 
                    onClick={() => setIsHistoryModalOpen(true)}
                    className="text-xs font-medium text-[#0099CC] hover:underline flex items-center gap-1"
                  >
                    <HistoryIcon className="w-3.5 h-3.5" />
                    Historie beheren
                  </button>
                </div>
                <PortfolioChart history={history} holdings={holdings} />
              </div>
            </>
          )}
        </div>
      </main>

      <AddHoldingModal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setEditingHolding(null); }} onSave={saveHolding} initialData={editingHolding} />
      
      <UpdatePricesModal 
        isOpen={isPricesModalOpen} 
        onClose={() => setIsPricesModalOpen(false)} 
        holdings={holdings} 
        onUpdatePrice={updateHoldingPrice} 
      />

      <FundsModal
        isOpen={isFundsModalOpen}
        onClose={() => setIsFundsModalOpen(false)}
        funds={funds}
        onSave={saveFunds}
      />

      <HistoryModal 
        isOpen={isHistoryModalOpen} 
        onClose={() => setIsHistoryModalOpen(false)} 
        history={history} 
        onAdd={addHistoryPoint} 
        onDelete={deleteHistoryPoint} 
      />

      <TransactionsModal 
        isOpen={isTransactionsModalOpen}
        onClose={() => setIsTransactionsModalOpen(false)}
        holdings={holdings}
        onEdit={(h) => {
            setIsTransactionsModalOpen(false);
            setEditingHolding(h);
            setIsModalOpen(true);
        }}
      />
      
      <PriceHistoryModal
        isOpen={isPriceHistoryModalOpen}
        onClose={() => setIsPriceHistoryModalOpen(false)}
        history={history}
        holdings={holdings}
      />
    </div>
  );
};

export default App;