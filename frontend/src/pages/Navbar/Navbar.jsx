import {
  BsMoon,
  BsSun,
  BsBell,
  BsSearch,
  BsPlusCircle,
  BsQuestionCircle,
  BsGlobe
} from "react-icons/bs";
import { useState } from "react";

const Navbar = () => {
  const [darkMode, setDarkMode] = useState(false);

  const toggleTheme = () => setDarkMode(!darkMode);

  return (
    <div className="bg-[#e7c6a5] mx-4 mt-4 mb-2 px-6 py-3 rounded-2xl shadow-md flex justify-between items-center text-[#4a3a2c]">
      {/* Left: Logo + Brand */}
      <div className="flex items-center gap-4">
        <div className="bg-[#4a3a2c] text-white w-9 h-9 flex items-center justify-center rounded-full font-bold text-sm">
          T
        </div>
        <div className="text-xl font-semibold">Tutora</div>
      </div>

      {/* Center: Page Title + Search + Add Button */}
      <div className="flex items-center gap-6 flex-1 justify-center">
        {/* Page Title */}
        <div className="text-base font-medium">Dashboard</div>

        {/* Search Bar */}
        <div className="relative w-64">
          <input
            type="text"
            placeholder="Search students, batches..."
            className="w-full pl-10 pr-3 py-2 rounded-lg border border-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#4a3a2c]"
          />
          <BsSearch className="absolute left-3 top-2.5 text-gray-500" />
        </div>

        {/* Quick Add Button */}
        <button className="flex items-center gap-2 bg-[#4a3a2c] text-white px-4 py-2 rounded-lg hover:bg-[#3b2f25] text-sm">
          <BsPlusCircle />
          Add Student
        </button>
      </div>

      {/* Right: Icons & Profile */}
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <button className="relative">
          <BsBell className="text-xl" />
          <span className="absolute top-0 right-0 w-2 h-2 bg-red-600 rounded-full" />
        </button>

        {/* Theme Toggle */}
        <button onClick={toggleTheme}>
          {darkMode ? <BsSun className="text-xl" /> : <BsMoon className="text-xl" />}
        </button>

        {/* Language Selector */}
        <button className="text-xl">
          <BsGlobe />
        </button>

        {/* Help */}
        <button className="text-xl">
          <BsQuestionCircle />
        </button>

        {/* Profile Dropdown Placeholder */}
        <div className="relative group">
          <img
            src="https://www.svgrepo.com/show/527961/user.svg"
            alt="User Avatar"
            className="w-10 h-10 rounded-full border border-gray-500 cursor-pointer"
          />
          {/* Dropdown */}
          <div className="absolute right-0 top-12 bg-white text-sm text-[#4a3a2c] shadow-md rounded-md py-2 px-4 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 transition duration-200 ease-in-out pointer-events-none group-hover:pointer-events-auto z-50">
            <div className="py-1 hover:bg-gray-100 rounded cursor-pointer">My Profile</div>
            <div className="py-1 hover:bg-gray-100 rounded cursor-pointer">Settings</div>
            <div className="py-1 hover:bg-gray-100 rounded cursor-pointer">Logout</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
