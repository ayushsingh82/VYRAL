import React from 'react'

const CategorySelector = () => {
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
  )
}

export default CategorySelector
