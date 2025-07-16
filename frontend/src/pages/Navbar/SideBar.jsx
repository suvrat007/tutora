import { Link, useLocation } from "react-router-dom";
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
import useLogoutAdmin from "@/useLogoutAdmin.js";

const Sidebar = () => {
  const location = useLocation();
  const handleLogout = useLogoutAdmin();
  const [isHovered, setIsHovered] = useState(false);
  const [management, setManagement] = useState(false);
  const [register, setRegister] = useState(false);

  const linkClass = (path) =>
      `cursor-pointer flex items-center justify-between gap-3 p-3 rounded-lg transition-all duration-200 group relative ${
          path && location.pathname.startsWith(path)
              ? "bg-[#f4e3d0] text-[#6b4c3b] font-semibold"
              : "hover:bg-gradient-to-r from-[#c5a37e] to-[#b98b65] hover:text-white text-[#4a3a2c]"
      }`;

  const menuItems = [
    { icon: AiFillHome, label: "Home", path: "/main" },
    {
      icon: MdManageAccounts,
      label: "Management",
      dropdown: true,
      toggle: () => setManagement((prev) => !prev),
      isOpen: management,
      subItems: [
        { label: "Attendance", path: "/main/attendance", icon: FaClipboardList },
        { label: "Fee Management", path: "/main/fees", icon: FaClipboardList },
      ],
    },
    {
      icon: BsFillPeopleFill,
      label: "Registrations & Info",
      dropdown: true,
      toggle: () => setRegister((prev) => !prev),
      isOpen: register,
      subItems: [
        { label: "Students", path: "/main/student-data", icon: AiOutlineTeam },
        { label: "Batches", path: "/main/batches", icon: IoIosSchool },
      ],
    },
    { icon: MdInfoOutline, label: "Student Center", path: "/main/info-students" },
    { icon: MdInfoOutline, label: "Institute Center", path: "/main/info-institute" },
  ];

  return (
      <div
          className={`bg-[#e7c6a5] shadow-2xl rounded-3xl transition-all duration-300 ease-in-out ml-4 my-4 px-4 py-6 flex flex-col justify-between ${
              isHovered ? "w-[17.5em]" : "w-[4.5em]"
          }`}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
      >
        <div className="flex flex-col gap-2 text-base font-medium">
          

          {menuItems.map((item, index) => (
              <div key={index}>
                {item.dropdown ? (
                    <div>
                      <div
                          onClick={item.toggle}
                          className={linkClass(null)}
                      >
                        <div className="flex items-center gap-3">
                          <item.icon
                              size={20}
                              className="group-hover:scale-110 transition-transform flex-shrink-0"
                          />
                          {isHovered && <span>{item.label}</span>}
                          {!isHovered && (
                              <div
                                  className="
                          absolute left-full ml-2 px-2 py-1 text-xs bg-[#e7c6a5]
                          rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200
                          pointer-events-none whitespace-nowrap z-50
                        "
                              >
                                {item.label}
                                <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 w-0 h-0"></div>
                              </div>
                          )}
                        </div>
                        {isHovered && (item.isOpen ? <AiOutlineUp /> : <AiOutlineDown />)}
                      </div>
                      {isHovered && (
                          <div
                              className={`flex flex-col pl-10 text-sm text-[#4a3a2c] transition-all duration-300 ease-in-out overflow-hidden ${
                                  item.isOpen ? "max-h-40 opacity-100" : "max-h-0 opacity-0"
                              }`}
                          >
                            {item.subItems.map((subItem, subIndex) => (
                                <Link
                                    key={subIndex}
                                    to={subItem.path}
                                    className="py-2 hover:text-[#6b4c3b] transition-colors flex items-center"
                                >
                                  <subItem.icon className="inline mr-2" />
                                  {subItem.label}
                                </Link>
                            ))}
                          </div>
                      )}
                    </div>
                ) : (
                    <Link
                        to={item.path}
                        className={linkClass(item.path)}
                    >
                      <item.icon
                          size={20}
                          className="group-hover:scale-110 transition-transform flex-shrink-0"
                      />
                      {isHovered && <span>{item.label}</span>}
                      {!isHovered && (
                          <div
                              className="
                      absolute left-full ml-2 px-2 py-1 text-xs bg-[#e7c6a5]
                      rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200
                      pointer-events-none whitespace-nowrap z-50
                    "
                          >
                            {item.label}
                            <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 w-0 h-0"></div>
                          </div>
                      )}
                    </Link>
                )}
              </div>
          ))}
        </div>

        {/* Bottom - Logout */}
        <div className="pt-4 border-t border-[#d4a97f]">
          <button
              onClick={handleLogout}
              className={linkClass(null)}
          >
            <FiLogOut
                size={20}
                className="group-hover:scale-110 transition-transform flex-shrink-0"
            />
            {isHovered && <span>Logout</span>}
            {!isHovered && (
                <div
                    className="
                absolute left-full ml-2 px-2 py-1 text-xs bg-[#e7c6a5]
                rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200
                pointer-events-none whitespace-nowrap z-50
              "
                >
                  Logout
                  <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 w-0 h-0"></div>
                </div>
            )}
          </button>
        </div>
      </div>
  );
};

export default Sidebar;