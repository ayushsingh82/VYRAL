"use client";

import React, { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { buildPriceSeries } from "../lib/synthetic";

const RANGES = [
  { id: "1H", points: 24 },
  { id: "1D", points: 48 },
  { id: "1W", points: 96 },
  { id: "1M", points: 160 },
] as const;

type RangeId = (typeof RANGES)[number]["id"];

type Props = {
  marketAddress: string;
  initialPrice: number;
  markPrice: number;
  positive: boolean;
};

const PriceChart: React.FC<Props> = ({ marketAddress, initialPrice, markPrice, positive }) => {
  const [range, setRange] = useState<RangeId>("1D");
  const config = RANGES.find((r) => r.id === range)!;
  const data = useMemo(
    () => buildPriceSeries(marketAddress, initialPrice, markPrice, config.points),
    [marketAddress, initialPrice, markPrice, config.points]
  );
  const color = positive ? "#b388ff" : "#ff4d5e";
  const gradId = `chart-${marketAddress}`;

  return (
    <div className="card overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-[color:var(--border)]">
        <div>
          <div className="text-xs text-[color:var(--muted)] uppercase tracking-widest">Price</div>
          <div className="flex items-baseline gap-3">
            <div className="mono text-2xl text-white">{markPrice.toFixed(4)}</div>
            <div className="text-xs text-[color:var(--muted)] mono">VYR</div>
            <div className={`mono text-sm ${positive ? "text-[color:var(--neon)]" : "text-[color:var(--red)]"}`}>
              {positive ? "+" : ""}
              {(((markPrice - initialPrice) / Math.max(initialPrice, 0.0001)) * 100).toFixed(2)}%
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1 bg-[color:var(--surface-2)]  p-1">
          {RANGES.map((r) => (
            <button
              key={r.id}
              onClick={() => setRange(r.id)}
              className={`px-2.5 py-1 text-[11px] mono transition-colors ${
                range === r.id ? "bg-[color:var(--surface)] text-white" : "text-[color:var(--muted)] hover:text-white"
              }`}
            >
              {r.id}
            </button>
          ))}
        </div>
      </div>

      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={0.35} />
                <stop offset="100%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#1f2632" strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="t" hide />
            <YAxis
              dataKey="price"
              domain={["auto", "auto"]}
              orientation="right"
              tick={{ fill: "#8a93a3", fontSize: 11, fontFamily: "var(--font-geist-mono)" }}
              axisLine={false}
              tickLine={false}
              width={56}
            />
            <Tooltip
              cursor={{ stroke: "#2a3242" }}
              contentStyle={{
                background: "#0d1015",
                border: "1px solid #1f2632",
                borderRadius: 0,
                fontSize: 12,
                fontFamily: "var(--font-geist-mono)",
              }}
              labelStyle={{ color: "#8a93a3" }}
              itemStyle={{ color: "#e8ecf1" }}
              formatter={(v) => [`${Number(v).toFixed(4)} VYR`, "Price"]}
            />
            <Area type="monotone" dataKey="price" stroke={color} strokeWidth={2} fill={`url(#${gradId})`} isAnimationActive={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="px-4 pt-2 pb-3 border-t border-[color:var(--border)]">
        <div className="text-[10px] uppercase tracking-widest text-[color:var(--muted)] mb-1">Volume</div>
        <div className="h-16">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 0, right: 16, left: 0, bottom: 0 }}>
              <Bar dataKey="volume" fill={color} fillOpacity={0.45} isAnimationActive={false} />
              <XAxis dataKey="t" hide />
              <YAxis hide />
              <Tooltip
                cursor={{ fill: "rgba(255,255,255,0.04)" }}
                contentStyle={{
                  background: "#0d1015",
                  border: "1px solid #1f2632",
                  borderRadius: 0,
                  fontSize: 12,
                  fontFamily: "var(--font-geist-mono)",
                }}
                formatter={(v) => [Number(v).toLocaleString(), "Vol"]}
                labelFormatter={() => ""}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default PriceChart;
