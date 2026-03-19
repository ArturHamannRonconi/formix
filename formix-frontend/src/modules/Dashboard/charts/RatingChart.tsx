import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { StatCard } from '../StatCard';
import type { ChartDataItem } from '@/hooks/useAnalytics';

interface RatingChartProps {
  data: ChartDataItem[];
  avg: number;
}

export function RatingChart({ data, avg }: RatingChartProps) {
  return (
    <div className="space-y-3">
      <StatCard label="Média" value={avg.toFixed(1)} />
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" tick={{ fontSize: 12 }} label={{ value: 'Nota', position: 'insideBottom', offset: -2 }} />
          <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
          <Tooltip />
          <Bar dataKey="value" fill="#f59e0b" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
