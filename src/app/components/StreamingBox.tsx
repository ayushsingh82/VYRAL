import React from 'react'

const StreamingBox = () => {
  return (
    <div className="w-2/3 bg-black border border-gray-800 rounded-lg overflow-hidden shadow-lg relative h-64">
      <h2 className="absolute top-3 left-3 text-white text-lg font-bold z-10 bg-black bg-opacity-70 px-3 py-1 rounded">
        Live Stream
      </h2>
      
      {/* Price/Stats overlay - Bottom Right */}
      <div className="absolute bottom-3 right-3 bg-black bg-opacity-50 px-3 py-2 rounded z-10">
        <div className="text-white text-xs flex items-center gap-4">
          <div className="text-center">
            <div className="text-gray-300">Price</div>
            <div className="font-bold">2.45 KAI</div>
          </div>
          <div className="w-px h-8 bg-gray-600"></div>
          <div className="text-center">
            <div className="text-gray-300">Open Interest</div>
            <div className="font-bold">10M</div>
          </div>
          <div className="w-px h-8 bg-gray-600"></div>
          <div className="text-center">
            <div className="text-gray-300">Volume</div>
            <div className="font-bold">$37.5K</div>
          </div>
        </div>
      </div>

      {/* Fighter/Leverage overlay - Bottom Left */}
      <div className="absolute bottom-3 left-3 bg-black bg-opacity-50 px-3 py-2 rounded z-10">
        <div className="text-white text-sm font-bold">
          Islam Makhachev <span className="text-orange-400">10x</span>
        </div>
      </div>
      
      <img 
        src="https://ca-times.brightspotcdn.com/dims4/default/32fcbe0/2147483647/strip/false/crop/6786x4500+0+0/resize/1486x985!/quality/75/?url=https%3A%2F%2Fcalifornia-times-brightspot.s3.amazonaws.com%2Fd7%2F2b%2Fcfa941e04a0781f1c14dde3bddb7%2Fhttps-delivery-gettyimages.com%2Fdownloads%2F2194651858"
        alt="MMA Fighting Content"
        className="w-full h-full object-cover"
      />
    </div>
  )
}

export default StreamingBox
