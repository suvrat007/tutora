import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "@/utilities/axiosInstance";
import { useSelector } from "react-redux";
import OnboardingForm from "@/pages/Auth/OnboardingForm.jsx";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import { BackgroundBeams } from "@/components/ui/background-beams";
import { FlipWords } from "@/components/ui/flip-words";
import useFetchUser from "@/pages/useFetchUser.js";

const Login = () => {
    const words = ["mazing", "wesome", "mbitious", "daptive", "dvanced"];
    const [isSignup, setIsSignup] = useState(false);
    const [signupCreds, setSignupCreds] = useState(null);
    const [formData, setFormData] = useState({ name: "", emailId: "", password: "" });
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const fetchUser = useFetchUser();

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const loggedInUser = useSelector((state) => state.user);
    useEffect(() => {
        if (loggedInUser) {
            navigate("/main");
        }
    }, [loggedInUser]);

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const response = await axiosInstance.post(
                "/api/auth/login",
                {
                    emailId: formData.emailId,
                    password: formData.password,
                },
                { withCredentials: true }
            );
            await fetchUser();
            navigate("/main");
        } catch (err) {
            alert("Login failed. Please check your credentials.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSignupCreds = (e) => {
        e.preventDefault();
        if (!formData.name || !formData.emailId || !formData.password) return;
        setIsLoading(true);
        try {
            setSignupCreds({
                name: formData.name,
                emailId: formData.emailId,
                password: formData.password,
            });
        } finally {
            setIsLoading(false);
        }
    };

    if (signupCreds) return <OnboardingForm adminCreds={signupCreds} />;

    const LoadingSpinner = () => (
        <motion.div
            className="absolute inset-0 bg-[#f8ede3]/80 backdrop-blur-sm z-50 flex items-center justify-center rounded-2xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
        >
            <motion.div
                className="w-12 h-12 border-4 border-[#e7c6a5] border-t-[#4a3a2c] rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
                <motion.div
                    className="w-full h-full rounded-full border-2 border-[#e7c6a5]/50"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                />
            </motion.div>
        </motion.div>
    );

    return (
        <div className="relative min-h-screen bg-gradient-to-br from-[#fdf5ec] to-[#f5e8dc] flex items-center justify-center px-4 sm:px-6 md:px-8 overflow-hidden">
            <BackgroundBeams className="absolute top-0 left-0 w-full h-full z-0" />
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="relative z-10 w-full max-w-md"
            >
                <Card className="rounded-2xl shadow-xl bg-[#f8ede3]/90 backdrop-blur-sm border border-[#e7c6a5]/50">
                    <CardContent className="p-6 sm:p-8 relative">
                        <AnimatePresence>
                            {isLoading && <LoadingSpinner />}
                        </AnimatePresence>
                        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-2 text-[#4a3a2c]">
                            <span className="inline">TUTORA</span>
                            <FlipWords className="text-[#e7c6a5]" words={words} />
                        </h1>
                        <p className="text-center text-[#9b8778] text-sm sm:text-base mb-4">
                            Your smart, modern tutoring platform.
                        </p>
                        <form
                            onSubmit={isSignup ? handleSignupCreds : handleLogin}
                            className="space-y-4 sm:space-y-5"
                        >
                            {isSignup && (
                                <Input
                                    type="text"
                                    name="name"
                                    placeholder="Username"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    className="bg-[#f8ede3] border-[#e7c6a5] placeholder-[#9b8778] text-[#4a3a2c] focus:ring-[#e7c6a5] focus:border-[#e7c6a5]"
                                    required
                                    disabled={isLoading}
                                />
                            )}
                            <Input
                                type="email"
                                name="emailId"
                                placeholder="Email"
                                value={formData.emailId}
                                onChange={handleInputChange}
                                className="bg-[#f8ede3] border-[#e7c6a5] placeholder-[#9b8778] text-[#4a3a2c] focus:ring-[#e7c6a5] focus:border-[#e7c6a5]"
                                required
                                disabled={isLoading}
                            />
                            <Input
                                type="password"
                                name="password"
                                placeholder="Password"
                                value={formData.password}
                                onChange={handleInputChange}
                                className="bg-[#f8ede3] border-[#e7c6a5] placeholder-[#9b8778] text-[#4a3a2c] focus:ring-[#e7c6a5] focus:border-[#e7c6a5]"
                                required
                                disabled={isLoading}
                            />
                            <Button
                                type="submit"
                                className="w-full bg-[#4a3a2c] text-white hover:bg-[#3e2f23] text-base sm:text-lg font-semibold rounded-md py-2.5"
                                disabled={isLoading}
                            >
                                {isSignup ? "Next" : `Login as Tutor`}
                            </Button>
                        </form>

                        <div className="my-6 flex items-center">
                            <div className="flex-grow h-px bg-[#e7c6a5]/50" />
                            <span className="px-4 text-sm sm:text-base text-[#9b8778]">or continue with</span>
                            <div className="flex-grow h-px bg-[#e7c6a5]/50" />
                        </div>

                        <p className="mt-6 text-sm sm:text-base text-center text-[#9b8778] cursor-pointer">
                            {isSignup ? "Already have an account?" : "Don’t have an account?"}{" "}
                            <button
                                onClick={() => {
                                    setIsSignup(!isSignup);
                                    setSignupCreds(null);
                                }}
                                className="text-[#4a3a2c] hover:underline"
                                disabled={isLoading}
                            >
                                {isSignup ? "Login" : "Sign up"}
                            </button>
                        </p>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
};

export default Login;