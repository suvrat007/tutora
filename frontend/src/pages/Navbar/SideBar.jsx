import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  AiFillHome,
  AiOutlineDown,
  AiOutlineUp,
  AiOutlineTeam,
  AiOutlineRight,
  AiOutlineLeft,
} from "react-icons/ai";
import { MdManageAccounts, MdInfoOutline } from "react-icons/md";
import { FaClipboardList } from "react-icons/fa";
import { BsFillPeopleFill } from "react-icons/bs";
import { IoIosSchool } from "react-icons/io";
import { FiLogOut } from "react-icons/fi";

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [management, setManagement] = useState(false);
  const [register, setRegister] = useState(false);

  const linkClass = (path) =>
    `cursor-pointer flex items-center gap-3 p-3 rounded-lg transition-all group ${
      location.pathname === path
        ? "bg-[#f4e3d0] text-[#6b4c3b] font-semibold"
        : "hover:bg-gradient-to-r from-[#c5a37e] to-[#b98b65] hover:text-white text-[#4a3a2c]"
    }`;

  const handleLogout = () => {
    navigate("/"); // Redirect to landing page
  };

  return (
    <div
      className={`
        bg-[#e7c6a5] shadow-2xl rounded-3xl transition-all duration-300 ease-in-out
        ml-4 my-4 px-4 py-6
        ${isOpen ? "w-[17.5em]" : "w-[4.5em]"}
        h-screen flex flex-col justify-between
      `}
      onMouseLeave={() => setIsOpen(false)}
    >
      {/* Top Section - Navigation */}
      <div className="flex flex-col gap-2 text-base font-medium">
        {/* Collapse Button */}
        <button
          onMouseEnter={() => setIsOpen(true)}
          onClick={() => setIsOpen((prev) => !prev)}
          className={linkClass("")}
        >
          <span
            className={`transition-transform duration-300 ${
              isOpen ? "rotate-0" : "rotate-90"
            }`}
          >
            {isOpen ? (
              <AiOutlineLeft size={20} className="group-hover:scale-110 transition-transform" />
            ) : (
              <AiOutlineRight size={20} className="group-hover:scale-110 transition-transform" />
            )}
          </span>
          {isOpen && <span className="transition-opacity duration-300">Collapse</span>}
        </button>

        {/* Home */}
        <Link to="/Home" className={linkClass("/Home")}>
          <AiFillHome size={20} className="group-hover:scale-110 transition-transform" />
          {isOpen && <span>Home</span>}
        </Link>

        {/* Management Dropdown */}
        <div>
          <div onClick={() => setManagement((prev) => !prev)} className={linkClass("")}>
            <div className="flex items-center gap-3">
              <MdManageAccounts size={20} className="group-hover:scale-110 transition-transform" />
              {isOpen && <span>Management</span>}
            </div>
            {isOpen && (management ? <AiOutlineUp /> : <AiOutlineDown />)}
          </div>
          {isOpen && (
            <div
              className={`flex flex-col pl-10 text-sm text-[#4a3a2c] transition-all duration-300 ease-in-out overflow-hidden ${
                management ? "max-h-40 opacity-100" : "max-h-0 opacity-0"
              }`}
            >
              <Link
                to="/attendence"
                className="py-2 hover:text-[#6b4c3b] transition-colors cursor-pointer"
              >
                <FaClipboardList className="inline mr-2" />
                Attendence
              </Link>
            </div>
          )}
        </div>

        {/* Registrations Dropdown */}
        <div>
          <div onClick={() => setRegister((prev) => !prev)} className={linkClass("")}>
            <div className="flex items-center gap-3">
              <BsFillPeopleFill size={20} className="group-hover:scale-110 transition-transform" />
              {isOpen && <span>Registrations & Info</span>}
            </div>
            {isOpen && (register ? <AiOutlineUp /> : <AiOutlineDown />)}
          </div>
          {isOpen && (
            <div
              className={`flex flex-col pl-10 text-sm text-[#4a3a2c] transition-all duration-300 ease-in-out overflow-hidden ${
                register ? "max-h-40 opacity-100" : "max-h-0 opacity-0"
              }`}
            >
              <Link
                to="/student-data"
                className="py-2 hover:text-[#6b4c3b] transition-colors cursor-pointer"
              >
                <AiOutlineTeam className="inline mr-2" />
                Students
              </Link>
              <Link
                to="/batches"
                className="py-2 hover:text-[#6b4c3b] transition-colors cursor-pointer"
              >
                <IoIosSchool className="inline mr-2" />
                Batches
              </Link>
            </div>
          )}
        </div>

        {/* Class Status */}
        <Link to="/class-status" className={linkClass("/class-status")}>
          <FaClipboardList size={20} className="group-hover:scale-110 transition-transform" />
          {isOpen && <span>Class Status</span>}
        </Link>

        {/* Info Center */}
        <Link to="/Info-Center" className={linkClass("/Info-Center")}>
          <MdInfoOutline size={20} className="group-hover:scale-110 transition-transform" />
          {isOpen && <span>Info Center</span>}
        </Link>
      </div>

      {/* Bottom Section - Logout */}
      <div className="mt-auto pt-4 border-t border-[#d4a97f]">
        <button onClick={handleLogout} className={linkClass("")}>
          <FiLogOut size={20} className="group-hover:scale-110 transition-transform" />
          {isOpen && <span>Logout</span>}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
