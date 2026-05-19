"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useWallet, shortAddr } from "../hooks/useWallet";

const CATEGORIES = ["Trending", "Pop Culture", "Sports", "Celebrities", "Pre-IPO", "RWA"];

type Proposal = {
  id: string;
  subject: string;
  category: string;
  reasoning: string;
  imageUrl?: string;
  proposer: string | null;
  createdAt: number;
  upvotes: string[]; // wallet addresses
};

const STORAGE_KEY = "vyral.proposals.v1";

function readProposals(): Proposal[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Proposal[]) : [];
  } catch {
    return [];
  }
}

function writeProposals(p: Proposal[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
}

export default function SubmitPage() {
  const { address, connect } = useWallet();
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [reasoning, setReasoning] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    setProposals(readProposals());
  }, []);

  function submit() {
    if (!subject.trim()) {
      setErr("Give it a name.");
      return;
    }
    if (subject.length > 64) {
      setErr("Name must be 64 characters or less.");
      return;
    }
    setErr(null);
    const next: Proposal = {
      id: Math.random().toString(36).slice(2),
      subject: subject.trim(),
      category,
      reasoning: reasoning.trim(),
      imageUrl: imageUrl.trim() || undefined,
      proposer: address ?? null,
      createdAt: Date.now(),
      upvotes: address ? [address] : [],
    };
    const updated = [next, ...proposals];
    setProposals(updated);
    writeProposals(updated);
    setSubject("");
    setReasoning("");
    setImageUrl("");
  }

  function upvote(id: string) {
    if (!address) return;
    const updated = proposals.map((p) => {
      if (p.id !== id) return p;
      const has = p.upvotes.includes(address);
      return { ...p, upvotes: has ? p.upvotes.filter((a) => a !== address) : [...p.upvotes, address] };
    });
    setProposals(updated);
    writeProposals(updated);
  }

  const sorted = [...proposals].sort((a, b) => b.upvotes.length - a.upvotes.length);

  return (
    <div className="max-w-[1400px] mx-auto px-5 py-8">
      <div className="mb-6">
        <h1 className="heading text-3xl md:text-5xl">Submit a viral topic</h1>
        <p className="text-xs text-[color:var(--muted)]">
          Propose what should become the next VYRAL market. Top voted proposals get listed.
        </p>
      </div>

      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 lg:col-span-5">
          <div className="card p-4 sticky top-20">
            <div className="text-sm font-bold mb-3">New proposal</div>
            <label className="block text-[10px] uppercase tracking-widest text-[color:var(--muted)] mb-1">Subject</label>
            <input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              maxLength={64}
              placeholder="e.g. Taylor Swift's next album"
              className="w-full px-3 py-2 bg-[color:var(--surface)] border border-[color:var(--border)]  text-white text-sm mb-3 focus:outline-none focus:border-[color:var(--border-strong)]"
            />

            <label className="block text-[10px] uppercase tracking-widest text-[color:var(--muted)] mb-1">Category</label>
            <div className="flex flex-wrap gap-2 mb-3">
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  onClick={() => setCategory(c)}
                  className={`chip ${category === c ? "is-active" : ""}`}
                >
                  {c}
                </button>
              ))}
            </div>

            <label className="block text-[10px] uppercase tracking-widest text-[color:var(--muted)] mb-1">Image URL <span className="opacity-60">(optional)</span></label>
            <input
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://…"
              className="w-full px-3 py-2 bg-[color:var(--surface)] border border-[color:var(--border)]  text-white text-xs mono mb-3 focus:outline-none focus:border-[color:var(--border-strong)]"
            />

            <label className="block text-[10px] uppercase tracking-widest text-[color:var(--muted)] mb-1">Why is this viral?</label>
            <textarea
              value={reasoning}
              onChange={(e) => setReasoning(e.target.value)}
              rows={4}
              placeholder="Make the case for this market. Headlines, traction, what makes it spike?"
              className="w-full px-3 py-2 bg-[color:var(--surface)] border border-[color:var(--border)]  text-white text-sm mb-3 focus:outline-none focus:border-[color:var(--border-strong)]"
            />

            {!address && (
              <button onClick={connect} className="w-full btn-ghost text-sm mb-2">
                Connect wallet to attribute proposal
              </button>
            )}
            <button onClick={submit} className="w-full btn-primary">
              Submit proposal
            </button>
            {err && <p className="text-[color:var(--red)] text-xs mt-2 mono">{err}</p>}
            <p className="text-[10px] text-[color:var(--muted)] mt-2">
              Proposals are stored locally and shown in the queue. Admins listing new markets pull from
              the top-voted entries.
            </p>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-7">
          <div className="card overflow-hidden">
            <div className="px-4 py-3 border-b border-[color:var(--border)] flex items-center justify-between">
              <div className="text-sm font-bold">Proposal queue</div>
              <div className="text-[10px] mono text-[color:var(--muted)]">{proposals.length} total</div>
            </div>
            {sorted.length === 0 ? (
              <div className="px-4 py-12 text-center text-sm text-[color:var(--muted)]">
                Nothing here yet — be the first to propose a market.
              </div>
            ) : (
              <ul>
                {sorted.map((p, i) => {
                  const mine = address && p.upvotes.includes(address);
                  return (
                    <li
                      key={p.id}
                      className="border-t border-[color:var(--border)] first:border-t-0 px-4 py-3 flex items-start gap-3 hover:bg-[color:var(--surface-2)]/40"
                    >
                      <span className="w-5 text-[11px] mono text-[color:var(--muted)] pt-1">#{i + 1}</span>
                      {p.imageUrl && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={p.imageUrl}
                          alt={p.subject}
                          className="w-10 h-10 object-cover flex-shrink-0"
                          onError={(e) => (e.currentTarget.style.display = "none")}
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-white font-semibold">{p.subject}</span>
                          <span className="text-[10px] mono px-1.5 py-0.5 border border-[color:var(--border)] text-[color:var(--muted)]">
                            {p.category}
                          </span>
                        </div>
                        {p.reasoning && (
                          <p className="text-xs text-[color:var(--muted)] mt-1 line-clamp-2">{p.reasoning}</p>
                        )}
                        <div className="text-[10px] mono text-[color:var(--muted)] mt-1">
                          by {p.proposer ? shortAddr(p.proposer) : "anon"} ·{" "}
                          {new Date(p.createdAt).toLocaleString()}
                        </div>
                      </div>
                      <button
                        onClick={() => upvote(p.id)}
                        disabled={!address}
                        title={address ? "Toggle upvote" : "Connect wallet to vote"}
                        className={`flex flex-col items-center justify-center px-3 py-2  border text-sm transition-colors ${
                          mine
                            ? "border-[color:var(--neon-dim)] text-[color:var(--neon)] bg-[color:var(--neon)]/5"
                            : "border-[color:var(--border)] text-[color:var(--muted)] hover:text-white"
                        }`}
                      >
                        <span className="text-[10px]">▲</span>
                        <span className="mono">{p.upvotes.length}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <div className="mt-4 text-xs text-[color:var(--muted)] flex items-center gap-2">
            <span>Already listed?</span>
            <Link href="/markets" className="text-[color:var(--neon)] hover:underline">See live markets →</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
