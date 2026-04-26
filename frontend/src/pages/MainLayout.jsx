import SideBar from "@/pages/Navbar/SideBar.jsx";
import Navbar from "@/pages/Navbar/Navbar.jsx";
import { Outlet, useNavigation } from "react-router-dom";

const MainLayout = () => {
    const navigation = useNavigation();
    const isNavigating = navigation.state === "loading";

    return (
        <div className="h-screen w-screen bg-[#d3a781] text-black flex justify-center items-start overflow-hidden">
            <div className="bg-[#fee5cf] relative w-full h-[95vh] rounded-[2rem] border border-[#e0b890] shadow-2xl overflow-hidden flex flex-col md:flex-row mx-2 mt-4 md:my-4">
                <SideBar />
                <div className="flex flex-col w-full overflow-hidden pb-16 md:pb-0 relative">
                    <Navbar />
                    {isNavigating && (
                        <div className="absolute inset-0 z-20 flex items-center justify-center bg-[#fee5cf]/60 backdrop-blur-[2px]">
                            <div className="w-8 h-8 border-4 border-[#e6c8a8] border-t-[#8b5e3c] rounded-full animate-spin" />
                        </div>
                    )}
                    <Outlet />
                </div>
            </div>
        </div>
    );
};

export default MainLayout;
