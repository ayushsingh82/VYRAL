"use client";

import React, { useState } from "react";
import { useMarket } from "../hooks/useMarket";
import { useWallet } from "../hooks/useWallet";
import { fmtVyr, fmtPct, fmtPrice } from "../lib/markets";
import OpenPositionModal from "./OpenPositionModal";
import type { MarketSeed } from "../lib/addresses";

const CATEGORIES = [
  "Trending",
  "Top Gainers",
  "Celebrities",
  "Pre-IPO",
  "RWA",
  "Sports",
  "Pop Culture",
];

type Props = { featured: MarketSeed };

const StreamingBox: React.FC<Props> = ({ featured }) => {
  const { address } = useWallet();
  const { snapshot, position, refresh } = useMarket(
    featured.address as `0x${string}`,
    address
  );
  const [modal, setModal] = useState(false);

  const longPct = snapshot ? fmtPct(snapshot.longPctBps) : "—";
  const shortPct = snapshot ? fmtPct(snapshot.shortPctBps) : "—";
  const longVyr = snapshot ? fmtVyr(snapshot.longOI) : "—";
  const shortVyr = snapshot ? fmtVyr(snapshot.shortOI) : "—";
  const longBar = snapshot ? Number(snapshot.longPctBps) / 100 : 50;

  return (
    <div>
      <div className="bg-black rounded-lg p-2 mb-4 shadow-lg">
        <div className="grid grid-cols-7 gap-2">
          {CATEGORIES.map((category, index) => (
            <button
              key={index}
              className="bg-gray-800 hover:bg-gray-700 text-white px-2 py-2 rounded-md text-sm font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-6">
        <div
          className="w-2/3 bg-black border border-gray-800 rounded-lg overflow-hidden shadow-lg relative h-64 cursor-pointer"
          onClick={() => setModal(true)}
        >
          <h2 className="absolute top-3 left-3 text-white text-lg font-bold z-10 bg-black bg-opacity-70 px-3 py-1 rounded">
            Live Stream
          </h2>

          <div className="absolute bottom-3 right-3 bg-black bg-opacity-50 px-3 py-2 rounded z-10">
            <div className="text-white text-xs flex items-center gap-4">
              <div className="text-center">
                <div className="text-gray-300">Price</div>
                <div className="font-bold">
                  {snapshot ? fmtPrice(snapshot.markPrice) : "—"} VYR
                </div>
              </div>
              <div className="w-px h-8 bg-gray-600"></div>
              <div className="text-center">
                <div className="text-gray-300">Open Interest</div>
                <div className="font-bold">
                  {snapshot ? fmtVyr(snapshot.longOI + snapshot.shortOI) : "—"}
                </div>
              </div>
              <div className="w-px h-8 bg-gray-600"></div>
              <div className="text-center">
                <div className="text-gray-300">Volume</div>
                <div className="font-bold">
                  {snapshot ? fmtVyr(snapshot.volumeAccum) : "—"}
                </div>
              </div>
            </div>
          </div>

          <div className="absolute bottom-3 left-3 bg-black bg-opacity-50 px-3 py-2 rounded z-10">
            <div className="text-white text-sm font-bold">
              {featured.subject} <span className="text-orange-400">10x</span>
            </div>
          </div>

          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={featured.imageUrl}
            alt={featured.subject}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="w-1/3 bg-black border border-gray-800 rounded-lg p-4 shadow-lg">
          <h2 className="text-white text-lg font-bold mb-3">Market Sentiment</h2>

          <div className="mb-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="text-green-400 font-semibold text-sm">Longs</span>
                <span className="text-green-400 font-bold text-sm">{longPct}</span>
              </div>
              <div className="text-white">
                <span className="text-sm font-bold">{longVyr}</span>
                <span className="text-gray-400 ml-1 text-xs">VYR</span>
              </div>
            </div>
          </div>

          <div className="mb-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="text-red-400 font-semibold text-sm">Shorts</span>
                <span className="text-red-400 font-bold text-sm">{shortPct}</span>
              </div>
              <div className="text-white">
                <span className="text-sm font-bold">{shortVyr}</span>
                <span className="text-gray-400 ml-1 text-xs">VYR</span>
              </div>
            </div>
          </div>

          <div className="text-gray-300 text-xs leading-relaxed mb-2">
            <p>
              Long or short {featured.subject}&apos;s popularity with up to 20x leverage.
              Profit if you&apos;re right, get liquidated if you&apos;re wrong.
            </p>
          </div>

          <div className="mb-3">
            <div className="flex items-end justify-center h-8 gap-0.5">
              {[2, 4, 1, 6, 3, 7, 2, 5, 1, 4, 6, 2].map((h, i) => (
                <div key={`g${i}`} className="w-0.5 bg-green-500" style={{ height: `${h * 4}px` }} />
              ))}
              {[3, 7, 1, 5, 3, 6, 2, 4, 1, 5, 3, 2].map((h, i) => (
                <div key={`r${i}`} className="w-0.5 bg-red-500" style={{ height: `${h * 4}px` }} />
              ))}
            </div>
          </div>

          <div className="mb-3">
            <div className="flex h-2 rounded-full overflow-hidden">
              <div className="bg-green-500" style={{ width: `${longBar}%` }} />
              <div className="bg-red-500" style={{ width: `${100 - longBar}%` }} />
            </div>
          </div>

          <button
            onClick={() => setModal(true)}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md text-sm font-bold"
          >
            {position?.open ? "Manage position" : "Open position"}
          </button>
        </div>
      </div>

      <OpenPositionModal
        open={modal}
        onClose={() => setModal(false)}
        marketAddress={featured.address as `0x${string}`}
        subject={featured.subject}
        account={address}
        position={position}
        onActionDone={refresh}
      />
    </div>
  );
};

export default StreamingBox;
