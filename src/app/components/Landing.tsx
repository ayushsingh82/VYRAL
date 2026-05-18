"use client";

import React from "react";
import StreamingBox from "./StreamingBox";
import PopularBox from "./PopularBox";
import PopularNews from "./PopularNews";
import { addresses } from "../lib/addresses";

const Landing = () => {
  const featured = addresses.markets.find((m) => m.featured) ?? addresses.markets[0];
  // Buckets mirror the original UI: 3 "Popular Culture", 3 "Popular News".
  const rest = addresses.markets.filter((m) => m.address !== featured.address);
  const popular = rest.slice(0, 3);
  const news = rest.slice(3, 6);

  return (
    <div className="bg-black p-4">
      <StreamingBox featured={featured} />
      <PopularBox items={popular} />
      <PopularNews items={news} />
    </div>
  );
};

export default Landing;
