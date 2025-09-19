import React from 'react'

const PopularBox = () => {
  const popularItems = [
    {
      id: 1,
      name: "Mr Beast",
      image: "https://static-www.adweek.com/wp-content/uploads/2025/01/mr-beast-buy-tiktok-2025.jpg?w=1200",
      volume: "$1.25K",
      gain: "+6%",
      isPositive: true
    },
    {
      id: 2,
      name: "Pokemon Go",
      image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSHnvg_o69CX26f-mHQ808Uf1Q6PHIxrgQ0Bg&s",
      volume: "$892",
      gain: "-0.25%",
      isPositive: false
    },
    {
      id: 3,
      name: "Tariff",
      image: "https://www.hindustantimes.com/ht-img/img/2025/09/19/550x309/USA-TRUMP-BRITAIN-5_1758247334681_1758247371957.JPG",
      volume: "$2.1K",
      gain: "+3.8%",
      isPositive: true
    }
  ]

  return (
    <div className="mt-6">
      {/* Heading */}
      <h3 className="text-white text-md font-semibold mb-1">Popular Culture Collection</h3>
      <p className="text-gray-300 text-xs mb-4">Popularity based on volume and gain/loss</p>
      
      {/* Popular Items Grid */}
      <div className="grid grid-cols-3 gap-4">
        {popularItems.map((item) => (
          <div key={item.id} className="bg-black border border-gray-800 rounded-lg overflow-hidden shadow-lg relative h-40">
            {/* Volume and Gain/Loss overlay - Top Right (same line) */}
            <div className="absolute top-2 right-2 bg-black bg-opacity-70 px-2 py-1 rounded z-10">
              <div className="text-white text-xs flex items-center gap-2">
                <span className="font-bold">{item.volume}</span>
                <span className={`font-bold ${item.isPositive ? 'text-green-400' : 'text-red-400'}`}>
                  {item.gain}
                </span>
              </div>
            </div>

            {/* Name overlay - Bottom Left */}
            <div className="absolute bottom-2 left-2 bg-black bg-opacity-70 px-2 py-1 rounded z-10">
              <div className="text-white text-xs font-bold">
                {item.name} <span className="text-orange-400">10x</span>
              </div>
            </div>
            
            {/* Image */}
            <img 
              src={item.image}
              alt={item.name}
              className="w-full h-full object-cover"
            />
          </div>
        ))}
      </div>
    </div>
  )
}

export default PopularBox
