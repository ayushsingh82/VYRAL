// Deterministic synthetic time-series for UI charts. We don't have onchain
// history yet, so we generate a plausible random walk seeded by the market
// address — same address always renders the same chart, and the walk lands
// near the current mark price.

function hashSeed(s: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h >>> 0;
}

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export type PricePoint = { t: number; price: number; volume: number };

export function buildPriceSeries(
  marketAddress: string,
  initialPrice: number,
  markPrice: number,
  points = 72
): PricePoint[] {
  const rand = mulberry32(hashSeed(marketAddress));
  const series: PricePoint[] = [];
  // Walk from initialPrice toward markPrice with noise.
  const drift = (markPrice - initialPrice) / Math.max(1, points - 1);
  let price = initialPrice;
  const baseVol = initialPrice * 800;
  for (let i = 0; i < points; i++) {
    const noise = (rand() - 0.5) * initialPrice * 0.08;
    price = Math.max(0.01, price + drift + noise);
    const volume = Math.max(0, baseVol + (rand() - 0.3) * baseVol * 1.6);
    series.push({ t: i, price: Number(price.toFixed(4)), volume: Math.round(volume) });
  }
  // Pin the last point exactly to markPrice for visual continuity.
  if (series.length > 0) series[series.length - 1].price = Number(markPrice.toFixed(4));
  return series;
}

export function pct24h(series: PricePoint[]): number {
  if (series.length < 2) return 0;
  const a = series[Math.max(0, series.length - 24)].price;
  const b = series[series.length - 1].price;
  if (a === 0) return 0;
  return ((b - a) / a) * 100;
}

export const CATEGORY_META: Record<string, { color: string; emoji: string }> = {
  Trending: { color: "var(--gold)", emoji: "🔥" },
  "Top Gainers": { color: "var(--neon)", emoji: "📈" },
  Celebrities: { color: "var(--violet)", emoji: "⭐" },
  "Pre-IPO": { color: "var(--cyan)", emoji: "🚀" },
  RWA: { color: "var(--gold)", emoji: "🏦" },
  Sports: { color: "var(--red)", emoji: "🥊" },
  "Pop Culture": { color: "var(--violet)", emoji: "🎬" },
};
