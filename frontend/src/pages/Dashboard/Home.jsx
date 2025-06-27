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
    <div className="min-h-screen bg-[#d3a781] text-white flex justify-center items-center py-10">
      <div className="bg-[#fee5cf] relative w-[97%] max-w-[1750px] min-h-[92vh] rounded-[2rem] bg-[#e7c6a5] border border-[#e0b890] shadow-2xl overflow-hidden flex">
        <SideBar />

        <div className="flex flex-col w-full overflow-hidden">
          <Navbar />

          <div className="flex flex-col gap-4 p-4">
            <div className="flex gap-4 flex-wrap">
              <Card className="flex-1 min-w-[400px]">
                <TodaysClasses />
              </Card>

              <Card className="w-[24em]">
                <Callendar />
              </Card>
            </div>

            <div className="flex gap-4 flex-wrap">
              <Card className="flex-1">
                <ClassStatusUpdates />
              </Card>

              <Card className="flex-1">
                <Reminders />
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
