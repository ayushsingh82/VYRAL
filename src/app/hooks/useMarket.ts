"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Address } from "viem";
import {
  getMarketSnapshot,
  getPosition,
  type MarketSnapshot,
  type PositionView,
} from "../lib/markets";

type Data = {
  snapshot: MarketSnapshot | null;
  position: PositionView | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
};

const POLL_MS = 6_000;

export function useMarket(market: Address | null | undefined, user?: Address | null): Data {
  const [snapshot, setSnapshot] = useState<MarketSnapshot | null>(null);
  const [position, setPosition] = useState<PositionView | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const mounted = useRef(true);

  const refresh = useCallback(async () => {
    if (!market) return;
    setLoading(true);
    try {
      const snapPromise = getMarketSnapshot(market);
      const posPromise = user ? getPosition(market, user) : Promise.resolve(null);
      const [snap, pos] = await Promise.all([snapPromise, posPromise]);
      if (!mounted.current) return;
      setSnapshot(snap);
      setPosition(pos);
      setError(null);
    } catch (e) {
      if (!mounted.current) return;
      setError(e instanceof Error ? e.message : "read failed");
    } finally {
      if (mounted.current) setLoading(false);
    }
  }, [market, user]);

  useEffect(() => {
    mounted.current = true;
    refresh();
    const id = setInterval(refresh, POLL_MS);
    return () => {
      mounted.current = false;
      clearInterval(id);
    };
  }, [refresh]);

  return { snapshot, position, loading, error, refresh };
}
