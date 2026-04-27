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
        fetchStudents();
        fetchAttendance();
        fetchFeeSummary();
    }, []);

    return (
        <div className="h-full py-3 px-3 sm:px-5 overflow-y-auto flex flex-col gap-4 sm:gap-6 pb-8">
            {/* Today's classes + Pending class updates + Reminders */}
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 sm:h-[400px]">
                <div className="w-full sm:w-1/3 sm:h-full">
                    <TodaysClasses />
                </div>
                <div className="w-full sm:w-1/3 sm:h-full">
                    <ClassStatusUpdates />
                </div>
                <div className="w-full sm:w-1/3 sm:h-full">
                    <Reminders refreshKey={reminderRefreshKey} />
                </div>
            </div>

            {/* Stats strip */}
            <StatsStrip />

            {/* Fee collection + Batch fee breakdown */}
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 sm:h-[380px]">
                <div className="w-full sm:w-[55%] sm:h-full">
                    <FeeCollection />
                </div>
                <div className="w-full sm:flex-1 sm:h-full">
                    <BatchFeeChart />
                </div>
            </div>

            {/* Reminders Calendar - full row */}
            <DashboardCalendar
                refreshKey={reminderRefreshKey}
                onReminderAdded={() => setReminderRefreshKey(k => k + 1)}
            />

            {/* Top students + Class frequency trend */}
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 sm:h-[380px]">
                <div className="w-full sm:w-[45%] sm:h-full">
                    <TopStudents />
                </div>
                <div className="w-full sm:flex-1 sm:h-full">
                    <ClassFrequencyTrend />
                </div>
            </div>
        </div>
    );
};

export default Home;
