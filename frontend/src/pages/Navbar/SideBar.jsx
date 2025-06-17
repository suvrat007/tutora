import { Link } from "react-router-dom";
import { useState } from "react";
import {
    AiFillHome,
    AiOutlineDown,
    AiOutlineUp,
    AiOutlineTeam,
} from "react-icons/ai";
import { MdManageAccounts } from "react-icons/md";
import { FaClipboardList } from "react-icons/fa";
import { BsFillPeopleFill } from "react-icons/bs";
import { IoIosSchool } from "react-icons/io";

const Sidebar = () => {
    const [management, setManagement] = useState(false);
    const [register, setRegister] = useState(false);

    return (
        <div className="w-[17.5em] border-2 shadow-lg rounded-r-xl flex flex-col h-screen py-10 px-6">
            <div className="flex flex-col gap-2 text-lg font-medium">

                {/* Home */}
                <Link to="/" className="flex items-center gap-3 p-3 rounded-md hover:bg-gradient-to-l from-[#d1d5db] via-[#6b7280] to-[#374151] hover:text-white transition-all">
                    <AiFillHome size={20} />
                    Home
                </Link>

                {/* Management Dropdown */}
                <div>
                    <div
                        onClick={() => setManagement(prev => !prev)}
                        className="flex items-center justify-between gap-3 p-3 rounded-md hover:bg-gradient-to-l from-[#d1d5db] via-[#6b7280] to-[#374151] hover:text-white cursor-pointer transition-all"
                    >
                        <div className="flex items-center gap-3">
                            <MdManageAccounts size={20} />
                            Management
                        </div>
                        {management ? <AiOutlineUp /> : <AiOutlineDown />}
                    </div>
                    <div
                        className={`flex flex-col pl-10 overflow-hidden  transition-all duration-300 ${
                            management ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'
                        }`}
                    >
                        <Link to="/attendence" className="py-2 text-sm hover:text-gray-300 transition-all">
                            <FaClipboardList className="inline mr-2" />
                            Attendence
                        </Link>
                    </div>
                </div>

                {/* Registrations Dropdown */}
                <div>
                    <div
                        onClick={() => setRegister(prev => !prev)}
                        className="flex items-center justify-between gap-3 p-3 rounded-md hover:bg-gradient-to-l from-[#d1d5db] via-[#6b7280] to-[#374151] hover:text-white cursor-pointer transition-all"
                    >
                        <div className="flex items-center gap-3">
                            <BsFillPeopleFill size={20} />
                            Registrations & Info
                        </div>
                        {register ? <AiOutlineUp /> : <AiOutlineDown />}
                    </div>
                    <div
                        className={`flex flex-col pl-10 overflow-hidden transition-all duration-300 ${
                            register ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'
                        }`}
                    >
                        <Link to="/student-data" className="py-2 text-sm hover:text-gray-300 transition-all">
                            <AiOutlineTeam className="inline mr-2" />
                            Students
                        </Link>
                        <Link to="/batches" className="py-2 text-sm hover:text-gray-300 transition-all">
                            <IoIosSchool className="inline mr-2" />
                            Batches
                        </Link>
                    </div>
                </div>

                {/* Class Status */}
                <div className="flex items-center hover:text-white gap-3 p-3 rounded-md hover:bg-gradient-to-l from-[#d1d5db] via-[#6b7280] to-[#374151]     transition-all cursor-default">
                    <FaClipboardList size={20} />
                    Class Status
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
