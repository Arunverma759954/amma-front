import Link from "next/link";
import Image from "next/image";
import { FaFacebookF, FaInstagram, FaPhoneAlt, FaEnvelope, FaLock, FaWallet, FaChevronDown, FaSync } from "react-icons/fa";

export default function Header() {
  return (
    <header className="w-full font-sans">
      {/* Top Strip - Features */}
      <div className="bg-[#002166] text-white py-2 px-4 border-b border-white/5">
        <div className="max-w-6xl mx-auto flex justify-between items-center text-[10px] md:text-[11px] font-medium tracking-wide">
          <div className="flex items-center gap-2">
            <FaSync className="text-yellow-400 text-sm" />
            <span>Global Links: 🇦🇺 🇳🇿</span>
          </div>
          <div className="flex items-center gap-2">
            <FaLock className="text-yellow-400 text-sm" />
            <span>Fare Lock</span>
          </div>
          <div className="flex items-center gap-2">
            <FaSync className="text-yellow-400 text-sm" />
            <span>Free Exchange</span>
          </div>
          <div className="flex items-center gap-2">
            <FaWallet className="text-yellow-400 text-sm" />
            <span>Book Now - Pay Later!</span>
          </div>
        </div>
      </div>

      {/* Contact Bar */}
      <div className="bg-[#00308F] text-white py-2 px-4 shadow-inner">
        <div className="max-w-6xl mx-auto flex justify-center items-center relative text-[11px] md:text-[13px]">
          <div className="flex items-center gap-6 md:gap-12">
            <a href="mailto:info@hifitravels.com.au" className="flex items-center gap-2 hover:text-white/80 transition-colors">
              <FaEnvelope className="text-white text-xs" />
              <span>info@hifitravels.com.au</span>
            </a>
            <a href="tel:+61872285253" className="flex items-center gap-2 hover:text-white/80 transition-colors">
              <FaPhoneAlt className="text-white text-xs" />
              <span className="font-semibold uppercase tracking-wider">ADL: +61 8 7228 5253</span>
            </a>
          </div>

          <div className="absolute right-0 hidden md:flex items-center gap-4">
            <a href="#" className="hover:text-white/70 transition-colors cursor-pointer"><FaFacebookF /></a>
            <a href="#" className="hover:text-white/70 transition-colors cursor-pointer"><FaInstagram /></a>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="bg-white px-4 shadow-md border-b border-gray-100">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center">
          {/* Logo */}
          <div className="py-2 md:py-3 flex items-center">
            <Link href="/" className="flex flex-col items-center md:items-start">
              <div className="relative w-48 h-16">
                <Image
                  src="/logo.png"
                  alt="HiFi Travels"
                  fill
                  className="object-contain object-left"
                  priority
                />
              </div>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex flex-wrap justify-center items-center gap-1 md:gap-4 font-bold text-[15px] tracking-wide">
            <Link href="/" className="bg-[#C41E22] text-white px-6 py-4 hover:bg-red-700 transition-colors">
              Home
            </Link>
            <Link href="/about" className="px-3 py-4 text-[#00308F] hover:bg-[#C41E22] hover:text-white transition-colors duration-300">
              About Us
            </Link>
            <Link href="/deals" className="px-3 py-4 text-[#00308F] hover:bg-[#C41E22] hover:text-white transition-colors duration-300">
              Deals & Promotions
            </Link>
            <Link href="/holidays" className="px-3 py-4 text-[#00308F] hover:bg-[#C41E22] hover:text-white transition-colors duration-300">
              Holidays
            </Link>
            <div className="relative group">
              <button className="px-3 py-4 text-[#00308F] hover:bg-[#C41E22] hover:text-white transition-colors duration-300 flex items-center gap-1 cursor-pointer">
                Special Offers <FaChevronDown size={10} />
              </button>
              {/* Dropdown Menu */}
              <div className="absolute top-full left-0 w-64 bg-white shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-[1100] border-t-2 border-[#C41E22]">
                <Link href="/group-travel" className="block px-6 py-4 text-[#00308F] hover:bg-gray-50 hover:text-red-600 font-bold transition-colors border-b border-gray-100">
                  Group Travel
                </Link>
                <Link href="/senior-travel" className="block px-6 py-4 text-[#00308F] hover:bg-gray-50 hover:text-red-600 font-bold transition-colors border-b border-gray-100">
                  Senior Travel
                </Link>
                <Link href="/student-travel" className="block px-6 py-4 text-[#00308F] hover:bg-gray-50 hover:text-red-600 font-bold transition-colors border-b border-gray-100">
                  Student Travel
                </Link>
                <Link href="/last-minute" className="block px-6 py-4 text-[#00308F] hover:bg-gray-50 hover:text-red-600 font-bold transition-colors">
                  Last Minute Travel
                </Link>
              </div>
            </div>
            <Link href="/insurance" className="px-3 py-4 text-[#00308F] hover:bg-[#C41E22] hover:text-white transition-colors duration-300">
              Travel Insurance
            </Link>
            <Link href="/contact" className="px-3 py-4 text-[#00308F] hover:bg-[#C41E22] hover:text-white transition-colors duration-300">
              Contact
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}

