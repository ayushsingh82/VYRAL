import React from 'react'

const Landing = () => {
  const categories = [
    'Trending',
    'Top Gainers', 
    'Celebrities',
    'Pre-IPO',
    'RWA',
    'Sports',
    'Pop Culture'
  ]

  return (
    <div className="bg-black p-4">
      {/* Category Selection Box */}
      <div className="bg-black rounded-lg p-2 mb-4 shadow-lg">
        <div className="grid grid-cols-7 gap-2">
          {categories.map((category, index) => (
            <button
              key={index}
              className="bg-gray-800 hover:bg-gray-700 text-white px-2 py-2 rounded-md text-sm font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex gap-6">
        {/* Streaming Box - 2/3 width */}
        <div className="w-2/3 bg-black border border-gray-800 rounded-lg overflow-hidden shadow-lg relative h-64">
          <h2 className="absolute top-3 left-3 text-white text-lg font-bold z-10 bg-black bg-opacity-70 px-3 py-1 rounded">Live Stream</h2>
          <img 
            src="https://ca-times.brightspotcdn.com/dims4/default/32fcbe0/2147483647/strip/false/crop/6786x4500+0+0/resize/1486x985!/quality/75/?url=https%3A%2F%2Fcalifornia-times-brightspot.s3.amazonaws.com%2Fd7%2F2b%2Fcfa941e04a0781f1c14dde3bddb7%2Fhttps-delivery-gettyimages.com%2Fdownloads%2F2194651858"
            alt="MMA Fighting Content"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Market Sentiment Box - 1/3 width */}
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

          {/* Description */}
          <div className="text-gray-300 text-xs leading-relaxed">
            <p>Long or short Kai's popularity with up to 20x leverage. Profit if you're right, get liquidated if you're wrong.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Landing