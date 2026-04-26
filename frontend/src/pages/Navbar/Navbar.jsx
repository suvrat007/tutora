import { useSelector } from "react-redux";
import {useNavigate} from "react-router-dom";

const Navbar = () => {
    const adminData = useSelector((state) => state.user);
    const navigate = useNavigate();
    return (
        <header className="bg-[#e7c6a5] min-h-20 mx-3 sm:mx-4 mt-4 mb-2 rounded-3xl shadow-md px-3 sm:px-6 flex items-center justify-between gap-2">

            <div className="flex items-center cursor-pointer shrink-0" onClick={() => navigate('/')}>
                {adminData?.institute_info?.logo_URL ? (
                    <img
                        src={adminData.institute_info.logo_URL}
                        alt="Institute Logo"
                        className="w-12 h-12 sm:w-16 sm:h-16 rounded-full border border-gray-400 shadow-sm p-1"
                    />
                ) : (
                    <div className="bg-[#4a3a2c] text-white w-9 h-9 flex items-center justify-center rounded-full font-bold text-sm shrink-0">
                        T
                    </div>
                )}
            </div>

            <div className="flex flex-col text-center cursor-pointer items-center min-w-0 flex-1 px-2" onClick={() => navigate('/main')}>
                <h1 className="text-base sm:text-2xl font-semibold text-[#4a3a2c] leading-tight truncate w-full">
                    {adminData?.institute_info?.name || "Tutora"}
                </h1>
                <span className="text-xs sm:text-sm text-[#6b4c3b]">Tutor Dashboard</span>
            </div>

            <div className="flex items-center gap-2 sm:gap-4 cursor-pointer shrink-0" onClick={() => navigate('/main/info-institute')}>
                <span className="h-6 w-px bg-[#d4a97f]"/>
                <div className="flex items-center gap-2 sm:gap-3">
                    <div className="relative">
                        <img
                            src={adminData.adminPicURL}
                            alt="User Avatar"
                            className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border border-gray-400 shadow-sm p-1 bg-[#f4e3d0]"
                        />
                        <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border border-[#e7c6a5]"/>
                    </div>
                    <div className="hidden sm:block leading-tight">
                        <div className="text-sm font-medium text-[#4a3a2c]">{adminData.name}</div>
                        <div className="text-sm font-medium text-[#4a3a2c]">Tutor</div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Navbar;
