"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { formatUnits } from "viem";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { useWallet, shortAddr } from "../hooks/useWallet";
import { useAllPositions } from "../hooks/useAllPositions";
import {
  closePosition,
  fmtSignedVyr,
  fmtVyr,
  getVyrBalance,
  fmtPrice,
} from "../lib/markets";

export default function PortfolioPage() {
  const { address, connect } = useWallet();
  const { rows, refresh } = useAllPositions(address);
  const [balance, setBalance] = useState<bigint | null>(null);
  const [closing, setClosing] = useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!address) {
        setBalance(null);
        return;
      }
      try {
        const b = await getVyrBalance(address);
        if (!cancelled) setBalance(b);
      } catch {
        if (!cancelled) setBalance(null);
      }
    }
    load();
    const id = setInterval(load, 8000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [address]);

  const open = useMemo(() => rows.filter((r) => r.position?.open), [rows]);

  const totals = useMemo(() => {
    let collateral = 0n;
    let size = 0n;
    let pnl = 0n;
    for (const r of open) {
      if (!r.position) continue;
      collateral += r.position.collateral;
      size += r.position.size;
      pnl += r.position.unrealizedPnl;
    }
    return { collateral, size, pnl };
  }, [open]);

  // Synthetic equity curve from current PnL — a smoothed climb to the current
  // total. Real history would come from event logs.
  const equity = useMemo(() => {
    const final = Number(formatUnits(totals.collateral + totals.pnl, 18));
    const start = Math.max(final - Math.abs(final) * 0.4, 0);
    const points = 30;
    return Array.from({ length: points }, (_, i) => {
      const x = i / (points - 1);
      const v = start + (final - start) * (x * x * (3 - 2 * x)); // smoothstep
      return { t: i, equity: Number(v.toFixed(4)) };
    });
  }, [totals]);

  async function onClose(marketAddress: `0x${string}`) {
    if (!address) return;
    setClosing(marketAddress);
    try {
      await closePosition(address, marketAddress);
      await refresh();
    } catch (e) {
      console.error(e);
    } finally {
      setClosing(null);
    }
  }

  if (!address) {
    return (
      <div className="max-w-[1400px] mx-auto px-5 py-16 text-center">
        <h1 className="heading text-4xl mb-2">Portfolio</h1>
        <p className="text-[color:var(--muted)] mb-6">
          Connect a wallet to see your open positions, PnL and equity curve.
        </p>
        <button onClick={connect} className="btn-primary">Connect Wallet</button>
      </div>
    );
  }

  const pnlPositive = totals.pnl >= 0n;

  return (
    <div className="max-w-[1400px] mx-auto px-5 py-8">
      <div className="flex items-end justify-between mb-5">
        <div>
          <h1 className="heading text-3xl md:text-5xl">Portfolio</h1>
          <p className="text-xs text-[color:var(--muted)] mono">{shortAddr(address)}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        <Stat label="VYR Balance" value={balance !== null ? `${fmtVyr(balance)} VYR` : "—"} />
        <Stat label="Collateral in use" value={`${fmtVyr(totals.collateral)} VYR`} />
        <Stat label="Notional size" value={`${fmtVyr(totals.size)} VYR`} />
        <Stat
          label="Unrealised PnL"
          value={`${fmtSignedVyr(totals.pnl)} VYR`}
          accentClass={pnlPositive ? "text-[color:var(--neon)]" : "text-[color:var(--red)]"}
        />
      </div>

      <div className="grid grid-cols-12 gap-4 mb-6">
        <div className="col-span-12 lg:col-span-8 card overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-[color:var(--border)]">
            <div className="text-xs font-semibold text-white">Equity curve</div>
            <div className="text-[10px] mono text-[color:var(--muted)]">Synthetic · placeholder until events indexed</div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={equity} margin={{ top: 10, right: 16, left: 0, bottom: 10 }}>
                <defs>
                  <linearGradient id="eq" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#b388ff" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#b388ff" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#1f2632" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="t" hide />
                <YAxis
                  orientation="right"
                  tick={{ fill: "#8a93a3", fontSize: 11, fontFamily: "var(--font-geist-mono)" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    background: "#0d1015",
                    border: "1px solid #1f2632",
                    borderRadius: 0,
                    fontSize: 12,
                    fontFamily: "var(--font-geist-mono)",
                  }}
                  formatter={(v) => [`${Number(v).toFixed(2)} VYR`, "Equity"]}
                  labelStyle={{ color: "#8a93a3" }}
                />
                <Area type="monotone" dataKey="equity" stroke="#b388ff" strokeWidth={2} fill="url(#eq)" isAnimationActive={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-4 card p-4">
          <div className="text-xs font-semibold text-white mb-3">Allocation</div>
          {open.length === 0 ? (
            <div className="text-xs text-[color:var(--muted)]">No open positions.</div>
          ) : (
            <ul className="space-y-2">
              {open.map((r) => {
                const total = Number(formatUnits(totals.size === 0n ? 1n : totals.size, 18));
                const pct = total > 0 ? (Number(formatUnits(r.position!.size, 18)) / total) * 100 : 0;
                return (
                  <li key={r.market.address}>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-white">{r.market.subject}</span>
                      <span className="mono text-[color:var(--muted)]">{pct.toFixed(1)}%</span>
                    </div>
                    <div className="h-1.5  bg-[color:var(--surface-2)] overflow-hidden mt-1">
                      <div
                        className={r.position!.isLong ? "h-full bg-[color:var(--neon)]" : "h-full bg-[color:var(--red)]"}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="px-4 py-3 border-b border-[color:var(--border)] text-xs font-semibold">
          Open positions
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-[11px] uppercase tracking-wider text-[color:var(--muted)] bg-[color:var(--surface-2)]/40">
              <tr>
                <th className="text-left px-4 py-3">Market</th>
                <th className="text-left px-2 py-3">Side</th>
                <th className="text-right px-2 py-3">Size</th>
                <th className="text-right px-2 py-3">Collateral</th>
                <th className="text-right px-2 py-3">Entry</th>
                <th className="text-right px-2 py-3">Mark</th>
                <th className="text-right px-2 py-3">PnL</th>
                <th className="text-right px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {open.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-[color:var(--muted)] text-sm">
                    No open positions. <Link href="/markets" className="text-[color:var(--neon)] hover:underline">Browse markets</Link>.
                  </td>
                </tr>
              )}
              {open.map((r) => {
                const p = r.position!;
                const positive = p.unrealizedPnl >= 0n;
                const closingNow = closing === r.market.address;
                return (
                  <tr key={r.market.address} className="border-t border-[color:var(--border)] hover:bg-[color:var(--surface-2)]/60">
                    <td className="px-4 py-3">
                      <Link href={`/markets/${r.market.address}`} className="flex items-center gap-3 group">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={r.market.imageUrl} alt={r.market.subject} className="w-8 h-8  object-cover" />
                        <div>
                          <div className="text-white font-semibold group-hover:underline">{r.market.subject}</div>
                          <div className="text-[10px] text-[color:var(--muted)]">{r.market.category}</div>
                        </div>
                      </Link>
                    </td>
                    <td className="px-2 py-3">
                      <span className={`px-2 py-0.5  text-[11px] mono ${p.isLong ? "tag-long" : "tag-short"}`}>
                        {p.isLong ? "LONG" : "SHORT"} {p.leverage}×
                      </span>
                    </td>
                    <td className="px-2 py-3 text-right mono">{fmtVyr(p.size)}</td>
                    <td className="px-2 py-3 text-right mono">{fmtVyr(p.collateral)}</td>
                    <td className="px-2 py-3 text-right mono">{fmtPrice(p.entryPrice)}</td>
                    <td className="px-2 py-3 text-right mono">{fmtPrice(r.snapshot?.markPrice ?? 0n)}</td>
                    <td className={`px-2 py-3 text-right mono ${positive ? "text-[color:var(--neon)]" : "text-[color:var(--red)]"}`}>
                      {fmtSignedVyr(p.unrealizedPnl)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => onClose(r.market.address as `0x${string}`)}
                        disabled={closingNow}
                        className="btn-ghost text-xs"
                      >
                        {closingNow ? "Closing…" : "Close"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

const Stat = ({
  label,
  value,
  accentClass = "text-white",
}: {
  label: string;
  value: string;
  accentClass?: string;
}) => (
  <div className="card px-3 py-2.5">
    <div className="text-[10px] uppercase tracking-widest text-[color:var(--muted)]">{label}</div>
    <div className={`mono text-base ${accentClass}`}>{value}</div>
  </div>
);
