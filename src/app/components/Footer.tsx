import React from 'react'

const Footer = () => {
  const footerItems = [
    {
      id: 1,
      name: "Table",
      emoji: "📊",
      color: "text-blue-400"
    },
    {
      id: 2,
      name: "Tracker",
      emoji: "📈",
      color: "text-green-400"
    },
    {
      id: 3,
      name: "P1",
      emoji: "🎯",
      color: "text-purple-400"
    },
    {
      id: 4,
      name: "Instant Trade",
      emoji: "⚡",
      color: "text-orange-400"
    }
  ]

  return (
    <footer className="bg-black border-t border-gray-800 h-12 flex items-center px-6">
      <div className="flex items-center gap-6">
        {footerItems.map((item) => (
          <div key={item.id} className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
            <span className="text-lg">{item.emoji}</span>
            <span className={`text-sm font-medium ${item.color}`}>
              {item.name}
            </span>
          </div>
        ))}
      </div>
    </footer>
  )
}

export default Footer
