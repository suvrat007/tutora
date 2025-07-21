import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";
import useFetchBatches from "@/pages/useFetchBatches.js";
import useFetchStudents from "@/pages/useFetchStudents.js";
import useFetchClassLogs from "@/pages/useFetchClassLogs.js";
import useFetchAttendanceSummary from "@/pages/useFetchAttendanceSummary.js";
import { FaUniversity, FaUserCheck, FaUserGraduate } from "react-icons/fa";
import { HiOutlineClipboardList } from "react-icons/hi";

const LoadingPage = ({ onDone }) => {
    const fetchBatches = useFetchBatches();
    const fetchGroupedStudents = useFetchStudents();
    const fetchClassLogs = useFetchClassLogs();
    const fetchAttendanceSummary = useFetchAttendanceSummary();

    const [currentStep, setCurrentStep] = useState(0);

    const classLogs = useSelector((state) => state.classlogs);
    const batches = useSelector((state) => state.batches);
    const students = useSelector((state) => state.students);
    const attendanceSummary = useSelector((state) => state.attendanceSummary);

    const steps = [
        { name: "Batches", icon: FaUserGraduate },
        { name: "Students", icon: FaUserCheck },
        { name: "Classes", icon: FaUniversity },
        { name: "Attendance", icon: HiOutlineClipboardList },
    ];

    useEffect(() => {
        const fetchData = async () => {
            const hasData =
                batches?.length > 0 &&
                students?.length > 0 &&
                classLogs?.length > 0 &&
                attendanceSummary;

            if (hasData) {
                setCurrentStep(4);
                setTimeout(() => onDone(), 500);
                return;
            }

            try {
                const operations = [
                    { fetch: fetchBatches, shouldRun: !batches?.length },
                    { fetch: fetchGroupedStudents, shouldRun: !students?.length },
                    { fetch: fetchClassLogs, shouldRun: !classLogs?.length },
                    { fetch: fetchAttendanceSummary, shouldRun: !attendanceSummary },
                ];

                for (let i = 0; i < operations.length; i++) {
                    if (operations[i].shouldRun) {
                        setCurrentStep(i);
                        await operations[i].fetch();
                        await new Promise((resolve) => setTimeout(resolve, 300));
                    }
                }

                setCurrentStep(4);
                setTimeout(() => onDone(), 500);
            } catch (err) {
                console.error("Error while loading data:", err);
            }
        };

        fetchData();
    }, []);

    return (
        <div className="flex items-center justify-center h-full w-full relative overflow-hidden">
            {/* Glowing Background Effects */}
            <div className="absolute inset-0 opacity-5">
                <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-orange-300 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-1/4 right-1/4 w-24 h-24 bg-orange-400 rounded-full blur-2xl animate-pulse delay-1000"></div>
            </div>

            <div className="relative z-10 text-center max-w-md mx-auto px-8">
                <div className="mb-8">
                    {/* Spinning Loaders */}
                    <div className="relative w-16 h-16 mx-auto mb-6">
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                            className="absolute inset-0 border-2 border-orange-200 rounded-full"
                        >
                            <div className="absolute top-0 left-1/2 w-1 h-4 bg-orange-500 rounded-full transform -translate-x-1/2 origin-bottom"></div>
                        </motion.div>
                        <motion.div
                            animate={{ rotate: -360 }}
                            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                            className="absolute inset-2 border border-orange-300 rounded-full opacity-60"
                        >
                            <div className="absolute top-0 left-1/2 w-0.5 h-2 bg-orange-400 rounded-full transform -translate-x-1/2 origin-bottom"></div>
                        </motion.div>
                    </div>

                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="text-2xl font-light text-orange-700 mb-3"
                    >
                        Loading your dashboard
                    </motion.h2>

                    {/* Dot Bounce */}
                    <div className="flex justify-center space-x-1 mb-8">
                        {[0, 1, 2].map((i) => (
                            <motion.div
                                key={i}
                                animate={{
                                    scale: [1, 1.2, 1],
                                    opacity: [0.3, 1, 0.3],
                                }}
                                transition={{
                                    duration: 1.5,
                                    repeat: Infinity,
                                    delay: i * 0.2,
                                }}
                                className="w-2 h-2 bg-orange-400 rounded-full"
                            />
                        ))}
                    </div>
                </div>

                {/* Step Progress */}
                <div className="space-y-3">
                    {steps.map((step, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{
                                opacity: index <= currentStep ? 1 : 0.3,
                                x: 0,
                                scale: index === currentStep ? 1.05 : 1,
                            }}
                            transition={{ duration: 0.3, delay: index * 0.1 }}
                            className={`flex items-center space-x-3 px-4 py-2 rounded-lg transition-all duration-300 ${
                                index <= currentStep
                                    ? "bg-orange-50 border border-orange-200"
                                    : "bg-transparent"
                            }`}
                        >
                            <motion.div
                                animate={
                                    index === currentStep ? { rotate: [0, 10, -10, 0] } : {}
                                }
                                transition={{
                                    duration: 0.5,
                                    repeat: index === currentStep ? Infinity : 0,
                                }}
                                className="text-lg text-orange-700"
                            >
                                <step.icon />
                            </motion.div>

                            <div className="flex-1 text-left">
                <span
                    className={`text-sm font-medium ${
                        index < currentStep
                            ? "text-orange-600"
                            : index === currentStep
                                ? "text-orange-700"
                                : "text-orange-400"
                    }`}
                >
                  {step.name}
                </span>
                            </div>

                            {index < currentStep && (
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ duration: 0.3 }}
                                    className="w-4 h-4 bg-orange-500 rounded-full flex items-center justify-center"
                                >
                                    <svg
                                        className="w-2 h-2 text-white"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                </motion.div>
                            )}

                            {index === currentStep && (
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{
                                        duration: 1,
                                        repeat: Infinity,
                                        ease: "linear",
                                    }}
                                    className="w-4 h-4 border-2 border-orange-200 border-t-orange-500 rounded-full"
                                />
                            )}
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default LoadingPage;