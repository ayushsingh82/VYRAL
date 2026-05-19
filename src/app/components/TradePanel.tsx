"use client";

import React, { useState } from "react";
import type { Address } from "viem";
import {
  closePosition,
  openPosition,
  type PositionView,
  fmtSignedVyr,
  fmtVyr,
} from "../lib/markets";

type Props = {
  marketAddress: Address;
  subject: string;
  markPrice: number;
  account: Address | null;
  position: PositionView | null;
  onActionDone: () => void;
};

const TradePanel: React.FC<Props> = ({
  marketAddress,
  subject,
  markPrice,
  account,
  position,
  onActionDone,
}) => {
  const [collateral, setCollateral] = useState("100");
  const [leverage, setLeverage] = useState(5);
  const [isLong, setIsLong] = useState(true);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function submit() {
    if (!account) {
      setErr("Connect a wallet first");
      return;
    }
    setBusy(true);
    setErr(null);
    try {
      await openPosition(account, marketAddress, collateral, leverage, isLong);
      onActionDone();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "tx failed");
    } finally {
      setBusy(false);
    }
  }

  async function close() {
    if (!account) return;
    setBusy(true);
    setErr(null);
    try {
      await closePosition(account, marketAddress);
      onActionDone();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "tx failed");
    } finally {
      setBusy(false);
    }
  }

  const notional = (parseFloat(collateral || "0") * leverage).toFixed(2);
  const liqEstimate = markPrice * (isLong ? 1 - 0.95 / leverage : 1 + 0.95 / leverage);

  return (
    <div className="card overflow-hidden">
      <div className="px-3 py-2 border-b border-[color:var(--border)] flex items-center justify-between">
        <div className="text-xs font-semibold text-white">Trade {subject}</div>
        <div className="text-[10px] mono text-[color:var(--muted)]">Up to 20×</div>
      </div>

      <div className="p-3 space-y-3">
        {position?.open ? (
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-[color:var(--muted)]">Side</span>
              <span className={position.isLong ? "tag-long px-2 py-0.5  text-[11px]" : "tag-short px-2 py-0.5  text-[11px]"}>
                {position.isLong ? "LONG" : "SHORT"} {position.leverage}×
              </span>
            </div>
            <Row label="Collateral" value={`${fmtVyr(position.collateral)} VYR`} />
            <Row label="Size" value={`${fmtVyr(position.size)} VYR`} />
            <Row label="Entry" value={`${(Number(position.entryPrice) / 1e18).toFixed(4)}`} />
            <Row
              label="Unrealised PnL"
              value={`${fmtSignedVyr(position.unrealizedPnl)} VYR`}
              valueClass={position.unrealizedPnl >= 0n ? "text-[color:var(--neon)]" : "text-[color:var(--red)]"}
            />
            {position.liquidatable && (
              <div className="text-[11px] text-[color:var(--red)] mono">⚠ liquidatable</div>
            )}
            <button onClick={close} disabled={busy} className="w-full btn-ghost text-sm mt-2">
              {busy ? "Closing…" : "Close position"}
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setIsLong(true)}
                className={`py-2  text-sm font-bold transition-colors ${
                  isLong ? "bg-[color:var(--neon)] text-black" : "btn-ghost"
                }`}
              >
                LONG
              </button>
              <button
                onClick={() => setIsLong(false)}
                className={`py-2  text-sm font-bold transition-colors ${
                  !isLong ? "bg-[color:var(--red)] text-black" : "btn-ghost"
                }`}
              >
                SHORT
              </button>
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-widest text-[color:var(--muted)] mb-1">
                Collateral (VYR)
              </label>
              <input
                value={collateral}
                onChange={(e) => setCollateral(e.target.value.replace(/[^0-9.]/g, ""))}
                className="w-full px-3 py-2 bg-[color:var(--surface)] border border-[color:var(--border)]  text-white text-sm mono focus:outline-none focus:border-[color:var(--border-strong)]"
                inputMode="decimal"
              />
              <div className="flex gap-1 mt-1">
                {["25", "100", "500", "1000"].map((v) => (
                  <button
                    key={v}
                    onClick={() => setCollateral(v)}
                    className="flex-1 chip text-[10px] py-1"
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-[10px] uppercase tracking-widest text-[color:var(--muted)] mb-1">
                <span>Leverage</span>
                <span className="mono text-white text-sm">{leverage}×</span>
              </div>
              <input
                type="range"
                min={1}
                max={20}
                value={leverage}
                onChange={(e) => setLeverage(parseInt(e.target.value))}
                className="w-full accent-[color:var(--neon)]"
              />
              <div className="flex justify-between text-[10px] text-[color:var(--muted)] mono">
                <span>1×</span><span>5×</span><span>10×</span><span>20×</span>
              </div>
            </div>

            <div className="space-y-1.5 text-xs pt-1 border-t border-[color:var(--border)]">
              <Row label="Notional" value={`${notional} VYR`} mono />
              <Row label="Entry" value={`${markPrice.toFixed(4)} VYR`} mono />
              <Row
                label="Est. liq. price"
                value={`${liqEstimate.toFixed(4)} VYR`}
                valueClass="text-[color:var(--gold)]"
                mono
              />
            </div>

            <button
              onClick={submit}
              disabled={busy || !account || !collateral || parseFloat(collateral) <= 0}
              className="w-full btn-primary"
            >
              {busy ? "Submitting…" : account ? `Open ${isLong ? "Long" : "Short"}` : "Connect Wallet"}
            </button>
          </>
        )}

        {err && <p className="text-[color:var(--red)] text-[11px] mono break-words">{err}</p>}
      </div>
    </div>
  );
};

const Row = ({
  label,
  value,
  valueClass = "text-white",
  mono = false,
}: {
  label: string;
  value: string;
  valueClass?: string;
  mono?: boolean;
}) => (
  <div className="flex items-center justify-between text-xs">
    <span className="text-[color:var(--muted)]">{label}</span>
    <span className={`${mono ? "mono" : ""} ${valueClass}`}>{value}</span>
  </div>
);

export default TradePanel;
