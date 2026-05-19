import React from "react";
import Link from "next/link";
import Logo from "./Logo";

const Footer = () => {
  return (
    <footer className="border-t border-[color:var(--border)] bg-black/70">
      <div className="max-w-[1400px] mx-auto px-5 py-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-sm">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Logo size={22} />
            <span className="font-black tracking-tight">VYRAL</span>
          </div>
          <p className="text-[color:var(--muted)] text-xs leading-relaxed">
            Perpetual leverage on cultural virality. Long or short the popularity of
            anyone or anything, settled in VYR.
          </p>
        </div>
        <div>
          <div className="text-white font-semibold mb-2">Trade</div>
          <ul className="space-y-1 text-[color:var(--muted)] text-xs">
            <li><Link href="/markets" className="hover:text-white">Markets</Link></li>
            <li><Link href="/trending" className="hover:text-white">Trending</Link></li>
            <li><Link href="/portfolio" className="hover:text-white">Portfolio</Link></li>
          </ul>
        </div>
        <div>
          <div className="text-white font-semibold mb-2">Community</div>
          <ul className="space-y-1 text-[color:var(--muted)] text-xs">
            <li><Link href="/submit" className="hover:text-white">Submit a topic</Link></li>
            <li><span className="hover:text-white cursor-pointer">Docs</span></li>
            <li><span className="hover:text-white cursor-pointer">Discord</span></li>
          </ul>
        </div>
        <div>
          <div className="text-white font-semibold mb-2">Stats</div>
          <ul className="space-y-1 text-[color:var(--muted)] text-xs mono">
            <li>Network · VYRAL devnet</li>
            <li>Quote · VYR</li>
            <li>Max leverage · 20×</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-[color:var(--border)] py-3 text-center text-[10px] text-[color:var(--muted)]">
        © {new Date().getFullYear()} VYRAL · For test / demo use only · Not financial advice
      </div>
    </footer>
  );
};

export default Footer;
