"use client";

import React, { useMemo } from "react";

// Synthetic L2 orderbook keyed off the mark price. We don't have an onchain
// CLOB — this gives the page the dense data feel of a real venue. Deterministic
// per address so it doesn't flicker between renders.

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

type Level = { price: number; size: number; cumulative: number };

function buildSide(seed: number, mid: number, isBid: boolean, levels = 14): Level[] {
  const r = rng(seed + (isBid ? 1 : 2));
  const step = mid * 0.001;
  const out: Level[] = [];
  let cum = 0;
  for (let i = 1; i <= levels; i++) {
    const price = isBid ? mid - step * i : mid + step * i;
    const size = Math.max(1, (r() * 800 + 80) * (1 + (levels - i) * 0.05));
    cum += size;
    out.push({ price, size, cumulative: cum });
  }
  return out;
}

type Props = {
  marketAddress: string;
  markPrice: number;
};

const Orderbook: React.FC<Props> = ({ marketAddress, markPrice }) => {
  const { bids, asks, maxCum, spread } = useMemo(() => {
    const seed = hash(marketAddress);
    const bids = buildSide(seed, markPrice, true);
    const asks = buildSide(seed, markPrice, false);
    const maxCum = Math.max(bids[bids.length - 1].cumulative, asks[asks.length - 1].cumulative);
    const spread = asks[0].price - bids[0].price;
    return { bids, asks, maxCum, spread };
  }, [marketAddress, markPrice]);

  const Row = ({ lvl, side }: { lvl: Level; side: "bid" | "ask" }) => {
    const pct = (lvl.cumulative / maxCum) * 100;
    const bg =
      side === "bid"
        ? "linear-gradient(to left, rgba(57,255,138,0.12) 0%, rgba(57,255,138,0.12) " + pct + "%, transparent " + pct + "%)"
        : "linear-gradient(to left, rgba(255,77,94,0.12) 0%, rgba(255,77,94,0.12) " + pct + "%, transparent " + pct + "%)";
    return (
      <div className="relative grid grid-cols-3 px-3 py-[3px] text-[11px] mono">
        <div className="absolute inset-0" style={{ background: bg }} />
        <div className={side === "bid" ? "text-[color:var(--neon)]" : "text-[color:var(--red)]"}>
          {lvl.price.toFixed(4)}
        </div>
        <div className="text-right text-white">{lvl.size.toFixed(0)}</div>
        <div className="text-right text-[color:var(--muted)]">{lvl.cumulative.toFixed(0)}</div>
      </div>
    );
  };

  return (
    <div className="card overflow-hidden">
      <div className="px-3 py-2 border-b border-[color:var(--border)] flex items-center justify-between">
        <div className="text-xs font-semibold text-white">Orderbook</div>
        <div className="text-[10px] mono text-[color:var(--muted)]">L2 · synthetic</div>
      </div>
      <div className="grid grid-cols-3 px-3 py-1.5 text-[10px] uppercase tracking-widest text-[color:var(--muted)] border-b border-[color:var(--border)]">
        <div>Price</div>
        <div className="text-right">Size</div>
        <div className="text-right">Total</div>
      </div>
      <div className="flex flex-col-reverse">
        {asks.map((lvl, i) => (
          <Row key={`a${i}`} lvl={lvl} side="ask" />
        ))}
      </div>
      <div className="px-3 py-2 border-y border-[color:var(--border)] bg-[color:var(--surface-2)]/40 flex items-center justify-between text-[11px] mono">
        <span className="text-[color:var(--muted)]">Mid</span>
        <span className="text-white">{markPrice.toFixed(4)}</span>
        <span className="text-[color:var(--muted)]">
          Spread <span className="text-white">{spread.toFixed(4)}</span>
        </span>
      </div>
      <div>
        {bids.map((lvl, i) => (
          <Row key={`b${i}`} lvl={lvl} side="bid" />
        ))}
      </div>
    </div>
  );
};

export default Orderbook;
