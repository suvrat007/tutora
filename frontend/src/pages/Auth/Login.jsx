import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "@/utilities/axiosInstance";
import { useDispatch } from "react-redux";
import { setUser } from "@/utilities/redux/userSlice.jsx";
import OnboardingForm from "@/pages/Auth/OnboardingForm.jsx";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { FcGoogle } from "react-icons/fc";
import { FaFacebook, FaGithub } from "react-icons/fa";
import { motion } from "framer-motion";
import { BackgroundBeams } from "@/components/ui/background-beams";
import { FlipWords } from "@/components/ui/flip-words";

const Login = () => {
    const words = ["mazing", "wesome", "mbitious", "daptive", "dvanced"];
    const [role, setRole] = useState("student");
    const [isSignup, setIsSignup] = useState(false);
    const [signupCreds, setSignupCreds] = useState(null);
    const [formData, setFormData] = useState({ name: "", emailId: "", password: "" });
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

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
            dispatch(setUser(response.data));
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
        <div className="relative min-h-screen bg-gray-600 flex items-center justify-center px-4 overflow-hidden">
            <BackgroundBeams />
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="relative z-10 max-w-md w-full"
            >
                <Card className="rounded-2xl shadow-2xl bg-white/10 backdrop-blur-md border-white/10 text-white">
                    <CardContent className="p-8">
                        <h1 className="text-3xl md:text-4xl font-bold text-center mb-2">
                            <span className="text-white inline">TUTORA</span>
                            <FlipWords className="text-[#e7c6a5]" words={words} />
                        </h1>
                        <p className="text-center text-neutral-400 text-sm mb-4">Your smart, modern tutoring platform.</p>
                        <div className="flex justify-center mb-4 gap-2">
                            {["Tutor"].map((r) => (
                                <button
                                    key={r}
                                    type="button"
                                    onClick={() => setRole(r.toLowerCase())}
                                    className={`px-4 py-1.5 rounded-full text-sm font-medium border transition ${
                                        role === r.toLowerCase()
                                            ? "bg-[#e7c6a5] text-black border-[#e7c6a5]"
                                            : "bg-white/10 text-white border-white/20 hover:bg-white/20"
                                    }`}
                                >
                                    {r}
                                </button>
                            ))}
                        </div>
                        <form onSubmit={isSignup ? handleSignupCreds : handleLogin} className="space-y-4">
                            {isSignup && (
                                <Input
                                    type="text"
                                    name="name"
                                    placeholder="Username"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    className="bg-white/20 border-white/20 placeholder-white"
                                    required
                                />
                            )}
                            <Input
                                type="email"
                                name="emailId"
                                placeholder="Email"
                                value={formData.emailId}
                                onChange={handleInputChange}
                                className="bg-white/20 border-white/20 placeholder-white"
                                required
                            />
                            <Input
                                type="password"
                                name="password"
                                placeholder="Password"
                                value={formData.password}
                                onChange={handleInputChange}
                                className="bg-white/20 border-white/20 placeholder-white"
                                required
                            />
                            <Button type="submit" className="w-full bg-[#e7c6a5] text-black hover:bg-[#dbb892]">
                                {isSignup ? "Next" : `Login as Tutor`}
                            </Button>
                        </form>
                        <div className="my-6 flex items-center">
                            <div className="flex-grow h-px bg-white/20" />
                            <span className="px-4 text-sm text-white/70">or continue with</span>
                            <div className="flex-grow h-px bg-white/20" />
                        </div>
                        <div className="flex flex-col gap-3">
                            <Button variant="outline" className="w-full flex items-center justify-center gap-2 bg-white/10 border-white/20 hover:bg-white/20 text-white">
                                <FcGoogle className="text-xl" />
                                Sign in with Google
                            </Button>
                            <Button variant="outline" className="w-full flex items-center justify-center gap-2 bg-white/10 border-white/20 hover:bg-white/20 text-white">
                                <FaFacebook className="text-xl text-blue-500" />
                                Sign in with Facebook
                            </Button>
                            <Button variant="outline" className="w-full flex items-center justify-center gap-2 bg-white/10 border-white/20 hover:bg-white/20 text-white">
                                <FaGithub className="text-xl" />
                                Sign in with GitHub
                            </Button>
                        </div>
                        <p className="mt-6 text-sm text-center text-white/80">
                            {isSignup ? "Already have an account?" : "Don’t have an account?"}{" "}
                            <button onClick={() => { setIsSignup(!isSignup); setSignupCreds(null); }} className="text-[#e7c6a5] hover:underline">
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
