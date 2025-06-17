import Calendar from "react-calendar";
import { useEffect, useState } from "react";
import useFetchAllClasses from "../DashboardHooks/useFetchAllClasses.jsx";
import { CalendarDays, NotebookText } from "lucide-react";

const TodaysClasses = () => {
    const [allClasses, setAllClasses] = useState(null);

    useEffect(() => {
        const fetchClasses = async () => {
            const data = await useFetchAllClasses();
            setAllClasses(data);
        };
        fetchClasses();
    }, []);

    return (
        <div className="border-2 rounded-2xl mt-2 w-[70%] overflow-hidden bg-white shadow-md">
            <h1 className="text-lg font-semibold text-gray-800 p-4 border-b-2 flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-blue-600" />
                Today's Classes
            </h1>
            <div className="overflow-y-auto h-[18rem] p-2 space-y-3">
                {allClasses && allClasses.length > 0 ? (
                    allClasses.map((c, index) => (
                        <div
                            key={index}
                            className="border border-gray-200 rounded-xl p-4 bg-gray-50 hover:shadow transition-all duration-200"
                        >
                            <div className="mb-2 border-b pb-2">
                                <p className="text-sm font-medium text-blue-600">
                                    {c.batchName}
                                </p>
                            </div>
                            <div className="flex justify-between text-sm text-gray-700 font-medium">
                                <p>
                                    <span className="text-gray-500">Class: </span>
                                    {c.forStandard}
                                </p>
                                <p>
                                    <span className="text-gray-500">Subject: </span>
                                    {c.subjectName}
                                </p>
                                <p>
                                    <span className="text-gray-500">Time: </span>
                                    {c.time}
                                </p>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-gray-500 animate-pulse">
                        <NotebookText className="w-10 h-10 mb-2 text-blue-400" />
                        <p className="text-md font-medium">Yay! No classes scheduled for today.</p>
                        <p className="text-sm text-gray-400 mt-1">Take a break or plan ahead 📘</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TodaysClasses;
