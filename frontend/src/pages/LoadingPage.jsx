import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";
import useFetchBatches from "@/hooks/useFetchBatches.js";
import useFetchStudents from "@/hooks/useFetchStudents.js";
import useFetchClassLogs from "@/hooks/useFetchClassLogs.js";
import { FaUserGraduate, FaUserCheck, FaUniversity } from "react-icons/fa";
import useFetchTests from "@/hooks/useFetchTests.js";

const steps = [
    { name: "Batches", icon: FaUserGraduate },
    { name: "Students", icon: FaUserCheck },
    { name: "Classes", icon: FaUniversity },
];

const LoadingPage = ({ onDone }) => {
    const fetchBatches = useFetchBatches();
    const fetchGroupedStudents = useFetchStudents();
    const fetchClassLogs = useFetchClassLogs();
    useFetchTests();

    const [currentStep, setCurrentStep] = useState(0);

    const classLogs = useSelector((state) => state.classlogs);
    const batches = useSelector((state) => state.batches);
    const students = useSelector((state) => state.students);

    useEffect(() => {
        const fetchData = async () => {
            const hasData =
                batches?.length > 0 &&
                students?.groupedStudents?.length > 0 &&
                classLogs?.length > 0;

            if (hasData) {
                setCurrentStep(3);
                setTimeout(() => onDone(), 500);
                return;
            }

            try {
                const operations = [
                    { fetch: fetchBatches, shouldRun: !batches?.length },
                    { fetch: fetchGroupedStudents, shouldRun: !students?.groupedStudents?.length },
                    { fetch: fetchClassLogs, shouldRun: !classLogs?.length },
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

    const progress = Math.min((currentStep / steps.length) * 100, 100);

    return (
        <div className="flex flex-col items-center justify-center h-full w-full bg-[#f8ede3] relative overflow-hidden">
            {/* Soft ambient blobs */}
            <div className="absolute top-1/4 -left-20 w-72 h-72 bg-[#e0c4a8] rounded-full blur-3xl opacity-25 pointer-events-none" />
            <div className="absolute bottom-1/4 -right-16 w-56 h-56 bg-[#d4b896] rounded-full blur-3xl opacity-20 pointer-events-none" />

            <div className="relative z-10 text-center w-full max-w-xs mx-auto px-8">
                {/* Brand */}
                <motion.div
                    initial={{ opacity: 0, y: -16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="mb-10"
                >
                    <h1 className="text-5xl font-bold text-[#5a4a3c] tracking-wide">Tutora</h1>
                    <p className="text-sm text-[#8b5e3c] mt-2 font-medium">Getting your workspace ready</p>
                </motion.div>

                {/* Progress bar */}
                <div className="w-full bg-[#e6c8a8] rounded-full h-1 mb-8 overflow-hidden">
                    <motion.div
                        className="bg-[#8b5e3c] h-1 rounded-full"
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.4, ease: "easeOut" }}
                    />
                </div>

                {/* Steps */}
                <div className="space-y-2.5">
                    {steps.map((step, index) => {
                        const done = index < currentStep;
                        const active = index === currentStep;
                        const Icon = step.icon;
                        return (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, x: -12 }}
                                animate={{
                                    opacity: done || active ? 1 : 0.35,
                                    x: 0,
                                }}
                                transition={{ duration: 0.3, delay: index * 0.08 }}
                                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-colors ${
                                    done
                                        ? "bg-[#e0c4a8]/50 border border-[#d4b896]"
                                        : active
                                        ? "bg-[#f0d9c0] border border-[#e0c4a8] shadow-sm"
                                        : ""
                                }`}
                            >
                                <Icon
                                    size={16}
                                    className={
                                        done
                                            ? "text-[#8b5e3c]"
                                            : active
                                            ? "text-[#5a4a3c]"
                                            : "text-[#c4a98a]"
                                    }
                                />
                                <span
                                    className={`flex-1 text-left text-sm font-medium ${
                                        done
                                            ? "text-[#8b5e3c]"
                                            : active
                                            ? "text-[#5a4a3c]"
                                            : "text-[#c4a98a]"
                                    }`}
                                >
                                    {step.name}
                                </span>

                                {done && (
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ duration: 0.25, type: "spring" }}
                                        className="w-5 h-5 rounded-full bg-[#8b5e3c] flex items-center justify-center flex-shrink-0"
                                    >
                                        <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    </motion.div>
                                )}

                                {active && (
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                        className="w-4 h-4 border-2 border-[#e0c4a8] border-t-[#8b5e3c] rounded-full flex-shrink-0"
                                    />
                                )}
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default LoadingPage;
