"use client";

import React, { useState } from "react";
import { parseUnits } from "viem";
import { useMarket } from "../hooks/useMarket";
import { useWallet } from "../hooks/useWallet";
import { fmtKai } from "../lib/markets";
import OpenPositionModal from "./OpenPositionModal";
import type { MarketSeed } from "../lib/addresses";

const MarketTile: React.FC<{ item: MarketSeed }> = ({ item }) => {
  const { address } = useWallet();
  const { snapshot, position, refresh } = useMarket(
    item.address as `0x${string}`,
    address
  );
  const [open, setOpen] = useState(false);

  let gainPct = 0;
  if (snapshot) {
    const initial = Number(item.initialPrice);
    const mark = Number(snapshot.markPrice) / 1e18;
    if (initial > 0) gainPct = ((mark - initial) / initial) * 100;
  }
  const isPositive = gainPct >= 0;
  const volume = snapshot ? `${fmtKai(snapshot.volumeAccum)} KAI` : "—";

  // Avoid unused import warning — used in fmtKai but referenced for parseUnits in modal flow.
  void parseUnits;

  return (
    <>
      <div
        onClick={() => setOpen(true)}
        className="bg-black border border-gray-800 rounded-lg overflow-hidden shadow-lg relative h-40 cursor-pointer hover:border-gray-700 transition-colors"
      >
        <div className="absolute top-2 right-2 bg-black bg-opacity-70 px-2 py-1 rounded z-10">
          <div className="text-white text-xs flex items-center gap-2">
            <span className="font-bold">{volume}</span>
            <span
              className={`font-bold ${isPositive ? "text-green-400" : "text-red-400"}`}
            >
              {isPositive ? "+" : ""}
              {gainPct.toFixed(2)}%
            </span>
          </div>
        </div>

        <div className="absolute bottom-2 left-2 bg-black bg-opacity-70 px-2 py-1 rounded z-10">
          <div className="text-white text-xs font-bold">
            {item.subject} <span className="text-orange-400">10x</span>
          </div>
        </div>

        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={item.imageUrl} alt={item.subject} className="w-full h-full object-cover" />
      </div>

      <OpenPositionModal
        open={open}
        onClose={() => setOpen(false)}
        marketAddress={item.address as `0x${string}`}
        subject={item.subject}
        account={address}
        position={position}
        onActionDone={refresh}
      />
    </>
  );
};

export default MarketTile;
