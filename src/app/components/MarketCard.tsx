"use client";

import React from "react";
import Link from "next/link";
import { useMarket } from "../hooks/useMarket";
import { fmtVyr, fmtPrice } from "../lib/markets";
import type { MarketSeed } from "../lib/addresses";
import Sparkline from "./Sparkline";

const MarketCard: React.FC<{ item: MarketSeed }> = ({ item }) => {
  const { snapshot } = useMarket(item.address as `0x${string}`);
  const initial = Number(item.initialPrice);
  const mark = snapshot ? Number(snapshot.markPrice) / 1e18 : initial;
  const gainPct = initial > 0 ? ((mark - initial) / initial) * 100 : 0;
  const up = gainPct >= 0;

  return (
    <Link
      href={`/markets/${item.address}`}
      className="card card-hover block overflow-hidden group"
    >
      <div className="relative h-32 overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={item.imageUrl}
          alt={item.subject}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[color:var(--surface)] via-transparent to-transparent" />
        <div className="absolute top-2 left-2 flex items-center gap-1.5">
          <span className="text-[10px] mono px-1.5 py-0.5 bg-black/60 border border-[color:var(--border)] text-white">
            {item.category}
          </span>
          <span className="text-[10px] mono px-1.5 py-0.5 bg-black/60 border border-[color:var(--border)] text-[color:var(--gold)]">
            20×
          </span>
        </div>
        <div className="absolute bottom-2 left-2 right-2">
          <div className="text-white font-bold text-sm leading-tight">{item.subject}</div>
        </div>
      </div>

      <div className="px-3 py-2.5 grid grid-cols-2 gap-2 items-center">
        <div>
          <div className="text-[10px] uppercase tracking-wide text-[color:var(--muted)]">Mark</div>
          <div className="mono text-sm text-white">
            {snapshot ? fmtPrice(snapshot.markPrice) : initial.toFixed(2)}
            <span className="text-[color:var(--muted)] text-[10px] ml-1">VYR</span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-[10px] uppercase tracking-wide text-[color:var(--muted)]">24h</div>
          <div className={`mono text-sm ${up ? "text-[color:var(--neon)]" : "text-[color:var(--red)]"}`}>
            {up ? "+" : ""}
            {gainPct.toFixed(2)}%
          </div>
        </div>
      </div>

      <div className="px-1 -mt-1">
        <Sparkline
          marketAddress={item.address}
          initialPrice={initial}
          markPrice={mark}
          positive={up}
          height={48}
        />
      </div>

      <div className="px-3 py-2 border-t border-[color:var(--border)] flex items-center justify-between text-[10px]">
        <span className="text-[color:var(--muted)]">
          OI <span className="mono text-white">{snapshot ? fmtVyr(snapshot.longOI + snapshot.shortOI) : "—"}</span>
        </span>
        <span className="text-[color:var(--muted)]">
          Vol <span className="mono text-white">{snapshot ? fmtVyr(snapshot.volumeAccum) : "—"}</span>
        </span>
      </div>
    </Link>
  );
};

export default MarketCard;
