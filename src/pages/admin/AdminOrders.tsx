import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const statusOptions = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];

const AdminOrders = () => {
  const { toast } = useToast();
  const [orders, setOrders] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);

  const fetchOrders = async () => {
    const { data } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
    setOrders(data || []);
  };

  useEffect(() => { fetchOrders(); }, []);

  const viewOrder = async (order: any) => {
    setSelected(order);
    const { data } = await supabase.from('order_items').select('*, products(name_en, name_bn)').eq('order_id', order.id);
    setItems(data || []);
  };

  const updateStatus = async (id: string, status: string) => {
    await supabase.from('orders').update({ order_status: status }).eq('id', id);
    toast({ title: `Order updated to ${status}` });
    fetchOrders();
    if (selected?.id === id) setSelected({ ...selected, order_status: status });
  };

  const statusColor = (s: string) => {
    if (s === 'delivered') return 'text-secondary';
    if (s === 'cancelled') return 'text-destructive';
    return 'text-cta';
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Orders</h1>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-2">
          {orders.map(order => (
            <div
              key={order.id}
              onClick={() => viewOrder(order)}
              className={`bg-card border rounded-lg p-3 cursor-pointer hover:border-primary/50 transition-colors ${selected?.id === order.id ? 'border-primary' : 'border-border'}`}
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-xs text-muted-foreground font-mono">#{order.id.slice(0, 8)}</p>
                  <p className="text-sm font-medium mt-1">{order.guest_name || 'Registered User'} — ৳{order.total}</p>
                </div>
                <div className="text-right">
                  <span className={`text-xs font-medium capitalize ${statusColor(order.order_status)}`}>{order.order_status}</span>
                  <p className="text-xs text-muted-foreground">{new Date(order.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {selected && (
          <div className="bg-card border border-border rounded-lg p-4 h-fit sticky top-4 space-y-4">
            <h3 className="font-bold">Order #{selected.id.slice(0, 8)}</h3>
            <div className="space-y-2 text-sm">
              <p><span className="text-muted-foreground">Customer:</span> {selected.guest_name || 'Registered'}</p>
              {selected.business_name && (
                <p><span className="text-muted-foreground">Business:</span> {selected.business_name}</p>
              )}
              <p><span className="text-muted-foreground">Phone:</span> {selected.guest_phone || 'N/A'}</p>
              {selected.guest_email && (
                <p><span className="text-muted-foreground">Email:</span> {selected.guest_email}</p>
              )}
              <p><span className="text-muted-foreground">Payment:</span> {selected.payment_method} ({selected.payment_status})</p>
              <p><span className="text-muted-foreground">Total:</span> ৳{selected.total}</p>
            </div>

            <div>
              <label className="text-sm font-medium">Update Status</label>
              <select
                value={selected.order_status}
                onChange={e => updateStatus(selected.id, e.target.value)}
                className="w-full mt-1 px-3 py-2 bg-muted rounded-lg text-sm"
              >
                {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            {items.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2">Items</h4>
                <div className="space-y-1 text-sm">
                  {items.map((item: any) => (
                    <div key={item.id} className="flex justify-between">
                      <span>{item.products?.name_en} x{item.quantity}</span>
                      <span>৳{item.unit_price * item.quantity}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminOrders;
