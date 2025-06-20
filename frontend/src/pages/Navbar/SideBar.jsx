import { Link } from "react-router-dom";
import { useState } from "react";
import {
    AiFillHome,
    AiOutlineDown,
    AiOutlineUp,
    AiOutlineTeam,
    AiOutlineMenu,
} from "react-icons/ai";
import { MdManageAccounts } from "react-icons/md";
import { FaClipboardList } from "react-icons/fa";
import { BsFillPeopleFill } from "react-icons/bs";
import { IoIosSchool } from "react-icons/io";

const Sidebar = () => {
    const [isOpen, setIsOpen] = useState(true);
    const [management, setManagement] = useState(false);
    const [register, setRegister] = useState(false);

    return (
        <div
            className={`bg-gradient-to-b from-[#f9fafb] to-[#e5e7eb] ${
                isOpen ? "w-[17.5em]" : "w-[4.5em]"
            } shadow-2xl rounded-2xl flex flex-col h-[95vh] py-6 px-4 transition-all duration-300 ease-in-out ml-4 mt-4`}
        >
            <div className="flex flex-col gap-3 text-base font-medium text-gray-800">

                {/* Toggle Button (Inline) */}
                <button
                    onClick={() => setIsOpen((prev) => !prev)}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] hover:text-white transition-all group"
                >
                    <AiOutlineMenu size={20} className="group-hover:scale-110 transition-transform" />
                    {isOpen && <span>{isOpen ? 'Collapse' : 'Expand'}</span>}
                </button>

                {/* Home */}
                <Link
                    to="/"
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] hover:text-white transition-all group"
                >
                    <AiFillHome size={20} className="group-hover:scale-110 transition-transform" />
                    {isOpen && <span>Home</span>}
                </Link>

                {/* Management Dropdown */}
                <div>
                    <div
                        onClick={() => setManagement((prev) => !prev)}
                        className="flex items-center justify-between p-3 rounded-lg hover:bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] hover:text-white cursor-pointer transition-all group"
                    >
                        <div className="flex items-center gap-3">
                            <MdManageAccounts size={20} className="group-hover:scale-110 transition-transform" />
                            {isOpen && <span>Management</span>}
                        </div>
                        {isOpen && (management ? <AiOutlineUp /> : <AiOutlineDown />)}
                    </div>

                    {isOpen && (
                        <div
                            className={`flex flex-col pl-10 text-sm text-gray-700 transition-all duration-300 ease-in-out overflow-hidden ${
                                management ? "max-h-40 opacity-100" : "max-h-0 opacity-0"
                            }`}
                        >
                            <Link to="/attendence" className="py-2 hover:text-indigo-600 transition-colors">
                                <FaClipboardList className="inline mr-2" />
                                Attendence
                            </Link>
                        </div>
                    )}
                </div>

                {/* Registrations Dropdown */}
                <div>
                    <div
                        onClick={() => setRegister((prev) => !prev)}
                        className="flex items-center justify-between p-3 rounded-lg hover:bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] hover:text-white cursor-pointer transition-all group"
                    >
                        <div className="flex items-center gap-3">
                            <BsFillPeopleFill size={20} className="group-hover:scale-110 transition-transform" />
                            {isOpen && <span>Registrations & Info</span>}
                        </div>
                        {isOpen && (register ? <AiOutlineUp /> : <AiOutlineDown />)}
                    </div>

                    {isOpen && (
                        <div
                            className={`flex flex-col pl-10 text-sm text-gray-700 transition-all duration-300 ease-in-out overflow-hidden ${
                                register ? "max-h-40 opacity-100" : "max-h-0 opacity-0"
                            }`}
                        >
                            <Link to="/student-data" className="py-2 hover:text-indigo-600 transition-colors">
                                <AiOutlineTeam className="inline mr-2" />
                                Students
                            </Link>
                            <Link to="/batches" className="py-2 hover:text-indigo-600 transition-colors">
                                <IoIosSchool className="inline mr-2" />
                                Batches
                            </Link>
                        </div>
                    )}
                </div>

                {/* Class Status */}
                <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] hover:text-white transition-all cursor-default group">
                    <FaClipboardList size={20} className="group-hover:scale-110 transition-transform" />
                    {isOpen && <span>Class Status</span>}
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
