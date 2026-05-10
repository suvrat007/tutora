import { motion, AnimatePresence } from 'framer-motion';
import { X, Zap, Users, TestTube2 } from 'lucide-react';
import SubscribeButton from './SubscribeButton.jsx';

const featureLabels = {
    STUDENT_LIMIT_REACHED: {
        icon: <Users className="w-6 h-6 text-[#a0683f]" />,
        title: 'Student limit reached',
        desc: 'Your free plan supports up to 12 students. Upgrade to Pro for unlimited students.',
    },
    UPGRADE_TO_PRO: {
        icon: <Zap className="w-6 h-6 text-[#a0683f]" />,
        title: 'Pro feature',
        desc: 'This feature is available on the Pro plan. Upgrade to unlock parent portals, tests, and more.',
    },
};

const UpgradeModal = ({ open, onClose, reason = 'UPGRADE_TO_PRO' }) => {
    const content = featureLabels[reason] ?? featureLabels['UPGRADE_TO_PRO'];

    return (
        <AnimatePresence>
            {open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                        onClick={onClose}
                    />

                    {/* Card */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 16 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 16 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 28 }}
                        className="relative z-10 w-full max-w-md rounded-2xl bg-white dark:bg-[#1a1207] border border-[#e6c8a8] dark:border-[#3d2b1a] shadow-2xl p-8"
                    >
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 p-1.5 rounded-lg text-[#5a4a3c] hover:bg-[#fdf8f3] dark:hover:bg-[#2c1a0e] transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>

                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 rounded-xl bg-[#fef3e8] dark:bg-[#2c1a0e]">
                                {content.icon}
                            </div>
                            <h2 className="text-lg font-semibold text-[#1a0f07] dark:text-[#fdf8f3]">
                                {content.title}
                            </h2>
                        </div>

                        <p className="text-sm text-[#5a4a3c] dark:text-[#d7b48f] mb-6 leading-relaxed">
                            {content.desc}
                        </p>

                        <div className="flex flex-col gap-3">
                            <SubscribeButton
                                planType="annual"
                                className="w-full py-3 px-4 rounded-xl bg-[#1a0f07] text-white text-sm font-medium hover:bg-[#2c1a0e] transition-colors flex items-center justify-center gap-2"
                            >
                                <Zap className="w-4 h-4" />
                                Upgrade to Pro Annual — ₹2,999/year
                            </SubscribeButton>

                            <SubscribeButton
                                planType="monthly"
                                className="w-full py-3 px-4 rounded-xl border border-[#d08f56] text-[#a0683f] dark:text-[#d08f56] text-sm font-medium hover:bg-[#fef3e8] dark:hover:bg-[#2c1a0e] transition-colors"
                            >
                                Try monthly — ₹349/month
                            </SubscribeButton>

                            <button
                                onClick={onClose}
                                className="text-xs text-center text-[#8b5e3c] dark:text-[#a0683f] hover:underline mt-1"
                            >
                                Maybe later
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default UpgradeModal;
