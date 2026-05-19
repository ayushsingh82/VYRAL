"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { useAllMarkets } from "../hooks/useAllMarkets";
import { fmtVyr } from "../lib/markets";
import Sparkline from "../components/Sparkline";

export default function TrendingPage() {
  const { rows } = useAllMarkets();

  const computed = useMemo(() => {
    return rows.map((r) => {
      const ip = Number(r.initialPrice);
      const mp = r.snapshot ? Number(r.snapshot.markPrice) / 1e18 : ip;
      const pct = ip > 0 ? ((mp - ip) / ip) * 100 : 0;
      const vol = r.snapshot ? Number(r.snapshot.volumeAccum) / 1e18 : 0;
      return { row: r, mark: mp, pct, vol };
    });
  }, [rows]);

  const gainers = [...computed].sort((a, b) => b.pct - a.pct).slice(0, 5);
  const losers = [...computed].sort((a, b) => a.pct - b.pct).slice(0, 5);
  const byVolume = [...computed].sort((a, b) => b.vol - a.vol).slice(0, 6);

  return (
    <div className="max-w-[1400px] mx-auto px-5 py-8">
      <div className="mb-6">
        <h1 className="heading text-3xl md:text-5xl">Trending</h1>
        <p className="text-xs text-[color:var(--muted)]">Top movers, busiest markets, freshly minted topics</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <LeaderboardCard
          title="Top gainers"
          accent="text-[color:var(--neon)]"
          rows={gainers}
        />
        <LeaderboardCard
          title="Top losers"
          accent="text-[color:var(--red)]"
          rows={losers}
        />
      </div>

      <div className="card overflow-hidden mb-6">
        <div className="flex items-center justify-between px-4 py-3 border-b border-[color:var(--border)]">
          <div>
            <div className="text-sm font-bold">Hottest by volume</div>
            <div className="text-[10px] text-[color:var(--muted)]">Sorted by cumulative VYR volume</div>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 p-3">
          {byVolume.map(({ row, mark, pct, vol }) => {
            const up = pct >= 0;
            return (
              <Link key={row.address} href={`/markets/${row.address}`} className="card card-hover p-3 flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={row.imageUrl} alt={row.subject} className="w-12 h-12  object-cover" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-white truncate">{row.subject}</div>
                  <div className="text-[10px] text-[color:var(--muted)] mono">
                    {row.category} · {vol.toFixed(0)} VYR vol
                  </div>
                </div>
                <div className="w-20 h-10">
                  <Sparkline
                    marketAddress={row.address}
                    initialPrice={Number(row.initialPrice)}
                    markPrice={mark}
                    positive={up}
                    height={40}
                  />
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      <div className="card p-4">
        <div className="text-sm font-bold mb-1">Freshly added subjects</div>
        <p className="text-[10px] text-[color:var(--muted)] mb-3">
          Latest markets minted by the factory.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {computed.slice(-4).reverse().map(({ row }) => (
            <Link
              key={row.address}
              href={`/markets/${row.address}`}
              className="flex items-center gap-3 p-2  hover:bg-[color:var(--surface-2)]/60"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={row.imageUrl} alt={row.subject} className="w-9 h-9 object-cover" />
              <div className="flex-1 min-w-0">
                <div className="text-sm text-white truncate">{row.subject}</div>
                <div className="text-[10px] text-[color:var(--muted)] mono">{row.category}</div>
              </div>
              <span className="text-[10px] mono text-[color:var(--muted)]">view →</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

function LeaderboardCard({
  title,
  accent,
  rows,
}: {
  title: string;
  accent: string;
  rows: { row: { address: string; subject: string; imageUrl: string; initialPrice: string; category: string }; mark: number; pct: number; vol: number }[];
}) {
  return (
    <div className="card overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-[color:var(--border)]">
        <div className="text-sm font-bold">{title}</div>
        <div className="text-[10px] mono text-[color:var(--muted)]">24h Δ%</div>
      </div>
      <ul>
        {rows.map(({ row, pct, vol }, i) => {
          const up = pct >= 0;
          return (
            <li key={row.address} className="border-t border-[color:var(--border)] first:border-t-0">
              <Link href={`/markets/${row.address}`} className="flex items-center gap-3 px-4 py-2.5 hover:bg-[color:var(--surface-2)]/50">
                <span className="w-5 text-[11px] mono text-[color:var(--muted)]">{i + 1}</span>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={row.imageUrl} alt={row.subject} className="w-8 h-8 object-cover" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-white truncate">{row.subject}</div>
                  <div className="text-[10px] text-[color:var(--muted)] mono">
                    {row.category} · {fmtVyr(BigInt(Math.floor(vol * 1e18)))} VYR
                  </div>
                </div>
                <span className={`mono text-sm ${up ? "text-[color:var(--neon)]" : "text-[color:var(--red)]"} ${accent}`}>
                  {up ? "+" : ""}
                  {pct.toFixed(2)}%
                </span>
              </Link>
            </li>
          );
        })}
        {rows.length === 0 && (
          <li className="px-4 py-6 text-xs text-[color:var(--muted)]">No markets yet.</li>
        )}
      </ul>
    </div>
  );
}
