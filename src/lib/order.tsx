import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { ITEMS, SHOPS, type ItemId } from '../data/copy';

type Lines = Partial<Record<ItemId, number>>;

interface OrderValue {
  lines: Lines;
  count: number;
  total: number;
  shop: string;
  setShop: (id: string) => void;
  add: (id: ItemId) => void;
  remove: (id: ItemId) => void;
  clear: () => void;
}

const OrderContext = createContext<OrderValue | null>(null);

export function useOrder() {
  const o = useContext(OrderContext);
  if (!o) throw new Error('useOrder must be used inside OrderProvider');
  return o;
}

export function OrderProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<Lines>({});
  const [shop, setShop] = useState(SHOPS[0].id);
  const add = useCallback((id: ItemId) => setLines(l => ({ ...l, [id]: Math.min(9, (l[id] ?? 0) + 1) })), []);
  const remove = useCallback((id: ItemId) => setLines(l => {
    const n = (l[id] ?? 0) - 1;
    const next = { ...l };
    if (n > 0) next[id] = n; else delete next[id];
    return next;
  }), []);
  const value = useMemo<OrderValue>(() => {
    const count = Object.values(lines).reduce((a, b) => a + (b ?? 0), 0);
    const total = ITEMS.reduce((a, i) => a + (lines[i.id] ?? 0) * i.price, 0);
    return { lines, count, total, shop, setShop, add, remove, clear: () => setLines({}) };
  }, [lines, shop, add, remove]);
  return <OrderContext.Provider value={value}>{children}</OrderContext.Provider>;
}
