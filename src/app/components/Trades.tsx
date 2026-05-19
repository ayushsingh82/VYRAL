"use client";

import React, { useMemo } from "react";

function hash(s: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h >>> 0;
}
function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Trade = { price: number; size: number; side: "buy" | "sell"; t: number };

type Props = {
  marketAddress: string;
  markPrice: number;
};

const Trades: React.FC<Props> = ({ marketAddress, markPrice }) => {
  const trades = useMemo<Trade[]>(() => {
    const r = rng(hash(marketAddress) + 3);
    const out: Trade[] = [];
    const now = Date.now();
    let last = markPrice;
    for (let i = 0; i < 18; i++) {
      const wiggle = (r() - 0.5) * markPrice * 0.004;
      last = Math.max(0.0001, last + wiggle);
      out.push({
        price: last,
        size: Math.max(1, r() * 600 + 20),
        side: r() > 0.5 ? "buy" : "sell",
        t: now - i * (15_000 + Math.floor(r() * 30_000)),
      });
    }
    return out;
  }, [marketAddress, markPrice]);

  return (
    <div className="card overflow-hidden">
      <div className="px-3 py-2 border-b border-[color:var(--border)] flex items-center justify-between">
        <div className="text-xs font-semibold text-white">Recent trades</div>
        <div className="text-[10px] mono text-[color:var(--muted)]">{trades.length}</div>
      </div>
      <div className="grid grid-cols-3 px-3 py-1.5 text-[10px] uppercase tracking-widest text-[color:var(--muted)] border-b border-[color:var(--border)]">
        <div>Price</div>
        <div className="text-right">Size</div>
        <div className="text-right">Time</div>
      </div>
      <div className="max-h-[420px] overflow-y-auto">
        {trades.map((t, i) => {
          const buy = t.side === "buy";
          const time = new Date(t.t).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
          return (
            <div key={i} className="grid grid-cols-3 px-3 py-[3px] text-[11px] mono">
              <div className={buy ? "text-[color:var(--neon)]" : "text-[color:var(--red)]"}>{t.price.toFixed(4)}</div>
              <div className="text-right text-white">{t.size.toFixed(0)}</div>
              <div className="text-right text-[color:var(--muted)]">{time}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Trades;
