// src/components/MainWrapper.jsx
import Navbar from './Navbar'
import { Outlet } from 'react-router-dom'

const MainWrapper = () => {
  return (
    <div className="min-h-screen flex flex-col overflow-hidden">
      <Navbar />
      <main className="flex-grow">
        <Outlet />
      </main>
    </div>
  )
}

export default MainWrapper
