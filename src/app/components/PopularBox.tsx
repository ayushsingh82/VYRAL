"use client";

import React from "react";
import MarketTile from "./MarketTile";
import type { MarketSeed } from "../lib/addresses";

const PopularBox: React.FC<{ items: MarketSeed[] }> = ({ items }) => {
  return (
    <div className="mt-6">
      <h3 className="text-white text-md font-semibold mb-1">Popular Culture Collection</h3>
      <p className="text-gray-300 text-xs mb-4">Popularity based on volume and gain/loss</p>

      <div className="grid grid-cols-3 gap-4">
        {items.map((item) => (
          <MarketTile key={item.address} item={item} />
        ))}
      </div>
    </div>
  );
};

export default PopularBox;
