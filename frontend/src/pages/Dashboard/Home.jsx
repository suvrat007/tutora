import { useState } from "react";
import LoadingPage from "../LoadingPage.jsx";
import TodaysClasses from "./comps/FuturePhases/TodaysClasses.jsx";
import Callendar from "./comps/P1/Callendar.jsx";
import ClassStatusUpdates from "./comps/P1/ClassStatusUpdates.jsx";
import Reminders from "./comps/P1/Reminders.jsx";
import WrapperCard from "@/utilities/WrapperCard.jsx";
import StatsStrip from "./comps/Widgets/StatsStrip.jsx";
import FeeCollection from "./comps/Widgets/FeeCollection.jsx";
import TopStudents from "./comps/Widgets/TopStudents.jsx";
import BatchFeeChart from "./comps/Widgets/BatchFeeChart.jsx";
import ClassFrequencyTrend from "./comps/Widgets/ClassFrequencyTrend.jsx";

const Home = () => {
    const [loaded, setLoaded] = useState(false);

    if (!loaded) return <LoadingPage onDone={() => setLoaded(true)} />;

    return (
        <div className="py-3 px-3 sm:px-5 overflow-y-auto flex flex-col gap-4 sm:gap-6">
            {/* Stats strip */}
            <StatsStrip />

            {/* Fee collection + Top students */}
            <div className="flex flex-col sm:flex-row gap-6 sm:h-[420px]">
                <div className="w-full sm:w-[55%]">
                    <FeeCollection />
                </div>
                <div className="w-full sm:flex-1">
                    <TopStudents />
                </div>
            </div>

            {/* Batch fee breakdown + Class frequency trend */}
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 sm:h-[340px]">
                <div className="w-full sm:w-1/2">
                    <BatchFeeChart />
                </div>
                <div className="w-full sm:w-1/2">
                    <ClassFrequencyTrend />
                </div>
            </div>

            {/* Today's classes + Calendar */}
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

            {/* Class status + Reminders */}
            <div className="flex flex-col sm:flex-row gap-6 sm:h-[45rem]">
                <div className="w-full sm:w-1/2">
                    <WrapperCard className="h-full">
                        <div className="h-[30em] sm:h-full">
                            <ClassStatusUpdates />
                        </div>
                    </WrapperCard>
                </div>
                <div className="w-full sm:w-1/2 mb-25 sm:mb-0">
                    <WrapperCard className="h-full">
                        <div className="h-[20em] sm:h-full">
                            <Reminders />
                        </div>
                    </WrapperCard>
                </div>
            </div>
        </div>
    );
};

export default Home;
