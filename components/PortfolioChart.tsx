import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Holding } from '../types';
import { PieChart as PieIcon } from 'lucide-react';

interface Props {
  holdings: Holding[];
}

const COLORS = [
  '#0099CC', // Branded Blue
  '#10b981', // Emerald
  '#6366f1', // Indigo
  '#f59e0b', // Amber
  '#ef4444', // Red
  '#8b5cf6', // Violet
  '#ec4899', // Pink
  '#14b8a6', // Teal
];

const PortfolioChart: React.FC<Props> = ({ holdings }) => {
  const data = useMemo(() => {
    return holdings
      .map(h => ({
        name: h.ticker,
        fullName: h.name,
        value: h.quantity * h.currentPrice
      }))
      .filter(d => d.value > 0)
      .sort((a, b) => b.value - a.value);
  }, [holdings]);

  const totalValue = data.reduce((sum, item) => sum + item.value, 0);

  const formatEuro = (val: number) => 
    new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(val);

  if (data.length === 0) return null;

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const dataPoint = payload[0].payload;
      const percentage = ((dataPoint.value / totalValue) * 100).toFixed(1);
      
      return (
        <div className="bg-white p-3 border border-slate-200 shadow-lg rounded-lg">
          <p className="font-bold text-slate-900">{dataPoint.name}</p>
          <p className="text-xs text-slate-500 mb-1 max-w-[150px] truncate">{dataPoint.fullName}</p>
          <p className="text-[#0099CC] font-semibold">
            {formatEuro(dataPoint.value)} <span className="text-slate-400">({percentage}%)</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 sm:p-6 mt-6">
      <div className="flex items-center gap-2 mb-6">
        <div className="bg-purple-50 p-2 rounded-lg">
          <PieIcon className="w-5 h-5 text-purple-600" />
        </div>
        <h3 className="text-lg font-bold text-slate-900">Verdeling</h3>
      </div>

      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={4}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              verticalAlign="bottom" 
              height={36} 
              iconType="circle"
              formatter={(value: string) => <span className="text-slate-600 font-medium ml-1">{value}</span>}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default PortfolioChart;