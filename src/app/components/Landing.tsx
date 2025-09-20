import React from 'react'
import StreamingBox from './StreamingBox'
import PopularBox from './PopularBox'
import PopularNews from './PopularNews'

const Landing = () => {
  return (
    <div className="bg-black p-4">
      <StreamingBox />
      <PopularBox />
      <PopularNews />
    </div>
  )
}

export default Landing