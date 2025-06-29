import Navbar from "../Navbar/Navbar.jsx";
import SideBar from "../Navbar/SideBar.jsx";
import TodaysClasses from "./comps/FuturePhases/TodaysClasses.jsx";
import Callendar from "./comps/P1/Callendar.jsx";
import ClassStatusUpdates from "./comps/P1/ClassStatusUpdates.jsx";
import Reminders from "./comps/P1/Reminders.jsx";
import Card from "./comps/uii/Card.jsx";
import useLogoutAdmin from "@/useLogoutAdmin.js";

const Home = () => {
  return (
    <div className="min-h-screen w-screen bg-[#d3a781] text-white flex justify-center items-start overflow-hidden">
      {/* Outer Container */}
      <div className="bg-[#fee5cf] relative w-full min-h-[95vh] rounded-[2rem] border border-[#e0b890] shadow-2xl overflow-hidden flex mx-2 my-4">

        {/* Sidebar */}
        <SideBar />

        <div className="flex flex-col w-full overflow-hidden">
          <Navbar />

          {/* Content Area */}
          <div className="flex flex-col gap-4 p-4 flex-1 overflow-hidden">
            {/* Top Row: Today's Classes + Calendar */}
            <div className="flex gap-4 flex-1 overflow-hidden">

              {/* Wrapper Card */}
              <div className="bg-[#f4d8bb] p-2 rounded-3xl shadow-md flex-1 min-w-[400px]">
                <div className="bg-white rounded-2xl shadow p-4 h-full">
                  <TodaysClasses />
                </div>
              </div>

              {/* Wrapper Card */}
              <div className="bg-[#f4d8bb] p-2 rounded-3xl shadow-md w-[28%] min-w-[280px]">
                <div className="bg-white rounded-2xl shadow p-4 h-full">
                  <Callendar />
                </div>
              </div>

            </div>

            {/* Bottom Row: Class Status + Reminders */}
            <div className="flex gap-4 flex-1 overflow-hidden">

              {/* Wrapper Card */}
              <div className="bg-[#f4d8bb] p-2 rounded-3xl shadow-md flex-1 min-w-[400px]">
                <div className="bg-white rounded-2xl shadow p-4 h-full">
                  <ClassStatusUpdates />
                </div>
              </div>

              {/* Wrapper Card */}
              <div className="bg-[#f4d8bb] p-2 rounded-3xl shadow-md flex-1 min-w-[400px]">
                <div className="bg-white rounded-2xl shadow p-4 h-full">
                  <Reminders />
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
