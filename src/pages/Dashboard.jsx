import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import bgImage from '../assets/k.jpg'
import Swal from 'sweetalert2'

const Dashboard = () => {
  const navigate = useNavigate()

  const handleDownloadLaporan = async () => {
  const result = await Swal.fire({
    title: "Apakah Anda ingin mengunduh laporan?",
    text: "File akan diunduh dalam format Excel.",
    icon: "question",
    showCancelButton: true,
    confirmButtonText: "Ya, unduh",
    cancelButtonText: "Batal",
    buttonsStyling: false, 
    didOpen: () => {
      const confirmBtn = Swal.getConfirmButton();
      const cancelBtn = Swal.getCancelButton();

      confirmBtn.classList.add(
        "bg-blue-600",
        "text-white",
        "px-4",
        "py-2",
        "rounded",
        "hover:bg-blue-700"
      );

      cancelBtn.classList.add(
        "bg-gray-400",
        "text-white",
        "px-4",
        "py-2",
        "rounded",
        "hover:bg-gray-500"
      );
    }
  });

  if (!result.isConfirmed) return;

  try {
    const response = await fetch("http://127.0.0.1:5000/laporan/export/excel");
    if (!response.ok) throw new Error("Gagal mengunduh laporan.");

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "laporan.xlsx";
    a.click();
    window.URL.revokeObjectURL(url);

    Swal.fire({
      title: "Berhasil!",
      text: "Laporan berhasil diunduh.",
      icon: "success",
      confirmButtonText: "OK",
      buttonsStyling: false,
      didOpen: () => {
        Swal.getConfirmButton().classList.add(
          "bg-green-600",
          "text-white",
          "px-4",
          "py-2",
          "rounded",
          "hover:bg-green-700"
        );
      }
    });
  } catch (error) {
    Swal.fire({
      title: "Gagal",
      text: error.message,
      icon: "error",
      confirmButtonText: "OK",
      buttonsStyling: false,
      didOpen: () => {
        Swal.getConfirmButton().classList.add(
          "bg-red-600",
          "text-white",
          "px-4",
          "py-2",
          "rounded",
          "hover:bg-red-700"
        );
      }
    });
  }
}


  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Navbar />

      <div
        className="flex-1 bg-cover bg-center bg-no-repeat flex flex-col items-center justify-center px-4 py-6"
        style={{ backgroundImage: `url(${bgImage})` }}
      >

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 w-full max-w-4xl mb-6">
          {[
            { label: 'Produk', path: '/produk' },
            { label: 'Pelanggan', path: '/pelanggan' },
            { label: 'Pembayaran', path: '/pembayaran' },
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

        <div className="w-full max-w-md">
          <button
            onClick={handleDownloadLaporan}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white py-4 text-lg sm:text-xl rounded-lg transition font-semibold shadow"
          >
            Export Laporan
          </button>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
