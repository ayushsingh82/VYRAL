import React from 'react'

const Navbar = () => {
  return (
    <nav className="bg-black h-10 flex items-center justify-between px-6 shadow-md border-b border-gray-400">
      {/* Left side - HEAT logo/name and search bar close together */}
      <div className="flex items-center gap-4">
        <h1 className="text-white text-xl font-bold">HEAT</h1>
        {/* Search bar moved close to HEAT name */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search tokens..."
            className="w-full px-3 py-1 bg-gray-800 text-white placeholder-gray-400 rounded-md focus:outline-none  focus:bg-gray-700 transition-colors text-sm"
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-2">
            <svg
              className="w-3 h-3 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Right side - Connect Wallet button */}
      <div className="flex items-center">
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-black text-sm">
          Connect Wallet
        </button>
      </div>
    </nav>
  )
}

export default Navbar