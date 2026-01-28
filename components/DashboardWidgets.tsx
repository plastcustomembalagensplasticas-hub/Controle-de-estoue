
import React from 'react';

interface MetricCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: {
    value: string;
    positive: boolean;
  };
}

export const MetricCard: React.FC<MetricCardProps> = ({ label, value, icon, trend }) => (
  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-2">
    <div className="flex items-center justify-between">
      <div className="p-2 bg-slate-50 rounded-lg text-blue-700">
        {icon}
      </div>
      {trend && (
        <span className={`text-xs font-bold px-2 py-1 rounded-full ${trend.positive ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
          {trend.positive ? '↑' : '↓'} {trend.value}
        </span>
      )}
    </div>
    <div>
      <p className="text-slate-500 text-sm font-medium">{label}</p>
      <h3 className="text-2xl font-bold text-slate-800">{value}</h3>
    </div>
  </div>
);

interface StatusBadgeProps {
  status: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const styles: Record<string, string> = {
    'Estoque Baixo': 'bg-rose-100 text-rose-700 border-rose-200',
    'Normal': 'bg-emerald-100 text-emerald-700 border-emerald-200',
    'Crítico': 'bg-red-100 text-red-700 border-red-200 animate-pulse',
    'Bronze': 'bg-orange-100 text-orange-700 border-orange-200',
    'Prata': 'bg-slate-200 text-slate-700 border-slate-300',
    'Ouro': 'bg-amber-100 text-amber-700 border-amber-200',
  };

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${styles[status] || 'bg-slate-100 text-slate-600'}`}>
      {status}
    </span>
  );
};
