import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { HistoryEntry, Holding } from '../types';

interface Props {
  history: HistoryEntry[];
  holdings?: Holding[];
}

const PortfolioChart: React.FC<Props> = ({ history, holdings = [] }) => {
  const formatEuro = (val: number) => 
    new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(val);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('nl-NL', { month: 'short', year: 'numeric' }).format(date);
  };

  // Modern, distinct color palette
  const colors = [
    '#0ea5e9', // Sky Blue
    '#22c55e', // Green
    '#f59e0b', // Amber
    '#ec4899', // Pink
    '#8b5cf6', // Violet
    '#ef4444', // Red
    '#6366f1', // Indigo
    '#14b8a6', // Teal
  ];

  // Get unique tickers and map them to colors
  const uniqueTickers = Array.from(new Set(holdings.map(h => h.ticker)));
  const tickerColorMap: { [ticker: string]: string } = {};
  uniqueTickers.forEach((ticker, index) => {
      tickerColorMap[ticker] = colors[index % colors.length];
  });

  const sortedData = [...history].sort((a, b) => a.timestamp - b.timestamp);

  // Logic to fill gaps: "Last known value"
  // If a data point is missing for a specific ticker in a history entry, 
  // we use the last known value for that ticker (Forward Fill).
  let lastKnownValues: { [key: string]: number } = {};

  const chartData = sortedData.map(entry => {
      const flatEntry: any = {
          date: entry.date,
          timestamp: entry.timestamp,
          totalValue: entry.totalValue,
      };
      
      if (entry.breakdown) {
          // 1. Update with current values from this entry
          Object.keys(entry.breakdown).forEach(ticker => {
              flatEntry[ticker] = entry.breakdown![ticker];
              lastKnownValues[ticker] = entry.breakdown![ticker];
          });
          
          // 2. Forward fill any known tickers that are missing in this breakdown
          Object.keys(lastKnownValues).forEach(ticker => {
              if (flatEntry[ticker] === undefined) {
                   flatEntry[ticker] = lastKnownValues[ticker];
              }
          });
      } else {
          // 3. No breakdown available (e.g. manual history entry)
          // Forward fill ALL previously known values to keep lines flat/continuous
          Object.keys(lastKnownValues).forEach(ticker => {
              flatEntry[ticker] = lastKnownValues[ticker];
          });

          // Fallback if truly empty (e.g. very first entry is manual)
          const hasData = Object.keys(flatEntry).some(k => k !== 'date' && k !== 'timestamp' && k !== 'totalValue');
          if (!hasData) {
             if (uniqueTickers.length === 1) {
                  const t = uniqueTickers[0];
                  flatEntry[t] = entry.totalValue;
                  lastKnownValues[t] = entry.totalValue;
             } else {
                  flatEntry['unknown'] = entry.totalValue;
             }
          }
      }
      return flatEntry;
  });

  // Identify all unique keys present in the FINAL chartData to create Lines
  const dataKeys = new Set<string>();
  chartData.forEach(d => {
      Object.keys(d).forEach(k => {
          if (k !== 'date' && k !== 'timestamp' && k !== 'totalValue') {
              dataKeys.add(k);
          }
      });
  });
  
  // Custom Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const sortedPayload = [...payload].sort((a, b) => b.value - a.value);
      const totalValue = chartData.find(d => d.date === label)?.totalValue || 0;
      
      return (
        <div className="bg-white p-3 border border-slate-200 shadow-lg rounded-lg text-sm z-50">
          <p className="font-bold text-slate-900 mb-2 border-b border-slate-100 pb-1">
            {new Date(label).toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
          
          <div className="space-y-1 mb-2">
            {sortedPayload.map((p: any) => {
                const ticker = p.dataKey === 'unknown' ? 'Historie (Totaal)' : p.dataKey;
                if (p.value < 0.01) return null;

                return (
                    <div key={p.dataKey} className="flex items-center justify-between gap-4">
                        <span className="flex items-center gap-1.5 text-xs text-slate-600">
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }}></span>
                            {ticker}
                        </span>
                        <span className="font-medium font-mono text-slate-900">{formatEuro(p.value)}</span>
                    </div>
                );
            })}
          </div>
          
          <div className="pt-2 border-t border-slate-100 flex justify-between items-center">
            <span className="text-xs font-bold text-slate-500">Portfolio Totaal</span>
            <span className="font-bold text-[#0099CC]">{formatEuro(totalValue)}</span>
          </div>
        </div>
      );
    }
    return null;
  };

  if (history.length === 0) {
     return (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8 text-center">
            <p className="text-slate-400 text-sm">Geen data beschikbaar voor de grafiek.</p>
        </div>
     );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 sm:p-6">
      <div className="h-[250px] sm:h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis 
                dataKey="date" 
                tickFormatter={formatDate} 
                stroke="#94a3b8" 
                fontSize={10}
                tickLine={false}
                axisLine={false}
                minTickGap={40}
            />
            <YAxis 
                tickFormatter={(val) => `€${val >= 1000 ? (val/1000).toFixed(0) + 'k' : val}`} 
                stroke="#94a3b8" 
                fontSize={10}
                tickLine={false}
                axisLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            
            {Array.from(dataKeys).map((key) => {
                const isUnknown = key === 'unknown';
                const color = isUnknown ? '#cbd5e1' : (tickerColorMap[key] || '#94a3b8');
                
                return (
                    <Line 
                        key={key}
                        type="monotone" 
                        dataKey={key} 
                        stroke={color} 
                        strokeWidth={2.5}
                        dot={false}
                        activeDot={{ r: 6, strokeWidth: 0 }}
                        animationDuration={1500}
                        connectNulls={true}
                    />
                );
            })}
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 flex flex-wrap gap-2 justify-center">
          {uniqueTickers.map(ticker => (
              <div key={ticker} className="flex items-center gap-1.5 text-xs text-slate-600 bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: tickerColorMap[ticker] }}></span>
                  {ticker}
              </div>
          ))}
      </div>
    </div>
  );
};

export default PortfolioChart;