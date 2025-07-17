

// SideBar.jsx
import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import {
  AiFillHome,
  AiOutlineDown,
  AiOutlineUp,
  AiOutlineTeam,
} from "react-icons/ai";
import { MdManageAccounts, MdInfoOutline } from "react-icons/md";
import { FaClipboardList } from "react-icons/fa";
import { BsFillPeopleFill } from "react-icons/bs";
import { IoIosSchool } from "react-icons/io";
import { FiLogOut } from "react-icons/fi";
import { X } from "lucide-react";
import useLogoutAdmin from "@/useLogoutAdmin.js";
import { motion } from "framer-motion";

const Sidebar = ({ isMobile = false, onClose }) => {
  const location = useLocation();
  const handleLogout = useLogoutAdmin();
  const [isHovered, setIsHovered] = useState(false);
  const [management, setManagement] = useState(false);
  const [register, setRegister] = useState(false);

  const linkClass = (path) =>
      `cursor-pointer flex items-center justify-between gap-3 p-3 rounded-lg transition-all duration-200 group relative ${
          path && location.pathname.startsWith(path)
              ? "bg-[#f4e3d0] text-[#6b4c3b] font-semibold"
              : "hover:bg-[#d7b48f] text-[#4a3a2c] hover:text-white"
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

  const handleLinkClick = () => {
    if (isMobile && onClose) {
      onClose();
    }
  };

  // Mobile version
  if (isMobile) {
    return (
        <div className="h-full w-full p-4 flex flex-col">
          {/* Mobile Header with Close Button */}
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#d4a97f]">
            <h2 className="text-xl font-bold text-[#4a3a2c]">Menu</h2>
            <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-[#f4e3d0] transition-colors"
            >
              <X size={24} className="text-[#4a3a2c]" />
            </button>
          </div>

          {/* Mobile Menu Items */}
          <div className="flex flex-col gap-2 text-base font-medium flex-1">
            {menuItems.map((item, index) => (
                <div key={index}>
                  {item.dropdown ? (
                      <>
                        <div onClick={item.toggle} className={linkClass(null)}>
                          <div className="flex items-center gap-3">
                            <item.icon
                                size={20}
                                className="group-hover:scale-110 transition-transform flex-shrink-0 text-[#4a3a2c]"
                            />
                            <span>{item.label}</span>
                          </div>
                          {item.isOpen ? <AiOutlineUp /> : <AiOutlineDown />}
                        </div>

                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{
                              height: item.isOpen ? "auto" : 0,
                              opacity: item.isOpen ? 1 : 0,
                            }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                            className="flex flex-col pl-10 text-sm text-[#4a3a2c] overflow-hidden"
                        >
                          {item.subItems.map((subItem, subIndex) => (
                              <Link
                                  key={subIndex}
                                  to={subItem.path}
                                  onClick={handleLinkClick}
                                  className="py-2 hover:text-[#6b4c3b] transition-colors flex items-center"
                              >
                                <subItem.icon className="inline mr-2 text-[#4a3a2c]" />
                                {subItem.label}
                              </Link>
                          ))}
                        </motion.div>
                      </>
                  ) : (
                      <Link to={item.path} onClick={handleLinkClick} className={linkClass(item.path)}>
                        <div className="flex items-center gap-3">
                          <item.icon
                              size={20}
                              className="group-hover:scale-110 transition-transform flex-shrink-0 text-[#4a3a2c]"
                          />
                          <span>{item.label}</span>
                        </div>
                      </Link>
                  )}
                </div>
            ))}
          </div>

          {/* Mobile Logout */}
          <div className="pt-4 border-t border-[#d4a97f]">
            <button onClick={handleLogout} className={linkClass(null)}>
              <div className="flex items-center gap-3">
                <FiLogOut
                    size={20}
                    className="group-hover:scale-110 transition-transform flex-shrink-0 text-[#4a3a2c]"
                />
                <span>Logout</span>
              </div>
            </button>
          </div>
        </div>
    );
  }

  // Desktop version (original hover behavior)
  return (
      <motion.div
          className={`bg-[#e7c6a5] shadow-xl rounded-3xl transition-all duration-300 ease-in-out ml-4 my-4 px-4 py-6 flex flex-col justify-between ${
              isHovered ? "w-[17.5em]" : "w-[4.5em]"
          }`}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          animate={{ width: isHovered ? "17.5em" : "4.5em" }}
      >
        {/* Top Menu */}
        <div className="flex flex-col gap-2 text-base font-medium">
          {menuItems.map((item, index) => (
              <div key={index}>
                {item.dropdown ? (
                    <>
                      <div onClick={item.toggle} className={linkClass(null)}>
                        <div className="flex items-center gap-3">
                          <item.icon
                              size={20}
                              className="group-hover:scale-110 transition-transform flex-shrink-0 text-[#4a3a2c]"
                          />
                          {isHovered && (
                              <motion.span
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  exit={{ opacity: 0 }}
                              >
                                {item.label}
                              </motion.span>
                          )}
                          {!isHovered && (
                              <div className="absolute left-full ml-2 px-2 py-1 text-xs bg-[#f4e3d0] text-[#4a3a2c] border border-[#ddb892] rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                                {item.label}
                              </div>
                          )}
                        </div>
                        {isHovered &&
                            (item.isOpen ? <AiOutlineUp /> : <AiOutlineDown />)}
                      </div>

                      {isHovered && (
                          <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{
                                height: item.isOpen ? "auto" : 0,
                                opacity: item.isOpen ? 1 : 0,
                              }}
                              transition={{ duration: 0.3, ease: "easeInOut" }}
                              className="flex flex-col pl-10 text-sm text-[#4a3a2c] overflow-hidden"
                          >
                            {item.subItems.map((subItem, subIndex) => (
                                <Link
                                    key={subIndex}
                                    to={subItem.path}
                                    className="py-2 hover:text-[#6b4c3b] transition-colors flex items-center"
                                >
                                  <subItem.icon className="inline mr-2 text-[#4a3a2c]" />
                                  {subItem.label}
                                </Link>
                            ))}
                          </motion.div>
                      )}
                    </>
                ) : (
                    <Link to={item.path} className={linkClass(item.path)}>
                      <item.icon
                          size={20}
                          className="group-hover:scale-110 transition-transform flex-shrink-0 text-[#4a3a2c]"
                      />
                      {isHovered && (
                          <motion.span
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                          >
                            {item.label}
                          </motion.span>
                      )}
                      {!isHovered && (
                          <div className="absolute left-full ml-2 px-2 py-1 text-xs bg-[#f4e3d0] text-[#4a3a2c] border border-[#ddb892] rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                            {item.label}
                          </div>
                      )}
                    </Link>
                )}
              </div>
          ))}
        </div>

        {/* Bottom - Logout */}
        <div className="pt-4 border-t border-[#d4a97f]">
          <button onClick={handleLogout} className={linkClass(null)}>
            <FiLogOut
                size={20}
                className="group-hover:scale-110 transition-transform flex-shrink-0 text-[#4a3a2c]"
            />
            {isHovered && (
                <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                  Logout
                </motion.span>
            )}
            {!isHovered && (
                <div className="absolute left-full ml-2 px-2 py-1 text-xs bg-[#f4e3d0] text-[#4a3a2c] border border-[#ddb892] rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                  Logout
                </div>
            )}
          </button>
        </div>
      </motion.div>
  );
};

export default Sidebar;