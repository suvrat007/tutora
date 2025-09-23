import {ArrowRight, Calendar, CheckCircle, Clock, DollarSign, FileText, Sparkles, Users, X} from "lucide-react";
import {AnimatePresence, motion} from "framer-motion";
import {Button} from "@/components/ui/button.jsx";

const VideoModal = ({ isOpen, onClose, handleNavigate }) => {
    const handleVideoEnd = () => {
        setTimeout(() => {
            onClose();
        }, 1000);
    };

    const modalFeatures = [
        {
            icon: FileText,
            title: "Batch & Subject Management",
            description: "Persistently store and retrieve batch-specific data with real-time access.",
            color: "from-[#e7c6a5] to-[#f5e8dc]"
        },
        {
            icon: Users,
            title: "Student Management",
            description: "Efficiently manage student profiles and batch assignments.",
            color: "from-[#e7c6a5] to-[#f5e8dc]"
        },
        {
            icon: DollarSign,
            title: "Fee & Attendance",
            description: "Automate attendance tracking and fee collection seamlessly.",
            color: "from-[#e7c6a5] to-[#f5e8dc]"
        },
        {
            icon: Calendar,
            title: "Class Scheduling",
            description: "Real-time schedules and class management system.",
            color: "from-[#e7c6a5] to-[#f5e8dc]"
        },
        {
            icon: Clock,
            title: "Smart Reminders",
            description: "Customizable reminders for classes and deadlines.",
            color: "from-[#e7c6a5] to-[#f5e8dc]"
        },
        {
            icon: CheckCircle,
            title: "Status Tracking",
            description: "Monitor class completion with automated logging.",
            color: "from-[#e7c6a5] to-[#f5e8dc]"
        },
    ];

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                >
                    <motion.div
                        className="bg-white/90 backdrop-blur-xl rounded-2xl border border-white/30 shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto"
                        initial={{ scale: 0.7, opacity: 0, y: 50 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.7, opacity: 0, y: 50 }}
                        transition={{ type: "spring", damping: 20, stiffness: 120 }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-white/20 bg-gradient-to-r from-[#4a3a2c]/5 to-[#6b5b4f]/5">
                            <div>
                                <h3 className="text-2xl font-bold text-[#4a3a2c]">Tutora Demo</h3>
                                <p className="text-[#9b8778] mt-1">See how Tutora transforms your teaching workflow</p>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 rounded-full bg-[#4a3a2c]/10 hover:bg-[#4a3a2c]/20 text-[#4a3a2c] transition-colors duration-200 hover:scale-110"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Video Section */}
                        <div className="p-6">
                            <div className="bg-black/10 rounded-xl p-4 backdrop-blur-sm border border-white/10">
                                <video
                                    controls
                                    autoPlay
                                    className="w-full rounded-lg shadow-lg"
                                    src="/demo.mp4"
                                    onEnded={handleVideoEnd}
                                >
                                    Your browser does not support the video tag.
                                </video>
                            </div>
                        </div>

                        {/* Features Section */}
                        <div className="px-6 pb-6">
                            <h4 className="text-xl font-bold text-[#4a3a2c] mb-4 text-center">Features Demonstrated in this Video</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {modalFeatures.map(({ icon: Icon, title, description, color }, i) => (
                                    <div key={i} className="group">
                                        <div className="bg-white/60 backdrop-blur-sm border border-white/20 rounded-xl p-4 hover:bg-white/80 transition-all duration-300 h-full shadow-sm hover:shadow-md">
                                            <div className="flex items-start gap-3">
                                                <div className={`w-10 h-10 bg-gradient-to-br ${color} rounded-lg flex items-center justify-center shadow-sm flex-shrink-0`}>
                                                    <Icon className="h-5 w-5 text-[#4a3a2c]" />
                                                </div>
                                                <div className="min-w-0">
                                                    <h5 className="font-semibold text-[#4a3a2c] text-sm mb-1">
                                                        {title}
                                                    </h5>
                                                    <p className="text-[#9b8778] text-xs leading-relaxed">
                                                        {description}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Call to Action */}
                        <div className="bg-gradient-to-r from-[#4a3a2c]/5 to-[#6b5b4f]/5 border-t border-white/20 p-6">
                            <div className="text-center">
                                <p className="text-[#9b8778] mb-4">Ready to get started with Tutora?</p>
                                <Button
                                    size="lg"
                                    className="bg-[#4a3a2c] text-white hover:bg-[#3e2f23] transition-all duration-300 shadow-lg hover:shadow-xl px-6 py-3 font-semibold rounded-xl"
                                    onClick={() => {
                                        onClose();
                                        handleNavigate("/login");
                                    }}
                                >
                                    <Sparkles className="mr-2 h-5 w-5" />
                                    Start Your Free Trial
                                    <ArrowRight className="ml-2 h-5 w-5" />
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
export  default  VideoModal;