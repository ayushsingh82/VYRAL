"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { addresses } from "../lib/addresses";
import { useAllMarkets } from "../hooks/useAllMarkets";
import MarketCard from "./MarketCard";
import Sparkline from "./Sparkline";
import { fmtPrice, fmtVyr } from "../lib/markets";

const CATEGORIES = ["All", "Trending", "Pop Culture", "Sports", "Pre-IPO", "RWA"];

const Landing = () => {
  const { rows } = useAllMarkets();
  const [cat, setCat] = useState("All");

  const featured =
    addresses.markets.find((m) => m.featured) ?? addresses.markets[0];
  const featuredRow = rows.find((r) => r.address === featured.address);
  const featuredInitial = Number(featured.initialPrice);
  const featuredMark = featuredRow?.snapshot
    ? Number(featuredRow.snapshot.markPrice) / 1e18
    : featuredInitial;
  const featuredPct =
    featuredInitial > 0
      ? ((featuredMark - featuredInitial) / featuredInitial) * 100
      : 0;
  const featuredUp = featuredPct >= 0;

  const aggregates = useMemo(() => {
    let oi = 0n;
    let vol = 0n;
    let longOI = 0n;
    let shortOI = 0n;
    for (const r of rows) {
      if (!r.snapshot) continue;
      oi += r.snapshot.longOI + r.snapshot.shortOI;
      vol += r.snapshot.volumeAccum;
      longOI += r.snapshot.longOI;
      shortOI += r.snapshot.shortOI;
    }
    const totalDir = longOI + shortOI;
    const longPct =
      totalDir === 0n ? 50 : Number((longOI * 10000n) / totalDir) / 100;
    return { oi, vol, longPct };
  }, [rows]);

  const filtered = useMemo(() => {
    const others = rows.filter((r) => r.address !== featured.address);
    if (cat === "All") return others;
    return others.filter((r) => r.category === cat);
  }, [rows, cat, featured.address]);

  // Top movers across all markets (incl featured).
  const movers = useMemo(() => {
    return [...rows]
      .map((r) => {
        const ip = Number(r.initialPrice);
        const mp = r.snapshot ? Number(r.snapshot.markPrice) / 1e18 : ip;
        const pct = ip > 0 ? ((mp - ip) / ip) * 100 : 0;
        return { row: r, pct };
      })
      .sort((a, b) => Math.abs(b.pct) - Math.abs(a.pct))
      .slice(0, 4);
  }, [rows]);

  return (
    <div>
      {/* Hero */}
      <section className="relative bg-grid overflow-hidden border-b border-[color:var(--border)]">
        <div className="max-w-[1400px] mx-auto px-5 py-12 md:py-16 relative">
          <div className="grid lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7">
              <div className="inline-flex items-center gap-2 px-2.5 py-1  border border-[color:var(--border)] bg-[color:var(--surface)] text-xs text-[color:var(--muted)] mb-4">
                <span className="live-dot" />
                <span className="mono">VYRAL devnet · {rows.length} markets live</span>
              </div>
              <h1 className="heading text-5xl md:text-7xl mb-4">
                Trade the <span className="text-[color:var(--neon)]">virality</span><br />
                of anything that moves culture.
              </h1>
              <p className="text-[color:var(--muted)] text-base md:text-lg max-w-xl mb-6">
                Long or short cultural subjects — celebrities, news, sports, RWA, pre-IPO — with up to
                <span className="text-white font-semibold"> 20× leverage</span>, settled in VYR. Perpetual,
                onchain, no expiry.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link href="/markets" className="btn-primary">Open markets</Link>
                <Link href="/submit" className="btn-ghost">Submit a viral topic</Link>
              </div>

              <div className="mt-8 grid grid-cols-3 gap-3 max-w-lg">
                <Stat label="Total OI" value={`${fmtVyr(aggregates.oi)} VYR`} />
                <Stat label="Volume" value={`${fmtVyr(aggregates.vol)} VYR`} />
                <Stat label="Long bias" value={`${aggregates.longPct.toFixed(1)}%`} accent />
              </div>
            </div>

            {/* Featured market hero card */}
            <div className="lg:col-span-5">
              <Link
                href={`/markets/${featured.address}`}
                className="card card-hover block overflow-hidden"
              >
                <div className="relative h-40">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={featured.imageUrl} alt={featured.subject} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[color:var(--surface)] via-[color:var(--surface)]/30 to-transparent" />
                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    <span className="text-[10px] mono px-2 py-0.5 bg-black/60 border border-[color:var(--border)]">
                      FEATURED
                    </span>
                    <span className="text-[10px] mono px-2 py-0.5 tag-long">
                      {featured.category}
                    </span>
                  </div>
                  <div className="absolute bottom-3 left-3 right-3">
                    <div className="text-white font-bold text-xl">{featured.subject}</div>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="mono text-white text-lg">
                        {fmtPrice(featuredRow?.snapshot?.markPrice ?? 0n)} VYR
                      </span>
                      <span className={`mono text-sm ${featuredUp ? "text-[color:var(--neon)]" : "text-[color:var(--red)]"}`}>
                        {featuredUp ? "+" : ""}
                        {featuredPct.toFixed(2)}%
                      </span>
                    </div>
                  </div>
                </div>
                <Sparkline
                  marketAddress={featured.address}
                  initialPrice={featuredInitial}
                  markPrice={featuredMark}
                  positive={featuredUp}
                  height={80}
                />
                <div className="px-4 py-3 grid grid-cols-3 gap-3 border-t border-[color:var(--border)] text-xs">
                  <Mini label="Open interest" value={featuredRow?.snapshot ? `${fmtVyr(featuredRow.snapshot.longOI + featuredRow.snapshot.shortOI)} VYR` : "—"} />
                  <Mini label="24h vol" value={featuredRow?.snapshot ? `${fmtVyr(featuredRow.snapshot.volumeAccum)} VYR` : "—"} />
                  <Mini label="Max lev" value="20×" />
                </div>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Top movers */}
      <section className="max-w-[1400px] mx-auto px-5 py-10">
        <SectionHeader title="Top movers" subtitle="Biggest |change| from listing price · refreshed every 8s" href="/trending" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {movers.map(({ row, pct }) => {
            const ip = Number(row.initialPrice);
            const mp = row.snapshot ? Number(row.snapshot.markPrice) / 1e18 : ip;
            const up = pct >= 0;
            return (
              <Link
                key={row.address}
                href={`/markets/${row.address}`}
                className="card card-hover p-3 flex items-center gap-3"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={row.imageUrl} alt={row.subject} className="w-12 h-12  object-cover" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold truncate">{row.subject}</div>
                  <div className="text-[10px] text-[color:var(--muted)]">{row.category}</div>
                </div>
                <div className="text-right">
                  <div className="mono text-sm">{mp.toFixed(2)}</div>
                  <div className={`mono text-xs ${up ? "text-[color:var(--neon)]" : "text-[color:var(--red)]"}`}>
                    {up ? "+" : ""}
                    {pct.toFixed(2)}%
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Markets grid */}
      <section className="max-w-[1400px] mx-auto px-5 pb-16">
        <SectionHeader title="All markets" subtitle="Filter by category" href="/markets" />
        <div className="flex flex-wrap gap-2 mb-5">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={`chip ${cat === c ? "is-active" : ""}`}
            >
              {c}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((m) => (
            <MarketCard key={m.address} item={m} />
          ))}
        </div>
      </section>
    </div>
  );
};

const Stat = ({ label, value, accent }: { label: string; value: string; accent?: boolean }) => (
  <div className="card px-3 py-2.5">
    <div className="text-[10px] uppercase tracking-widest text-[color:var(--muted)]">{label}</div>
    <div className={`mono text-base ${accent ? "text-[color:var(--neon)]" : "text-white"}`}>{value}</div>
  </div>
);

const Mini = ({ label, value }: { label: string; value: string }) => (
  <div>
    <div className="text-[10px] uppercase tracking-widest text-[color:var(--muted)]">{label}</div>
    <div className="mono text-sm text-white">{value}</div>
  </div>
);

const SectionHeader = ({ title, subtitle, href }: { title: string; subtitle: string; href?: string }) => (
  <div className="flex items-end justify-between mb-4">
    <div>
      <h2 className="heading text-2xl md:text-3xl">{title}</h2>
      <p className="text-xs text-[color:var(--muted)]">{subtitle}</p>
    </div>
    {href && (
      <Link href={href} className="text-xs text-[color:var(--muted)] hover:text-white">
        View all →
      </Link>
    )}
  </div>
);

export default Landing;
