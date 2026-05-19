"use client";

import React from "react";
import { Area, AreaChart, ResponsiveContainer } from "recharts";
import { buildPriceSeries } from "../lib/synthetic";

type Props = {
  marketAddress: string;
  initialPrice: number;
  markPrice: number;
  positive?: boolean;
  height?: number;
};

const Sparkline: React.FC<Props> = ({
  marketAddress,
  initialPrice,
  markPrice,
  positive = true,
  height = 60,
}) => {
  const data = buildPriceSeries(marketAddress, initialPrice, markPrice, 48);
  const color = positive ? "#b388ff" : "#ff4d5e";
  const gradId = `spark-${marketAddress}`;
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.4} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area
          type="monotone"
          dataKey="price"
          stroke={color}
          strokeWidth={1.5}
          fill={`url(#${gradId})`}
          isAnimationActive={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};

export default Sparkline;
