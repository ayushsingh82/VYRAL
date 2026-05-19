"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useWallet, shortAddr } from "../hooks/useWallet";
import { faucetMintVyr, getVyrBalance, fmtVyr } from "../lib/markets";
import Logo from "./Logo";

const LINKS = [
  { href: "/markets", label: "Markets" },
  { href: "/trending", label: "Trending" },
  { href: "/submit", label: "Submit" },
  { href: "/portfolio", label: "Portfolio" },
];

const Navbar = () => {
  const { address, connect, disconnect, connecting, chainId, error } = useWallet();
  const [busy, setBusy] = useState(false);
  const [bal, setBal] = useState<bigint | null>(null);
  const pathname = usePathname();

  React.useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!address) {
        setBal(null);
        return;
      }
      try {
        const b = await getVyrBalance(address);
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
      await faucetMintVyr(address);
    } catch (e) {
      console.error(e);
    } finally {
      setBusy(false);
    }
  }

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname?.startsWith(href);

  return (
    <nav className="sticky top-0 z-40 bg-black/70 backdrop-blur-md border-b border-[color:var(--border)]">
      <div className="max-w-[1400px] mx-auto px-5 h-14 flex items-center gap-6">
        <Link href="/" className="flex items-center gap-2 group">
          <Logo size={28} />
          <span className="text-white text-lg font-black tracking-tight">VYRAL</span>
          <span className="hidden md:inline text-[10px] mono text-[color:var(--muted)] border border-[color:var(--border)] px-1.5 py-0.5 ml-1">BETA</span>
        </Link>

        <div className="hidden md:flex items-center gap-1 ml-2">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`px-3 py-1.5  text-sm transition-colors ${
                isActive(l.href)
                  ? "text-white bg-[color:var(--surface-2)]"
                  : "text-[color:var(--muted)] hover:text-white hover:bg-[color:var(--surface)]"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </div>

        <div className="hidden lg:flex relative ml-auto w-72">
          <input
            type="text"
            placeholder="Search subjects, categories…"
            className="w-full px-3 py-1.5 bg-[color:var(--surface)] text-white placeholder-[color:var(--muted)]  border border-[color:var(--border)] focus:outline-none focus:border-[color:var(--border-strong)] text-sm"
          />
          <svg className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-[color:var(--muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        <div className="flex items-center gap-2 ml-auto lg:ml-0">
          {error && <span className="text-[color:var(--red)] text-xs hidden md:inline">{error}</span>}

          {address && (
            <div className="hidden sm:flex items-center gap-2 text-xs px-2.5 py-1.5  bg-[color:var(--surface)] border border-[color:var(--border)]">
              <span className="text-[color:var(--muted)]">Balance</span>
              <span className="mono text-white font-semibold">
                {bal !== null ? `${fmtVyr(bal)} VYR` : "…"}
              </span>
            </div>
          )}

          {address && (
            <button
              onClick={onFaucet}
              disabled={busy}
              className="btn-ghost text-xs px-2.5 py-1.5 hidden md:inline-flex"
              title="Mint 10,000 test VYR"
            >
              {busy ? "Minting…" : "Faucet"}
            </button>
          )}

          {!address ? (
            <button
              onClick={connect}
              disabled={connecting}
              className="btn-primary text-sm"
            >
              {connecting ? "Connecting…" : "Connect Wallet"}
            </button>
          ) : (
            <button
              onClick={disconnect}
              className="btn-ghost text-sm flex items-center gap-2"
              title={`Chain ${chainId ?? "?"}`}
            >
              <span className="live-dot" />
              <span className="mono">{shortAddr(address)}</span>
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
