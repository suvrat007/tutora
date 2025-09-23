import { useState } from "react";
import LoadingPage from "../LoadingPage.jsx";
import TodaysClasses from "./comps/FuturePhases/TodaysClasses.jsx";
import Callendar from "./comps/P1/Callendar.jsx";
import ClassStatusUpdates from "./comps/P1/ClassStatusUpdates.jsx";
import Reminders from "./comps/P1/Reminders.jsx";
import WrapperCard from "@/utilities/WrapperCard.jsx";

const Home = () => {
    const [loaded, setLoaded] = useState(false);

    if (!loaded) return <LoadingPage onDone={() => setLoaded(true)} />;

    return (
        <div className=" py-3 px-5 overflow-y-auto flex flex-col gap-6">
            {/* Top Row */}
            <div className="flex flex-col sm:flex-row gap-6 h-auto sm:h-[37vh]">
                <div className="w-full sm:w-[80%]">
                    <WrapperCard className="h-full">
                        <div className="h-[30em] sm:h-full">
                            <TodaysClasses />
                        </div>
                    </WrapperCard>
                </div>
                <div className="w-full sm:flex-1">
                    <div className="bg-[#f8ede3] p-4 rounded-3xl shadow-[0_8px_24px_rgba(0,0,0,0.15)] h-full">
                        <Callendar />
                    </div>
                </div>
            </div>

            {/* Bottom Row */}
            <div className="flex flex-col sm:flex-row gap-6 h-[45rem]">
                <div className="w-full sm:w-1/2">
                    <WrapperCard className="h-full">
                        <div className="h-[30em] sm:h-full">
                            <ClassStatusUpdates />
                        </div>
                    </WrapperCard>
                </div>
                <div className="w-full sm:w-1/2 mb-25 sm:mb-0">
                    <WrapperCard className="h-full">
                        <div className="h-[20em]  sm:h-full">
                            <Reminders />
                        </div>
                    </WrapperCard>
                </div>
            </div>
        </div>
    );
};

export default Home;
