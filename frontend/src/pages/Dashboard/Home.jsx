import Navbar from "../Navbar/Navbar.jsx";
import SideBar from "../Navbar/SideBar.jsx";
import TodaysClasses from "./comps/FuturePhases/TodaysClasses.jsx";
import Callendar from "./comps/P1/Callendar.jsx";
import ClassStatusUpdates from "./comps/P1/ClassStatusUpdates.jsx";
import Reminders from "./comps/P1/Reminders.jsx";
import {useEffect} from "react";
import useFetchBatches from "@/pages/useFetchBatches.js";
import useFetchStudents from "@/pages/useFetchStudents.js";
import useFetchClassLogs from "@/pages/useFetchClassLogs.js";
import useFetchAttendanceSummary from "@/pages/useFetchAttendanceSummary.js";

const Home = () => {
  const fetchBatches = useFetchBatches();
  const fetchGroupedStudents = useFetchStudents();
  const fetchClassLogs = useFetchClassLogs();
  const fetchAttendanceSummary = useFetchAttendanceSummary();

  useEffect(() => {
    fetchBatches();
    fetchGroupedStudents();
    fetchClassLogs()
    fetchAttendanceSummary();
  }, []);

  return (
      <div className="flex flex-col gap-4 p-4 flex-1 overflow-hidden">
        <div className="flex gap-4 flex-1 overflow-hidden">

          <div className="bg-[#f4d8bb] p-2 rounded-3xl shadow-md flex-1 min-w-[400px]">
            <div className="bg-white rounded-2xl shadow p-4 h-full">
              <TodaysClasses/>
            </div>
          </div>

          <div className="bg-[#f4d8bb] p-2 rounded-3xl shadow-md w-[28%] min-w-[280px]">
            <div className="bg-white rounded-2xl shadow p-4 h-full">
              <Callendar/>
            </div>
          </div>

        </div>

        <div className="flex gap-4 flex-1 overflow-hidden">
          <div className="bg-[#f4d8bb] p-2 rounded-3xl shadow-md flex-1 min-w-[400px]">
            <div className="bg-white rounded-2xl shadow p-4 h-full">
              <ClassStatusUpdates/>
            </div>
          </div>

          <div className="bg-[#f4d8bb] p-2 rounded-3xl shadow-md flex-1 min-w-[400px]">
            <div className="bg-white rounded-2xl shadow p-4 h-full">
              <Reminders/>
            </div>
          </div>

        </div>
      </div>

  );
};

export default Home;
