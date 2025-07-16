import { BellIcon, UserCircleIcon, Bars3Icon } from '@heroicons/react/24/outline'

const Header = ({ toggleSidebar, isSidebarOpen }) => {
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
              Dashboard Admin
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
          <div className="flex items-center space-x-3">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium text-gray-700">Admin</p>
              <p className="text-xs text-gray-500">Administrator</p>
            </div>
            <div className="relative">
              <button className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors">
                <UserCircleIcon className="w-8 h-8 text-gray-400" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
