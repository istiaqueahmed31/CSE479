import React, { createContext, useContext, useState, useCallback } from 'react';

export interface CartItem {
  id: string;
  name_bn: string;
  name_en: string;
  price: number;
  quantity: number;
  image: string;
  stock: number;
  unit: string;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'>, qty?: number) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, qty: number) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('miskal_cart');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  const persist = (newItems: CartItem[]) => {
    setItems(newItems);
    localStorage.setItem('miskal_cart', JSON.stringify(newItems));
  };

  const addItem = useCallback((item: Omit<CartItem, 'quantity'>, qty = 1) => {
    setItems(prev => {
      const existing = prev.find(i => i.id === item.id);
      const updated = existing
        ? prev.map(i => i.id === item.id ? { ...i, quantity: Math.min(i.quantity + qty, i.stock) } : i)
        : [...prev, { ...item, quantity: qty }];
      localStorage.setItem('miskal_cart', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems(prev => {
      const updated = prev.filter(i => i.id !== id);
      localStorage.setItem('miskal_cart', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const updateQuantity = useCallback((id: string, qty: number) => {
    setItems(prev => {
      const updated = qty <= 0
        ? prev.filter(i => i.id !== id)
        : prev.map(i => i.id === id ? { ...i, quantity: Math.min(qty, i.stock) } : i);
      localStorage.setItem('miskal_cart', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const clearCart = useCallback(() => {
    persist([]);
  }, []);

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, totalItems, subtotal }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
};
