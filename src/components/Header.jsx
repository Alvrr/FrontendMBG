import { BellIcon, UserCircleIcon, Bars3Icon, ChevronDownIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline'
import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { decodeJWT } from '../utils/jwtDecode'
import { logoutService } from '../services/authAPI'
import Swal from 'sweetalert2'

const Header = ({ toggleSidebar, isSidebarOpen }) => {
  const [userRole, setUserRole] = useState('')
  const [userName, setUserName] = useState('')
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const navigate = useNavigate()
  const dropdownRef = useRef(null)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const decoded = decodeJWT(token)
    setUserRole(decoded?.role || '')
    setUserName(decoded?.username || decoded?.name || '')
  }, [])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // Function untuk mendapatkan title berdasarkan role
  const getDashboardTitle = () => {
    switch (userRole) {
      case 'admin':
        return 'Dashboard Admin'
      case 'driver':
        return 'Dashboard Driver'
      case 'kasir':
        return 'Dashboard Kasir'
      default:
        return 'Dashboard'
    }
  }

  // Function untuk mendapatkan role display name
  const getRoleDisplayName = () => {
    switch (userRole) {
      case 'admin':
        return 'Administrator'
      case 'driver':
        return 'Driver'
      case 'kasir':
        return 'Kasir'
      default:
        return 'User'
    }
  }

  // Function untuk mendapatkan user display name
  const getUserDisplayName = () => {
    switch (userRole) {
      case 'admin':
        return 'Admin'
      case 'driver':
        return userName || 'Driver'
      case 'kasir':
        return userName || 'Kasir'
      default:
        return userName || 'User'
    }
  }

  // Handle logout
  const handleLogout = async () => {
    try {
      const result = await Swal.fire({
        title: 'Konfirmasi Logout',
        text: 'Apakah Anda yakin ingin keluar?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Ya, Logout',
        cancelButtonText: 'Batal'
      })

      if (result.isConfirmed) {
        logoutService()
        await Swal.fire({
          icon: 'success',
          title: 'Logout berhasil',
          text: 'Anda telah berhasil keluar',
          timer: 1500,
          showConfirmButton: false
        })
        navigate('/login')
      }
    } catch {
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Terjadi kesalahan saat logout'
      })
    }
  }

  return (
    <header className={`fixed top-0 bg-white shadow-sm border-b border-gray-200 h-16 z-30 transition-all duration-300 ${
      isSidebarOpen ? 'left-64' : 'left-20'
    } right-0`}>
      <div className="flex items-center justify-between h-full px-6">
        {/* Left side - Menu toggle */}
        <div className="flex items-center space-x-4">
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
          >
            <Bars3Icon className="w-6 h-6" />
          </button>
          
          <div className="hidden md:block">
            <h1 className="text-lg font-semibold text-gray-800">
              {getDashboardTitle()}
            </h1>
          </div>
        </div>

        {/* Right side - Notifications and User */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <button className="relative p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 rounded-lg transition-colors">
            <BellIcon className="w-6 h-6" />
            <span className="absolute top-1 right-1 w-3 h-3 bg-red-500 rounded-full"></span>
          </button>

          {/* User Menu */}
          <div className="flex items-center space-x-3" ref={dropdownRef}>
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium text-gray-700">{getUserDisplayName()}</p>
              <p className="text-xs text-gray-500">{getRoleDisplayName()}</p>
            </div>
            <div className="relative">
              <button 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <UserCircleIcon className="w-8 h-8 text-gray-400" />
                <ChevronDownIcon className={`w-4 h-4 text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-50">
                  <div className="py-1">
                    {/* Profile Info dalam dropdown (untuk mobile) */}
                    <div className="px-4 py-2 border-b border-gray-200 sm:hidden">
                      <p className="text-sm font-medium text-gray-700">{getUserDisplayName()}</p>
                      <p className="text-xs text-gray-500">{getRoleDisplayName()}</p>
                    </div>
                    
                    {/* Logout Button */}
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                    >
                      <ArrowRightOnRectangleIcon className="w-4 h-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
