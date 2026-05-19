"use client";

import React, { useState } from "react";
import type { Address } from "viem";
import { closePosition, openPosition, type PositionView, fmtSignedVyr, fmtVyr } from "../lib/markets";

type Props = {
  open: boolean;
  onClose: () => void;
  marketAddress: Address;
  subject: string;
  account: Address | null;
  position: PositionView | null;
  onActionDone: () => void;
};

const OpenPositionModal: React.FC<Props> = ({
  open,
  onClose,
  marketAddress,
  subject,
  account,
  position,
  onActionDone,
}) => {
  const [collateral, setCollateral] = useState("100");
  const [leverage, setLeverage] = useState(5);
  const [isLong, setIsLong] = useState(true);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  if (!open) return null;

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
      onClose();
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
      onClose();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "tx failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div className="card w-full max-w-md p-5 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white text-lg font-bold">Trade {subject}</h3>
          <button onClick={onClose} className="text-[color:var(--muted)] hover:text-white text-xl leading-none">×</button>
        </div>

        {position?.open && (
          <div className="card p-3 mb-3 text-xs">
            <div className="flex justify-between mb-1">
              <span className="text-[color:var(--muted)]">Open position</span>
              <span className={position.isLong ? "text-[color:var(--neon)]" : "text-[color:var(--red)]"}>
                {position.isLong ? "LONG" : "SHORT"} {position.leverage}×
              </span>
            </div>
            <div className="flex justify-between mono">
              <span className="text-[color:var(--muted)]">Collateral</span>
              <span className="text-white">{fmtVyr(position.collateral)} VYR</span>
            </div>
            <div className="flex justify-between mono">
              <span className="text-[color:var(--muted)]">Unrealised PnL</span>
              <span className={position.unrealizedPnl >= 0n ? "text-[color:var(--neon)]" : "text-[color:var(--red)]"}>
                {fmtSignedVyr(position.unrealizedPnl)} VYR
              </span>
            </div>
            <button onClick={close} disabled={busy} className="mt-3 w-full btn-ghost text-sm">
              {busy ? "Closing…" : "Close position"}
            </button>
          </div>
        )}

        {!position?.open && (
          <>
            <div className="grid grid-cols-2 gap-2 mb-3">
              <button
                onClick={() => setIsLong(true)}
                className={`py-2  text-sm font-bold ${isLong ? "bg-[color:var(--neon)] text-black" : "btn-ghost"}`}
              >
                LONG
              </button>
              <button
                onClick={() => setIsLong(false)}
                className={`py-2  text-sm font-bold ${!isLong ? "bg-[color:var(--red)] text-black" : "btn-ghost"}`}
              >
                SHORT
              </button>
            </div>

            <label className="block text-[11px] uppercase tracking-widest text-[color:var(--muted)] mb-1">Collateral (VYR)</label>
            <input
              value={collateral}
              onChange={(e) => setCollateral(e.target.value.replace(/[^0-9.]/g, ""))}
              className="w-full px-3 py-2 bg-[color:var(--surface)] border border-[color:var(--border)]  text-white text-sm mono mb-3 focus:outline-none focus:border-[color:var(--border-strong)]"
              inputMode="decimal"
            />

            <label className="block text-[11px] uppercase tracking-widest text-[color:var(--muted)] mb-1">
              Leverage <span className="text-white font-bold ml-1 mono">{leverage}×</span>
            </label>
            <input
              type="range"
              min={1}
              max={20}
              value={leverage}
              onChange={(e) => setLeverage(parseInt(e.target.value))}
              className="w-full mb-1 accent-[color:var(--neon)]"
            />
            <div className="flex justify-between text-[10px] text-[color:var(--muted)] mb-3 mono">
              <span>1×</span><span>5×</span><span>10×</span><span>20×</span>
            </div>

            <div className="text-xs flex justify-between mono mb-3">
              <span className="text-[color:var(--muted)]">Notional size</span>
              <span className="text-white">{(parseFloat(collateral || "0") * leverage).toFixed(2)} VYR</span>
            </div>

            <button
              onClick={submit}
              disabled={busy || !account || !collateral || parseFloat(collateral) <= 0}
              className="w-full btn-primary"
            >
              {busy ? "Submitting…" : account ? "Open Position" : "Connect Wallet First"}
            </button>
          </>
        )}

        {err && <p className="text-[color:var(--red)] text-xs mt-2 break-words mono">{err}</p>}
      </div>
    </div>
  );
};

export default OpenPositionModal;
