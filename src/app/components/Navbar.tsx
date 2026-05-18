"use client";

import React, { useState } from "react";
import { useWallet, shortAddr } from "../hooks/useWallet";
import { faucetMintKai, getKaiBalance, fmtKai } from "../lib/markets";

const Navbar = () => {
  const { address, connect, disconnect, connecting, chainId, error } = useWallet();
  const [busy, setBusy] = useState(false);
  const [bal, setBal] = useState<bigint | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!address) {
        setBal(null);
        return;
      }
      try {
        const b = await getKaiBalance(address);
        if (!cancelled) setBal(b);
      } catch {
        if (!cancelled) setBal(null);
      }
    }
    load();
    const id = setInterval(load, 8000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [address]);

  async function onFaucet() {
    if (!address) return;
    setBusy(true);
    try {
      await faucetMintKai(address);
    } catch (e) {
      console.error(e);
    } finally {
      setBusy(false);
    }
  }

  return (
    <nav className="bg-black h-10 flex items-center justify-between px-6 shadow-md border-b border-gray-400">
      <div className="flex items-center gap-4">
        <h1 className="text-white text-xl font-bold">HEAT</h1>
        <div className="relative">
          <input
            type="text"
            placeholder="Search tokens..."
            className="w-full px-3 py-1 bg-gray-800 text-white placeholder-gray-400 rounded-md focus:outline-none  focus:bg-gray-700 transition-colors text-sm"
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-2">
            <svg
              className="w-3 h-3 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>
        {error && (
          <span className="text-red-400 text-xs">{error}</span>
        )}
      </div>

      <div className="flex items-center gap-2">
        {address && (
          <div className="text-white text-xs flex items-center gap-2">
            <span className="text-gray-400">Balance</span>
            <span className="font-bold">{bal !== null ? `${fmtKai(bal)} KAI` : "…"}</span>
          </div>
        )}
        {address && (
          <button
            onClick={onFaucet}
            disabled={busy}
            className="bg-gray-800 hover:bg-gray-700 text-white px-2 py-1 rounded-md text-xs font-medium transition-colors duration-200 disabled:opacity-50"
            title="Mint 10,000 test KAI"
          >
            {busy ? "Minting…" : "Get Test KAI"}
          </button>
        )}
        {!address ? (
          <button
            onClick={connect}
            disabled={connecting}
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-black text-sm disabled:opacity-60"
          >
            {connecting ? "Connecting…" : "Connect Wallet"}
          </button>
        ) : (
          <button
            onClick={disconnect}
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md font-medium transition-colors duration-200 text-sm"
            title={`Chain ${chainId ?? "?"}`}
          >
            {shortAddr(address)}
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
