import React from 'react'
import CategorySelector from './CategorySelector'
import StreamingBox from './StreamingBox'
import MarketSentiment from './MarketSentiment'

const Landing = () => {
  return (
    <div className="bg-black p-4">
      {/* Category Selection Box */}
      <CategorySelector />

      {/* Main Content Area */}
      <div className="flex gap-6">
        <StreamingBox />
        <MarketSentiment />
      </div>
    </div>
  )
}

export default Landing