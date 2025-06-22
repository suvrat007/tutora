  import Navbar from "../Navbar/Navbar.jsx";
  import SideBar from "../Navbar/SideBar.jsx";
  import TodaysClasses from "./comps/FuturePhases/TodaysClasses.jsx";
  import Callendar from "./comps/P1/Callendar.jsx";
  import ClassStatusUpdates from "./comps/P1/ClassStatusUpdates.jsx";
  import Reminders from "./comps/P1/Reminders.jsx";
  import Card from "./comps/uii/Card.jsx";

  const Home = () => {
    return (
      <div className="min-h-screen w-screen bg-[#d3a781] text-white flex justify-center items-start overflow-hidden">
        {/* Outer Container */}
        <div className="bg-[#fee5cf] relative w-full min-h-[95vh] rounded-[2rem] bg-[#e7c6a5] border border-[#e0b890] shadow-2xl overflow-hidden flex mx-2 my-4">

          
          {/* Sidebar */}
          <SideBar />

          {/* Main Content */}
          <div className="flex flex-col w-full overflow-hidden">
            <Navbar />

            {/* Content Area */}
            <div className="flex flex-col gap-4 p-4 flex-1 overflow-hidden">
              {/* Top Row: Today's Classes + Calendar */}
              <div className="flex gap-4 flex-1 overflow-hidden">
                <Card className="flex-1 min-w-[400px] overflow-hidden flex flex-col">
                  <TodaysClasses />
                </Card>
                <Card className="w-[28%] overflow-hidden flex flex-col">
                  <Callendar />
                </Card>
              </div>

              {/* Bottom Row: Status + Reminders */}
              <div className="flex gap-4 flex-1 overflow-hidden">
                <Card className="flex-1 overflow-hidden flex flex-col">
                  <ClassStatusUpdates />
                </Card>
                <Card className="flex-1 overflow-hidden flex flex-col">
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
