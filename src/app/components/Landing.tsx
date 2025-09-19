import React from 'react'
import StreamingBox from './StreamingBox'
import PopularBox from './PopularBox'

const Landing = () => {
  return (
    <div className="bg-black p-4">
      <StreamingBox />
      <PopularBox />
    </div>
  )
}

export default Landing