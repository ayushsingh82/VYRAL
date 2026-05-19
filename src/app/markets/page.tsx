"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useAllMarkets, type MarketRow } from "../hooks/useAllMarkets";
import { fmtVyr } from "../lib/markets";
import Sparkline from "../components/Sparkline";

const CATEGORIES = ["All", "Trending", "Pop Culture", "Sports", "Pre-IPO", "RWA"];

type SortKey = "subject" | "price" | "change" | "volume" | "oi" | "longPct";
type SortDir = "asc" | "desc";

type Computed = {
  row: MarketRow;
  price: number;
  change: number;
  volume: number;
  oi: number;
  longPct: number;
};

function rowMetrics(row: MarketRow): Computed {
  const ip = Number(row.initialPrice);
  const price = row.snapshot ? Number(row.snapshot.markPrice) / 1e18 : ip;
  const change = ip > 0 ? ((price - ip) / ip) * 100 : 0;
  const volume = row.snapshot ? Number(row.snapshot.volumeAccum) / 1e18 : 0;
  const oi = row.snapshot
    ? Number(row.snapshot.longOI + row.snapshot.shortOI) / 1e18
    : 0;
  const longPct = row.snapshot ? Number(row.snapshot.longPctBps) / 100 : 50;
  return { row, price, change, volume, oi, longPct };
}

export default function MarketsPage() {
  const { rows, loading } = useAllMarkets();
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState("All");
  const [sort, setSort] = useState<{ key: SortKey; dir: SortDir }>({
    key: "volume",
    dir: "desc",
  });

  const data = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows
      .map(rowMetrics)
      .filter((c) => cat === "All" || c.row.category === cat)
      .filter((c) =>
        q === "" ? true : c.row.subject.toLowerCase().includes(q) || c.row.category.toLowerCase().includes(q)
      )
      .sort((a, b) => {
        const dir = sort.dir === "asc" ? 1 : -1;
        switch (sort.key) {
          case "subject":
            return a.row.subject.localeCompare(b.row.subject) * dir;
          case "price":
            return (a.price - b.price) * dir;
          case "change":
            return (a.change - b.change) * dir;
          case "volume":
            return (a.volume - b.volume) * dir;
          case "oi":
            return (a.oi - b.oi) * dir;
          case "longPct":
            return (a.longPct - b.longPct) * dir;
        }
      });
  }, [rows, query, cat, sort]);

  const toggleSort = (key: SortKey) => {
    setSort((s) => (s.key === key ? { key, dir: s.dir === "asc" ? "desc" : "asc" } : { key, dir: "desc" }));
  };

  const Arrow = ({ k }: { k: SortKey }) => (
    <span className="text-[10px] text-[color:var(--muted)] ml-1">
      {sort.key === k ? (sort.dir === "asc" ? "▲" : "▼") : "↕"}
    </span>
  );

  return (
    <div className="max-w-[1400px] mx-auto px-5 py-8">
      <div className="flex items-end justify-between mb-5">
        <div>
          <h1 className="heading text-3xl md:text-5xl">Markets</h1>
          <p className="text-xs text-[color:var(--muted)]">
            {data.length} of {rows.length} subjects · {loading ? "refreshing…" : "live"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search subject…"
            className="bg-[color:var(--surface)] border border-[color:var(--border)]  px-3 py-1.5 text-sm focus:outline-none focus:border-[color:var(--border-strong)] w-64"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {CATEGORIES.map((c) => (
          <button key={c} onClick={() => setCat(c)} className={`chip ${cat === c ? "is-active" : ""}`}>
            {c}
          </button>
        ))}
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-[11px] uppercase tracking-wider text-[color:var(--muted)] bg-[color:var(--surface-2)]/40">
              <tr>
                <th className="text-left px-4 py-3 cursor-pointer" onClick={() => toggleSort("subject")}>
                  Subject <Arrow k="subject" />
                </th>
                <th className="text-left px-2 py-3">Category</th>
                <th className="text-right px-2 py-3 cursor-pointer" onClick={() => toggleSort("price")}>
                  Mark <Arrow k="price" />
                </th>
                <th className="text-right px-2 py-3 cursor-pointer" onClick={() => toggleSort("change")}>
                  Change <Arrow k="change" />
                </th>
                <th className="text-right px-2 py-3 cursor-pointer" onClick={() => toggleSort("volume")}>
                  Volume <Arrow k="volume" />
                </th>
                <th className="text-right px-2 py-3 cursor-pointer" onClick={() => toggleSort("oi")}>
                  OI <Arrow k="oi" />
                </th>
                <th className="text-right px-2 py-3 cursor-pointer" onClick={() => toggleSort("longPct")}>
                  L / S <Arrow k="longPct" />
                </th>
                <th className="text-right px-4 py-3">Chart</th>
                <th className="text-right px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {data.map(({ row, price, change, longPct }) => {
                const up = change >= 0;
                return (
                  <tr
                    key={row.address}
                    className="border-t border-[color:var(--border)] hover:bg-[color:var(--surface-2)]/60 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <Link href={`/markets/${row.address}`} className="flex items-center gap-3 group">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={row.imageUrl} alt={row.subject} className="w-8 h-8  object-cover" />
                        <div>
                          <div className="text-white font-semibold group-hover:underline">{row.subject}</div>
                          <div className="text-[10px] mono text-[color:var(--muted)]">
                            {row.address.slice(0, 6)}…{row.address.slice(-4)}
                          </div>
                        </div>
                      </Link>
                    </td>
                    <td className="px-2 py-3">
                      <span className="text-[10px] mono px-2 py-0.5 border border-[color:var(--border)] text-[color:var(--muted)]">
                        {row.category}
                      </span>
                    </td>
                    <td className="px-2 py-3 text-right mono">
                      {price.toFixed(2)}
                      <span className="text-[10px] text-[color:var(--muted)] ml-1">VYR</span>
                    </td>
                    <td className={`px-2 py-3 text-right mono ${up ? "text-[color:var(--neon)]" : "text-[color:var(--red)]"}`}>
                      {up ? "+" : ""}
                      {change.toFixed(2)}%
                    </td>
                    <td className="px-2 py-3 text-right mono">
                      {row.snapshot ? fmtVyr(row.snapshot.volumeAccum) : "—"}
                    </td>
                    <td className="px-2 py-3 text-right mono">
                      {row.snapshot ? fmtVyr(row.snapshot.longOI + row.snapshot.shortOI) : "—"}
                    </td>
                    <td className="px-2 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-20 h-1.5  overflow-hidden bg-[color:var(--surface-2)]">
                          <div className="h-full bg-[color:var(--neon)]" style={{ width: `${longPct}%` }} />
                        </div>
                        <span className="mono text-[11px] text-[color:var(--muted)] w-12 text-right">
                          {longPct.toFixed(0)}/{(100 - longPct).toFixed(0)}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 w-32">
                      <div className="w-28 h-10 ml-auto">
                        <Sparkline
                          marketAddress={row.address}
                          initialPrice={Number(row.initialPrice)}
                          markPrice={price}
                          positive={up}
                          height={40}
                        />
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/markets/${row.address}`}
                        className="btn-primary text-xs"
                      >
                        Trade
                      </Link>
                    </td>
                  </tr>
                );
              })}
              {data.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-4 py-10 text-center text-[color:var(--muted)] text-sm">
                    No markets match those filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
