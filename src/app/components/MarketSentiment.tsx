import React from 'react'

const MarketSentiment = () => {
  return (
    <div className="w-1/3 bg-black border border-gray-800 rounded-lg p-4 shadow-lg">
      <h2 className="text-white text-lg font-bold mb-3">Market Sentiment</h2>
      
      {/* Longs Section - All in one line */}
      <div className="mb-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-green-400 font-semibold text-sm">Longs</span>
            <span className="text-green-400 font-bold text-sm">68.72%</span>
          </div>
          <div className="text-white">
            <span className="text-sm font-bold">14,617.8</span>
            <span className="text-gray-400 ml-1 text-xs">KAI</span>
          </div>
        </div>
      </div>

      {/* Shorts Section - All in one line */}
      <div className="mb-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-red-400 font-semibold text-sm">Shorts</span>
            <span className="text-red-400 font-bold text-sm">31.28%</span>
          </div>
          <div className="text-white">
            <span className="text-sm font-bold">15,386.2</span>
            <span className="text-gray-400 ml-1 text-xs">KAI</span>
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="text-gray-300 text-xs leading-relaxed mb-2">
        <p>Long or short Kai's popularity with up to 20x leverage. Profit if you're right, get liquidated if you're wrong.</p>
      </div>

      {/* Small Heartbeat Chart */}
      <div className="mb-3">
        <div className="flex items-end justify-center h-8 gap-0.5">
          <div className="w-0.5 bg-green-500 h-2"></div>
          <div className="w-0.5 bg-green-500 h-4"></div>
          <div className="w-0.5 bg-green-500 h-1"></div>
          <div className="w-0.5 bg-green-500 h-6"></div>
          <div className="w-0.5 bg-green-500 h-3"></div>
          <div className="w-0.5 bg-green-500 h-7"></div>
          <div className="w-0.5 bg-green-500 h-2"></div>
          <div className="w-0.5 bg-green-500 h-5"></div>
          <div className="w-0.5 bg-green-500 h-1"></div>
          <div className="w-0.5 bg-green-500 h-4"></div>
          <div className="w-0.5 bg-green-500 h-6"></div>
          <div className="w-0.5 bg-green-500 h-2"></div>
          <div className="w-0.5 bg-red-500 h-3"></div>
          <div className="w-0.5 bg-red-500 h-7"></div>
          <div className="w-0.5 bg-red-500 h-1"></div>
          <div className="w-0.5 bg-red-500 h-5"></div>
          <div className="w-0.5 bg-red-500 h-3"></div>
          <div className="w-0.5 bg-red-500 h-6"></div>
          <div className="w-0.5 bg-red-500 h-2"></div>
          <div className="w-0.5 bg-red-500 h-4"></div>
          <div className="w-0.5 bg-red-500 h-1"></div>
          <div className="w-0.5 bg-red-500 h-5"></div>
          <div className="w-0.5 bg-red-500 h-3"></div>
          <div className="w-0.5 bg-red-500 h-2"></div>
        </div>
      </div>

      {/* Visual Bar */}
      <div className="mb-3">
        <div className="flex h-2 rounded-full overflow-hidden">
          <div className="bg-green-500 w-[68.72%]"></div>
          <div className="bg-red-500 w-[31.28%]"></div>
        </div>
      </div>
    </div>
  )
}

export default MarketSentiment
