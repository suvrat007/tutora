import Navbar from "../Navbar/Navbar.jsx";
import SideBar from "../Navbar/SideBar.jsx";
import TodaysClasses from "./comps/FuturePhases/TodaysClasses.jsx";
import Callendar from "./comps/P1/Callendar.jsx";
import ClassStatusUpdates from "./comps/P1/ClassStatusUpdates.jsx";
import Reminders from "./comps/P1/Reminders.jsx";

const Home = () => {
  return (
    <div className="bg-white"> {/* change to 'bg-black' if needed */}
      <div className="flex h-screen">
        <SideBar />

        <div className="flex flex-col w-full overflow-hidden">
          <Navbar />

          <div className="flex flex-col gap-2 p-2">
            <div className="flex gap-2 w-full">
              {/* Today's Classes */}
              <TodaysClasses />

              {/* Calendar */}
              <Callendar />
            </div>

            <div className="flex gap-2 w-full justify-between">
              {/* Status Updates */}
              <ClassStatusUpdates />

              {/* Reminders */}
              <Reminders />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
