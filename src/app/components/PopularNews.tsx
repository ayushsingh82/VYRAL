import React from 'react'

const PopularNews = () => {
  const newsItems = [
    {
      id: 1,
      name: "OpenAI",
      image: "https://static01.nyt.com/images/2024/10/02/business/00openai-deal-hfo/00openai-deal-hfo-videoSixteenByNine3000-v2.jpg",
      volume: "$3.4K",
      gain: "+8.2%",
      isPositive: true
    },
    {
      id: 2,
      name: "S&P500",
      image: "https://themarketperiodical.com/wp-content/uploads/2025/08/1P4MteiiFbiYc8DJWk9z8CRPvzEXpwbpp-696x392.jpeg",
      volume: "$5.7K",
      gain: "+2.1%",
      isPositive: true
    },
    {
      id: 3,
      name: "Ondo",
      image: "https://media.architecturaldigest.com/photos/5da74823d599ec0008227ea8/master/pass/GettyImages-946087016.jpg",
      volume: "$1.8K",
      gain: "-1.5%",
      isPositive: false
    }
  ]

  return (
    <div className="mt-6">
      {/* Heading */}
      <h3 className="text-white text-md font-semibold mb-1">Popular News</h3>
      <p className="text-gray-300 text-xs mb-4">Trending news based on market activity</p>
      
      {/* Popular News Items Grid */}
      <div className="grid grid-cols-3 gap-4">
        {newsItems.map((item) => (
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

export default PopularNews
