import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import bgImage from '../assets/k.jpg'

const Dashboard = () => {
  const navigate = useNavigate()

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Navbar />

      <div
        className="flex-1 bg-cover bg-center bg-no-repeat flex flex-col items-center justify-center px-4 py-6"
        style={{ backgroundImage: `url(${bgImage})` }}
      >

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 w-full max-w-5xl mb-6">
          {[
            { label: 'Produk', path: '/produk' },
            { label: 'Pelanggan', path: '/pelanggan' },
            { label: 'Pembayaran', path: '/pembayaran' },
            { label: 'Riwayat', path: '/riwayat' },
          ].map(({ label, path }) => (
            <button
              key={label}
              onClick={() => navigate(path)}
              className="bg-yellow-300 text-black py-5 text-lg sm:text-xl rounded-lg hover:bg-yellow-200 transition font-semibold shadow"
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Dashboard
