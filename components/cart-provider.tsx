"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import type { CartFixedLine, CartFundLine, CartState } from "@/lib/types";

const STORAGE_KEY = "eva-vy-registry-cart";
const emptyCart: CartState = { fixed: [], funds: [] };

type CartContextValue = {
  cart: CartState;
  ready: boolean;
  itemCount: number;
  addFixed: (line: Omit<CartFixedLine, "quantity">) => void;
  setFixedQuantity: (itemId: string, quantity: number) => void;
  setFund: (line: CartFundLine) => void;
  removeFund: (itemId: string) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

function isCartState(value: unknown): value is CartState {
  if (!value || typeof value !== "object") return false;
  const candidate = value as CartState;
  return Array.isArray(candidate.fixed) && Array.isArray(candidate.funds);
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartState>(emptyCart);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const stored = window.sessionStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed: unknown = JSON.parse(stored);
        if (isCartState(parsed)) setCart(parsed);
      }
    } catch {
      // Storage can be unavailable in private browsing or restricted webviews.
    } finally {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    } catch {
      // Keep the in-memory cart working when storage is unavailable.
    }
  }, [cart, ready]);

  const addFixed = useCallback(
    (line: Omit<CartFixedLine, "quantity">) => {
      setCart((current) => {
        const existing = current.fixed.find(
          (entry) => entry.itemId === line.itemId,
        );
        const quantity = Math.min((existing?.quantity ?? 0) + 1, line.maxQuantity);
        return {
          ...current,
          fixed: existing
            ? current.fixed.map((entry) =>
                entry.itemId === line.itemId
                  ? { ...entry, ...line, quantity }
                  : entry,
              )
            : [...current.fixed, { ...line, quantity: 1 }],
        };
      });
    },
    [],
  );

  const setFixedQuantity = useCallback((itemId: string, quantity: number) => {
    setCart((current) => ({
      ...current,
      fixed:
        quantity <= 0
          ? current.fixed.filter((entry) => entry.itemId !== itemId)
          : current.fixed.map((entry) =>
              entry.itemId === itemId
                ? {
                    ...entry,
                    quantity: Math.min(
                      Math.max(1, Math.floor(quantity)),
                      entry.maxQuantity,
                    ),
                  }
                : entry,
            ),
    }));
  }, []);

  const setFund = useCallback((line: CartFundLine) => {
    setCart((current) => {
      const contributionUsd = Math.min(
        Math.max(1, line.contributionUsd),
        line.maxUsd,
      );
      const rate =
        line.contributionUsd > 0
          ? line.contributionVnd / line.contributionUsd
          : Number(process.env.NEXT_PUBLIC_USD_TO_VND_RATE || 26000);
      const nextLine = {
        ...line,
        contributionUsd,
        contributionVnd: Math.round(contributionUsd * rate),
      };
      const exists = current.funds.some((entry) => entry.itemId === line.itemId);
      return {
        ...current,
        funds: exists
          ? current.funds.map((entry) =>
              entry.itemId === line.itemId ? nextLine : entry,
            )
          : [...current.funds, nextLine],
      };
    });
  }, []);

  const removeFund = useCallback((itemId: string) => {
    setCart((current) => ({
      ...current,
      funds: current.funds.filter((entry) => entry.itemId !== itemId),
    }));
  }, []);

  const clearCart = useCallback(() => setCart(emptyCart), []);

  const value = useMemo(
    () => ({
      cart,
      ready,
      itemCount:
        cart.fixed.reduce((sum, line) => sum + line.quantity, 0) +
        cart.funds.length,
      addFixed,
      setFixedQuantity,
      setFund,
      removeFund,
      clearCart,
    }),
    [
      addFixed,
      cart,
      clearCart,
      ready,
      removeFund,
      setFixedQuantity,
      setFund,
    ],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used inside CartProvider.");
  return context;
}
