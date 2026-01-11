import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { HistoryEntry } from '../types';
import { TrendingUp } from 'lucide-react';

interface Props {
  history: HistoryEntry[];
}

const PortfolioChart: React.FC<Props> = ({ history }) => {
  const formatEuro = (val: number) => 
    new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(val);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('nl-NL', { month: 'short', day: 'numeric' }).format(date);
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-slate-200 shadow-lg rounded-lg text-sm">
          <p className="font-bold text-slate-900 mb-1">{formatDate(label)}</p>
          <p className="text-[#0099CC] font-semibold">
            Waarde: {formatEuro(payload[0].value)}
          </p>
          {payload[1] && (
            <p className="text-slate-400 font-medium text-xs">
              Inleg: {formatEuro(payload[1].value)}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  // If we have no history, or only 1 point, we can still show the chart, 
  // but let's make sure it doesn't look broken.
  // Recharts handles 1 point fine (it just shows a point or a line across if we fake a 2nd point).
  
  if (history.length === 0) {
     return (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mt-6 text-center">
            <p className="text-slate-400">Nog onvoldoende data voor grafiek. Kom morgen terug!</p>
        </div>
     );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 sm:p-6 mt-6">
      <div className="flex items-center gap-2 mb-6">
        <div className="bg-blue-50 p-2 rounded-lg">
          <TrendingUp className="w-5 h-5 text-[#0099CC]" />
        </div>
        <h3 className="text-lg font-bold text-slate-900">Waardeontwikkeling</h3>
      </div>

      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={history} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0099CC" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="#0099CC" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis 
                dataKey="date" 
                tickFormatter={formatDate} 
                stroke="#94a3b8" 
                fontSize={12}
                tickLine={false}
                axisLine={false}
                minTickGap={30}
            />
            <YAxis 
                tickFormatter={(val) => `€${val/1000}k`} 
                stroke="#94a3b8" 
                fontSize={12}
                tickLine={false}
                axisLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area 
                type="monotone" 
                dataKey="totalValue" 
                stroke="#0099CC" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorValue)" 
                name="Waarde"
                animationDuration={1500}
            />
             <Area 
                type="monotone" 
                dataKey="totalInvested" 
                stroke="#94a3b8" 
                strokeWidth={1}
                strokeDasharray="4 4"
                fill="none" 
                name="Inleg"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default PortfolioChart;