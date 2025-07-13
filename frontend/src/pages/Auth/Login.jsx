import React, {useEffect, useState} from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "@/utilities/axiosInstance";
import {useSelector} from "react-redux";
import OnboardingForm from "@/pages/Auth/OnboardingForm.jsx";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { FcGoogle } from "react-icons/fc";
import { FaFacebook, FaGithub } from "react-icons/fa";
import { motion } from "framer-motion";
import { BackgroundBeams } from "@/components/ui/background-beams";
import { FlipWords } from "@/components/ui/flip-words";
import useFetchUser from "@/pages/useFetchUser.js";

const Login = () => {
    const words = ["mazing", "wesome", "mbitious", "daptive", "dvanced"];
    const [role, setRole] = useState("student");
    const [isSignup, setIsSignup] = useState(false);
    const [signupCreds, setSignupCreds] = useState(null);
    const [formData, setFormData] = useState({ name: "", emailId: "", password: "" });
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
        }
    };

    const handleSignupCreds = (e) => {
        e.preventDefault();
        if (!formData.name || !formData.emailId || !formData.password) return;
        setSignupCreds({
            name: formData.name,
            emailId: formData.emailId,
            password: formData.password,
        });
    };

    if (signupCreds) return <OnboardingForm adminCreds={signupCreds} />;

    return (
        <div className="relative min-h-screen bg-[#F0EAD6] flex items-center justify-center px-4 overflow-hidden">
            {/* Adjusted BackgroundBeams to be more visible */}
            <BackgroundBeams className="absolute top-0 left-0 w-full h-full" />
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="relative z-10 max-w-md w-full"
            >
                <Card className="rounded-2xl shadow-xl bg-white/90 backdrop-blur-sm border border-[#DEDCCA] text-[#4A442A]">
                    <CardContent className="p-8">
                        <h1 className="text-3xl md:text-4xl font-bold text-center mb-2">
                            {/* Changed TUTORA text color for better contrast */}
                            <span className="text-[#3A3322] inline">TUTORA</span>
                            <FlipWords className="text-[#A08860]" words={words} />
                        </h1>
                        <p className="text-center text-[#7F745B] text-sm mb-4">
                            Your smart, modern tutoring platform.
                        </p>
                        <div className="flex justify-center mb-4 gap-2">
                            {/* Updated button colors for consistency and appeal */}
                            {["Tutor"].map((r) => (
                                <button
                                    key={r}
                                    type="button"
                                    onClick={() => setRole(r.toLowerCase())}
                                    className={`px-4 py-1.5 rounded-full text-sm font-medium border transition ${
                                        role === r.toLowerCase()
                                            ? "bg-[#A08860] text-white border-[#A08860]"
                                            : "bg-[#EDE9D7] text-[#5A543A] border-[#DEDCCA] hover:bg-[#E0DBCE]"
                                    }`}
                                >
                                    {r}
                                </button>
                            ))}
                        </div>

                        <form
                            onSubmit={isSignup ? handleSignupCreds : handleLogin}
                            className="space-y-4"
                        >
                            {isSignup && (
                                <Input
                                    type="text"
                                    name="name"
                                    placeholder="Username"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    className="bg-[#F8F6EF] border-[#DEDCCA] placeholder-[#9B9078] text-[#4A442A]"
                                    required
                                />
                            )}
                            <Input
                                type="email"
                                name="emailId"
                                placeholder="Email"
                                value={formData.emailId}
                                onChange={handleInputChange}
                                className="bg-[#F8F6EF] border-[#DEDCCA] placeholder-[#9B9078] text-[#4A442A]"
                                required
                            />
                            <Input
                                type="password"
                                name="password"
                                placeholder="Password"
                                value={formData.password}
                                onChange={handleInputChange}
                                className="bg-[#F8F6EF] border-[#DEDCCA] placeholder-[#9B9078] text-[#4A442A]"
                                required
                            />
                            <Button
                                type="submit"
                                className="w-full bg-[#A08860] text-white hover:bg-[#8F7C5A]"
                            >
                                {isSignup ? "Next" : `Login as Tutor`}
                            </Button>
                        </form>

                        <div className="my-6 flex items-center">
                            <div className="flex-grow h-px bg-[#DEDCCA]" />
                            <span className="px-4 text-sm text-[#9B9078]">or continue with</span>
                            <div className="flex-grow h-px bg-[#DEDCCA]" />
                        </div>

                        <p className="mt-6 text-sm text-center text-[#6A6048]">
                            {isSignup ? "Already have an account?" : "Don’t have an account?"}{" "}
                            <button
                                onClick={() => {
                                    setIsSignup(!isSignup);
                                    setSignupCreds(null);
                                }}
                                className="text-[#8F7C5A] hover:underline"
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