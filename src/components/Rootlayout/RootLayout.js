import React from 'react'
import Navbar from '../Navbar/Navbar'
import {Outlet} from 'react-router-dom'
function RootLayout() {
  return (
    <div>
      <Navbar/>
      {/* Dynamic Content placeholder */}
      <Outlet/>
      
    </div>
  )
}

export default RootLayout
