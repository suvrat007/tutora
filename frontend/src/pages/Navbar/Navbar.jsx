import useLogoutAdmin from "@/useLogoutAdmin.js";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
    const adminData = useSelector((state) => state.user);
    const navigate = useNavigate();

    return (
        <motion.header
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="bg-[#e7c6a5] min-h-20 mx-4 mt-4 mb-2 rounded-2xl shadow-md px-6 flex items-center justify-between border border-[#ddb892]"
        >
            {/* Left Logo or T Icon */}
            <div className="flex items-center cursor-pointer" onClick={() => navigate('/')}>
                {adminData?.institute_info?.logo_URL ? (
                    <img
                        src={adminData.institute_info.logo_URL}
                        alt="Institute Logo"
                        className="h-16 w-16 object-contain rounded-xl"
                    />
                ) : (
                    <div className="bg-[#4a3a2c] text-white w-12 h-12 flex items-center justify-center rounded-full font-bold text-lg">
                        T
                    </div>
                )}
            </div>

            {/* Center Institute Name */}
            <div
                className="flex flex-col text-center cursor-pointer"
                onClick={() => navigate('/main')}
            >
                <h1 className="text-xl font-semibold text-[#4a3a2c] leading-tight">
                    {adminData?.institute_info?.name || "Tutora"}
                </h1>
                <span className="text-sm text-[#6b4c3b]">Tutor Dashboard</span>
            </div>

            {/* Right Profile Info */}
            <div
                className="flex items-center gap-4 cursor-pointer"
                onClick={() => navigate('/main/info-institute')}
            >
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <img
                            src={adminData.adminPicURL}
                            alt="User Avatar"
                            className="w-12 h-12 rounded-full border-2 border-[#4a3a2c] shadow-md p-1 bg-[#f4e3d0]"
                        />
                        <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-[#e7c6a5]" />
                    </div>
                    <div className="hidden sm:block leading-tight">
                        <div className="text-sm font-medium text-[#4a3a2c]">
                            {adminData.name}
                        </div>
                        <div className="text-xs text-[#6b4c3b]">Tutor</div>
                    </div>
                </div>
            </div>
        </motion.header>
    );
};

export default Navbar;
