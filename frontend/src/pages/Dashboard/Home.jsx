    import Navbar from "../Navbar/Navbar.jsx";
    import SideBar from "../Navbar/SideBar.jsx";
    import TodaysClasses from "./comps/FuturePhases/TodaysClasses.jsx";
    import FeeInfo from "./comps/FuturePhases/FeeInfo.jsx";
    import AttendancePercentages from "./comps/P1/AttendancePercentages.jsx";
    import Callendar from "./comps/P1/Callendar.jsx";
    import ClassStatusUpdates from "./comps/P1/ClassStatusUpdates.jsx";
    import Reminders from "./comps/P1/Reminders.jsx";
    import {useEffect, useState} from "react";
    import useFetchAllClasses from "./comps/DashboardHooks/useFetchAllClasses.jsx";

    const Home = () => {


        return (
            <div className="flex h-screen">
                <SideBar/>
                <div className="flex flex-col w-full overflow-hidden">
                    <Navbar/>

                    <div className={'flex flex-col flex-wrap  gap-2 mx-2'}>

                        <div className={'w-full flex gap-2'}>
                            {/*todays classes*/}
                            <TodaysClasses/>

                            {/*calender*/}
                            <Callendar/>

                        </div>


                        <div className={' flex justify-between w-full gap-2'}>
                         
                            <ClassStatusUpdates/>

                           
                            <Reminders/>
                        </div>


                    </div>
                </div>


            </div>
        )
    }
    export default Home