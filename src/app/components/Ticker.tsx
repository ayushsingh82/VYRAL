"use client";

import React from "react";
import Link from "next/link";
import { useAllMarkets } from "../hooks/useAllMarkets";
import { fmtPrice } from "../lib/markets";

const Ticker = () => {
  const { rows } = useAllMarkets();
  const display = rows.length > 0 ? [...rows, ...rows] : [];

  return (
    <div className="border-b border-[color:var(--border)] bg-[color:var(--surface)]/60 overflow-hidden">
      <div className="max-w-[1400px] mx-auto h-9 flex items-center relative">
        <span className="absolute left-0 top-0 bottom-0 px-3 flex items-center text-[10px] mono uppercase tracking-widest text-[color:var(--muted)] bg-gradient-to-r from-[color:var(--surface)] to-transparent z-10">
          Live
        </span>
        <div className="marquee-track text-xs pl-20">
          {display.map((r, i) => {
            const initial = Number(r.initialPrice);
            const mark = r.snapshot ? Number(r.snapshot.markPrice) / 1e18 : initial;
            const pct = initial > 0 ? ((mark - initial) / initial) * 100 : 0;
            const up = pct >= 0;
            return (
              <Link
                key={`${r.address}-${i}`}
                href={`/markets/${r.address}`}
                className="inline-flex items-center gap-2 hover:text-white text-[color:var(--muted)]"
              >
                <span className="text-white font-semibold">{r.subject}</span>
                <span className="mono">{fmtPrice(r.snapshot?.markPrice ?? 0n)} VYR</span>
                <span className={`mono ${up ? "text-[color:var(--neon)]" : "text-[color:var(--red)]"}`}>
                  {up ? "+" : ""}
                  {pct.toFixed(2)}%
                </span>
                <span className="text-[color:var(--border-strong)]">•</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Ticker;
