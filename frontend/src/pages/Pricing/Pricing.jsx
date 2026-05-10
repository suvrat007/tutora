import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";
import { Check, X, Zap, Star } from "lucide-react";
import SubscribeButton from "@/components/SubscribeButton.jsx";

const fadeUp = (delay = 0) => ({
    hidden: { opacity: 0, y: 28 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut", delay } },
});
const VP = { once: true, margin: "-60px" };

const FREE_FEATURES = [
    { text: "Up to 12 students", ok: true },
    { text: "1 batch", ok: true },
    { text: "Attendance marking", ok: true },
    { text: "Fee tracking", ok: true },
    { text: "Class scheduling", ok: true },
    { text: "Reminders", ok: true },
    { text: "Parent portal invites", ok: false },
    { text: "Test management", ok: false },
    { text: "Priority support", ok: false },
];

const PRO_FEATURES = [
    { text: "Unlimited students", ok: true },
    { text: "Unlimited batches", ok: true },
    { text: "Attendance marking", ok: true },
    { text: "Fee tracking + CSV export", ok: true },
    { text: "Class scheduling", ok: true },
    { text: "Reminders", ok: true },
    { text: "Parent portal invites", ok: true },
    { text: "Test management", ok: true },
    { text: "Priority support", ok: true },
];

const FeatureRow = ({ text, ok }) => (
    <li className="flex items-center gap-2.5 text-sm">
        {ok
            ? <Check className="w-4 h-4 text-[#8b5e3c] shrink-0" />
            : <X className="w-4 h-4 text-[#c9a888]/60 shrink-0" />
        }
        <span className={ok ? "text-[#3d2b1a]" : "text-[#c9a888]/70 line-through"}>{text}</span>
    </li>
);

const PricingCards = ({ showTitle = true }) => {
    const navigate = useNavigate();
    const user = useSelector((s) => s.user);
    const isPro = useSelector((s) => s.subscription?.isPro);

    return (
        <div>
            {showTitle && (
                <motion.div
                    variants={fadeUp()}
                    initial="hidden"
                    whileInView="visible"
                    viewport={VP}
                    className="text-center mb-14"
                >
                    <span className="inline-block px-3 py-1 rounded-full text-xs font-bold tracking-widest uppercase border border-[#ddb892]/60 bg-[#fdf5ec] text-[#8b5e3c] mb-4">
                        Pricing
                    </span>
                    <h2
                        className="text-4xl sm:text-5xl font-extrabold text-[#1a0f07] tracking-tight"
                        style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                    >
                        Simple, honest pricing
                    </h2>
                    <p className="mt-3 text-[#7b5c4b] text-base max-w-md mx-auto">
                        Start free. Upgrade when you grow. No hidden fees, no contracts.
                    </p>
                </motion.div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">

                {/* Free */}
                <motion.div
                    variants={fadeUp(0.05)}
                    initial="hidden"
                    whileInView="visible"
                    viewport={VP}
                    className="rounded-2xl border border-[#e8d5c0] bg-white p-7 flex flex-col"
                >
                    <p className="text-xs font-bold tracking-widest uppercase text-[#8b5e3c] mb-2">Free</p>
                    <div className="mb-1">
                        <span className="text-4xl font-extrabold text-[#1a0f07]">₹0</span>
                        <span className="text-sm text-[#9b8778] ml-1">/ forever</span>
                    </div>
                    <p className="text-xs text-[#9b8778] mb-6">Up to 12 students</p>

                    <ul className="space-y-3 mb-8 flex-1">
                        {FREE_FEATURES.map((f) => <FeatureRow key={f.text} {...f} />)}
                    </ul>

                    <button
                        onClick={() => user ? navigate('/main') : navigate('/login')}
                        className="w-full py-2.5 rounded-xl border border-[#d08f56] text-[#8b5e3c] text-sm font-semibold hover:bg-[#fef3e8] transition-colors"
                    >
                        {user ? 'Go to dashboard' : 'Get started free'}
                    </button>
                </motion.div>

                {/* Pro Monthly */}
                <motion.div
                    variants={fadeUp(0.12)}
                    initial="hidden"
                    whileInView="visible"
                    viewport={VP}
                    className="rounded-2xl border border-[#e8d5c0] bg-white p-7 flex flex-col"
                >
                    <p className="text-xs font-bold tracking-widest uppercase text-[#8b5e3c] mb-2">Pro Monthly</p>
                    <div className="mb-1">
                        <span className="text-4xl font-extrabold text-[#1a0f07]">₹349</span>
                        <span className="text-sm text-[#9b8778] ml-1">/ month</span>
                    </div>
                    <p className="text-xs text-[#9b8778] mb-6">Cancel anytime</p>

                    <ul className="space-y-3 mb-8 flex-1">
                        {PRO_FEATURES.map((f) => <FeatureRow key={f.text} {...f} />)}
                    </ul>

                    {isPro ? (
                        <div className="w-full py-2.5 rounded-xl bg-[#f0d5b0] text-[#8b5e3c] text-sm font-semibold text-center">
                            Current plan
                        </div>
                    ) : (
                        <SubscribeButton
                            planType="monthly"
                            className="w-full py-2.5 rounded-xl border border-[#1a0f07] text-[#1a0f07] text-sm font-semibold hover:bg-[#fef3e8] transition-colors"
                        >
                            Subscribe monthly
                        </SubscribeButton>
                    )}
                </motion.div>

                {/* Pro Annual — highlighted */}
                <motion.div
                    variants={fadeUp(0.19)}
                    initial="hidden"
                    whileInView="visible"
                    viewport={VP}
                    className="rounded-2xl border-2 border-[#a0683f] bg-[#1a0f07] p-7 flex flex-col relative overflow-hidden shadow-xl"
                >
                    {/* Best value badge */}
                    <div className="absolute top-4 right-4 flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#d08f56]/20 border border-[#d08f56]/40">
                        <Star className="w-3 h-3 text-[#d08f56]" />
                        <span className="text-[10px] font-bold text-[#d08f56] uppercase tracking-wider">Best value</span>
                    </div>

                    {/* Ambient glow */}
                    <div className="pointer-events-none absolute -top-12 -right-12 w-40 h-40 bg-[#8b5e3c]/20 rounded-full blur-3xl" />

                    <p className="text-xs font-bold tracking-widest uppercase text-[#d08f56] mb-2">Pro Annual</p>
                    <div className="mb-1">
                        <span className="text-4xl font-extrabold text-white">₹2,999</span>
                        <span className="text-sm text-[#c9a888] ml-1">/ year</span>
                    </div>
                    <p className="text-xs text-[#a0683f] mb-6">
                        Save 28% · 3 months free vs monthly
                    </p>

                    <ul className="space-y-3 mb-8 flex-1">
                        {PRO_FEATURES.map((f) => (
                            <li key={f.text} className="flex items-center gap-2.5 text-sm">
                                <Check className="w-4 h-4 text-[#d08f56] shrink-0" />
                                <span className="text-[#e6c8a8]">{f.text}</span>
                            </li>
                        ))}
                    </ul>

                    {isPro ? (
                        <div className="w-full py-2.5 rounded-xl bg-[#2c1a0e] text-[#d08f56] text-sm font-semibold text-center">
                            Current plan
                        </div>
                    ) : (
                        <SubscribeButton
                            planType="annual"
                            className="w-full py-2.5 rounded-xl bg-[#d08f56] text-[#1a0f07] text-sm font-bold hover:bg-[#c0764b] transition-colors flex items-center justify-center gap-1.5"
                        >
                            <Zap className="w-3.5 h-3.5" />
                            Subscribe annually
                        </SubscribeButton>
                    )}
                </motion.div>
            </div>

            <motion.p
                variants={fadeUp(0.25)}
                initial="hidden"
                whileInView="visible"
                viewport={VP}
                className="text-center text-xs text-[#9b8778] mt-8"
            >
                Secure payments via Razorpay · No credit card required for free plan · Cancel anytime
            </motion.p>
        </div>
    );
};

const Pricing = () => (
    <div className="min-h-screen bg-[#faf6f1]">
        {/* Minimal nav */}
        <div className="px-6 py-5 flex items-center justify-between max-w-6xl mx-auto">
            <span
                className="text-xl font-extrabold text-[#1a0f07]"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
                MeriKaksha
            </span>
            <a href="/" className="text-sm text-[#8b5e3c] hover:underline">← Back to home</a>
        </div>

        <section className="py-16 md:py-24 px-4 sm:px-6">
            <PricingCards showTitle />
        </section>
    </div>
);

export { PricingCards };
export default Pricing;
