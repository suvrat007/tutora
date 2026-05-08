import { useState, useEffect } from "react";
import TodaysClasses from "./comps/FuturePhases/TodaysClasses.jsx";
import ClassStatusUpdates from "./comps/P1/ClassStatusUpdates.jsx";
import Reminders from "./comps/P1/Reminders.jsx";
import DashboardCalendar from "./comps/Widgets/DashboardCalendar.jsx";
import StatsStrip from "./comps/Widgets/StatsStrip.jsx";
import FeeCollection from "./comps/Widgets/FeeCollection.jsx";
import TopStudents from "./comps/Widgets/TopStudents.jsx";
import BatchFeeChart from "./comps/Widgets/BatchFeeChart.jsx";
import ClassFrequencyTrend from "./comps/Widgets/ClassFrequencyTrend.jsx";
import useFetchAttendanceSummary from "@/hooks/useFetchAttendanceSummary.js";
import useFetchStudents from "@/hooks/useFetchStudents.js";
import useFetchFeeSummary from "@/hooks/useFetchFeeSummary.js";

const Home = () => {
    const [reminderRefreshKey, setReminderRefreshKey] = useState(0);
    const fetchAttendance = useFetchAttendanceSummary();
    const fetchStudents = useFetchStudents();
    const fetchFeeSummary = useFetchFeeSummary();

    useEffect(() => {
        const controller = new AbortController();
        fetchStudents(controller.signal);
        fetchAttendance(controller.signal);
        fetchFeeSummary(controller.signal);
        return () => controller.abort();
    }, []);

    return (
        <div className="h-full py-3 px-3 sm:px-5 overflow-y-auto flex flex-col gap-4 sm:gap-6 pb-8">
            {/* Today's classes + Pending class updates + Reminders */}
            <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-4 sm:gap-6">
                <div className="w-full h-[350px] sm:h-[400px]">
                    <TodaysClasses />
                </div>
                <div className="w-full h-[350px] sm:h-[400px]">
                    <ClassStatusUpdates />
                </div>
                <div className="w-full lg:col-span-2 2xl:col-span-1 h-[350px] sm:h-[400px]">
                    <Reminders refreshKey={reminderRefreshKey} />
                </div>
            </div>

            {/* Stats strip */}
            <StatsStrip />

            {/* Fee collection + Batch fee breakdown */}
            <div className="flex flex-col xl:flex-row gap-4 sm:gap-6 xl:h-[380px]">
                <div className="w-full xl:w-[55%] h-[350px] xl:h-full">
                    <FeeCollection />
                </div>
                <div className="w-full xl:flex-1 h-[350px] xl:h-full">
                    <BatchFeeChart />
                </div>
            </div>

            {/* Reminders Calendar - full row */}
            <DashboardCalendar
                refreshKey={reminderRefreshKey}
                onReminderAdded={() => setReminderRefreshKey(k => k + 1)}
            />

            {/* Top students + Class frequency trend */}
            <div className="flex flex-col xl:flex-row gap-4 sm:gap-6 xl:h-[380px]">
                <div className="w-full xl:w-[45%] h-[350px] xl:h-full">
                    <TopStudents />
                </div>
                <div className="w-full xl:flex-1 h-[350px] xl:h-full">
                    <ClassFrequencyTrend />
                </div>
            </div>
        </div>
    );
};

export default Home;
