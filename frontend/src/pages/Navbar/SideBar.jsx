import {Link, useLocation, useNavigate} from "react-router-dom";
import { useState } from "react";
import {
    AiOutlineDown,
    AiOutlineUp,
} from "react-icons/ai";
import {
    FaHome,
    FaUserCog,
    FaUserGraduate,
    FaUniversity,
    FaUsers,
    FaMoneyCheckAlt,
    FaUserCheck,
} from "react-icons/fa";
import { HiOutlineClipboardList, HiOutlineDocumentText } from "react-icons/hi";
import { MdExpandLess, MdExpandMore } from "react-icons/md";
import { FiLogOut } from "react-icons/fi";
import useLogoutAdmin from "@/useLogoutAdmin.js";

const Sidebar = () => {
    const handleLogout = useLogoutAdmin();
    const [isHovered, setIsHovered] = useState(false);
    const [management, setManagement] = useState(false);
    const [register, setRegister] = useState(false);

    const DesktopSidebar = () => (
        <div
            className={`bg-[#e7c6a5] shadow-2xl rounded-3xl transition-all duration-300 ease-in-out ml-4 my-4 px-4 py-6 flex-col justify-between hidden md:flex ${
                isHovered ? "w-[17.5em]" : "w-[4.5em]"
            }`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className="flex flex-col gap-2 text-base font-medium">
                {/* Menu Items */}
                <SidebarItems
                    isHovered={isHovered}
                    management={management}
                    register={register}
                    setManagement={setManagement}
                    setRegister={setRegister}
                    isMobile={false}
                />
            </div>

            <div className="pt-4 border-t border-[#d4a97f]">
                <button
                    onClick={handleLogout}
                    className={`flex w-full items-center gap-3 p-3 rounded-lg transition-all ${
                        isHovered
                            ? "hover:bg-[#d1ac8a] text-[#4a3a2c]"
                            : "justify-center hover:text-white"
                    }`}
                >
                    <FiLogOut size={20} />
                    {isHovered && <span>Logout</span>}
                </button>
            </div>
        </div>
    );
    const navigate = useNavigate();

    const MobileBottomNav = () => {
        const [expand, setExpand] = useState(null); // 'management' | 'register' | null

        return (
            <div className="fixed bottom-0 left-0 right-0 bg-[#e7c6a5] shadow-inner flex md:hidden justify-around py-2 z-50">
                <MobileNavItem icon={<FaHome />}  onClick={()=>navigate('/main')} label="Home" />
                <MobileNavDropdown
                    icon={<FaUserCog />}
                    label="Manage"
                    isOpen={expand === "management"}
                    toggle={() => setExpand(expand === "management" ? null : "management")}
                    subItems={[
                        { label: "Attendance", path: "/main/attendance", icon: <HiOutlineClipboardList /> },
                        { label: "Fee", path: "/main/fees", icon: <FaMoneyCheckAlt /> },
                        { label: "Tests", path: "/main/tests", icon: <HiOutlineDocumentText /> },
                    ]}
                />
                <MobileNavDropdown
                    icon={<FaUsers />}
                    label="Register"
                    isOpen={expand === "register"}
                    toggle={() => setExpand(expand === "register" ? null : "register")}
                    subItems={[
                        { label: "Students", path: "/main/student-data", icon: <FaUserCheck /> },
                        { label: "Batches", path: "/main/batches", icon: <FaUserGraduate /> },
                    ]}
                />
                <MobileNavItem icon={<FaUniversity />}  onClick={()=>navigate('/main/info-institute')} label="Institute" />
                <MobileNavItem icon={<FaUserGraduate />}  onClick={()=>navigate('/main/info-students')} label="Student" />
                <MobileNavItem icon={<FiLogOut />} label="Logout" onClick={handleLogout} />
            </div>
        );
    };

    return (
        <>
            <DesktopSidebar />
            <MobileBottomNav />
        </>
    );
};

const SidebarItems = ({ isHovered, management, register, setManagement, setRegister, isMobile }) => {
    const location = useLocation();

    const Item = ({ label, path, icon: Icon }) => (
        <Link
            to={path}
            className={`cursor-pointer flex items-center gap-3 p-3 rounded-lg transition-all group relative ${
                path && location.pathname.startsWith(path)
                    ? "bg-[#f4e3d0] text-[#6b4c3b] font-semibold"
                    : "hover:bg-gradient-to-r from-[#c5a37e] to-[#b98b65] hover:text-white text-[#4a3a2c]"
            }`}
        >
            <Icon size={20} className="flex-shrink-0" />
            {isHovered && <span>{label}</span>}
        </Link>
    );

    const DropItem = ({ label, isOpen, toggle, subItems, icon: Icon }) => (
        <div>
            <div
                onClick={toggle}
                className="cursor-pointer flex items-center justify-between gap-3 p-3 rounded-lg transition-all hover:bg-[#d1ac8a] text-[#4a3a2c]"
            >
                <div className="flex items-center justify-between gap-3">
                    <Icon size={20} />
                    {isHovered && <span>{label}</span>}
                </div>
                {isHovered && (isOpen ? <AiOutlineUp /> : <AiOutlineDown />)}
            </div>
            {isHovered && isOpen && (
                <div className="flex flex-col pl-10 text-sm text-[#4a3a2c]">
                    {subItems.map((sub, idx) => (
                        <Link to={sub.path} key={idx} className="py-2 hover:text-[#6b4c3b] flex items-center">
                            <sub.icon className="mr-2" /> {sub.label}
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );

    return (
        <>
            <Item label="Home" path="/main" icon={FaHome} />
            <DropItem
                label="Management"
                icon={FaUserCog}
                isOpen={management}
                toggle={() => setManagement((prev) => !prev)}
                subItems={[
                    { label: "Attendance", path: "/main/attendance", icon: HiOutlineClipboardList },
                    { label: "Fee Management", path: "/main/fees", icon: FaMoneyCheckAlt },
                    { label: "Test Management", path: "/main/tests", icon: HiOutlineDocumentText },
                ]}
            />
            <Item label="Student Center" path="/main/info-students" icon={FaUserGraduate} />
            <Item label="Institute Center" path="/main/info-institute" icon={FaUniversity} />
            <DropItem
                label="Registrations"
                icon={FaUsers}
                isOpen={register}
                toggle={() => setRegister((prev) => !prev)}
                subItems={[
                    { label: "Students", path: "/main/student-data", icon: FaUserCheck },
                    { label: "Batches", path: "/main/batches", icon: FaUserGraduate },
                ]}
            />
        </>
    );
};

const MobileNavItem = ({ icon, to, label, onClick }) => {
    return (
        <div
            onClick={onClick}
            className="flex flex-col items-center text-[#4a3a2c] hover:text-[#6b4c3b] text-xs"
        >
            <div className="text-lg">{icon}</div>
            <span>{label}</span>
        </div>
    );
};

const MobileNavDropdown = ({ icon, label, isOpen, toggle, subItems }) => {
    return (
        <div className="flex flex-col items-center relative">
            <button
                onClick={toggle}
                className="flex flex-col items-center text-[#4a3a2c] hover:text-[#6b4c3b] text-xs"
            >
                <div className="text-lg">{icon}</div>
                <span>{label}</span>
                {isOpen ? <MdExpandLess size={16} /> : <MdExpandMore size={16} />}
            </button>
            {isOpen && (
                <div className="absolute bottom-12 mb-2 w-40 bg-[#f4e3d0] rounded-md shadow-lg z-50">
                    {subItems.map((item, idx) => (
                        <Link
                            key={idx}
                            to={item.path}
                            className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-[#ddbfa1] text-[#4a3a2c]"
                        >
                            {item.icon} {item.label}
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Sidebar;