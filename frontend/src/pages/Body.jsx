import {Outlet} from "react-router-dom";
import {useEffect, useRef} from "react";
import { useSelector } from "react-redux";
import axiosInstance from "@/utilities/axiosInstance.jsx";
import useFetchUser from "@/pages/useFetchUser.js";

const Body = () => {
    const fetchUser=useFetchUser()
    const batches = useSelector((state) => state.batches);
    const hasEnsuredTodayRef = useRef(false);

    useEffect(() => {
        fetchUser();
    }, []);

    useEffect(() => {
        const getTodayInfo = () => {
            const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            const now = new Date();
            const todayDay = days[now.getDay()];
            const todayDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
            return { todayDay, todayDate };
        };

        const buildTodayClasses = (allBatches) => {
            const { todayDay, todayDate } = getTodayInfo();
            const seen = new Set();
            return allBatches.flatMap((batch) =>
                (batch.subject || [])
                    .filter((subject) => subject?.classSchedule?.days?.includes(todayDay) && subject?.classSchedule?.time)
                    .map((subject) => {
                        const key = `${batch._id}-${subject._id}`;
                        if (seen.has(key)) return null;
                        seen.add(key);
                        return {
                            batch_id: batch._id,
                            subject_id: subject._id,
                            date: todayDate,
                            hasHeld: false,
                            note: "No Data",
                        };
                    })
                    .filter(Boolean)
            );
        };

        const ensureTodayClassesExist = async () => {
            if (!Array.isArray(batches) || batches.length === 0 || hasEnsuredTodayRef.current) return;
            try {
                const updates = buildTodayClasses(batches);
                if (updates.length === 0) {
                    hasEnsuredTodayRef.current = true;
                    return;
                }
                await axiosInstance.post("/api/classLog/add-class-updates", { updates }, { withCredentials: true });
            } catch (e) {
                // Silent fail to avoid blocking app load
                console.error("Failed ensuring today's classes:", e);
            } finally {
                hasEnsuredTodayRef.current = true;
            }
        };

        ensureTodayClassesExist();
    }, [batches]);
    return (
        <>
            <Outlet/>
        </>
    )
}

export default Body
