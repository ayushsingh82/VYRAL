"use client";

import React from "react";
import MarketTile from "./MarketTile";
import type { MarketSeed } from "../lib/addresses";

const PopularNews: React.FC<{ items: MarketSeed[] }> = ({ items }) => {
  return (
    <div className="mt-6">
      <h3 className="text-white text-md font-semibold mb-1">Popular News</h3>
      <p className="text-gray-300 text-xs mb-4">Trending news based on market activity</p>

      <div className="grid grid-cols-3 gap-4">
        {items.map((item) => (
          <MarketTile key={item.address} item={item} />
        ))}
      </div>
    </div>
  );
};

export default PopularNews;
