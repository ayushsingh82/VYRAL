"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Address } from "viem";
import { addresses, type MarketSeed } from "../lib/addresses";
import { getMarketSnapshot, getPosition, type MarketSnapshot, type PositionView } from "../lib/markets";

export type PositionRow = {
  market: MarketSeed;
  snapshot: MarketSnapshot | null;
  position: PositionView | null;
};

const POLL_MS = 8_000;

export function useAllPositions(account: Address | null | undefined) {
  const [rows, setRows] = useState<PositionRow[]>([]);
  const [loading, setLoading] = useState(false);
  const mounted = useRef(true);

  const refresh = useCallback(async () => {
    if (!account) {
      setRows([]);
      return;
    }
    setLoading(true);
    try {
      const out = await Promise.all(
        addresses.markets.map(async (m) => {
          try {
            const [snapshot, position] = await Promise.all([
              getMarketSnapshot(m.address as `0x${string}`),
              getPosition(m.address as `0x${string}`, account),
            ]);
            return { market: m, snapshot, position };
          } catch {
            return { market: m, snapshot: null, position: null };
          }
        })
      );
      if (mounted.current) setRows(out);
    } finally {
      if (mounted.current) setLoading(false);
    }
  }, [account]);

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
