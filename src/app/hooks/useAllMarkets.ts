"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { addresses, type MarketSeed } from "../lib/addresses";
import { getMarketSnapshot, type MarketSnapshot } from "../lib/markets";

export type MarketRow = MarketSeed & {
  snapshot: MarketSnapshot | null;
};

const POLL_MS = 8_000;

export function useAllMarkets(): {
  rows: MarketRow[];
  loading: boolean;
  refresh: () => Promise<void>;
} {
  const [rows, setRows] = useState<MarketRow[]>(
    addresses.markets.map((m) => ({ ...m, snapshot: null }))
  );
  const [loading, setLoading] = useState(false);
  const mounted = useRef(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const results = await Promise.all(
        addresses.markets.map(async (m) => {
          try {
            const snap = await getMarketSnapshot(m.address as `0x${string}`);
            return { ...m, snapshot: snap };
          } catch {
            return { ...m, snapshot: null };
          }
        })
      );
      if (mounted.current) setRows(results);
    } finally {
      if (mounted.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    mounted.current = true;
    refresh();
    const id = setInterval(refresh, POLL_MS);
    return () => {
      mounted.current = false;
      clearInterval(id);
    };
  }, [refresh]);

  return { rows, loading, refresh };
}
