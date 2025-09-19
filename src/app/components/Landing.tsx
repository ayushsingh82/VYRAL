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
    <div className="min-h-screen bg-gray-900 p-6">
      {/* Category Selection Box */}
      <div className="bg-gray-800 rounded-lg p-4 mb-6 shadow-lg">
        <div className="grid grid-cols-7 gap-2">
          {categories.map((category, index) => (
            <button
              key={index}
              className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex gap-6">
        {/* Streaming Box - 2/3 width */}
        <div className="w-2/3 bg-gray-800 rounded-lg p-6 shadow-lg">
          <h2 className="text-white text-xl font-bold mb-4">Live Stream</h2>
          <div className="bg-gray-900 rounded-lg h-96 flex items-center justify-center">
            <p className="text-gray-400 text-lg">Streaming Content Area</p>
          </div>
        </div>

        {/* Market Sentiment Box - 1/3 width */}
        <div className="w-1/3 bg-gray-800 rounded-lg p-6 shadow-lg">
          <h2 className="text-white text-xl font-bold mb-4">Market Sentiment</h2>
          
          {/* Longs Section */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-green-400 font-semibold">Longs</span>
              <span className="text-green-400 font-bold">68.72%</span>
            </div>
            <div className="text-white">
              <span className="text-2xl font-bold">14,617.8</span>
              <span className="text-gray-400 ml-2">KAI</span>
            </div>
          </div>

          {/* Shorts Section */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-red-400 font-semibold">Shorts</span>
              <span className="text-red-400 font-bold">31.28%</span>
            </div>
            <div className="text-white">
              <span className="text-2xl font-bold">15,386.2</span>
              <span className="text-gray-400 ml-2">KAI</span>
            </div>
          </div>

          {/* Visual Bar */}
          <div className="mb-4">
            <div className="flex h-3 rounded-full overflow-hidden">
              <div className="bg-green-500 w-[68.72%]"></div>
              <div className="bg-red-500 w-[31.28%]"></div>
            </div>
          </div>

          {/* Description */}
          <div className="text-gray-300 text-sm leading-relaxed">
            <p>Long or short Kai's popularity with up to 20x leverage. Profit if you're right, get liquidated if you're wrong.</p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 mt-4">
            <button className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md font-medium transition-colors">
              Long
            </button>
            <button className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-md font-medium transition-colors">
              Short
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Landing
