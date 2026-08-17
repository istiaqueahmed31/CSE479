import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Package, ShoppingCart, Layers } from 'lucide-react';
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';

type RangeKey = '7d' | '30d' | '90d' | '1y';

const rangeLabels: Record<RangeKey, string> = { '7d': '7 Days', '30d': '30 Days', '90d': '90 Days', '1y': '1 Year' };

function daysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

function monthRange(offset: number) {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() + offset, 1);
  const end = new Date(now.getFullYear(), now.getMonth() + offset + 1, 0, 23, 59, 59);
  return { start: start.toISOString(), end: end.toISOString() };
}

function groupByDay(orders: any[]) {
  const map: Record<string, number> = {};
  orders.forEach(o => {
    const day = o.created_at?.slice(0, 10);
    if (day) map[day] = (map[day] || 0) + Number(o.total);
  });
  return map;
}

const AdminDashboard = () => {
  const [stats, setStats] = useState({ products: 0, orders: 0, categories: 0 });
  const [range, setRange] = useState<RangeKey>('30d');
  const [orders, setOrders] = useState<any[]>([]);
  const [compareLast, setCompareLast] = useState(false);
  const [compareHighest, setCompareHighest] = useState(false);
  const [lastMonthOrders, setLastMonthOrders] = useState<any[]>([]);
  const [highestMonthOrders, setHighestMonthOrders] = useState<any[]>([]);
  const [highestLabel, setHighestLabel] = useState('');

  // Stats
  useEffect(() => {
    Promise.all([
      supabase.from('products').select('id', { count: 'exact', head: true }),
      supabase.from('orders').select('id', { count: 'exact', head: true }),
      supabase.from('categories').select('id', { count: 'exact', head: true }),
    ]).then(([p, o, c]) => {
      setStats({ products: p.count || 0, orders: o.count || 0, categories: c.count || 0 });
    });
  }, []);

  // Current range orders
  useEffect(() => {
    const days = range === '7d' ? 7 : range === '30d' ? 30 : range === '90d' ? 90 : 365;
    supabase
      .from('orders')
      .select('created_at, total')
      .gte('created_at', daysAgo(days))
      .order('created_at')
      .then(({ data }) => setOrders(data || []));
  }, [range]);

  // Last month
  useEffect(() => {
    if (!compareLast) { setLastMonthOrders([]); return; }
    const { start, end } = monthRange(-1);
    supabase.from('orders').select('created_at, total').gte('created_at', start).lte('created_at', end).then(({ data }) => setLastMonthOrders(data || []));
  }, [compareLast]);

  // Highest month
  useEffect(() => {
    if (!compareHighest) { setHighestMonthOrders([]); return; }
    // Fetch all orders to find highest month
    supabase.from('orders').select('created_at, total').order('created_at').then(({ data }) => {
      if (!data || data.length === 0) return;
      const monthly: Record<string, number> = {};
      data.forEach(o => {
        const m = o.created_at?.slice(0, 7);
        if (m) monthly[m] = (monthly[m] || 0) + Number(o.total);
      });
      const best = Object.entries(monthly).sort((a, b) => b[1] - a[1])[0];
      if (!best) return;
      setHighestLabel(best[0]);
      const start = best[0] + '-01T00:00:00';
      const endD = new Date(parseInt(best[0].slice(0, 4)), parseInt(best[0].slice(5, 7)), 0, 23, 59, 59);
      supabase.from('orders').select('created_at, total').gte('created_at', start).lte('created_at', endD.toISOString()).then(({ data: hd }) => setHighestMonthOrders(hd || []));
    });
  }, [compareHighest]);

  // Build chart data
  const chartData = useMemo(() => {
    const currentMap = groupByDay(orders);
    const lastMap = groupByDay(lastMonthOrders);
    const highMap = groupByDay(highestMonthOrders);

    const allDays = new Set([...Object.keys(currentMap), ...Object.keys(lastMap), ...Object.keys(highMap)]);
    const sorted = Array.from(allDays).sort();

    return sorted.map(day => ({
      date: day,
      current: currentMap[day] || 0,
      ...(compareLast ? { lastMonth: lastMap[day] || 0 } : {}),
      ...(compareHighest ? { highestMonth: highMap[day] || 0 } : {}),
    }));
  }, [orders, lastMonthOrders, highestMonthOrders, compareLast, compareHighest]);

  const cards = [
    { label: 'Products', value: stats.products, icon: Package, color: 'text-primary' },
    { label: 'Orders', value: stats.orders, icon: ShoppingCart, color: 'text-cta' },
    { label: 'Categories', value: stats.categories, icon: Layers, color: 'text-secondary' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

      {/* Stats cards */}
      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        {cards.map(card => (
          <div key={card.label} className="bg-card border border-border rounded-lg p-4 flex items-center gap-4">
            <div className={`p-3 rounded-lg bg-muted ${card.color}`}>
              <card.icon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-2xl font-bold">{card.value}</p>
              <p className="text-sm text-muted-foreground">{card.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Sales Chart */}
      <div className="bg-card border border-border rounded-lg p-4">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <h2 className="text-lg font-bold">Sales Overview</h2>
          <div className="flex gap-1">
            {(Object.keys(rangeLabels) as RangeKey[]).map(k => (
              <button
                key={k}
                onClick={() => setRange(k)}
                className={`px-3 py-1 text-xs rounded-md transition-colors ${range === k ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}
              >
                {rangeLabels[k]}
              </button>
            ))}
          </div>
        </div>

        {/* Comparison toggles */}
        <div className="flex flex-wrap gap-3 mb-4">
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" checked={compareLast} onChange={() => setCompareLast(!compareLast)} className="rounded" />
            Compare Last Month
          </label>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" checked={compareHighest} onChange={() => setCompareHighest(!compareHighest)} className="rounded" />
            Compare Highest Month {highestLabel && compareHighest ? `(${highestLabel})` : ''}
          </label>
        </div>

        <div className="h-[300px] sm:h-[400px]">
          {chartData.length === 0 ? (
            <div className="h-full flex items-center justify-center text-muted-foreground text-sm">No sales data for this period</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <defs>
                  <linearGradient id="gradCurrent" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradLast" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--cta))" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="hsl(var(--cta))" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradHigh" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--secondary))" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="hsl(var(--secondary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: 12 }}
                  labelStyle={{ color: 'hsl(var(--foreground))' }}
                />
                <Legend />
                <Area type="monotone" dataKey="current" name="Current" stroke="hsl(var(--primary))" fill="url(#gradCurrent)" strokeWidth={2} />
                {compareLast && <Area type="monotone" dataKey="lastMonth" name="Last Month" stroke="hsl(var(--cta))" fill="url(#gradLast)" strokeWidth={2} />}
                {compareHighest && <Area type="monotone" dataKey="highestMonth" name="Highest Month" stroke="hsl(var(--secondary))" fill="url(#gradHigh)" strokeWidth={2} />}
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
