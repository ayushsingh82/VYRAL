"use client";

import React, { useState } from "react";
import type { Address } from "viem";
import { closePosition, openPosition, type PositionView, fmtSignedKai, fmtKai } from "../lib/markets";

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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
      onClick={onClose}
    >
      <div
        className="bg-black border border-gray-800 rounded-lg w-full max-w-md p-5 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-white text-lg font-bold">Trade {subject}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-xl leading-none"
          >
            ×
          </button>
        </div>

        {position?.open && (
          <div className="bg-gray-900 border border-gray-800 rounded-md p-3 mb-3 text-xs text-white">
            <div className="flex justify-between mb-1">
              <span className="text-gray-400">Open position</span>
              <span className={position.isLong ? "text-green-400" : "text-red-400"}>
                {position.isLong ? "LONG" : "SHORT"} {position.leverage}x
              </span>
            </div>
            <div className="flex justify-between">
              <span>Collateral</span>
              <span>{fmtKai(position.collateral)} KAI</span>
            </div>
            <div className="flex justify-between">
              <span>Unrealised P&amp;L</span>
              <span
                className={
                  position.unrealizedPnl >= 0n ? "text-green-400" : "text-red-400"
                }
              >
                {fmtSignedKai(position.unrealizedPnl)} KAI
              </span>
            </div>
            <button
              onClick={close}
              disabled={busy}
              className="mt-3 w-full bg-orange-500 hover:bg-orange-600 text-white py-1.5 rounded-md text-sm font-medium disabled:opacity-60"
            >
              {busy ? "Closing…" : "Close position"}
            </button>
          </div>
        )}

        {!position?.open && (
          <>
            <div className="flex gap-2 mb-3">
              <button
                onClick={() => setIsLong(true)}
                className={`flex-1 py-2 rounded-md text-sm font-bold ${
                  isLong
                    ? "bg-green-500 text-black"
                    : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                }`}
              >
                LONG
              </button>
              <button
                onClick={() => setIsLong(false)}
                className={`flex-1 py-2 rounded-md text-sm font-bold ${
                  !isLong
                    ? "bg-red-500 text-black"
                    : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                }`}
              >
                SHORT
              </button>
            </div>

            <label className="block text-xs text-gray-400 mb-1">Collateral (KAI)</label>
            <input
              value={collateral}
              onChange={(e) => setCollateral(e.target.value.replace(/[^0-9.]/g, ""))}
              className="w-full px-3 py-2 bg-gray-900 border border-gray-800 rounded-md text-white text-sm mb-3 focus:outline-none focus:border-blue-500"
              inputMode="decimal"
            />

            <label className="block text-xs text-gray-400 mb-1">
              Leverage: <span className="text-white font-bold">{leverage}x</span>
            </label>
            <input
              type="range"
              min={1}
              max={20}
              value={leverage}
              onChange={(e) => setLeverage(parseInt(e.target.value))}
              className="w-full mb-2 accent-orange-500"
            />
            <div className="flex justify-between text-[10px] text-gray-500 mb-3">
              <span>1x</span>
              <span>5x</span>
              <span>10x</span>
              <span>20x</span>
            </div>

            <div className="text-xs text-gray-400 mb-3 flex justify-between">
              <span>Notional size</span>
              <span className="text-white font-bold">
                {(parseFloat(collateral || "0") * leverage).toFixed(2)} KAI
              </span>
            </div>

            <button
              onClick={submit}
              disabled={busy || !account || !collateral || parseFloat(collateral) <= 0}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md text-sm font-bold disabled:opacity-60"
            >
              {busy ? "Submitting…" : account ? "Open Position" : "Connect Wallet First"}
            </button>
          </>
        )}

        {err && <p className="text-red-400 text-xs mt-2 break-words">{err}</p>}
      </div>
    </div>
  );
};

export default OpenPositionModal;
