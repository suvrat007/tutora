import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AiOutlineDown, AiOutlineUp } from "react-icons/ai";
import {
    FaHome,
    FaUserCog,
    FaUserGraduate,
    FaUniversity,
    FaUsers,
    FaMoneyCheckAlt,
    FaUserCheck,
    FaChalkboardTeacher,
} from "react-icons/fa";
import { HiOutlineClipboardList, HiOutlineDocumentText } from "react-icons/hi";
import { MdExpandLess, MdExpandMore } from "react-icons/md";
import { FiLogOut } from "react-icons/fi";
import useLogoutAdmin from "@/hooks/useLogoutAdmin.js";

// ── Animated hamburger: bottom line shrinks to half when sidebar is closed ───

const AnimatedHamburger = ({ isOpen }) => (
    <svg width="20" height="14" viewBox="0 0 20 14" fill="currentColor">
        <rect x="0" y="0" width="20" height="2" rx="1" />
        <rect x="0" y="6" width="20" height="2" rx="1" />
        <motion.rect
            x="0" y="12" height="2" rx="1"
            animate={{ width: isOpen ? 20 : 10 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
        />
    </svg>
);

// ── All sub-components at module level so their references never change ──────

const NavItem = ({ label, path, icon: Icon, isOpen, currentPath }) => (
    <Link
        to={path}
        className={`cursor-pointer flex items-center gap-3 p-3 rounded-lg transition-all ${
            currentPath === path
                ? "bg-[#f4e3d0] text-[#6b4c3b] font-semibold"
                : "hover:bg-[#d1ac8a] text-[#4a3a2c]"
        }`}
    >
        <Icon size={20} className="flex-shrink-0" />
        <AnimatePresence>
            {isOpen && (
                <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="whitespace-nowrap"
                >
                    {label}
                </motion.span>
            )}
        </AnimatePresence>
    </Link>
);

const NavDropItem = ({ label, isExpanded, toggle, subItems, icon: Icon, isOpen, onOpenSidebar }) => (
    <div>
        <div
            onClick={() => { if (!isOpen && onOpenSidebar) { onOpenSidebar(); } else { toggle(); } }}
            className="cursor-pointer flex items-center justify-between gap-3 p-3 rounded-lg transition-all hover:bg-[#d1ac8a] text-[#4a3a2c]"
        >
            <div className="flex items-center gap-3">
                <Icon size={20} className="flex-shrink-0" />
                <AnimatePresence>
                    {isOpen && (
                        <motion.span
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.15 }}
                            className="whitespace-nowrap"
                        >
                            {label}
                        </motion.span>
                    )}
                </AnimatePresence>
            </div>
            {isOpen && (isExpanded ? <AiOutlineUp size={14} /> : <AiOutlineDown size={14} />)}
        </div>
        {isOpen && isExpanded && (
            <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="flex flex-col pl-10 text-sm text-[#4a3a2c]"
            >
                {subItems.map((sub, idx) => (
                    <Link
                        to={sub.path}
                        key={idx}
                        className="cursor-pointer py-2 hover:text-[#6b4c3b] flex items-center gap-2"
                    >
                        <sub.icon className="flex-shrink-0" /> {sub.label}
                    </Link>
                ))}
            </motion.div>
        )}
    </div>
);

const MobileNavItem = ({ icon, label, onClick }) => (
    <div onClick={onClick} className="flex flex-col items-center text-[#4a3a2c] hover:text-[#6b4c3b] text-xs cursor-pointer">
        <div className="text-lg">{icon}</div>
        <span>{label}</span>
    </div>
);

const MobileNavDropdown = ({ icon, label, isOpen, toggle, subItems }) => (
    <div className="flex flex-col items-center relative">
        <button onClick={toggle} className="cursor-pointer flex flex-col items-center text-[#4a3a2c] hover:text-[#6b4c3b] text-xs">
            <div className="text-lg">{icon}</div>
            <span>{label}</span>
            {isOpen ? <MdExpandLess size={16} /> : <MdExpandMore size={16} />}
        </button>
        {isOpen && (
            <div className="absolute bottom-12 mb-2 w-40 bg-[#f4e3d0] rounded-md shadow-lg z-50">
                {subItems.map((item, idx) => (
                    <Link key={idx} to={item.path} className="cursor-pointer flex items-center gap-2 px-3 py-2 text-sm hover:bg-[#ddbfa1] text-[#4a3a2c]">
                        {item.icon} {item.label}
                    </Link>
                ))}
            </div>
        )}
    </div>
);

// ── Main Sidebar component ───────────────────────────────────────────────────

const Sidebar = () => {
    const handleLogout = useLogoutAdmin();
    const navigate = useNavigate();
    const location = useLocation();
    const [isOpen, setIsOpen] = useState(true);
    const [management, setManagement] = useState(false);
    const [register, setRegister] = useState(false);
    const [mobileExpand, setMobileExpand] = useState(null);

    useEffect(() => {
        setMobileExpand(null);
    }, [location.pathname]);

    return (
        <>
            {/* ── Desktop ── */}
            <motion.div
                animate={{ width: isOpen ? "15rem" : "4.5rem" }}
                transition={{ duration: 0.25, ease: "easeInOut" }}
                className="bg-[#e7c6a5] shadow-2xl rounded-3xl ml-4 my-4 px-4 py-6 flex-col hidden md:flex overflow-hidden flex-shrink-0"
            >
                {/* Header — never scrolls */}
                <div className={`flex items-center gap-3 h-9 shrink-0 ${isOpen ? "px-1" : "justify-center"}`}>
                    <button
                        onClick={() => setIsOpen((p) => !p)}
                        className="cursor-pointer flex-shrink-0 text-[#5a4a3c] hover:text-[#8b5e3c] transition-colors"
                        aria-label="Toggle sidebar"
                    >
                        <AnimatedHamburger isOpen={isOpen} />
                    </button>
                    <AnimatePresence>
                        {isOpen && (
                            <motion.span
                                initial={{ opacity: 0, x: -6 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -6 }}
                                transition={{ duration: 0.15 }}
                                className="text-xl font-bold text-[#5a4a3c] whitespace-nowrap select-none cursor-pointer"
                                onClick={() => setIsOpen(false)}
                            >
                                Tutora
                            </motion.span>
                        )}
                    </AnimatePresence>
                </div>

                <div className="border-t border-[#d4a97f] my-2 shrink-0" />

                {/* Scrollable nav items */}
                <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar flex flex-col gap-1 text-base font-medium">
                    <NavItem label="Home" path="/main" icon={FaHome} isOpen={isOpen} currentPath={location.pathname} />
                    <NavDropItem
                        label="Management"
                        icon={FaUserCog}
                        isExpanded={management}
                        toggle={() => setManagement((p) => !p)}
                        isOpen={isOpen}
                        onOpenSidebar={() => setIsOpen(true)}
                        subItems={[
                            { label: "Attendance", path: "/main/attendance", icon: HiOutlineClipboardList },
                            { label: "Fee Management", path: "/main/fees", icon: FaMoneyCheckAlt },
                            { label: "Test Management", path: "/main/tests", icon: HiOutlineDocumentText },
                        ]}
                    />
                    <NavItem label="Student Center" path="/main/info-students" icon={FaUserGraduate} isOpen={isOpen} currentPath={location.pathname} />
                    <NavItem label="Institute Center" path="/main/info-institute" icon={FaUniversity} isOpen={isOpen} currentPath={location.pathname} />
                    <NavDropItem
                        label="Registrations"
                        icon={FaUsers}
                        isExpanded={register}
                        toggle={() => setRegister((p) => !p)}
                        isOpen={isOpen}
                        onOpenSidebar={() => setIsOpen(true)}
                        subItems={[
                            { label: "Students", path: "/main/student-data", icon: FaUserCheck },
                            { label: "Batches", path: "/main/batches", icon: FaUserGraduate },
                            { label: "Teachers", path: "/main/teachers", icon: FaChalkboardTeacher },
                        ]}
                    />
                </div>

                {/* Logout — always pinned at bottom */}
                <div className="pt-4 border-t border-[#d4a97f] shrink-0">
                    <button
                        onClick={handleLogout}
                        className={`cursor-pointer flex w-full items-center gap-3 p-3 rounded-lg transition-all text-[#4a3a2c] hover:bg-[#d1ac8a] ${
                            !isOpen ? "justify-center" : ""
                        }`}
                    >
                        <FiLogOut size={20} className="flex-shrink-0" />
                        <AnimatePresence>
                            {isOpen && (
                                <motion.span
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.15 }}
                                    className="whitespace-nowrap"
                                >
                                    Logout
                                </motion.span>
                            )}
                        </AnimatePresence>
                    </button>
                </div>
            </motion.div>

            {/* ── Mobile Bottom Nav ── */}
            {mobileExpand && (
                <div className="fixed inset-0 z-40 md:hidden" onClick={() => setMobileExpand(null)} />
            )}
            <div className="fixed bottom-0 left-0 right-0 bg-[#e7c6a5] shadow-inner flex md:hidden justify-around py-2 z-50">
                <MobileNavItem icon={<FaHome />} onClick={() => navigate("/main")} label="Home" />
                <MobileNavDropdown
                    icon={<FaUserCog />}
                    label="Manage"
                    isOpen={mobileExpand === "management"}
                    toggle={() => setMobileExpand(mobileExpand === "management" ? null : "management")}
                    subItems={[
                        { label: "Attendance", path: "/main/attendance", icon: <HiOutlineClipboardList /> },
                        { label: "Fee", path: "/main/fees", icon: <FaMoneyCheckAlt /> },
                        { label: "Tests", path: "/main/tests", icon: <HiOutlineDocumentText /> },
                    ]}
                />
                <MobileNavDropdown
                    icon={<FaUsers />}
                    label="Register"
                    isOpen={mobileExpand === "register"}
                    toggle={() => setMobileExpand(mobileExpand === "register" ? null : "register")}
                    subItems={[
                        { label: "Students", path: "/main/student-data", icon: <FaUserCheck /> },
                        { label: "Batches", path: "/main/batches", icon: <FaUserGraduate /> },
                        { label: "Teachers", path: "/main/teachers", icon: <FaChalkboardTeacher /> },
                    ]}
                />
                <MobileNavItem icon={<FaUniversity />} onClick={() => navigate("/main/info-institute")} label="Institute" />
                <MobileNavItem icon={<FaUserGraduate />} onClick={() => navigate("/main/info-students")} label="Student" />
                <MobileNavItem icon={<FiLogOut />} label="Logout" onClick={handleLogout} />
            </div>
        </>
    );
};

export default Sidebar;
