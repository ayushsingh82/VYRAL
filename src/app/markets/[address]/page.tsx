"use client";

import React from "react";
import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import { addresses } from "../../lib/addresses";
import { useMarket } from "../../hooks/useMarket";
import { useWallet } from "../../hooks/useWallet";
import { fmtPrice, fmtVyr } from "../../lib/markets";
import PriceChart from "../../components/PriceChart";
import Orderbook from "../../components/Orderbook";
import Trades from "../../components/Trades";
import TradePanel from "../../components/TradePanel";

export default function MarketDetail() {
  const params = useParams<{ address: string }>();
  const market = addresses.markets.find(
    (m) => m.address.toLowerCase() === params.address?.toLowerCase()
  );
  if (!market) {
    notFound();
  }
  const subject = market!;

  const { address: account } = useWallet();
  const { snapshot, position, refresh } = useMarket(
    subject.address as `0x${string}`,
    account
  );

  const initial = Number(subject.initialPrice);
  const mark = snapshot ? Number(snapshot.markPrice) / 1e18 : initial;
  const change = initial > 0 ? ((mark - initial) / initial) * 100 : 0;
  const up = change >= 0;
  const longPct = snapshot ? Number(snapshot.longPctBps) / 100 : 50;

  return (
    <div className="max-w-[1400px] mx-auto px-5 py-6">
      {/* Header strip */}
      <div className="card overflow-hidden mb-4">
        <div className="flex flex-col md:flex-row gap-4 p-4">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={subject.imageUrl} alt={subject.subject} className="w-16 h-16  object-cover" />
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <Link href="/markets" className="text-[11px] text-[color:var(--muted)] hover:text-white">
                  ← Markets
                </Link>
                <span className="text-[color:var(--border-strong)]">/</span>
                <span className="text-[11px] mono px-1.5 py-0.5 border border-[color:var(--border)] text-[color:var(--muted)]">
                  {subject.category}
                </span>
                <span className="text-[11px] mono text-[color:var(--gold)]">20× max</span>
              </div>
              <h1 className="heading text-2xl md:text-4xl text-white truncate">{subject.subject}</h1>
              <div className="text-[10px] mono text-[color:var(--muted)] truncate">{subject.address}</div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:w-[640px]">
            <Stat label="Mark" value={`${fmtPrice(snapshot?.markPrice ?? 0n)} VYR`} />
            <Stat
              label="24h"
              value={`${up ? "+" : ""}${change.toFixed(2)}%`}
              accentClass={up ? "text-[color:var(--neon)]" : "text-[color:var(--red)]"}
            />
            <Stat label="Open interest" value={snapshot ? `${fmtVyr(snapshot.longOI + snapshot.shortOI)} VYR` : "—"} />
            <Stat label="Volume" value={snapshot ? `${fmtVyr(snapshot.volumeAccum)} VYR` : "—"} />
          </div>
        </div>

        <div className="border-t border-[color:var(--border)] px-4 py-2 flex items-center gap-3 text-[11px]">
          <span className="text-[color:var(--muted)] uppercase tracking-widest">Sentiment</span>
          <div className="flex-1 max-w-md h-2  overflow-hidden bg-[color:var(--surface-2)]">
            <div className="h-full bg-[color:var(--neon)] inline-block" style={{ width: `${longPct}%` }} />
            <div className="h-full bg-[color:var(--red)] inline-block" style={{ width: `${100 - longPct}%` }} />
          </div>
          <span className="mono text-[color:var(--neon)]">L {longPct.toFixed(1)}%</span>
          <span className="mono text-[color:var(--red)]">S {(100 - longPct).toFixed(1)}%</span>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4">
        {/* Chart + trades column */}
        <div className="col-span-12 lg:col-span-6 space-y-4">
          <PriceChart
            marketAddress={subject.address}
            initialPrice={initial}
            markPrice={mark}
            positive={up}
          />
          <Trades marketAddress={subject.address} markPrice={mark} />
        </div>

        {/* Orderbook */}
        <div className="col-span-12 md:col-span-7 lg:col-span-3">
          <Orderbook marketAddress={subject.address} markPrice={mark} />
        </div>

        {/* Trade panel */}
        <div className="col-span-12 md:col-span-5 lg:col-span-3">
          <TradePanel
            marketAddress={subject.address as `0x${string}`}
            subject={subject.subject}
            markPrice={mark}
            account={account}
            position={position}
            onActionDone={refresh}
          />
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
  <div className="card px-3 py-2">
    <div className="text-[10px] uppercase tracking-widest text-[color:var(--muted)]">{label}</div>
    <div className={`mono text-sm ${accentClass}`}>{value}</div>
  </div>
);
